import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * Middleware to restrict access to users with verified emails
 */
export async function isEmailVerified(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { userId } = req as AuthenticatedRequest;

        if (!userId) {
            throw new UnauthorizedError('Authentication required');
        }

        const user = await (prisma as any).user.findUnique({
            where: { id: userId },
            select: { emailVerified: true },
        });

        if (!user || !user.emailVerified) {
            throw new ForbiddenError('Please verify your email address to perform this action');
        }

        next();
    } catch (error) {
        next(error);
    }
}
