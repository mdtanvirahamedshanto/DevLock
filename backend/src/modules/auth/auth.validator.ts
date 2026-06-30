import { z } from 'zod';

export const RegisterSchema = z.object({
  body: z.object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(128),
    name: z.string().min(1).max(100),
    organizationName: z.string().min(1).max(100),
  }),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
    mfaCode: z.string().length(6).optional(),
  }),
});

export const RefreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

export const ForgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const ResetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8).max(128),
  }),
});
