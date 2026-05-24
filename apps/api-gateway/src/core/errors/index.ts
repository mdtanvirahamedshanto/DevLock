export abstract class BaseError extends Error {
  abstract statusCode: number;
  abstract code: string;
  isOperational = true;

  constructor(
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(process.env['NODE_ENV'] !== 'production' && this.details
          ? { details: this.details }
          : {}),
      },
    };
  }
}

export class ValidationError extends BaseError {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
}

export class AuthenticationError extends BaseError {
  statusCode = 401;
  code = 'AUTHENTICATION_ERROR';
  constructor(message = 'Authentication required') {
    super(message);
  }
}

export class ForbiddenError extends BaseError {
  statusCode = 403;
  code = 'FORBIDDEN';
  constructor(message = 'Access denied') {
    super(message);
  }
}

export class NotFoundError extends BaseError {
  statusCode = 404;
  code = 'NOT_FOUND';
  constructor(message = 'Resource not found') {
    super(message);
  }
}

export class ConflictError extends BaseError {
  statusCode = 409;
  code = 'CONFLICT';
}

export class RateLimitError extends BaseError {
  statusCode = 429;
  code = 'RATE_LIMIT_EXCEEDED';
  constructor() {
    super('Too many requests, please try again later');
  }
}

export class InternalError extends BaseError {
  statusCode = 500;
  code = 'INTERNAL_ERROR';
  override isOperational = false;
  constructor(message = 'An unexpected error occurred') {
    super(message);
  }
}
