import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import pinoHttp from 'pino-http';
import { connectDatabase } from '@devlock/db';
import { errorHandler } from './middleware/errorHandler.js';
import { tenantContext } from './middleware/tenantContext.js';
import { createRateLimiter } from './middleware/rateLimiter.js';
import { routes } from './routes/index.js';

const PORT = parseInt(process.env['PORT'] || '3000', 10);
const app = express();

// Security & parsing
app.use(helmet());
app.use(cors({
  origin: process.env['CORS_ORIGINS']?.split(',') || ['http://localhost:4000'],
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(pinoHttp({
  level: process.env['LOG_LEVEL'] || 'info',
  redact: ['req.headers.authorization', 'req.headers["x-devlock-secret"]'],
}));

// Rate limiting
app.use(createRateLimiter());

// Health check (no auth required)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now(), version: '0.1.0' });
});

app.get('/health/ready', async (_req, res) => {
  // Check dependencies
  try {
    // TODO: Check MongoDB and Redis connectivity
    res.json({ status: 'ready', checks: { db: 'ok', redis: 'ok' } });
  } catch {
    res.status(503).json({ status: 'not_ready' });
  }
});

// Tenant context extraction (for authenticated routes)
app.use('/v1', tenantContext);

// API routes
app.use('/v1', routes);

// Error handling
app.use(errorHandler);

// Start server
async function start() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.info(`[Gateway] Running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Gateway] Failed to start:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.info('[Gateway] SIGTERM received, shutting down gracefully...');
  // Close server, drain connections, close DB
  process.exit(0);
});

start();

export { app };
