import mongoose, { Schema, type Document } from 'mongoose';

export interface IAuditLog extends Document {
  tenantId: mongoose.Types.ObjectId;
  actor: {
    type: 'user' | 'system' | 'sdk' | 'webhook';
    id?: string;
    ip?: string;
    userAgent?: string;
  };
  action: string;
  resource: {
    type: 'license' | 'project' | 'config' | 'user' | 'tenant' | 'domain';
    id: string;
  };
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    actor: {
      type: { type: String, enum: ['user', 'system', 'sdk', 'webhook'], required: true },
      id: { type: String },
      ip: { type: String },
      userAgent: { type: String },
    },
    action: { type: String, required: true },
    resource: {
      type: { type: String, enum: ['license', 'project', 'config', 'user', 'tenant', 'domain'], required: true },
      id: { type: String, required: true },
    },
    changes: {
      before: { type: Schema.Types.Mixed },
      after: { type: Schema.Types.Mixed },
    },
    metadata: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, immutable: true },
  },
  {
    timestamps: false,
    toJSON: { virtuals: true },
  }
);

auditLogSchema.index({ tenantId: 1, timestamp: -1 });
auditLogSchema.index({ tenantId: 1, action: 1 });
auditLogSchema.index({ tenantId: 1, 'resource.type': 1, 'resource.id': 1 });

// TTL index: auto-delete after 1 year (configurable per plan)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const AuditLogModel = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
