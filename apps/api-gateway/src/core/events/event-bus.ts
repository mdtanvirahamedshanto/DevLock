import type { Redis } from 'ioredis';
import type { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { createLogger } from '@devlock/logger';

const logger = createLogger({ service: 'event-bus' });

export interface EventEnvelope {
  eventId: string;
  event: string;
  data: Record<string, unknown>;
  timestamp: number;
}

export class EventBus {
  constructor(
    private redis: Redis,
    private eventQueue: Queue,
  ) {}

  /**
   * Emit a domain event.
   * - Publishes to Redis Pub/Sub for real-time WebSocket delivery
   * - Enqueues in BullMQ for reliable async processing (webhooks, notifications, etc.)
   */
  async emit(event: string, data: Record<string, unknown>): Promise<string> {
    const envelope: EventEnvelope = {
      eventId: randomUUID(),
      event,
      data,
      timestamp: Date.now(),
    };

    // Real-time: publish to Redis for WebSocket service
    const channel = data['projectId']
      ? `events:${data['projectId'] as string}`
      : `events:global`;

    await this.redis.publish(channel, JSON.stringify(envelope));

    // Reliable: enqueue for async processing
    await this.eventQueue.add(event, envelope, {
      removeOnComplete: 1000,
      removeOnFail: 5000,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });

    logger.debug({ event, eventId: envelope.eventId }, 'Event emitted');
    return envelope.eventId;
  }

  /**
   * Emit without queueing (real-time only, fire-and-forget).
   */
  async broadcast(event: string, projectId: string, data: Record<string, unknown>): Promise<void> {
    const envelope: EventEnvelope = {
      eventId: randomUUID(),
      event,
      data,
      timestamp: Date.now(),
    };

    await this.redis.publish(`events:${projectId}`, JSON.stringify(envelope));
  }
}
