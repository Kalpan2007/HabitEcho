import { Request, Response, NextFunction } from 'express';
import { habitService } from '../services/index.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * POST /habits
 * Create a new habit
 */
export async function createHabit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const habit = await habitService.createHabit(userId, req.body);

    sendCreated(res, { habit }, 'Habit created successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /habits
 * Get all habits for the authenticated user
 */
export async function getHabits(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;

    // Use validated data from req.query (transformed by Zod)
    const { page, limit, isActive, search } = req.query as any;

    const { habits, total } = await habitService.getHabits(userId, {
      isActive,
      search,
      page,
      limit,
    });

    sendPaginated(res, habits, { page, limit, total }, 'Habits retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /habits/:id
 * Get a specific habit by ID
 */
export async function getHabit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { id } = req.params;

    const habit = await habitService.getHabitById(userId, id);

    sendSuccess(res, { habit }, 'Habit retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /habits/:id
 * Update a habit
 */
export async function updateHabit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { id } = req.params;

    const habit = await habitService.updateHabit(userId, id, req.body);

    sendSuccess(res, { habit }, 'Habit updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /habits/:id
 * Soft delete a habit
 */
export async function deleteHabit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { id } = req.params;

    await habitService.deleteHabit(userId, id);

    sendSuccess(res, null, 'Habit deleted successfully');
  } catch (error) {
    next(error);
  }
}
