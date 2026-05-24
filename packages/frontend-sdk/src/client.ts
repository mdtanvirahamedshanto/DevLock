import { io, Socket } from 'socket.io-client';
import type { DevLockOptions, DevLockState, DevLockCallbacks } from './types';

const DEFAULT_API = 'https://api.devlock.io';
const DEFAULT_WS = 'wss://ws.devlock.io';
const HEARTBEAT_MS = 30_000;

/**
 * DevLock Frontend SDK Client.
 *
 * @example
 * ```ts
 * const client = new DevLockClient({
 *   projectKey: 'pk_live_xxx',
 *   licenseKey: 'DLCK-XXXX-XXXX-XXXX-XXXX',
 *   callbacks: {
 *     onKillSwitch: (reason) => showBlockedUI(reason),
 *   },
 * });
 * await client.init();
 * ```
 */
export class DevLockClient {
  private opts: Required<DevLockOptions>;
  private state: DevLockState;
  private socket: Socket | null = null;
  private heartbeat: ReturnType<typeof setInterval> | null = null;

  constructor(options: DevLockOptions) {
    this.opts = {
      projectKey: options.projectKey,
      licenseKey: options.licenseKey ?? '',
      apiUrl: options.apiUrl ?? DEFAULT_API,
      wsUrl: options.wsUrl ?? DEFAULT_WS,
      environment: options.environment ?? 'production',
      debug: options.debug ?? false,
      callbacks: options.callbacks ?? {},
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

  async init(): Promise<DevLockState> {
    const response = await this.fetchInit();
    this.applyResponse(response);
    this.connectWs();
    this.startHeartbeat();
    this.state.initialized = true;
    this.opts.callbacks.onReady?.(this.state);
    return this.state;
  }

  isFeatureEnabled(flag: string): boolean {
    return this.state.featureFlags[flag] ?? false;
  }

  getState(): Readonly<DevLockState> {
    return { ...this.state };
  }

  destroy(): void {
    if (this.heartbeat) clearInterval(this.heartbeat);
    this.socket?.disconnect();
    this.state.initialized = false;
  }

  // ── Private ──────────────────────────────────────────────────────────

  private async fetchInit(): Promise<unknown> {
    const res = await fetch(`${this.opts.apiUrl}/v1/sdk/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-DevLock-Key': this.opts.projectKey,
        'X-DevLock-Domain': globalThis.location?.hostname ?? '',
      },
      body: JSON.stringify({
        projectId: this.opts.projectKey,
        licenseKey: this.opts.licenseKey,
        sdkVersion: '0.1.0',
        environment: this.opts.environment,
        fingerprint: await this.fingerprint(),
      }),
    });
    if (!res.ok) throw new Error(`DevLock init failed: ${res.status}`);
    return res.json();
  }

  private connectWs(): void {
    this.socket = io(this.opts.wsUrl, {
      auth: { apiKey: this.opts.projectKey, projectId: this.opts.projectKey },
      transports: ['websocket'],
      reconnection: true,
    });

    this.socket.on('connect', () => {
      this.state.connected = true;
      this.opts.callbacks.onConnectionChange?.(true);
    });
    this.socket.on('disconnect', () => {
      this.state.connected = false;
      this.opts.callbacks.onConnectionChange?.(false);
    });
    this.socket.on('killswitch:activated', (d: { reason: string }) => {
      this.state.killSwitch = true;
      this.opts.callbacks.onKillSwitch?.(d.reason);
    });
    this.socket.on('maintenance:enabled', (d: { message: string }) => {
      this.state.maintenance = { enabled: true, message: d.message };
      this.opts.callbacks.onMaintenance?.(d.message);
    });
    this.socket.on('maintenance:disabled', () => {
      this.state.maintenance = { enabled: false };
    });
    this.socket.on('license:suspended', (d: { reason: string }) => {
      this.state.license.status = 'suspended';
      this.state.license.valid = false;
      this.opts.callbacks.onSuspended?.(d.reason);
    });
    this.socket.on('feature:toggled', (d: { flag: string; enabled: boolean }) => {
      this.state.featureFlags[d.flag] = d.enabled;
      this.opts.callbacks.onFeatureToggle?.(d.flag, d.enabled);
    });
    this.socket.on('notification:push', (d: any) => {
      this.state.notifications.push(d);
      this.opts.callbacks.onNotification?.(d);
    });
  }

  private startHeartbeat(): void {
    this.heartbeat = setInterval(() => {
      this.socket?.emit('heartbeat', { sdkVersion: '0.1.0', uptime: Date.now() });
    }, HEARTBEAT_MS);
  }

  private applyResponse(data: any): void {
    if (data.license) this.state.license = data.license;
    if (data.config) {
      this.state.maintenance = data.config.maintenance ?? { enabled: false };
      this.state.killSwitch = data.config.killSwitch?.enabled ?? false;
      this.state.featureFlags = data.config.featureFlags ?? {};
      this.state.notifications = (data.config.notifications ?? []).filter((n: any) => n.active);
    }
  }

  private async fingerprint(): Promise<string> {
    const raw = [
      navigator.userAgent,
      navigator.language,
      `${screen.width}x${screen.height}`,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    ].join('|');
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
}
