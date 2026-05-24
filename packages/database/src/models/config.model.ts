import mongoose, { Schema, type Document } from 'mongoose';

export interface IConfigDocument extends Document {
  tenantId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  version: number;
  maintenance: { enabled: boolean; message?: string; estimatedEnd?: Date; allowedIPs?: string[] };
  killSwitch: { enabled: boolean; reason?: string; activatedAt?: Date };
  notifications: Array<{
    id: string;
    type: string;
    message: string;
    severity: string;
    active: boolean;
    dismissible: boolean;
    createdAt: Date;
  }>;
  featureFlags: Map<string, { enabled: boolean; description?: string }>;
  domainLock: { enabled: boolean; domains: string[]; action: string };
  updatedAt: Date;
}

const configSchema = new Schema<IConfigDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    version: { type: Number, required: true, default: 1 },
    maintenance: {
      enabled: { type: Boolean, default: false },
      message: String,
      estimatedEnd: Date,
      allowedIPs: [String],
    },
    killSwitch: {
      enabled: { type: Boolean, default: false },
      reason: String,
      activatedAt: Date,
    },
    notifications: [
      {
        id: { type: String, required: true },
        type: { type: String, enum: ['info', 'warning', 'error', 'payment'], required: true },
        message: { type: String, required: true },
        severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
        active: { type: Boolean, default: true },
        dismissible: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    featureFlags: { type: Map, of: Schema.Types.Mixed, default: new Map() },
    domainLock: {
      enabled: { type: Boolean, default: false },
      domains: { type: [String], default: [] },
      action: { type: String, enum: ['warn', 'block', 'kill'], default: 'warn' },
    },
  },
  { timestamps: true },
);

configSchema.index({ tenantId: 1, projectId: 1 }, { unique: true });
configSchema.index({ projectId: 1, version: 1 });

configSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }
  next();
});

export const ConfigModel = mongoose.model<IConfigDocument>('Config', configSchema);
