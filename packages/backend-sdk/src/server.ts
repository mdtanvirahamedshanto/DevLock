import { createHmac } from 'crypto';
import { io, type Socket } from 'socket.io-client';
import type { DevLockServerOptions, ValidationResult, ServerState } from './types.js';

const DEFAULT_API = 'https://api.devlock.io';
const DEFAULT_WS = 'wss://ws.devlock.io';

export class DevLockServer {
  private opts: Required<DevLockServerOptions>;
  private state: ServerState;
  private socket: Socket | null = null;
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private cache = new Map<string, { result: ValidationResult; ts: number }>();

  constructor(options: DevLockServerOptions) {
    this.opts = {
      secretKey: options.secretKey,
      projectId: options.projectId,
      apiUrl: options.apiUrl ?? DEFAULT_API,
      wsUrl: options.wsUrl ?? DEFAULT_WS,
      environment: options.environment ?? 'production',
      syncIntervalMs: options.syncIntervalMs ?? 300_000,
      cacheTtlMs: options.cacheTtlMs ?? 300_000,
      onKillSwitch: options.onKillSwitch ?? (() => {}),
      onMaintenance: options.onMaintenance ?? (() => {}),
      onError: options.onError ?? (() => {}),
    };
    this.state = {
      initialized: false,
      connected: false,
      lastSync: 0,
      maintenance: { enabled: false },
      killSwitch: { enabled: false },
      featureFlags: {},
    };
  }

  async init(): Promise<void> {
    await this.sync();
    this.connectWs();
    this.syncTimer = setInterval(() => this.sync().catch(this.opts.onError), this.opts.syncIntervalMs);
    this.state.initialized = true;
  }

  async validate(licenseKey: string, fingerprint = 'server'): Promise<ValidationResult> {
    const cached = this.cache.get(licenseKey);
    if (cached && Date.now() - cached.ts < this.opts.cacheTtlMs) return cached.result;

    if (this.state.killSwitch.enabled) {
      return { valid: false, status: 'revoked', features: [], error: 'Service disabled' };
    }

    try {
      const ts = Date.now().toString();
      const sig = this.sign(JSON.stringify({ licenseKey, fingerprint, ts }));
      const res = await fetch(`${this.opts.apiUrl}/v1/licenses/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-DevLock-Secret': this.opts.secretKey,
          'X-DevLock-Signature': sig,
          'X-DevLock-Timestamp': ts,
        },
        body: JSON.stringify({
          licenseKey, fingerprint,
          projectId: this.opts.projectId,
          sdkVersion: '0.1.0',
          environment: this.opts.environment,
        }),
      });
      if (!res.ok) throw new Error(`Validation HTTP ${res.status}`);
      const data = (await res.json()) as ValidationResult;
      this.cache.set(licenseKey, { result: data, ts: Date.now() });
      return data;
    } catch (err) {
      if (cached) return cached.result;
      return { valid: false, status: 'unknown', features: [], error: (err as Error).message };
    }
  }

  isFeatureEnabled(flag: string): boolean {
    return this.state.featureFlags[flag] ?? false;
  }

  isMaintenanceMode(): boolean {
    return this.state.maintenance.enabled;
  }

  getState(): Readonly<ServerState> {
    return { ...this.state };
  }

  destroy(): void {
    if (this.syncTimer) clearInterval(this.syncTimer);
    this.socket?.disconnect();
    this.cache.clear();
    this.state.initialized = false;
  }

  private async sync(): Promise<void> {
    const ts = Date.now().toString();
    const sig = this.sign(JSON.stringify({ projectId: this.opts.projectId, ts }));
    const res = await fetch(`${this.opts.apiUrl}/v1/sdk/config`, {
      headers: {
        'X-DevLock-Secret': this.opts.secretKey,
        'X-DevLock-Signature': sig,
        'X-DevLock-Timestamp': ts,
      },
    });
    if (res.ok) {
      const data = (await res.json()) as any;
      this.state.maintenance = data.config?.maintenance ?? this.state.maintenance;
      this.state.killSwitch = data.config?.killSwitch ?? this.state.killSwitch;
      this.state.featureFlags = data.config?.featureFlags ?? this.state.featureFlags;
      this.state.lastSync = Date.now();
    }
  }

  private connectWs(): void {
    this.socket = io(this.opts.wsUrl, {
      auth: { apiKey: this.opts.secretKey, projectId: this.opts.projectId },
      transports: ['websocket'],
      reconnection: true,
    });
    this.socket.on('connect', () => { this.state.connected = true; });
    this.socket.on('disconnect', () => { this.state.connected = false; });
    this.socket.on('killswitch:activated', (d: { reason: string }) => {
      this.state.killSwitch = { enabled: true, reason: d.reason };
      this.cache.clear();
      this.opts.onKillSwitch(d.reason);
    });
    this.socket.on('killswitch:deactivated', () => {
      this.state.killSwitch = { enabled: false };
    });
    this.socket.on('maintenance:enabled', (d: { message?: string }) => {
      this.state.maintenance = { enabled: true, message: d.message };
      this.opts.onMaintenance(true, d.message);
    });
    this.socket.on('maintenance:disabled', () => {
      this.state.maintenance = { enabled: false };
      this.opts.onMaintenance(false);
    });
    this.socket.on('license:suspended', () => { this.cache.clear(); });
  }

  private sign(data: string): string {
    return createHmac('sha256', this.opts.secretKey).update(data).digest('hex');
  }
}
