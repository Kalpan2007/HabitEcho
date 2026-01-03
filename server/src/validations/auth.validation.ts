import { z } from 'zod';

// ============================================
// AUTH VALIDATION SCHEMAS
// ============================================

export const signupSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be at most 100 characters')
    .trim(),

  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email must be at most 255 characters')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),

  occupation: z.enum(['STUDENT', 'ENGINEER', 'DOCTOR', 'OTHER'], {
    errorMap: () => ({ message: 'Occupation must be one of: STUDENT, ENGINEER, DOCTOR, OTHER' }),
  }),

  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
    .optional(),

  age: z
    .number()
    .int('Age must be a whole number')
    .min(13, 'User must be at least 13 years old')
    .max(120, 'Invalid age')
    .optional(),

  timezone: z
    .string()
    .max(50, 'Timezone must be at most 50 characters')
    .default('UTC'),
}).refine(
  (data) => data.dateOfBirth || data.age,
  { message: 'Either date of birth or age must be provided', path: ['dateOfBirth'] }
);

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(1, 'Password is required'),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
