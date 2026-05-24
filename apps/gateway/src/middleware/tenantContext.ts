import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { TenantContext } from '@devlock/shared';
import { AppError } from './errorHandler.js';

const JWT_SECRET = process.env['JWT_SECRET'] || 'dev-secret-change-me';

declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
      userId?: string;
    }
  }
}

/**
 * Extracts tenant context from JWT token or API key.
 * SDK endpoints use API keys; dashboard endpoints use JWT.
 */
export function tenantContext(req: Request, _res: Response, next: NextFunction): void {
  // SDK endpoints use API key auth
  const apiKey = req.headers['x-devlock-key'] as string | undefined;
  const secretKey = req.headers['x-devlock-secret'] as string | undefined;

  if (apiKey || secretKey) {
    // SDK authentication path — resolved by license/config service
    // Pass through; individual services validate the key
    next();
    return;
  }

  // Dashboard endpoints use JWT
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    // Public endpoints (health, auth) don't require auth
    next();
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      sub: string;
      tenantId: string;
      plan: string;
      role: string;
    };

    req.userId = payload.sub;
    req.tenant = {
      tenantId: payload.tenantId,
      plan: payload.plan as any,
      limits: {} as any, // Resolved from cache/DB in service layer
      features: [],
    };

    next();
  } catch {
    throw new AppError(401, 'Invalid or expired token', 'AUTH_INVALID_TOKEN');
  }
}
