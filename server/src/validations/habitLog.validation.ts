import { z } from 'zod';

// ============================================
// HABIT LOG VALIDATION SCHEMAS
// ============================================

export const createHabitLogSchema = z.object({
    date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),

    status: z.enum(['DONE', 'NOT_DONE', 'PARTIAL'], {
        errorMap: () => ({ message: 'Status must be one of: DONE, NOT_DONE, PARTIAL' }),
    }),

    completed: z.boolean().optional(),

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
);

export const updateHabitLogSchema = z.object({
    status: z
        .enum(['DONE', 'NOT_DONE', 'PARTIAL'])
        .optional(),

    completed: z.boolean().optional(),

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
});
