import type { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

type RateLimitTier = 'sdk' | 'auth' | 'api';

const TIER_CONFIG: Record<RateLimitTier, { windowMs: number; max: number }> = {
  sdk: { windowMs: 60_000, max: 500 },   // 500 req/min per API key
  auth: { windowMs: 60_000, max: 10 },    // 10 req/min per IP (brute force protection)
  api: { windowMs: 60_000, max: 100 },    // 100 req/min per user
};

/**
 * Create a rate limiter for the specified tier.
 */
export function rateLimiter(tier: RateLimitTier) {
  const config = TIER_CONFIG[tier];

  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      switch (tier) {
        case 'sdk':
          return (req.headers['x-devlock-key'] as string) ?? req.ip ?? 'unknown';
        case 'auth':
          return req.ip ?? 'unknown';
        case 'api':
          return req.auth?.sub ?? req.ip ?? 'unknown';
        default:
          return req.ip ?? 'unknown';
      }
    },
    handler: (_req: Request, res: Response, _next: NextFunction) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later',
        },
      });
    },
  });
}
