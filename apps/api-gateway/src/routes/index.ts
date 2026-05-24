import { Router } from 'express';

export const routes = Router();

// Each route module will be implemented in its respective service
// The gateway proxies or directly handles based on architecture choice

routes.use('/auth', (_req, res) => res.json({ service: 'auth-service' }));
routes.use('/sdk', (_req, res) => res.json({ service: 'sdk-endpoints' }));
routes.use('/projects', (_req, res) => res.json({ service: 'license-service' }));
routes.use('/licenses', (_req, res) => res.json({ service: 'license-service' }));
routes.use('/config', (_req, res) => res.json({ service: 'config-service' }));
routes.use('/analytics', (_req, res) => res.json({ service: 'telemetry-service' }));
routes.use('/billing', (_req, res) => res.json({ service: 'billing-service' }));
routes.use('/notifications', (_req, res) => res.json({ service: 'notification-service' }));
