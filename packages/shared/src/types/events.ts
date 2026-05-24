// WebSocket events from server to SDK
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
}

// WebSocket events from SDK to server
export enum ClientEvent {
  HEARTBEAT = 'heartbeat',
  ACK = 'ack',
  TELEMETRY_BATCH = 'telemetry:batch',
}

// Internal service events (Redis Pub/Sub)
export enum InternalEvent {
  LICENSE_CREATED = 'internal:license:created',
  LICENSE_UPDATED = 'internal:license:updated',
  LICENSE_DELETED = 'internal:license:deleted',
  CONFIG_CHANGED = 'internal:config:changed',
  TENANT_PLAN_CHANGED = 'internal:tenant:plan_changed',
  DOMAIN_VERIFIED = 'internal:domain:verified',
  DOMAIN_FAILED = 'internal:domain:failed',
  PAYMENT_FAILED = 'internal:payment:failed',
  PAYMENT_RECOVERED = 'internal:payment:recovered',
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

export interface TelemetryBatchPayload {
  events: TelemetryEvent[];
  sdkVersion: string;
  sessionId: string;
}
