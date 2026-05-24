import express from 'express';
import { createLogger } from '@devlock/logger';
import { connectMongo } from '@devlock/database';

const logger = createLogger({ service: 'telemetry-service' });
const PORT = Number(process.env['PORT'] ?? 3003);

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'telemetry-service' }));

// TODO: Implement telemetry routes
// POST /telemetry/ingest   (batch event ingestion)
// GET  /analytics/overview
// GET  /analytics/licenses
// GET  /analytics/usage
// GET  /analytics/events
// GET  /audit-logs

async function bootstrap() {
  await connectMongo();
  app.listen(PORT, () => logger.info(`Telemetry service running on :${PORT}`));
}

bootstrap().catch((err) => { logger.fatal({ err }, 'Failed to start'); process.exit(1); });
export { app };
