// Server → SDK WebSocket events
export enum ServerEvent {
  LICENSE_SUSPENDED = 'license:suspended',
  LICENSE_REVOKED = 'license:revoked',
  LICENSE_RENEWED = 'license:renewed',
  CONFIG_UPDATED = 'config:updated',
  MAINTENANCE_ENABLED = 'maintenance:enabled',
  MAINTENANCE_DISABLED = 'maintenance:disabled',
  NOTIFICATION_PUSH = 'notification:push',
  FEATURE_TOGGLED = 'feature:toggled',
  KILLSWITCH_ACTIVATED = 'killswitch:activated',
  KILLSWITCH_DEACTIVATED = 'killswitch:deactivated',
  DOMAIN_BLOCKED = 'domain:blocked',
  PAYMENT_WARNING = 'payment:warning',
}

// SDK → Server WebSocket events
export enum ClientEvent {
  HEARTBEAT = 'heartbeat',
  ACK = 'ack',
  TELEMETRY_BATCH = 'telemetry:batch',
}

// Internal service events (Redis Pub/Sub channels)
export enum InternalChannel {
  LICENSE_EVENTS = 'internal:license',
  CONFIG_EVENTS = 'internal:config',
  TENANT_EVENTS = 'internal:tenant',
  DOMAIN_EVENTS = 'internal:domain',
  BILLING_EVENTS = 'internal:billing',
  NOTIFICATION_EVENTS = 'internal:notification',
}

export interface WebSocketPayload<T = unknown> {
  event: ServerEvent;
  data: T;
  timestamp: number;
  eventId: string;
}

export interface HeartbeatPayload {
  sdkVersion: string;
  configVersion: number;
  uptime: number;
  fingerprint: string;
}

export interface TelemetryEvent {
  type: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}
