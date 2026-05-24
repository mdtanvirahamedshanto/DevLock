import { Router } from 'express';

export const routes = Router();

// Auth routes (public)
routes.use('/auth', (_req, res) => {
  res.json({ message: 'Auth service - TODO: implement' });
});

// SDK routes (API key auth)
routes.use('/sdk', (_req, res) => {
  res.json({ message: 'SDK endpoints - TODO: implement' });
});

// Project routes (JWT auth)
routes.use('/projects', (_req, res) => {
  res.json({ message: 'Projects service - TODO: implement' });
});

// License routes (JWT auth)
routes.use('/licenses', (_req, res) => {
  res.json({ message: 'License service - TODO: implement' });
});

// Config routes (JWT auth)
routes.use('/config', (_req, res) => {
  res.json({ message: 'Config service - TODO: implement' });
});

// Analytics routes (JWT auth)
routes.use('/analytics', (_req, res) => {
  res.json({ message: 'Analytics service - TODO: implement' });
});

// Billing routes (JWT auth)
routes.use('/billing', (_req, res) => {
  res.json({ message: 'Billing service - TODO: implement' });
});
