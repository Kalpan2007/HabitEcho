import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodType } from 'zod';
import { ValidationError } from '../utils/errors.js';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Middleware factory for validating request data with Zod
 */
export function validate(
  schema: ZodType,
  target: ValidationTarget = 'body'
) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req[target];
      const validated = await schema.parseAsync(data);
      
      // Replace the request data with validated and transformed data
      (req as unknown as Record<string, unknown>)[target] = validated;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        next(new ValidationError('Validation failed', formattedErrors));
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate multiple targets at once
 */
export function validateMultiple(schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors: Array<{ field: string; message: string }> = [];

      for (const [target, schema] of Object.entries(schemas)) {
        if (schema) {
          try {
            const data = req[target as ValidationTarget];
            const validated = await schema.parseAsync(data);
            (req as unknown as Record<string, unknown>)[target] = validated;
          } catch (error) {
            if (error instanceof ZodError) {
              error.errors.forEach((err) => {
                errors.push({
                  field: `${target}.${err.path.join('.')}`,
                  message: err.message,
                });
              });
            } else {
              throw error;
            }
          }
        }
      }

      if (errors.length > 0) {
        next(new ValidationError('Validation failed', errors));
      } else {
        next();
      }
    } catch (error) {
      next(error);
    }
  };
}
