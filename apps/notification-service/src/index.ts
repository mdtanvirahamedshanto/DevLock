import express from 'express';
import { createLogger } from '@devlock/logger';
import { connectMongo } from '@devlock/database';

const logger = createLogger({ service: 'notification-service' });
const PORT = Number(process.env['PORT'] ?? 3004);

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'notification-service' }));

// TODO: Implement notification routes + BullMQ workers
// POST /notifications/send       (in-app push via WebSocket)
// POST /notifications/email      (queue email delivery)
// POST /webhooks/dispatch        (outbound webhook delivery)
// GET  /notifications/templates
// Workers: email-sender, webhook-dispatcher

async function bootstrap() {
  await connectMongo();
  app.listen(PORT, () => logger.info(`Notification service running on :${PORT}`));
}

bootstrap().catch((err) => { logger.fatal({ err }, 'Failed to start'); process.exit(1); });
export { app };
