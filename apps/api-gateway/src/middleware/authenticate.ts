import type { Request, Response, NextFunction } from 'express';
import { TokenService } from '../core/auth/token-service.js';
import { AuthenticationError } from '../core/errors/index.js';
import { getPermissionsForRole, type Role } from '../core/auth/permissions.js';

const tokenService = new TokenService();

declare global {
  namespace Express {
    interface Request {
      auth?: {
        sub: string;
        orgId: string;
        role: Role;
        permissions: string[];
      };
    }
  }
}

/**
 * Authenticate requests using Bearer JWT token.
 * Attaches decoded auth context to req.auth.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing or invalid Authorization header');
  }

  const token = authHeader.slice(7);

  try {
    const decoded = tokenService.verifyAccessToken(token);

    req.auth = {
      sub: decoded.sub,
      orgId: decoded.orgId,
      role: decoded.role as Role,
      permissions: decoded.permissions ?? getPermissionsForRole(decoded.role as Role),
    };

    next();
  } catch (err: unknown) {
    const message = err instanceof Error && err.name === 'TokenExpiredError'
      ? 'Token expired'
      : 'Invalid token';
    throw new AuthenticationError(message);
  }
}

/**
 * Optional authentication — does not throw if no token present.
 * Useful for endpoints that behave differently for authenticated users.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next();
    return;
  }

  try {
    const token = authHeader.slice(7);
    const decoded = tokenService.verifyAccessToken(token);
    req.auth = {
      sub: decoded.sub,
      orgId: decoded.orgId,
      role: decoded.role as Role,
      permissions: decoded.permissions ?? getPermissionsForRole(decoded.role as Role),
    };
  } catch {
    // Ignore invalid tokens in optional auth
  }

  next();
}
