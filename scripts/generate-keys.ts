/**
 * Generate Ed25519 key pair for license signing.
 * Run with: pnpm generate:keys
 *
 * The private key is used by the server to sign license tokens.
 * The public key is embedded in SDKs for offline verification.
 */

import { generateKeyPairSync, randomBytes } from 'crypto';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const KEYS_DIR = join(process.cwd(), 'keys');

function generateLicenseKeys() {
  console.log('🔐 Generating Ed25519 key pair for license signing...\n');

  const { publicKey, privateKey } = generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  if (!existsSync(KEYS_DIR)) {
    mkdirSync(KEYS_DIR, { recursive: true });
  }

  writeFileSync(join(KEYS_DIR, 'license-private.pem'), privateKey);
  writeFileSync(join(KEYS_DIR, 'license-public.pem'), publicKey);

  console.log('✅ Keys generated:');
  console.log(`   Private: ${join(KEYS_DIR, 'license-private.pem')}`);
  console.log(`   Public:  ${join(KEYS_DIR, 'license-public.pem')}`);
  console.log('');
  console.log('⚠️  Add these to your .env file:');
  console.log(`   LICENSE_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"`);
  console.log(`   LICENSE_PUBLIC_KEY="${publicKey.replace(/\n/g, '\\n')}"`);
  console.log('');
}

function generateEncryptionKey() {
  console.log('🔑 Generating AES-256 encryption key...\n');

  const key = randomBytes(32).toString('hex');
  console.log(`   ENCRYPTION_KEY=${key}`);
  console.log('');
}

function generateJWTSecret() {
  console.log('🎫 Generating JWT secret...\n');

  const secret = randomBytes(64).toString('base64url');
  console.log(`   JWT_SECRET=${secret}`);
  console.log('');
}

console.log('═══════════════════════════════════════════');
console.log('  DevLock Key Generation Utility');
console.log('═══════════════════════════════════════════\n');

generateLicenseKeys();
generateEncryptionKey();
generateJWTSecret();

console.log('═══════════════════════════════════════════');
console.log('  ⚠️  Never commit keys to version control!');
console.log('  📁  keys/ is in .gitignore');
console.log('═══════════════════════════════════════════');
