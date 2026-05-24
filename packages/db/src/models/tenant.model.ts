import mongoose, { Schema, type Document } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  owner: mongoose.Types.ObjectId;
  settings: {
    customDomain?: string;
    branding?: {
      logo?: string;
      primaryColor?: string;
    };
  };
  billing: {
    stripeCustomerId?: string;
    subscriptionId?: string;
    currentPeriodEnd?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    settings: {
      customDomain: { type: String },
      branding: {
        logo: { type: String },
        primaryColor: { type: String },
      },
    },
    billing: {
      stripeCustomerId: { type: String },
      subscriptionId: { type: String },
      currentPeriodEnd: { type: Date },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tenantSchema.index({ slug: 1 });
tenantSchema.index({ owner: 1 });
tenantSchema.index({ 'billing.stripeCustomerId': 1 }, { sparse: true });

export const TenantModel = mongoose.model<ITenant>('Tenant', tenantSchema);
