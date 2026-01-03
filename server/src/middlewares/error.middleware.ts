import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
import type { ApiResponse } from '../types/index.js';

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  // Log the error
  logger.error(
    {
      error: {
        name: error.name,
        message: error.message,
        stack: config.isDevelopment ? error.stack : undefined,
      },
      request: {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userId: (req as { userId?: string }).userId,
      },
    },
    'Request error'
  );

  // Handle AppError (operational errors)
  if (error instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      message: error.message,
      error: {
        code: error.code,
        details: config.isDevelopment ? error.details : undefined,
      },
    };

    return res.status(error.statusCode).json(response);
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as unknown as { code: string; meta?: { target?: string[] } };
    
    let message = 'Database error';
    let statusCode = 500;
    let code = 'DATABASE_ERROR';

    switch (prismaError.code) {
      case 'P2002':
        message = `Duplicate value for ${prismaError.meta?.target?.join(', ') || 'field'}`;
        statusCode = 409;
        code = 'CONFLICT';
        break;
      case 'P2025':
        message = 'Record not found';
        statusCode = 404;
        code = 'NOT_FOUND';
        break;
      case 'P2003':
        message = 'Foreign key constraint failed';
        statusCode = 400;
        code = 'INVALID_REFERENCE';
        break;
    }

    const response: ApiResponse = {
      success: false,
      message,
      error: { code },
    };

    return res.status(statusCode).json(response);
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    const response: ApiResponse = {
      success: false,
      message: 'Invalid or expired token',
      error: { code: 'UNAUTHORIZED' },
    };

    return res.status(401).json(response);
  }

  // Handle unknown errors
  const response: ApiResponse = {
    success: false,
    message: config.isProduction ? 'Internal server error' : error.message,
    error: {
      code: 'INTERNAL_ERROR',
      details: config.isDevelopment ? error.stack : undefined,
    },
  };

  return res.status(500).json(response);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): Response {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    error: { code: 'NOT_FOUND' },
  };

  return res.status(404).json(response);
}
