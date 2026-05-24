import express from 'express';
import { createLogger } from '@devlock/logger';
import { connectMongo } from '@devlock/database';

const logger = createLogger({ service: 'license-service' });
const PORT = Number(process.env['PORT'] ?? 3002);

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'license-service' }));

// TODO: Implement license routes
// POST   /licenses/validate  (SDK endpoint)
// POST   /licenses/activate  (SDK endpoint)
// GET    /licenses
// POST   /licenses
// GET    /licenses/:id
// PUT    /licenses/:id
// POST   /licenses/:id/suspend
// POST   /licenses/:id/revoke
// POST   /licenses/:id/reactivate

async function bootstrap() {
  await connectMongo();
  app.listen(PORT, () => logger.info(`License service running on :${PORT}`));
}

bootstrap().catch((err) => { logger.fatal({ err }, 'Failed to start'); process.exit(1); });
export { app };
