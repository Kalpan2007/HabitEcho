import { Response } from 'express';
import type { ApiResponse, PaginatedResponse } from '../types/index.js';

/**
 * Send a successful response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };

  return res.status(statusCode).json(response);
}

/**
 * Send a successful response with pagination
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: { page: number; limit: number; total: number },
  message: string = 'Success'
): Response {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const response: PaginatedResponse<T> = {
    success: true,
    message,
    data,
    pagination: {
      ...pagination,
      totalPages,
    },
  };

  return res.status(200).json(response);
}

/**
 * Send an error response
 */
export function sendError(
  res: Response,
  message: string,
  code: string = 'ERROR',
  statusCode: number = 400,
  details?: unknown
): Response {
  const response: ApiResponse = {
    success: false,
    message,
    error: {
      code,
      details,
    },
  };

  return res.status(statusCode).json(response);
}

/**
 * Send created response
 */
export function sendCreated<T>(
  res: Response,
  data: T,
  message: string = 'Created successfully'
): Response {
  return sendSuccess(res, data, message, 201);
}

/**
 * Send no content response
 */
export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}
