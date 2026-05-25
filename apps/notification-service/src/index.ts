import express, { type Express } from 'express';
import { createLogger } from '@devlock/logger';
import { connectMongo } from '@devlock/database';

const SERVICE_NAME = process.env['SERVICE_NAME'] ?? 'service';
const logger = createLogger({ service: SERVICE_NAME });
const PORT = Number(process.env['PORT'] ?? 3001);

const app: Express = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: SERVICE_NAME, uptime: process.uptime() });
});

async function bootstrap() {
  await connectMongo();
  app.listen(PORT, () => logger.info(`${SERVICE_NAME} running on :${PORT}`));
}

bootstrap().catch((err) => { logger.fatal({ err }, 'Failed to start'); process.exit(1); });
export { app };
