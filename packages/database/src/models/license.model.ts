import mongoose, { Schema, type Document } from 'mongoose';

export interface ILicenseDocument extends Document {
  tenantId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  key: string;
  status: 'active' | 'suspended' | 'expired' | 'revoked' | 'trial';
  type: 'perpetual' | 'subscription' | 'trial' | 'floating';
  activations: Array<{
    fingerprint: string;
    domain?: string;
    ip: string;
    userAgent?: string;
    activatedAt: Date;
    lastSeenAt: Date;
  }>;
  maxActivations: number;
  features: string[];
  metadata: Record<string, unknown>;
  expiresAt?: Date;
  suspendedAt?: Date;
  revokedAt?: Date;
  lastValidatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const licenseSchema = new Schema<ILicenseDocument>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    key: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['active', 'suspended', 'expired', 'revoked', 'trial'],
      default: 'active',
    },
    type: {
      type: String,
      enum: ['perpetual', 'subscription', 'trial', 'floating'],
      required: true,
    },
    activations: [
      {
        fingerprint: { type: String, required: true },
        domain: String,
        ip: { type: String, required: true },
        userAgent: String,
        activatedAt: { type: Date, default: Date.now },
        lastSeenAt: { type: Date, default: Date.now },
      },
    ],
    maxActivations: { type: Number, required: true, default: 1, min: 1 },
    features: { type: [String], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },
    expiresAt: Date,
    suspendedAt: Date,
    revokedAt: Date,
    lastValidatedAt: Date,
  },
  { timestamps: true },
);

licenseSchema.index({ key: 1 }, { unique: true });
licenseSchema.index({ tenantId: 1, projectId: 1 });
licenseSchema.index({ tenantId: 1, status: 1 });
licenseSchema.index({ status: 1, expiresAt: 1 });

export const LicenseModel = mongoose.model<ILicenseDocument>('License', licenseSchema);
