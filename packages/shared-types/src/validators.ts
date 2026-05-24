import { z } from 'zod';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
  tenantName: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  mfaCode: z.string().length(6).optional(),
});

// ─── Projects ─────────────────────────────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  allowedDomains: z.array(z.string().max(253)).max(50).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

// ─── Licenses ─────────────────────────────────────────────────────────────────

export const createLicenseSchema = z.object({
  type: z.enum(['perpetual', 'subscription', 'trial', 'floating']),
  maxActivations: z.number().int().min(1).max(10000).default(1),
  expiresAt: z.string().datetime().optional(),
  features: z.array(z.string().max(100)).max(100).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const validateLicenseSchema = z.object({
  licenseKey: z.string().min(1).max(100),
  fingerprint: z.string().min(1).max(256),
  domain: z.string().max(253).optional(),
  projectId: z.string().min(1),
  sdkVersion: z.string().min(1),
  environment: z.enum(['production', 'staging', 'development']),
});

// ─── Config ───────────────────────────────────────────────────────────────────

export const updateConfigSchema = z.object({
  maintenance: z
    .object({
      enabled: z.boolean(),
      message: z.string().max(500).optional(),
      estimatedEnd: z.string().datetime().optional(),
      allowedIPs: z.array(z.string().ip()).max(50).optional(),
    })
    .optional(),
  killSwitch: z
    .object({
      enabled: z.boolean(),
      reason: z.string().max(500).optional(),
    })
    .optional(),
  domainLock: z
    .object({
      enabled: z.boolean(),
      domains: z.array(z.string().max(253)).max(50),
      action: z.enum(['warn', 'block', 'kill']),
    })
    .optional(),
});

// ─── Pagination ───────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// ─── SDK Init ─────────────────────────────────────────────────────────────────

export const sdkInitSchema = z.object({
  projectId: z.string().min(1),
  sdkVersion: z.string().min(1),
  environment: z.enum(['production', 'staging', 'development']),
  fingerprint: z.string().min(1).max(256),
  licenseKey: z.string().optional(),
});

// ─── Type Exports ─────────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateLicenseInput = z.infer<typeof createLicenseSchema>;
export type ValidateLicenseInput = z.infer<typeof validateLicenseSchema>;
export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SDKInitInput = z.infer<typeof sdkInitSchema>;
