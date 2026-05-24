export interface DevLockOptions {
  projectKey: string;
  licenseKey?: string;
  apiUrl?: string;
  wsUrl?: string;
  environment?: 'production' | 'staging' | 'development';
  debug?: boolean;
  callbacks?: DevLockCallbacks;
}

export interface DevLockCallbacks {
  onReady?: (state: DevLockState) => void;
  onSuspended?: (reason: string) => void;
  onMaintenance?: (message: string) => void;
  onKillSwitch?: (reason: string) => void;
  onNotification?: (notification: SDKNotification) => void;
  onFeatureToggle?: (flag: string, enabled: boolean) => void;
  onDomainBlocked?: () => void;
  onError?: (error: Error) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export interface DevLockState {
  initialized: boolean;
  connected: boolean;
  license: {
    valid: boolean;
    status: string;
    features: string[];
    expiresAt?: string;
  };
  maintenance: { enabled: boolean; message?: string };
  killSwitch: boolean;
  notifications: SDKNotification[];
  featureFlags: Record<string, boolean>;
}

export interface SDKNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'payment';
  message: string;
  severity: string;
  dismissible: boolean;
}
