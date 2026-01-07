import { Request, Response, NextFunction } from 'express';
import { habitLogService } from '../services/index.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * POST /habits/:id/log
 * Create a new habit log
 */
export async function createHabitLog(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { userId } = req as AuthenticatedRequest;
        const { id: habitId } = req.params;

        const log = await habitLogService.createHabitLog(userId, habitId, req.body);

        sendCreated(res, { log }, 'Habit log created successfully');
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /habits/:id/log/:date
 * Update a habit log
 */
export async function updateHabitLog(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { userId } = req as AuthenticatedRequest;
        const { id: habitId, date } = req.params;

        const log = await habitLogService.updateHabitLog(
            userId,
            habitId,
            date,
            req.body
        );

        sendSuccess(res, { log }, 'Habit log updated successfully');
    } catch (error) {
        next(error);
    }
}

/**
 * GET /habits/:id/history
 * Get habit log history
 */
export async function getHabitHistory(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { userId } = req as AuthenticatedRequest;
        const { id: habitId } = req.params;
        const query = req.query as unknown as {
            startDate?: string;
            endDate?: string;
            page: number;
            limit: number;
        };
        const { startDate, endDate, page, limit } = query;

        const { logs, total } = await habitLogService.getHabitHistory(userId, habitId, {
            startDate,
            endDate,
            page,
            limit,
        });

        sendPaginated(res, logs, { page, limit, total }, 'Habit history retrieved successfully');
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /habits/:id/log/:date
 * Delete a habit log
 */
export async function deleteHabitLog(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { userId } = req as AuthenticatedRequest;
        const { id: habitId, date } = req.params;

        await habitLogService.deleteHabitLog(userId, habitId, date);

        sendSuccess(res, null, 'Habit log deleted successfully');
    } catch (error) {
        next(error);
    }
}
