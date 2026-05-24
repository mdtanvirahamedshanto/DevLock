import { z } from 'zod';

const objectIdRegex = /^[a-f0-9]{24}$/;

export const CreateLicenseSchema = z.object({
  params: z.object({
    projectId: z.string().regex(objectIdRegex, 'Invalid project ID'),
  }),
  body: z.object({
    type: z.enum(['perpetual', 'subscription', 'trial', 'floating']),
    maxActivations: z.number().int().min(1).max(10000).default(1),
    expiresAt: z.string().datetime().optional(),
    features: z.array(z.string().max(100)).max(100).default([]),
    customerEmail: z.string().email().max(255).optional(),
    customerName: z.string().max(200).optional(),
    metadata: z.record(z.unknown()).default({}),
  }),
});

export const UpdateLicenseSchema = z.object({
  params: z.object({
    projectId: z.string().regex(objectIdRegex),
    licenseId: z.string().regex(objectIdRegex),
  }),
  body: z.object({
    maxActivations: z.number().int().min(1).max(10000).optional(),
    expiresAt: z.string().datetime().nullable().optional(),
    features: z.array(z.string().max(100)).max(100).optional(),
    customerEmail: z.string().email().max(255).optional(),
    customerName: z.string().max(200).optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export const SuspendLicenseSchema = z.object({
  params: z.object({
    projectId: z.string().regex(objectIdRegex),
    licenseId: z.string().regex(objectIdRegex),
  }),
  body: z.object({
    reason: z.string().min(1).max(500),
  }),
});

export const ListLicensesSchema = z.object({
  params: z.object({
    projectId: z.string().regex(objectIdRegex),
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(['active', 'suspended', 'expired', 'revoked', 'trial']).optional(),
    type: z.enum(['perpetual', 'subscription', 'trial', 'floating']).optional(),
    search: z.string().max(100).optional(),
    sort: z.enum(['createdAt', 'expiresAt', 'lastValidatedAt']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),
});
