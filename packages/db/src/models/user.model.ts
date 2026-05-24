import mongoose, { Schema, type Document } from 'mongoose';

export interface IUser extends Document {
  tenantId: mongoose.Types.ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer' | 'billing';
  mfa: {
    enabled: boolean;
    secret?: string;
    backupCodes?: string[];
  };
  lastLoginAt?: Date;
  emailVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['owner', 'admin', 'developer', 'viewer', 'billing'],
      default: 'developer',
    },
    mfa: {
      enabled: { type: Boolean, default: false },
      secret: { type: String, select: false },
      backupCodes: { type: [String], select: false },
    },
    lastLoginAt: { type: Date },
    emailVerifiedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, role: 1 });
userSchema.index({ email: 1 });

export const UserModel = mongoose.model<IUser>('User', userSchema);
