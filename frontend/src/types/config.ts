import type { DomainAction, NotificationType } from './enums.js';

export interface ProjectConfig {
  id: string;
  tenantId: string;
  projectId: string;
  version: number;
  maintenance: MaintenanceConfig;
  killSwitch: KillSwitchConfig;
  notifications: NotificationConfig[];
  featureFlags: Record<string, FeatureFlag>;
  domainLock: DomainLockConfig;
  updatedAt: string;
}

export interface MaintenanceConfig {
  enabled: boolean;
  message?: string;
  estimatedEnd?: string;
  allowedIPs?: string[];
}

export interface KillSwitchConfig {
  enabled: boolean;
  reason?: string;
  activatedAt?: string;
  activatedBy?: string;
}

export interface NotificationConfig {
  id: string;
  type: NotificationType;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  active: boolean;
  dismissible: boolean;
  createdAt: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  description?: string;
  rules?: FeatureFlagRule[];
}

export interface FeatureFlagRule {
  type: 'percentage' | 'domain' | 'license_type' | 'custom';
  value: string | number;
  enabled: boolean;
}

export interface DomainLockConfig {
  enabled: boolean;
  domains: string[];
  action: DomainAction;
}

export interface Project {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  publicKey: string;
  allowedDomains: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
