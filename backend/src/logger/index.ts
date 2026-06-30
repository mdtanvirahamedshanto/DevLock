import pino from 'pino';

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export interface LoggerOptions {
  service: string;
  level?: LogLevel;
  pretty?: boolean;
}

export function createLogger(options: LoggerOptions): pino.Logger {
  const { service, level, pretty } = options;

  const isProduction = process.env['NODE_ENV'] === 'production';
  const logLevel = level ?? (isProduction ? 'info' : 'debug');

  return pino({
    name: service,
    level: logLevel,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label };
      },
      bindings(bindings) {
        return {
          service: bindings['name'],
          pid: bindings['pid'],
          hostname: bindings['hostname'],
        };
      },
    },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers["x-devlock-secret"]',
        'password',
        'passwordHash',
        'secretKey',
        'token',
        'refreshToken',
      ],
      censor: '[REDACTED]',
    },
    ...(pretty || !isProduction
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'HH:MM:ss.l',
              ignore: 'pid,hostname',
            },
          },
        }
      : {}),
  });
}

// Convenience: child logger with request context
export function createRequestLogger(
  logger: pino.Logger,
  context: { requestId: string; tenantId?: string; userId?: string },
): pino.Logger {
  return logger.child(context);
}

export type { Logger } from 'pino';
export default createLogger;
