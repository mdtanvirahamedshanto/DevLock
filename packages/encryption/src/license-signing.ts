import { sign, verify, createPrivateKey, createPublicKey } from 'crypto';

/**
 * Sign a license token payload using Ed25519.
 */
export function signLicenseToken(payload: object, privateKeyPem: string): string {
  const data = JSON.stringify(payload);
  const privateKey = createPrivateKey(privateKeyPem);
  const signature = sign(null, Buffer.from(data), privateKey);

  const token = Buffer.from(JSON.stringify({
    payload: data,
    signature: signature.toString('base64'),
  })).toString('base64url');

  return token;
}

/**
 * Verify and decode a signed license token.
 */
export function verifyLicenseToken<T = unknown>(token: string, publicKeyPem: string): T | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    const { payload, signature } = decoded;

    const publicKey = createPublicKey(publicKeyPem);
    const isValid = verify(null, Buffer.from(payload), publicKey, Buffer.from(signature, 'base64'));

    if (!isValid) return null;
    return JSON.parse(payload) as T;
  } catch {
    return null;
  }
}
