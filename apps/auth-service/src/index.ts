import express from 'express';
import { createLogger } from '@devlock/logger';
import { connectMongo } from '@devlock/database';

const logger = createLogger({ service: 'auth-service' });
const PORT = Number(process.env['PORT'] ?? 3001);

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }));

// TODO: Implement auth routes
// POST /register
// POST /login
// POST /refresh
// POST /logout
// POST /mfa/enable
// POST /mfa/verify
// POST /forgot-password
// POST /reset-password

async function bootstrap() {
  await connectMongo();
  app.listen(PORT, () => logger.info(`Auth service running on :${PORT}`));
}

bootstrap().catch((err) => { logger.fatal({ err }, 'Failed to start'); process.exit(1); });
export { app };
