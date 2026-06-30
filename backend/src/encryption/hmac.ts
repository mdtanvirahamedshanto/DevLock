import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Generate HMAC-SHA256 signature for request signing.
 */
export function generateHmac(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verify HMAC signature using timing-safe comparison.
 */
export function verifyHmac(data: string, signature: string, secret: string): boolean {
  const expected = generateHmac(data, secret);
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
}
