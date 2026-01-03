import { z } from 'zod';

// ============================================
// HABIT ENTRY VALIDATION SCHEMAS
// ============================================

export const createHabitEntrySchema = z.object({
  entryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Entry date must be in YYYY-MM-DD format'),
  
  status: z.enum(['DONE', 'NOT_DONE', 'PARTIAL'], {
    errorMap: () => ({ message: 'Status must be one of: DONE, NOT_DONE, PARTIAL' }),
  }),
  
  percentComplete: z
    .number()
    .int('Percent complete must be a whole number')
    .min(0, 'Percent complete must be between 0 and 100')
    .max(100, 'Percent complete must be between 0 and 100')
    .optional(),
  
  reason: z
    .string()
    .max(300, 'Reason must be at most 300 characters')
    .trim()
    .optional(),
  
  notes: z
    .string()
    .max(1000, 'Notes must be at most 1000 characters')
    .trim()
    .optional(),
}).refine(
  (data) => {
    // If status is DONE, percentComplete should be 100 or undefined
    if (data.status === 'DONE' && data.percentComplete !== undefined && data.percentComplete !== 100) {
      return false;
    }
    return true;
  },
  { message: 'When status is DONE, percent complete should be 100', path: ['percentComplete'] }
).refine(
  (data) => {
    // If status is NOT_DONE, percentComplete should be 0 or undefined
    if (data.status === 'NOT_DONE' && data.percentComplete !== undefined && data.percentComplete !== 0) {
      return false;
    }
    return true;
  },
  { message: 'When status is NOT_DONE, percent complete should be 0', path: ['percentComplete'] }
).refine(
  (data) => {
    // If percentComplete is 100, status should be DONE
    if (data.percentComplete === 100 && data.status !== 'DONE') {
      return false;
    }
    return true;
  },
  { message: 'When percent complete is 100, status should be DONE', path: ['status'] }
);

export const updateHabitEntrySchema = z.object({
  status: z
    .enum(['DONE', 'NOT_DONE', 'PARTIAL'])
    .optional(),
  
  percentComplete: z
    .number()
    .int('Percent complete must be a whole number')
    .min(0, 'Percent complete must be between 0 and 100')
    .max(100, 'Percent complete must be between 0 and 100')
    .nullable()
    .optional(),
  
  reason: z
    .string()
    .max(300, 'Reason must be at most 300 characters')
    .trim()
    .nullable()
    .optional(),
  
  notes: z
    .string()
    .max(1000, 'Notes must be at most 1000 characters')
    .trim()
    .nullable()
    .optional(),
});

export const getHabitHistoryQuerySchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
    .optional(),
  
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
    .optional(),
  
  page: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .default('1'),
  
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(365))
    .default('30'),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) >= new Date(data.startDate);
    }
    return true;
  },
  { message: 'End date must be after or equal to start date', path: ['endDate'] }
);

// Type exports
export type CreateHabitEntryInput = z.infer<typeof createHabitEntrySchema>;
export type UpdateHabitEntryInput = z.infer<typeof updateHabitEntrySchema>;
export type GetHabitHistoryQuery = z.infer<typeof getHabitHistoryQuerySchema>;
