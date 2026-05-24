import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 60_000,
  max: Number(process.env['RATE_LIMIT_MAX'] ?? 100),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.headers['x-devlock-key'] as string) ?? req.ip ?? 'unknown',
  message: { error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
});

export const authRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'AUTH_RATE_LIMIT', message: 'Too many auth attempts' } },
});
