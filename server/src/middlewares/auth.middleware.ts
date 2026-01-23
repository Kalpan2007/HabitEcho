import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * Extract token from request
 * Priority: 1. Cookie (habitecho_access), 2. Authorization header (Bearer token)
 */
function extractToken(req: Request): string | null {
  // First, try to get token from cookie
  const cookieToken = req.cookies.habitecho_access;
  
  // Debug logging
  console.log('[Auth] Cookie token present:', !!cookieToken);
  console.log('[Auth] Authorization header:', req.headers.authorization ? 'Present' : 'Missing');
  
  if (cookieToken) {
    console.log('[Auth] Using cookie token, length:', cookieToken.length);
    return cookieToken;
  }

  // Fallback: Check Authorization header (for cross-origin localhost development)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    console.log('[Auth] Using Bearer token, length:', token.length);
    return token;
  }

  console.log('[Auth] No token found!');
  return null;
}

/**
 * Authentication middleware
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const payload = verifyToken(token);

    if (!payload || !payload.userId) {
      throw new UnauthorizedError('Invalid token');
    }

    // Attach userId to request
    (req as AuthenticatedRequest).userId = payload.userId;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
}


/**
 * Optional authentication middleware
 */
export async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);

    if (token) {
      const payload = verifyToken(token);

      if (payload && payload.userId) {
        (req as AuthenticatedRequest).userId = payload.userId;
      }
    }

    next();
  } catch {
    next();
  }
}
