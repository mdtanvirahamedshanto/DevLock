import mongoose, { Schema, type Document } from 'mongoose';

export interface IProject extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  publicKey: string;
  secretKey: string;
  allowedDomains: string[];
  settings: {
    sdkVersion?: string;
    customMessages?: Record<string, string>;
    tamperDetection: {
      enabled: boolean;
      level: 'warn' | 'degrade' | 'block' | 'report';
    };
    offlineGraceHours?: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    publicKey: { type: String, required: true, unique: true },
    secretKey: { type: String, required: true, select: false },
    allowedDomains: { type: [String], default: [] },
    settings: {
      sdkVersion: { type: String },
      customMessages: { type: Schema.Types.Mixed },
      tamperDetection: {
        enabled: { type: Boolean, default: true },
        level: { type: String, enum: ['warn', 'degrade', 'block', 'report'], default: 'warn' },
      },
      offlineGraceHours: { type: Number },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

projectSchema.index({ tenantId: 1 });
projectSchema.index({ publicKey: 1 });
projectSchema.index({ tenantId: 1, name: 1 });
projectSchema.index({ tenantId: 1, isActive: 1 });

export const ProjectModel = mongoose.model<IProject>('Project', projectSchema);
