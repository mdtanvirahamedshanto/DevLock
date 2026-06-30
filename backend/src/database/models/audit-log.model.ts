import mongoose, { Schema, type Document } from 'mongoose';

export interface IAuditLogDocument extends Document {
  tenantId: mongoose.Types.ObjectId;
  actor: { type: string; id?: string; ip?: string; userAgent?: string };
  action: string;
  resource: { type: string; id: string };
  changes?: { before?: Record<string, unknown>; after?: Record<string, unknown> };
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLogDocument>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  actor: {
    type: { type: String, enum: ['user', 'system', 'sdk', 'webhook'], required: true },
    id: String,
    ip: String,
    userAgent: String,
  },
  action: { type: String, required: true },
  resource: {
    type: { type: String, required: true },
    id: { type: String, required: true },
  },
  changes: {
    before: Schema.Types.Mixed,
    after: Schema.Types.Mixed,
  },
  metadata: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now, immutable: true },
});

auditLogSchema.index({ tenantId: 1, timestamp: -1 });
auditLogSchema.index({ tenantId: 1, action: 1 });
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const AuditLogModel = mongoose.model<IAuditLogDocument>('AuditLog', auditLogSchema);
