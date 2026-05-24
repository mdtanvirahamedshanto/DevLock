import rateLimit from 'express-rate-limit';
// import RedisStore from 'rate-limit-redis';
// import { redis } from '../config/redis.js';

/**
 * Creates a rate limiter middleware.
 * In production, uses Redis as the backing store for distributed rate limiting.
 * Falls back to in-memory store for development.
 */
export function createRateLimiter() {
  return rateLimit({
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '60000', 10),
    max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        message: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    },
    keyGenerator: (req) => {
      // Use API key if present, otherwise IP
      return (req.headers['x-devlock-key'] as string) || req.ip || 'unknown';
    },
    // In production, uncomment to use Redis store:
    // store: new RedisStore({
    //   sendCommand: (...args: string[]) => redis.call(...args),
    // }),
  });
}

/**
 * Stricter rate limiter for auth endpoints.
 */
export function createAuthRateLimiter() {
  return rateLimit({
    windowMs: 60_000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        message: 'Too many authentication attempts',
        code: 'AUTH_RATE_LIMIT',
      },
    },
  });
}
