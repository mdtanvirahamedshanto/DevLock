import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createLogger } from '@devlock/logger';
import { connectMongo } from '@devlock/database';
import { errorHandler } from './middleware/error-handler.js';
import { requestId } from './middleware/request-id.js';
import { rateLimiter } from './middleware/rate-limiter.js';
import { routes } from './routes/index.js';

const logger = createLogger({ service: 'api-gateway' });
const PORT = Number(process.env['PORT'] ?? 3000);

const app = express();

// ── Global Middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env['CORS_ORIGINS']?.split(',') ?? '*', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(requestId);
app.use(rateLimiter);

// ── Health ─────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0', uptime: process.uptime(), timestamp: Date.now() });
});

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/v1', routes);

// ── Error Handler ──────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────────────────────
async function bootstrap() {
  await connectMongo();
  app.listen(PORT, () => logger.info(`API Gateway running on :${PORT}`));
}

process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down');
  process.exit(0);
});

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Failed to start');
  process.exit(1);
});

export { app };
