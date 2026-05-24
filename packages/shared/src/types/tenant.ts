export enum Plan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  DEVELOPER = 'developer',
  VIEWER = 'viewer',
  BILLING = 'billing',
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
  plan: Plan;
  limits: TenantLimits;
  features: string[];
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  ownerId: string;
  settings: {
    customDomain?: string;
    branding?: {
      logo?: string;
      primaryColor?: string;
    };
  };
  billing: {
    stripeCustomerId?: string;
    subscriptionId?: string;
    currentPeriodEnd?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: Role;
  mfaEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
}
