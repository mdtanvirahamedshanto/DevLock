import type { Request, Response, NextFunction } from 'express';
import { DevLockServer } from '../server.js';
import type { DevLockServerOptions } from '../types.js';

interface MiddlewareOptions extends DevLockServerOptions {
  extractLicenseKey?: (req: Request) => string | undefined;
  excludePaths?: string[];
  onUnauthorized?: (req: Request, res: Response) => void;
}

/**
 * Express middleware for DevLock license enforcement.
 *
 * @example
 * ```ts
 * import { createExpressMiddleware } from '@devlock/backend-sdk/express';
 *
 * app.use(createExpressMiddleware({
 *   secretKey: process.env.DEVLOCK_SECRET_KEY!,
 *   projectId: process.env.DEVLOCK_PROJECT_ID!,
 *   excludePaths: ['/health', '/public'],
 * }));
 * ```
 */
export function createExpressMiddleware(options: MiddlewareOptions) {
  const client = new DevLockServer(options);
  let ready = false;

  client.init().then(() => { ready = true; }).catch(console.error);

  const extractKey = options.extractLicenseKey ?? ((req: Request) =>
    (req.headers['x-license-key'] as string) ?? (req.query['license'] as string)
  );

  const excluded = options.excludePaths ?? [];

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (excluded.some((p) => req.path.startsWith(p))) { next(); return; }
    if (!ready) { next(); return; } // Graceful degradation during init

    if (client.isMaintenanceMode()) {
      res.status(503).json({ error: 'Service under maintenance' });
      return;
    }

    const key = extractKey(req);
    if (!key) {
      if (options.onUnauthorized) { options.onUnauthorized(req, res); return; }
      res.status(401).json({ error: 'License key required' });
      return;
    }

    const result = await client.validate(key);
    if (!result.valid) {
      res.status(403).json({ error: 'Invalid license', status: result.status });
      return;
    }

    (req as any).devlock = { license: result, isFeatureEnabled: (f: string) => client.isFeatureEnabled(f) };
    next();
  };
}
