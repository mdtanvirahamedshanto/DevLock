import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ValidationError } from '../core/errors/index.js';

/**
 * Validate request against a Zod schema.
 * Schema should define shape for { body, params, query }.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const formatted = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      throw new ValidationError('Request validation failed', formatted);
    }

    // Replace with parsed/coerced values
    const data = result.data as { body?: unknown; params?: unknown; query?: unknown };
    if (data.body) req.body = data.body;
    if (data.params) req.params = data.params as Record<string, string>;
    if (data.query) req.query = data.query as Record<string, string>;

    next();
  };
}

/**
 * Validate only the request body.
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formatted = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      throw new ValidationError('Request body validation failed', formatted);
    }

    req.body = result.data;
    next();
  };
}
