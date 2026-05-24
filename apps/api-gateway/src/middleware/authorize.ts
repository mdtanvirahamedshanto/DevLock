import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError, AuthenticationError } from '../core/errors/index.js';
import type { Permission } from '../core/auth/permissions.js';

/**
 * Authorization middleware — checks if the authenticated user
 * has ALL of the required permissions.
 */
export function authorize(...requiredPermissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      throw new AuthenticationError();
    }

    for (const permission of requiredPermissions) {
      if (!req.auth.permissions.includes(permission)) {
        throw new ForbiddenError(
          `Insufficient permissions. Required: ${permission}`,
        );
      }
    }

    next();
  };
}

/**
 * Checks if user has ANY of the listed permissions.
 */
export function authorizeAny(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      throw new AuthenticationError();
    }

    const hasAny = permissions.some((p) => req.auth!.permissions.includes(p));
    if (!hasAny) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
}

/**
 * Ensures the request is scoped to the user's own organization.
 * Prevents cross-tenant access.
 */
export function ensureOrgAccess(req: Request, _res: Response, next: NextFunction): void {
  if (!req.auth) {
    throw new AuthenticationError();
  }

  const orgId = req.params['orgId'] ?? req.body?.orgId;
  if (orgId && orgId !== req.auth.orgId) {
    throw new ForbiddenError('Access denied to this organization');
  }

  next();
}
