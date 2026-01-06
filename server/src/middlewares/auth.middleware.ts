import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * Authentication middleware
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies.habitecho_access;

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
    const token = req.cookies.habitecho_access;

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
