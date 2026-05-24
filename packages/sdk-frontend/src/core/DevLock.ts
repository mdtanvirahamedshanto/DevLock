import { io, Socket } from 'socket.io-client';
import type { DevLockConfig, DevLockState, DevLockCallbacks } from './types.js';

const DEFAULT_API_URL = 'https://api.devlock.io';
const DEFAULT_WS_URL = 'wss://ws.devlock.io';
const HEARTBEAT_INTERVAL = 30_000;
const CONFIG_CACHE_TTL = 120_000;

/**
 * DevLock Frontend SDK
 *
 * Provides license enforcement, remote configuration, and real-time
 * management capabilities for browser-based applications.
 *
 * @example
 * ```typescript
 * const devlock = new DevLock({
 *   projectKey: 'pk_live_xxxxx',
 *   licenseKey: 'DLCK-XXXX-XXXX-XXXX-XXXX',
 *   callbacks: {
 *     onSuspended: (reason) => showSuspendedUI(reason),
 *     onMaintenance: (msg) => showMaintenanceUI(msg),
 *   }
 * });
 *
 * await devlock.init();
 * ```
 */
export class DevLock {
  private config: Required<DevLockConfig>;
  private state: DevLockState;
  private socket: Socket | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private configCache: { data: unknown; timestamp: number } | null = null;

  constructor(config: DevLockConfig) {
    this.config = {
      projectKey: config.projectKey,
      licenseKey: config.licenseKey || '',
      apiUrl: config.apiUrl || DEFAULT_API_URL,
      wsUrl: config.wsUrl || DEFAULT_WS_URL,
      environment: config.environment || 'production',
      debug: config.debug || false,
      callbacks: config.callbacks || {},
      ui: config.ui || { overlay: true, banner: true, position: 'top' },
    };

    this.state = {
      initialized: false,
      connected: false,
      license: { valid: false, status: 'unknown', features: [] },
      maintenance: { enabled: false },
      killSwitch: false,
      notifications: [],
      featureFlags: {},
    };
  }

  /**
   * Initialize the SDK. Validates license, fetches config, establishes WebSocket.
   */
  async init(): Promise<DevLockState> {
    try {
      // 1. Verify domain
      this.verifyDomain();

      // 2. Validate license + fetch config
      const response = await this.fetchInitialState();
      this.updateState(response);

      // 3. Establish WebSocket connection
      this.connectWebSocket();

      // 4. Start heartbeat
      this.startHeartbeat();

      this.state.initialized = true;
      this.config.callbacks.onReady?.(this.state);

      this.log('Initialized successfully');
      return this.state;
    } catch (error) {
      this.config.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Check if a feature flag is enabled.
   */
  isFeatureEnabled(flag: string): boolean {
    return this.state.featureFlags[flag] ?? false;
  }

  /**
   * Get current SDK state.
   */
  getState(): Readonly<DevLockState> {
    return { ...this.state };
  }

  /**
   * Destroy the SDK instance. Cleans up connections and timers.
   */
  destroy(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
    if (this.socket) {
      this.socket.disconnect();
    }
    this.state.initialized = false;
    this.log('Destroyed');
  }

  // ─── Private Methods ────────────────────────────────────────────────

  private verifyDomain(): void {
    const currentDomain = window.location.hostname;
    // Domain verification happens server-side during init
    // Client just reports its domain; server enforces
    this.log(`Domain: ${currentDomain}`);
  }

  private async fetchInitialState(): Promise<any> {
    const fingerprint = await this.generateFingerprint();

    const response = await fetch(`${this.config.apiUrl}/v1/sdk/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-DevLock-Key': this.config.projectKey,
        'X-DevLock-Domain': window.location.hostname,
      },
      body: JSON.stringify({
        projectId: this.config.projectKey,
        licenseKey: this.config.licenseKey,
        sdkVersion: '0.1.0',
        environment: this.config.environment,
        fingerprint,
      }),
    });

    if (!response.ok) {
      throw new Error(`DevLock init failed: ${response.status}`);
    }

    return response.json();
  }

  private connectWebSocket(): void {
    this.socket = io(this.config.wsUrl, {
      auth: {
        apiKey: this.config.projectKey,
        projectId: this.config.projectKey,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
    });

    this.socket.on('connect', () => {
      this.state.connected = true;
      this.config.callbacks.onConnectionChange?.(true);
      this.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      this.state.connected = false;
      this.config.callbacks.onConnectionChange?.(false);
    });

    // Real-time event handlers
    this.socket.on('license:suspended', (data) => {
      this.state.license.status = 'suspended';
      this.state.license.valid = false;
      this.config.callbacks.onSuspended?.(data.reason);
    });

    this.socket.on('maintenance:enabled', (data) => {
      this.state.maintenance = { enabled: true, message: data.message };
      this.config.callbacks.onMaintenance?.(data.message);
    });

    this.socket.on('maintenance:disabled', () => {
      this.state.maintenance = { enabled: false };
    });

    this.socket.on('killswitch:activated', (data) => {
      this.state.killSwitch = true;
      this.config.callbacks.onKillSwitch?.(data.reason);
    });

    this.socket.on('notification:push', (data) => {
      this.state.notifications.push(data);
      this.config.callbacks.onNotification?.(data);
    });

    this.socket.on('feature:toggled', (data) => {
      this.state.featureFlags[data.flag] = data.enabled;
      this.config.callbacks.onFeatureToggle?.(data.flag, data.enabled);
    });

    this.socket.on('config:updated', (data) => {
      this.updateState(data);
    });
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat', {
          sdkVersion: '0.1.0',
          configVersion: 0, // TODO: track version
          uptime: Date.now(),
        });
      }
    }, HEARTBEAT_INTERVAL);
  }

  private updateState(response: any): void {
    if (response.license) {
      this.state.license = response.license;
    }
    if (response.config) {
      if (response.config.maintenance) {
        this.state.maintenance = response.config.maintenance;
      }
      if (response.config.killSwitch) {
        this.state.killSwitch = response.config.killSwitch.enabled;
      }
      if (response.config.notifications) {
        this.state.notifications = response.config.notifications.filter(
          (n: any) => n.active
        );
      }
      if (response.config.featureFlags) {
        this.state.featureFlags = response.config.featureFlags;
      }
    }
  }

  private async generateFingerprint(): Promise<string> {
    // Simple browser fingerprint (canvas + screen + timezone)
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.hardwareConcurrency?.toString() || '',
    ];
    const data = components.join('|');
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[DevLock] ${message}`);
    }
  }
}
