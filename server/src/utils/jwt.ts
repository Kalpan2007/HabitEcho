import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import type { JwtPayload } from '../types/index.js';

/**
 * Generate Access JWT token
 */
export function generateAccessToken(userId: string): string {
  const payload = { userId };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as any,
  });
}

/**
 * Generate Refresh JWT token
 */
export function generateRefreshToken(userId: string): string {
  const payload = { userId };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: '30d', // Refresh token lives longer
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}

/**
 * Decode token without verification
 */
export function decodeToken(token: string): JwtPayload | null {
  return jwt.decode(token) as JwtPayload | null;
}
