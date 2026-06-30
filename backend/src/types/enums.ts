export enum Plan {
  FREE = 'free',
  PRO = 'pro',
  BUSINESS = 'business',
  ENTERPRISE = 'enterprise',
}

export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  VIEWER = 'viewer',
  BILLING = 'billing',
}

export enum LicenseStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  TRIAL = 'trial',
}

export enum LicenseType {
  PERPETUAL = 'perpetual',
  SUBSCRIPTION = 'subscription',
  TRIAL = 'trial',
  FLOATING = 'floating',
}

export enum NotificationType {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  PAYMENT = 'payment',
}

export enum DomainAction {
  WARN = 'warn',
  BLOCK = 'block',
  KILL = 'kill',
}

export enum TamperLevel {
  WARN = 'warn',
  DEGRADE = 'degrade',
  BLOCK = 'block',
  REPORT = 'report',
}
