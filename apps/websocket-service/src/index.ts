import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { createLogger } from '@devlock/logger';

const logger = createLogger({ service: 'websocket-service' });
const PORT = Number(process.env['PORT'] ?? 3010);
const REDIS_URL = process.env['REDIS_URL'] ?? 'redis://localhost:6379';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: process.env['WS_CORS_ORIGIN']?.split(',') ?? '*', credentials: true },
  transports: ['websocket', 'polling'],
  pingInterval: 25_000,
  pingTimeout: 20_000,
  connectionStateRecovery: { maxDisconnectionDuration: 120_000 },
});

// Redis adapter for horizontal scaling
const pub = new Redis(REDIS_URL);
const sub = pub.duplicate();
io.adapter(createAdapter(pub, sub));

// Auth middleware
io.use((socket, next) => {
  const { apiKey, token, projectId } = socket.handshake.auth;
  if (!apiKey && !token) return next(new Error('Authentication required'));
  // TODO: Validate API key or JWT
  (socket as any).projectId = projectId;
  next();
});

io.on('connection', (socket) => {
  const projectId = (socket as any).projectId;
  if (projectId) socket.join(`project:${projectId}`);

  socket.on('heartbeat', () => { /* update last-seen */ });
  socket.on('disconnect', (reason) => {
    logger.debug({ socketId: socket.id, reason }, 'Client disconnected');
  });
});

// Subscribe to internal events for broadcasting
const subscriber = new Redis(REDIS_URL);
subscriber.subscribe('config:updated', 'license:updated', 'killswitch', 'maintenance', 'notification');
subscriber.on('message', (_channel, message) => {
  try {
    const { projectId, event, data } = JSON.parse(message);
    if (projectId) io.to(`project:${projectId}`).emit(event, data);
  } catch { /* ignore malformed */ }
});

httpServer.listen(PORT, () => logger.info(`WebSocket service running on :${PORT}`));

process.on('SIGTERM', () => { io.close(); pub.quit(); sub.quit(); subscriber.quit(); });
export { io };
