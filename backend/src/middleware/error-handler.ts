import type { Request, Response, NextFunction } from 'express';
import { createLogger } from '@/logger';
import { BaseError } from '../core/errors/index.js';

const logger = createLogger({ service: 'api-gateway' });

/**
 * Global error handler — must be registered last.
 * Catches all errors thrown in route handlers and middleware.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = req.headers['x-request-id'] as string | undefined;

  if (err instanceof BaseError) {
    // Operational errors — expected, safe to expose
    if (!err.isOperational) {
      logger.fatal({ err, requestId, path: req.path }, 'Non-operational error');
    } else {
      logger.warn({ err: { code: err.code, message: err.message }, requestId, path: req.path }, err.message);
    }

    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: err.message },
    });
    return;
  }

  // Mongoose duplicate key
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message: 'Resource already exists' },
    });
    return;
  }

  // Unexpected errors — log full stack, return generic message
  logger.fatal({ err, requestId, path: req.path, method: req.method }, 'Unhandled error');

  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  });
}
