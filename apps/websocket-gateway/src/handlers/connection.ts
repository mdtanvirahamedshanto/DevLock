import type { Server, Socket } from 'socket.io';
import { ClientEvent } from '@devlock/shared';

/**
 * Handles new WebSocket connections.
 * Joins appropriate rooms and sets up event listeners.
 */
export function handleConnection(io: Server, socket: Socket): void {
  const { auth, tenantId, projectId } = socket;

  console.info(`[WS] Connection: ${socket.id} | type=${auth.type} | tenant=${tenantId}`);

  // Join rooms based on connection type
  socket.join(`tenant:${tenantId}`);

  if (auth.type === 'sdk' && projectId) {
    socket.join(`project:${projectId}`);
  }

  if (auth.type === 'admin') {
    socket.join(`admin:${tenantId}`);
  }

  // Handle heartbeat from SDK
  socket.on(ClientEvent.HEARTBEAT, (data) => {
    // Update last-seen timestamp
    // Check if config version is stale → push update
    const { configVersion } = data;
    // TODO: Compare with current version, push diff if stale
  });

  // Handle event acknowledgment
  socket.on(ClientEvent.ACK, (data) => {
    const { eventId } = data;
    // Mark event as delivered for this connection
    // Used for delivery guarantees
  });

  // Handle telemetry batch from SDK
  socket.on(ClientEvent.TELEMETRY_BATCH, (data) => {
    // Queue telemetry for async processing
    // TODO: Push to BullMQ analytics queue
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.info(`[WS] Disconnect: ${socket.id} | reason=${reason}`);
  });

  // Send initial state on connection
  socket.emit('connected', {
    socketId: socket.id,
    serverTime: Date.now(),
    reconnected: socket.recovered,
  });
}
