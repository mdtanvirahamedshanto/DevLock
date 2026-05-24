export interface DevLockNodeConfig {
  secretKey: string;
  projectId: string;
  apiUrl?: string;
  wsUrl?: string;
  environment?: 'production' | 'staging' | 'development';
  syncInterval?: number;       // Config sync interval in ms (default: 300000 = 5min)
  cacheTTL?: number;           // License cache TTL in ms (default: 300000 = 5min)
  offlineGraceHours?: number;  // Hours to allow offline operation
  onKillSwitch?: (reason: string) => void;
  onMaintenance?: (enabled: boolean, message?: string) => void;
  onError?: (error: Error) => void;
}

export interface DevLockNodeState {
  initialized: boolean;
  connected: boolean;
  lastSync: number;
  config: {
    maintenance: { enabled: boolean; message?: string };
    killSwitch: { enabled: boolean; reason?: string };
    featureFlags: Record<string, boolean>;
  };
}

export interface LicenseValidationResult {
  valid: boolean;
  status: 'active' | 'suspended' | 'expired' | 'revoked' | 'unknown';
  features: string[];
  expiresAt?: string;
  error?: string;
}
