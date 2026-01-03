import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { UnauthorizedError } from '../utils/errors.js';
import { config } from '../config/index.js';
import { prisma } from '../config/database.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * Authentication middleware
 * Extracts and verifies JWT from HttpOnly cookie
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from cookie
    const token = req.cookies[config.cookie.name];

    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload || !payload.userId) {
      throw new UnauthorizedError('Invalid token');
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
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
 * Does not throw if no token is present
 */
export async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies[config.cookie.name];

    if (token) {
      const payload = verifyToken(token);

      if (payload && payload.userId) {
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true },
        });

        if (user) {
          (req as AuthenticatedRequest).userId = payload.userId;
        }
      }
    }

    next();
  } catch {
    // Silently continue without authentication
    next();
  }
}
