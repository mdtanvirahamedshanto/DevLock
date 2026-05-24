import express from 'express';
import { createLogger } from '@devlock/logger';
import { connectMongo } from '@devlock/database';

const logger = createLogger({ service: 'billing-service' });
const PORT = Number(process.env['PORT'] ?? 3005);

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'billing-service' }));

// TODO: Implement billing routes
// GET    /billing/subscription
// POST   /billing/checkout       (Stripe Checkout session)
// PUT    /billing/subscription   (plan change)
// POST   /billing/cancel
// GET    /billing/invoices
// POST   /billing/webhook        (Stripe webhook handler)
// GET    /billing/usage          (current period usage)

async function bootstrap() {
  await connectMongo();
  app.listen(PORT, () => logger.info(`Billing service running on :${PORT}`));
}

bootstrap().catch((err) => { logger.fatal({ err }, 'Failed to start'); process.exit(1); });
export { app };
