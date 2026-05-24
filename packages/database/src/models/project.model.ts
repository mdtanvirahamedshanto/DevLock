import mongoose, { Schema, type Document } from 'mongoose';

export interface IProjectDocument extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  publicKey: string;
  secretKey: string;
  allowedDomains: string[];
  settings: {
    tamperDetection: { enabled: boolean; level: string };
    offlineGraceHours: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProjectDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, maxlength: 500 },
    publicKey: { type: String, required: true, unique: true },
    secretKey: { type: String, required: true, select: false },
    allowedDomains: { type: [String], default: [] },
    settings: {
      tamperDetection: {
        enabled: { type: Boolean, default: true },
        level: { type: String, enum: ['warn', 'degrade', 'block', 'report'], default: 'warn' },
      },
      offlineGraceHours: { type: Number, default: 72 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

projectSchema.index({ tenantId: 1 });
projectSchema.index({ publicKey: 1 }, { unique: true });
projectSchema.index({ tenantId: 1, name: 1 });

export const ProjectModel = mongoose.model<IProjectDocument>('Project', projectSchema);
