import { Router } from 'express';
import { habitController, habitLogController } from '../controllers/index.js';
import { authenticate, validate, validateMultiple, isEmailVerified } from '../middlewares/index.js';
import {
  createHabitSchema,
  updateHabitSchema,
  habitIdParamSchema,
  getHabitsQuerySchema,
  createHabitLogSchema,
  updateHabitLogSchema,
  getHabitHistoryQuerySchema,
} from '../validations/index.js';

const router = Router();

// All habit routes require authentication
router.use(authenticate);

/**
 * POST /habits
 * Create a new habit
 */
router.post(
  '/',
  isEmailVerified,
  validate(createHabitSchema),
  habitController.createHabit
);

/**
 * GET /habits
 * Get all habits
 */
router.get(
  '/',
  validate(getHabitsQuerySchema, 'query'),
  habitController.getHabits
);

/**
 * GET /habits/:id
 */
router.get(
  '/:id',
  validate(habitIdParamSchema, 'params'),
  habitController.getHabit
);

/**
 * PUT /habits/:id
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
 */
router.delete(
  '/:id',
  validate(habitIdParamSchema, 'params'),
  habitController.deleteHabit
);

/**
 * POST /habits/:id/log
 * (New preferred path)
 */
router.post(
  '/:id/log',
  validateMultiple({
    params: habitIdParamSchema,
    body: createHabitLogSchema,
  }),
  habitLogController.createHabitLog
);

/**
 * POST /habits/:id/entry
 * (Legacy path for compatibility)
 */
router.post(
  '/:id/entry',
  validateMultiple({
    params: habitIdParamSchema,
    body: createHabitLogSchema, // Use same schema but map 'entryDate' to 'date' if needed. 
    // Actually, createHabitLogSchema expects 'date'.
  }),
  habitLogController.createHabitLog
);

/**
 * PUT /habits/:id/log/:date
 */
router.put(
  '/:id/log/:date',
  validateMultiple({
    params: habitIdParamSchema,
    body: updateHabitLogSchema,
  }),
  habitLogController.updateHabitLog
);

/**
 * PUT /habits/:id/entry/:entryDate
 * (Legacy path)
 */
router.put(
  '/:id/entry/:date',
  validateMultiple({
    params: habitIdParamSchema,
    body: updateHabitLogSchema,
  }),
  habitLogController.updateHabitLog
);

/**
 * DELETE /habits/:id/log/:date
 */
router.delete(
  '/:id/log/:date',
  validate(habitIdParamSchema, 'params'),
  habitLogController.deleteHabitLog
);

/**
 * GET /habits/:id/history
 */
router.get(
  '/:id/history',
  validateMultiple({
    params: habitIdParamSchema,
    query: getHabitHistoryQuerySchema,
  }),
  habitLogController.getHabitHistory
);

export default router;
