import { Request, Response, NextFunction } from 'express';
import { performanceService } from '../services/index.js';
import { sendSuccess } from '../utils/response.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * GET /performance/summary
 * Get overall performance summary for the authenticated user
 */
export async function getPerformanceSummary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;

    const summary = await performanceService.getPerformanceSummary(userId);

    sendSuccess(res, { summary }, 'Performance summary retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /performance/habit/:id
 * Get detailed performance for a specific habit
 */
export async function getHabitPerformance(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { id: habitId } = req.params;

    const performance = await performanceService.getHabitPerformance(userId, habitId);

    sendSuccess(res, { performance }, 'Habit performance retrieved successfully');
  } catch (error) {
    next(error);
  }
}
