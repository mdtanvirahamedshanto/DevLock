import mongoose, { Schema, type Document } from 'mongoose';

export interface ILicenseActivation {
  fingerprint: string;
  domain?: string;
  ip: string;
  userAgent?: string;
  activatedAt: Date;
}

export interface ILicense extends Document {
  tenantId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  key: string;
  status: 'active' | 'suspended' | 'expired' | 'revoked';
  type: 'perpetual' | 'subscription' | 'trial' | 'floating';
  activations: ILicenseActivation[];
  maxActivations: number;
  metadata: Record<string, unknown>;
  features: string[];
  expiresAt?: Date;
  suspendedAt?: Date;
  revokedAt?: Date;
  lastValidatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const licenseActivationSchema = new Schema<ILicenseActivation>(
  {
    fingerprint: { type: String, required: true },
    domain: { type: String },
    ip: { type: String, required: true },
    userAgent: { type: String },
    activatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const licenseSchema = new Schema<ILicense>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    key: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['active', 'suspended', 'expired', 'revoked'],
      default: 'active',
    },
    type: {
      type: String,
      enum: ['perpetual', 'subscription', 'trial', 'floating'],
      required: true,
    },
    activations: { type: [licenseActivationSchema], default: [] },
    maxActivations: { type: Number, required: true, default: 1, min: 1 },
    metadata: { type: Schema.Types.Mixed, default: {} },
    features: { type: [String], default: [] },
    expiresAt: { type: Date },
    suspendedAt: { type: Date },
    revokedAt: { type: Date },
    lastValidatedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

licenseSchema.index({ tenantId: 1, projectId: 1 });
licenseSchema.index({ key: 1 }, { unique: true });
licenseSchema.index({ status: 1, expiresAt: 1 });
licenseSchema.index({ tenantId: 1, status: 1 });
licenseSchema.index({ projectId: 1, status: 1 });

export const LicenseModel = mongoose.model<ILicense>('License', licenseSchema);
