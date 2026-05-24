import { randomBytes } from 'crypto';

const LICENSE_KEY_PREFIX = 'DLCK';

/**
 * Generate a project API key.
 * Format: pk_live_<32 random hex chars> (public)
 *         sk_live_<32 random hex chars> (secret)
 */
export function generateApiKey(type: 'public' | 'secret'): string {
  const prefix = type === 'public' ? 'pk' : 'sk';
  const env = 'live'; // Could be parameterized for test keys
  const key = randomBytes(32).toString('hex');
  return `${prefix}_${env}_${key}`;
}

/**
 * Generate a license key.
 * Format: DLCK-XXXX-XXXX-XXXX-XXXX (Base32-like, uppercase alphanumeric)
 */
export function generateLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 for readability
  const segments: string[] = [];

  for (let s = 0; s < 4; s++) {
    let segment = '';
    const bytes = randomBytes(4);
    for (let i = 0; i < 4; i++) {
      segment += chars[bytes[i]! % chars.length];
    }
    segments.push(segment);
  }

  return `${LICENSE_KEY_PREFIX}-${segments.join('-')}`;
}
