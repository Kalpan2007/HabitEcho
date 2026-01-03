import { z } from 'zod';

// ============================================
// HABIT VALIDATION SCHEMAS
// ============================================

export const createHabitSchema = z.object({
  name: z
    .string()
    .min(1, 'Habit name is required')
    .max(100, 'Habit name must be at most 100 characters')
    .trim(),
  
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .trim()
    .optional(),
  
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'], {
    errorMap: () => ({ message: 'Frequency must be one of: DAILY, WEEKLY, MONTHLY, CUSTOM' }),
  }),
  
  scheduleDays: z
    .array(z.number().int().min(0).max(31))
    .max(31, 'Too many schedule days')
    .optional(),
  
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional(),
}).refine(
  (data) => {
    if (data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  { message: 'End date must be after or equal to start date', path: ['endDate'] }
).refine(
  (data) => {
    // For WEEKLY, scheduleDays should contain 0-6 (days of week)
    if (data.frequency === 'WEEKLY' && data.scheduleDays) {
      return data.scheduleDays.every(day => day >= 0 && day <= 6);
    }
    return true;
  },
  { message: 'For weekly frequency, schedule days must be between 0 (Sunday) and 6 (Saturday)', path: ['scheduleDays'] }
).refine(
  (data) => {
    // For MONTHLY, scheduleDays should contain 1-31 (days of month)
    if (data.frequency === 'MONTHLY' && data.scheduleDays) {
      return data.scheduleDays.every(day => day >= 1 && day <= 31);
    }
    return true;
  },
  { message: 'For monthly frequency, schedule days must be between 1 and 31', path: ['scheduleDays'] }
);

export const updateHabitSchema = z.object({
  name: z
    .string()
    .min(1, 'Habit name is required')
    .max(100, 'Habit name must be at most 100 characters')
    .trim()
    .optional(),
  
  description: z
    .string()
    .max(500, 'Description must be at most 500 characters')
    .trim()
    .nullable()
    .optional(),
  
  frequency: z
    .enum(['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'])
    .optional(),
  
  scheduleDays: z
    .array(z.number().int().min(0).max(31))
    .max(31, 'Too many schedule days')
    .nullable()
    .optional(),
  
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .optional(),
  
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .nullable()
    .optional(),
  
  isActive: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.endDate && data.startDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  { message: 'End date must be after or equal to start date', path: ['endDate'] }
);

export const habitIdParamSchema = z.object({
  id: z.string().uuid('Invalid habit ID format'),
});

export const getHabitsQuerySchema = z.object({
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .default('1'),
  
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(100))
    .default('20'),
});

// Type exports
export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type HabitIdParam = z.infer<typeof habitIdParamSchema>;
export type GetHabitsQuery = z.infer<typeof getHabitsQuerySchema>;
