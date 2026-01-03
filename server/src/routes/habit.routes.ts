import { Router } from 'express';
import { habitController, habitEntryController } from '../controllers/index.js';
import { authenticate, validate, validateMultiple } from '../middlewares/index.js';
import {
  createHabitSchema,
  updateHabitSchema,
  habitIdParamSchema,
  getHabitsQuerySchema,
  createHabitEntrySchema,
  updateHabitEntrySchema,
  getHabitHistoryQuerySchema,
} from '../validations/index.js';

const router = Router();

// All habit routes require authentication
router.use(authenticate);

/**
 * POST /habits
 * Create a new habit
 * 
 * Request Body:
 * {
 *   "name": "Morning Meditation",
 *   "description": "10 minutes of mindfulness meditation",
 *   "frequency": "DAILY",
 *   "scheduleDays": null,
 *   "startDate": "2026-01-01",
 *   "endDate": null
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Habit created successfully",
 *   "data": {
 *     "habit": { ... }
 *   }
 * }
 */
router.post(
  '/',
  validate(createHabitSchema),
  habitController.createHabit
);

/**
 * GET /habits
 * Get all habits for the authenticated user
 * 
 * Query Parameters:
 * - isActive: boolean (optional) - Filter by active status
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Habits retrieved successfully",
 *   "data": [...],
 *   "pagination": { page, limit, total, totalPages }
 * }
 */
router.get(
  '/',
  validate(getHabitsQuerySchema, 'query'),
  habitController.getHabits
);

/**
 * GET /habits/:id
 * Get a specific habit by ID
 */
router.get(
  '/:id',
  validate(habitIdParamSchema, 'params'),
  habitController.getHabit
);

/**
 * PUT /habits/:id
 * Update a habit
 * 
 * Request Body (all fields optional):
 * {
 *   "name": "Updated Habit Name",
 *   "description": "Updated description",
 *   "frequency": "WEEKLY",
 *   "scheduleDays": [1, 3, 5],
 *   "isActive": false
 * }
 */
router.put(
  '/:id',
  validateMultiple({
    params: habitIdParamSchema,
    body: updateHabitSchema,
  }),
  habitController.updateHabit
);

/**
 * DELETE /habits/:id
 * Delete a habit and all its entries
 */
router.delete(
  '/:id',
  validate(habitIdParamSchema, 'params'),
  habitController.deleteHabit
);

/**
 * POST /habits/:id/entry
 * Create a habit entry for a specific date
 * 
 * Request Body:
 * {
 *   "entryDate": "2026-01-01",
 *   "status": "DONE",
 *   "percentComplete": 100,
 *   "reason": null,
 *   "notes": "Great session today!"
 * }
 */
router.post(
  '/:id/entry',
  validateMultiple({
    params: habitIdParamSchema,
    body: createHabitEntrySchema,
  }),
  habitEntryController.createHabitEntry
);

/**
 * PUT /habits/:id/entry/:entryDate
 * Update a habit entry
 * 
 * URL Parameters:
 * - id: Habit UUID
 * - entryDate: Date in YYYY-MM-DD format
 * 
 * Request Body (all fields optional):
 * {
 *   "status": "PARTIAL",
 *   "percentComplete": 75,
 *   "reason": "Got interrupted",
 *   "notes": "Will complete tomorrow"
 * }
 */
router.put(
  '/:id/entry/:entryDate',
  validateMultiple({
    params: habitIdParamSchema,
    body: updateHabitEntrySchema,
  }),
  habitEntryController.updateHabitEntry
);

/**
 * DELETE /habits/:id/entry/:entryDate
 * Delete a habit entry
 */
router.delete(
  '/:id/entry/:entryDate',
  validate(habitIdParamSchema, 'params'),
  habitEntryController.deleteHabitEntry
);

/**
 * GET /habits/:id/history
 * Get entry history for a habit
 * 
 * Query Parameters:
 * - startDate: string (YYYY-MM-DD, optional)
 * - endDate: string (YYYY-MM-DD, optional)
 * - page: number (default: 1)
 * - limit: number (default: 30, max: 365)
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Habit history retrieved successfully",
 *   "data": [...entries],
 *   "pagination": { page, limit, total, totalPages }
 * }
 */
router.get(
  '/:id/history',
  validateMultiple({
    params: habitIdParamSchema,
    query: getHabitHistoryQuerySchema,
  }),
  habitEntryController.getHabitHistory
);

export default router;
