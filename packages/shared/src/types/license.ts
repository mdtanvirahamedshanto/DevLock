export enum LicenseStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export enum LicenseType {
  PERPETUAL = 'perpetual',
  SUBSCRIPTION = 'subscription',
  TRIAL = 'trial',
  FLOATING = 'floating',
}

export interface LicenseActivation {
  fingerprint: string;
  domain?: string;
  ip: string;
  userAgent?: string;
  activatedAt: string;
}

export interface License {
  id: string;
  tenantId: string;
  projectId: string;
  key: string;
  status: LicenseStatus;
  type: LicenseType;
  activations: LicenseActivation[];
  maxActivations: number;
  metadata: Record<string, unknown>;
  features: string[];
  expiresAt?: string;
  suspendedAt?: string;
  lastValidatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LicenseValidationRequest {
  licenseKey: string;
  fingerprint: string;
  domain?: string;
  projectId: string;
  sdkVersion: string;
  environment: 'production' | 'staging' | 'development';
}

export interface LicenseValidationResponse {
  valid: boolean;
  status: LicenseStatus;
  features: string[];
  expiresAt?: string;
  config: {
    maintenance: { enabled: boolean; message?: string };
    notifications: Array<{
      id: string;
      type: 'info' | 'warning' | 'error';
      message: string;
      active: boolean;
    }>;
    flags: Record<string, boolean>;
  };
  offlineToken?: string;
  signature: string;
}

export interface OfflineLicensePayload {
  lid: string;
  tid: string;
  pid: string;
  sts: LicenseStatus;
  fts: string[];
  exp: number;
  grc: number;
  iat: number;
  nxt: number;
  fp: string;
  dom: string[];
}
