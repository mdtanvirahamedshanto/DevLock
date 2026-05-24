import type { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env['JWT_SECRET'] || 'dev-secret-change-me';

interface SocketAuth {
  type: 'sdk' | 'admin';
  projectId?: string;
  tenantId?: string;
  licenseId?: string;
  apiKey?: string;
  token?: string;
}

declare module 'socket.io' {
  interface Socket {
    auth: SocketAuth;
    tenantId: string;
    projectId?: string;
  }
}

/**
 * Authenticates WebSocket connections.
 * SDK connections use API key; Admin connections use JWT.
 */
export function authenticateSocket(socket: Socket, next: (err?: Error) => void): void {
  const { apiKey, token, projectId } = socket.handshake.auth as Partial<SocketAuth>;

  // SDK connection (API key)
  if (apiKey && projectId) {
    // TODO: Validate API key against project
    // For now, extract tenant from key lookup
    socket.auth = { type: 'sdk', projectId, apiKey };
    socket.projectId = projectId;
    socket.tenantId = 'pending'; // Resolved after key validation
    next();
    return;
  }

  // Admin connection (JWT)
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as {
        sub: string;
        tenantId: string;
      };
      socket.auth = { type: 'admin', tenantId: payload.tenantId, token };
      socket.tenantId = payload.tenantId;
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
    return;
  }

  next(new Error('No authentication credentials provided'));
}
