import { createHmac } from 'crypto';
import { io, Socket } from 'socket.io-client';
import type { DevLockNodeConfig, DevLockNodeState, LicenseValidationResult } from './types.js';

const DEFAULT_API_URL = 'https://api.devlock.io';
const DEFAULT_WS_URL = 'wss://ws.devlock.io';
const DEFAULT_SYNC_INTERVAL = 300_000; // 5 minutes
const DEFAULT_CACHE_TTL = 300_000;     // 5 minutes

/**
 * DevLock Backend SDK for Node.js
 *
 * Provides server-side license validation, remote configuration,
 * and real-time kill-switch capabilities.
 *
 * @example
 * ```typescript
 * const devlock = new DevLockNode({
 *   secretKey: 'sk_live_xxxxx',
 *   projectId: 'proj_xxxxx',
 *   onKillSwitch: (reason) => {
 *     console.error('Kill switch activated:', reason);
 *     // Gracefully shut down or return 503
 *   }
 * });
 *
 * await devlock.init();
 *
 * // Validate a license
 * const result = await devlock.validateLicense('DLCK-XXXX-XXXX-XXXX-XXXX');
 * ```
 */
export class DevLockNode {
  private config: Required<DevLockNodeConfig>;
  private state: DevLockNodeState;
  private socket: Socket | null = null;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private licenseCache: Map<string, { result: LicenseValidationResult; timestamp: number }> = new Map();

  constructor(config: DevLockNodeConfig) {
    this.config = {
      secretKey: config.secretKey,
      projectId: config.projectId,
      apiUrl: config.apiUrl || DEFAULT_API_URL,
      wsUrl: config.wsUrl || DEFAULT_WS_URL,
      environment: config.environment || 'production',
      syncInterval: config.syncInterval || DEFAULT_SYNC_INTERVAL,
      cacheTTL: config.cacheTTL || DEFAULT_CACHE_TTL,
      offlineGraceHours: config.offlineGraceHours || 72,
      onKillSwitch: config.onKillSwitch || (() => {}),
      onMaintenance: config.onMaintenance || (() => {}),
      onError: config.onError || (() => {}),
    };

    this.state = {
      initialized: false,
      connected: false,
      lastSync: 0,
      config: {
        maintenance: { enabled: false },
        killSwitch: { enabled: false },
        featureFlags: {},
      },
    };
  }

  /**
   * Initialize the SDK. Fetches initial config and establishes WebSocket.
   */
  async init(): Promise<void> {
    try {
      await this.syncConfig();
      this.connectWebSocket();
      this.startSyncTimer();
      this.state.initialized = true;
    } catch (error) {
      this.config.onError(error as Error);
      throw error;
    }
  }

  /**
   * Validate a license key. Results are cached for the configured TTL.
   */
  async validateLicense(licenseKey: string, fingerprint?: string): Promise<LicenseValidationResult> {
    // Check cache first
    const cached = this.licenseCache.get(licenseKey);
    if (cached && Date.now() - cached.timestamp < this.config.cacheTTL) {
      return cached.result;
    }

    // Check kill switch
    if (this.state.config.killSwitch.enabled) {
      return { valid: false, status: 'revoked', features: [], error: 'Service disabled' };
    }

    try {
      const timestamp = Date.now().toString();
      const signature = this.signRequest({ licenseKey, fingerprint, timestamp });

      const response = await fetch(`${this.config.apiUrl}/v1/licenses/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-DevLock-Secret': this.config.secretKey,
          'X-DevLock-Signature': signature,
          'X-DevLock-Timestamp': timestamp,
        },
        body: JSON.stringify({
          licenseKey,
          fingerprint: fingerprint || 'server',
          projectId: this.config.projectId,
          sdkVersion: '0.1.0',
          environment: this.config.environment,
        }),
      });

      if (!response.ok) {
        throw new Error(`Validation failed: ${response.status}`);
      }

      const data = await response.json() as LicenseValidationResult;

      // Cache the result
      this.licenseCache.set(licenseKey, { result: data, timestamp: Date.now() });

      return data;
    } catch (error) {
      // On network failure, check offline cache
      if (cached) {
        return cached.result; // Return stale cache
      }
      return { valid: false, status: 'unknown', features: [], error: (error as Error).message };
    }
  }

  /**
   * Check if a feature flag is enabled.
   */
  isFeatureEnabled(flag: string): boolean {
    return this.state.config.featureFlags[flag] ?? false;
  }

  /**
   * Check if the service is in maintenance mode.
   */
  isMaintenanceMode(): boolean {
    return this.state.config.maintenance.enabled;
  }

  /**
   * Get current state.
   */
  getState(): Readonly<DevLockNodeState> {
    return { ...this.state };
  }

  /**
   * Destroy the SDK instance.
   */
  destroy(): void {
    if (this.syncTimer) clearInterval(this.syncTimer);
    if (this.socket) this.socket.disconnect();
    this.licenseCache.clear();
    this.state.initialized = false;
  }

  // ─── Private Methods ────────────────────────────────────────────────

  private async syncConfig(): Promise<void> {
    const timestamp = Date.now().toString();
    const signature = this.signRequest({ projectId: this.config.projectId, timestamp });

    const response = await fetch(`${this.config.apiUrl}/v1/sdk/config`, {
      headers: {
        'X-DevLock-Secret': this.config.secretKey,
        'X-DevLock-Signature': signature,
        'X-DevLock-Timestamp': timestamp,
      },
    });

    if (response.ok) {
      const data = await response.json() as any;
      this.state.config = data.config || this.state.config;
      this.state.lastSync = Date.now();
    }
  }

  private connectWebSocket(): void {
    this.socket = io(this.config.wsUrl, {
      auth: {
        apiKey: this.config.secretKey,
        projectId: this.config.projectId,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
    });

    this.socket.on('connect', () => {
      this.state.connected = true;
    });

    this.socket.on('disconnect', () => {
      this.state.connected = false;
    });

    this.socket.on('killswitch:activated', (data) => {
      this.state.config.killSwitch = { enabled: true, reason: data.reason };
      this.licenseCache.clear();
      this.config.onKillSwitch(data.reason);
    });

    this.socket.on('killswitch:deactivated', () => {
      this.state.config.killSwitch = { enabled: false };
    });

    this.socket.on('maintenance:enabled', (data) => {
      this.state.config.maintenance = { enabled: true, message: data.message };
      this.config.onMaintenance(true, data.message);
    });

    this.socket.on('maintenance:disabled', () => {
      this.state.config.maintenance = { enabled: false };
      this.config.onMaintenance(false);
    });

    this.socket.on('config:updated', (data) => {
      if (data.featureFlags) {
        this.state.config.featureFlags = data.featureFlags;
      }
    });

    this.socket.on('license:suspended', () => {
      // Invalidate all cached license validations
      this.licenseCache.clear();
    });
  }

  private startSyncTimer(): void {
    this.syncTimer = setInterval(() => {
      this.syncConfig().catch((err) => {
        this.config.onError(err);
      });
    }, this.config.syncInterval);
  }

  private signRequest(payload: Record<string, unknown>): string {
    const data = JSON.stringify(payload);
    return createHmac('sha256', this.config.secretKey).update(data).digest('hex');
  }
}
