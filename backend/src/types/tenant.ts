import type { Plan, Role } from './enums.js';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  ownerId: string;
  settings: TenantSettings;
  billing: TenantBilling;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
  customDomain?: string;
  branding?: {
    logo?: string;
    primaryColor?: string;
    companyName?: string;
  };
}

export interface TenantBilling {
  stripeCustomerId?: string;
  subscriptionId?: string;
  currentPeriodEnd?: string;
  paymentStatus?: 'active' | 'past_due' | 'canceled';
}

export interface TenantLimits {
  maxProjects: number;
  maxLicenses: number;
  maxApiCalls: number;
  maxTeamMembers: number;
  maxDomains: number;
  maxFeatureFlags: number;
  analyticsRetentionDays: number;
  offlineGraceHours: number;
  websocketEnabled: boolean;
  killSwitchEnabled: boolean;
  webhooksEnabled: boolean;
}

export interface TenantContext {
  tenantId: string;
  userId: string;
  plan: Plan;
  role: Role;
  limits: TenantLimits;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  mfaEnabled: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}
