export interface DevLockServerOptions {
  secretKey: string;
  projectId: string;
  apiUrl?: string;
  wsUrl?: string;
  environment?: 'production' | 'staging' | 'development';
  syncIntervalMs?: number;
  cacheTtlMs?: number;
  onKillSwitch?: (reason: string) => void;
  onMaintenance?: (enabled: boolean, message?: string) => void;
  onError?: (error: Error) => void;
}

export interface ValidationResult {
  valid: boolean;
  status: 'active' | 'suspended' | 'expired' | 'revoked' | 'unknown';
  features: string[];
  expiresAt?: string;
  error?: string;
}

export interface ServerState {
  initialized: boolean;
  connected: boolean;
  lastSync: number;
  maintenance: { enabled: boolean; message?: string };
  killSwitch: { enabled: boolean; reason?: string };
  featureFlags: Record<string, boolean>;
}
