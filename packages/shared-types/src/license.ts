import type { LicenseStatus, LicenseType } from './enums.js';

export interface License {
  id: string;
  tenantId: string;
  projectId: string;
  key: string;
  status: LicenseStatus;
  type: LicenseType;
  activations: LicenseActivation[];
  maxActivations: number;
  features: string[];
  metadata: Record<string, unknown>;
  expiresAt?: string;
  suspendedAt?: string;
  lastValidatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LicenseActivation {
  fingerprint: string;
  domain?: string;
  ip: string;
  userAgent?: string;
  activatedAt: string;
  lastSeenAt: string;
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
  offlineToken?: string;
  signature: string;
  serverTime: number;
}

export interface OfflineLicenseToken {
  lid: string;   // license ID
  tid: string;   // tenant ID
  pid: string;   // project ID
  sts: LicenseStatus;
  fts: string[]; // features
  exp: number;   // license expiry
  grc: number;   // offline grace hours
  iat: number;   // issued at
  nxt: number;   // next required check-in
  fp: string;    // fingerprint hash
  dom: string[]; // allowed domains
}
