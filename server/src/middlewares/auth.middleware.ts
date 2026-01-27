import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * Extract token from request
 * Priority: 1. Authorization header (Bearer token), 2. Cookie (habitecho_access)
 * Authorization header takes priority for better cross-domain support
 */
function extractToken(req: Request): string | null {
  // First, check Authorization header (primary method for cross-domain)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (token && token.length > 0) {
      console.log('[Auth] Using Bearer token from header, length:', token.length);
      return token;
    }
  }

  // Fallback: Try to get token from cookie (for same-domain requests)
  const cookieToken = req.cookies.habitecho_access;
  if (cookieToken && cookieToken.length > 0) {
    console.log('[Auth] Using token from cookie, length:', cookieToken.length);
    return cookieToken;
  }

  // Debug logging for missing tokens
  console.log('[Auth] No valid token found!');
  console.log('[Auth] Cookie present:', !!req.cookies.habitecho_access);
  console.log('[Auth] Authorization header:', authHeader || 'Missing');
  console.log('[Auth] Request path:', req.path);
  console.log('[Auth] Request method:', req.method);
  
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
