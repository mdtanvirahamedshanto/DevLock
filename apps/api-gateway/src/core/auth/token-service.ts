import jwt, { type JwtPayload } from 'jsonwebtoken';
import { randomBytes } from 'crypto';

export interface AccessTokenPayload {
  sub: string;
  orgId: string;
  role: string;
  permissions: string[];
}

export interface DecodedAccessToken extends AccessTokenPayload {
  iat: number;
  exp: number;
  iss: string;
}

export class TokenService {
  private readonly jwtSecret: string;
  private readonly accessExpiry: string;
  private readonly refreshExpiry: string;
  private readonly issuer = 'devlock';

  constructor() {
    this.jwtSecret = process.env['JWT_SECRET'] ?? 'dev-secret-change-me';
    this.accessExpiry = process.env['JWT_ACCESS_EXPIRY'] ?? '15m';
    this.refreshExpiry = process.env['JWT_REFRESH_EXPIRY'] ?? '7d';
  }

  generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(
      { sub: payload.sub, orgId: payload.orgId, role: payload.role, permissions: payload.permissions } as JwtPayload,
      this.jwtSecret,
      { expiresIn: this.accessExpiry, issuer: this.issuer, audience: 'devlock-api' } as jwt.SignOptions,
    );
  }

  verifyAccessToken(token: string): DecodedAccessToken {
    return jwt.verify(token, this.jwtSecret, {
      issuer: this.issuer,
      audience: 'devlock-api',
    }) as DecodedAccessToken;
  }

  generateRefreshToken(): string {
    return randomBytes(32).toString('base64url');
  }

  getRefreshExpiryMs(): number {
    // Parse "7d" → ms
    const match = this.refreshExpiry.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const [, num, unit] = match;
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return parseInt(num!, 10) * (multipliers[unit!] ?? 1000);
  }
}
