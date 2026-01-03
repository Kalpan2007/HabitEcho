import { Router } from 'express';
import { performanceController } from '../controllers/index.js';
import { authenticate, validate } from '../middlewares/index.js';
import { habitIdParamSchema } from '../validations/index.js';

const router = Router();

// All performance routes require authentication
router.use(authenticate);

/**
 * GET /performance/summary
 * Get overall performance summary for the authenticated user
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Performance summary retrieved successfully",
 *   "data": {
 *     "summary": {
 *       "totalHabits": 5,
 *       "activeHabits": 4,
 *       "overallCompletionRate": 78,
 *       "currentStreak": 12,
 *       "longestStreak": 30,
 *       "todayCompletion": {
 *         "completed": 3,
 *         "total": 4,
 *         "percentage": 75
 *       },
 *       "rollingAverages": {
 *         "last7Days": 82,
 *         "last14Days": 79,
 *         "last30Days": 75
 *       },
 *       "momentum": {
 *         "current": 82,
 *         "previous": 75,
 *         "trend": "UP",
 *         "percentageChange": 9
 *       }
 *     }
 *   }
 * }
 */
router.get('/summary', performanceController.getPerformanceSummary);

/**
 * GET /performance/habit/:id
 * Get detailed performance for a specific habit
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Habit performance retrieved successfully",
 *   "data": {
 *     "performance": {
 *       "habitId": "uuid",
 *       "habitName": "Morning Meditation",
 *       "completionRate": 85,
 *       "currentStreak": 7,
 *       "longestStreak": 21,
 *       "totalEntries": 45,
 *       "completedEntries": 38,
 *       "partialEntries": 4,
 *       "missedEntries": 3,
 *       "rollingAverages": {
 *         "last7Days": 90,
 *         "last14Days": 85,
 *         "last30Days": 82
 *       },
 *       "heatmapData": [
 *         { "date": "2026-01-01", "value": 100, "status": "DONE" },
 *         { "date": "2026-01-02", "value": 75, "status": "PARTIAL" },
 *         ...
 *       ],
 *       "momentum": {
 *         "current": 90,
 *         "previous": 80,
 *         "trend": "UP",
 *         "percentageChange": 12
 *       }
 *     }
 *   }
 * }
 */
router.get(
  '/habit/:id',
  validate(habitIdParamSchema, 'params'),
  performanceController.getHabitPerformance
);

export default router;
