import { Request, Response, NextFunction } from 'express';
import { habitEntryService } from '../services/index.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * POST /habits/:id/entry
 * Create a new habit entry
 */
export async function createHabitEntry(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { id: habitId } = req.params;

    const entry = await habitEntryService.createHabitEntry(userId, habitId, req.body);

    sendCreated(res, { entry }, 'Habit entry created successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /habits/:id/entry/:entryDate
 * Update a habit entry
 */
export async function updateHabitEntry(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { id: habitId, entryDate } = req.params;

    const entry = await habitEntryService.updateHabitEntry(
      userId,
      habitId,
      entryDate,
      req.body
    );

    sendSuccess(res, { entry }, 'Habit entry updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /habits/:id/history
 * Get habit entry history
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

    const { entries, total } = await habitEntryService.getHabitHistory(userId, habitId, {
      startDate,
      endDate,
      page,
      limit,
    });

    sendPaginated(res, entries, { page, limit, total }, 'Habit history retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /habits/:id/entry/:entryDate
 * Delete a habit entry
 */
export async function deleteHabitEntry(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { id: habitId, entryDate } = req.params;

    await habitEntryService.deleteHabitEntry(userId, habitId, entryDate);

    sendSuccess(res, null, 'Habit entry deleted successfully');
  } catch (error) {
    next(error);
  }
}
