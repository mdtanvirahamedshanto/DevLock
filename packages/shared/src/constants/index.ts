import { Plan, type TenantLimits } from '../types/tenant.js';

export const PLAN_LIMITS: Record<Plan, TenantLimits> = {
  [Plan.FREE]: {
    maxProjects: 2,
    maxLicenses: 50,
    maxApiCalls: 10_000,
    maxTeamMembers: 2,
    maxDomains: 2,
    maxFeatureFlags: 5,
    analyticsRetentionDays: 7,
    offlineGraceHours: 24,
    websocketEnabled: false,
    killSwitchEnabled: false,
    webhooksEnabled: false,
  },
  [Plan.PRO]: {
    maxProjects: 20,
    maxLicenses: 5_000,
    maxApiCalls: 500_000,
    maxTeamMembers: 10,
    maxDomains: 20,
    maxFeatureFlags: 50,
    analyticsRetentionDays: 90,
    offlineGraceHours: 72,
    websocketEnabled: true,
    killSwitchEnabled: true,
    webhooksEnabled: true,
  },
  [Plan.ENTERPRISE]: {
    maxProjects: Infinity,
    maxLicenses: Infinity,
    maxApiCalls: Infinity,
    maxTeamMembers: Infinity,
    maxDomains: Infinity,
    maxFeatureFlags: Infinity,
    analyticsRetentionDays: 365,
    offlineGraceHours: 168,
    websocketEnabled: true,
    killSwitchEnabled: true,
    webhooksEnabled: true,
  },
};

export const LICENSE_KEY_PREFIX = 'DLCK';
export const LICENSE_KEY_SEGMENTS = 4;
export const LICENSE_KEY_SEGMENT_LENGTH = 4;

export const SDK_HEARTBEAT_INTERVAL_MS = 30_000;
export const SDK_CONFIG_CACHE_TTL_MS = 120_000;
export const SDK_LICENSE_CACHE_TTL_MS = 300_000;

export const REDIS_KEY_PREFIX = {
  LICENSE: 'license:',
  CONFIG: 'config:',
  TENANT: 'tenant:',
  SESSION: 'session:',
  RATE_LIMIT: 'rl:',
  LOCK: 'lock:',
} as const;

export const CACHE_TTL = {
  LICENSE_STATUS: 300,       // 5 minutes
  CONFIG: 120,               // 2 minutes
  TENANT_LIMITS: 600,        // 10 minutes
  SESSION: 86_400,           // 24 hours
  RATE_LIMIT_WINDOW: 60,    // 1 minute
} as const;

export const MAX_REQUEST_TIMESTAMP_DRIFT_MS = 300_000; // 5 minutes
export const MAX_CLOCK_DRIFT_WARNING_MS = 300_000;     // 5 minutes
export const MAX_CLOCK_DRIFT_REVALIDATE_MS = 3_600_000; // 1 hour
