import { z } from 'zod';

export const licenseValidationSchema = z.object({
  licenseKey: z.string().min(1).max(100),
  fingerprint: z.string().min(1).max(256),
  domain: z.string().optional(),
  projectId: z.string().min(1),
  sdkVersion: z.string().min(1),
  environment: z.enum(['production', 'staging', 'development']),
});

export const sdkInitSchema = z.object({
  projectId: z.string().min(1),
  sdkVersion: z.string().min(1),
  environment: z.enum(['production', 'staging', 'development']),
  fingerprint: z.string().min(1).max(256),
});

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  allowedDomains: z.array(z.string().max(253)).max(50).optional(),
  settings: z
    .object({
      maintenance: z
        .object({
          enabled: z.boolean(),
          message: z.string().max(500).optional(),
        })
        .optional(),
    })
    .optional(),
});

export const createLicenseSchema = z.object({
  type: z.enum(['perpetual', 'subscription', 'trial', 'floating']),
  maxActivations: z.number().int().min(1).max(10000).default(1),
  expiresAt: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
  features: z.array(z.string().max(100)).max(100).optional(),
});

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
  notifications: z
    .array(
      z.object({
        id: z.string().optional(),
        type: z.enum(['info', 'warning', 'error', 'payment']),
        message: z.string().max(500),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        active: z.boolean(),
        dismissible: z.boolean().default(true),
      })
    )
    .max(20)
    .optional(),
  domainLock: z
    .object({
      enabled: z.boolean(),
      domains: z.array(z.string().max(253)).max(50),
      action: z.enum(['warn', 'block', 'kill']),
    })
    .optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type LicenseValidationInput = z.infer<typeof licenseValidationSchema>;
export type SDKInitInput = z.infer<typeof sdkInitSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateLicenseInput = z.infer<typeof createLicenseSchema>;
export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
