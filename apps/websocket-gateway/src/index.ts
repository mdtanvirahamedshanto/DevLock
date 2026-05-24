import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { ServerEvent, ClientEvent } from '@devlock/shared';
import { authenticateSocket } from './middleware/auth.js';
import { handleConnection } from './handlers/connection.js';

const PORT = parseInt(process.env['WEBSOCKET_PORT'] || '3010', 10);
const REDIS_URL = process.env['REDIS_URL'] || 'redis://localhost:6379';

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env['WEBSOCKET_CORS_ORIGIN']?.split(',') || ['http://localhost:4000'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 20000,
  maxHttpBufferSize: 1e6, // 1MB
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
});

// Redis adapter for multi-node scaling
const pubClient = new Redis(REDIS_URL);
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

// Authentication middleware
io.use(authenticateSocket);

// Connection handler
io.on('connection', (socket) => handleConnection(io, socket));

// Subscribe to internal Redis events for broadcasting
const subscriber = new Redis(REDIS_URL);
subscriber.subscribe(
  'config:updated',
  'license:updated',
  'killswitch:activated',
  'maintenance:changed',
  'notification:push'
);

subscriber.on('message', (channel, message) => {
  try {
    const payload = JSON.parse(message);
    const { projectId, event, data } = payload;

    if (projectId) {
      // Broadcast to all SDK connections for this project
      io.to(`project:${projectId}`).emit(event, data);
    }
  } catch (err) {
    console.error('[WS] Failed to process Redis message:', err);
  }
});

httpServer.listen(PORT, () => {
  console.info(`[WebSocket Gateway] Running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.info('[WS] Shutting down...');
  io.close();
  pubClient.quit();
  subClient.quit();
  subscriber.quit();
  httpServer.close();
});

export { io };
