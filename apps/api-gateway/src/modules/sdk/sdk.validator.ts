import { z } from 'zod';

export const SDKInitSchema = z.object({
  body: z.object({
    projectId: z.string().min(1),
    licenseKey: z.string().optional(),
    sdkVersion: z.string().min(1).max(20),
    environment: z.enum(['production', 'staging', 'development']),
    fingerprint: z.string().min(1).max(512),
    domain: z.string().max(253).optional(),
    integrityHash: z.string().optional(),
  }),
});

export const SDKValidateSchema = z.object({
  body: z.object({
    licenseKey: z.string().min(1).max(100),
    fingerprint: z.string().min(1).max(512),
    domain: z.string().max(253).optional(),
    sdkVersion: z.string().min(1).max(20),
    environment: z.enum(['production', 'staging', 'development']),
  }),
});

export const SDKHeartbeatSchema = z.object({
  body: z.object({
    sdkVersion: z.string().min(1),
    configVersion: z.number().int().min(0),
    fingerprint: z.string().min(1).max(512),
    uptime: z.number().int().min(0),
  }),
});

export const SDKTelemetrySchema = z.object({
  body: z.object({
    events: z.array(z.object({
      type: z.string().max(100),
      timestamp: z.number(),
      metadata: z.record(z.unknown()).optional(),
    })).max(100),
    sessionId: z.string().max(100),
    sdkVersion: z.string().max(20),
  }),
});
