import type { Request, Response, NextFunction } from 'express';
import { DevLockNode } from '../DevLock.js';
import type { DevLockNodeConfig } from '../types.js';

interface DevLockMiddlewareOptions extends DevLockNodeConfig {
  /**
   * Function to extract license key from request.
   * Default: checks X-License-Key header, then query param 'license'.
   */
  extractLicenseKey?: (req: Request) => string | undefined;

  /**
   * Routes to exclude from license validation.
   * Supports glob patterns.
   */
  excludePaths?: string[];

  /**
   * Custom response when license is invalid.
   */
  onInvalid?: (req: Request, res: Response) => void;

  /**
   * Custom response when in maintenance mode.
   */
  onMaintenance?: (req: Request, res: Response, message?: string) => void;
}

/**
 * Express middleware for DevLock license enforcement.
 *
 * @example
 * ```typescript
 * import { createDevLockMiddleware } from '@devlock/sdk-node/express';
 *
 * const devlock = createDevLockMiddleware({
 *   secretKey: process.env.DEVLOCK_SECRET_KEY,
 *   projectId: process.env.DEVLOCK_PROJECT_ID,
 *   excludePaths: ['/health', '/public/*'],
 * });
 *
 * app.use(devlock);
 * ```
 */
export function createDevLockMiddleware(options: DevLockMiddlewareOptions) {
  const client = new DevLockNode(options);
  let initialized = false;

  const extractKey = options.extractLicenseKey || ((req: Request) => {
    return (req.headers['x-license-key'] as string) || (req.query['license'] as string);
  });

  const excludePaths = options.excludePaths || [];

  // Initialize asynchronously
  client.init().then(() => {
    initialized = true;
  }).catch((err) => {
    console.error('[DevLock] Middleware initialization failed:', err);
  });

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip excluded paths
    if (excludePaths.some((pattern) => matchPath(req.path, pattern))) {
      next();
      return;
    }

    // If not initialized yet, allow through (graceful degradation)
    if (!initialized) {
      next();
      return;
    }

    // Check maintenance mode
    if (client.isMaintenanceMode()) {
      if (options.onMaintenance) {
        options.onMaintenance(req, res, client.getState().config.maintenance.message);
      } else {
        res.status(503).json({
          error: 'Service is under maintenance',
          message: client.getState().config.maintenance.message,
        });
      }
      return;
    }

    // Check kill switch
    if (client.getState().config.killSwitch.enabled) {
      res.status(503).json({
        error: 'Service temporarily disabled',
        reason: client.getState().config.killSwitch.reason,
      });
      return;
    }

    // Extract and validate license
    const licenseKey = extractKey(req);
    if (!licenseKey) {
      if (options.onInvalid) {
        options.onInvalid(req, res);
      } else {
        res.status(401).json({ error: 'License key required' });
      }
      return;
    }

    const result = await client.validateLicense(licenseKey);

    if (!result.valid) {
      if (options.onInvalid) {
        options.onInvalid(req, res);
      } else {
        res.status(403).json({
          error: 'Invalid license',
          status: result.status,
        });
      }
      return;
    }

    // Attach license info to request
    (req as any).devlock = {
      license: result,
      features: result.features,
      isFeatureEnabled: (flag: string) => client.isFeatureEnabled(flag),
    };

    next();
  };
}

function matchPath(path: string, pattern: string): boolean {
  if (pattern.endsWith('/*')) {
    return path.startsWith(pattern.slice(0, -2));
  }
  return path === pattern;
}
