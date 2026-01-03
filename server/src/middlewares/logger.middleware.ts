import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { randomUUID } from 'crypto';

/**
 * Request logging middleware using pino
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = randomUUID();
  const startTime = Date.now();

  // Attach request ID to request object
  (req as Request & { requestId: string }).requestId = requestId;

  // Log incoming request
  logger.info(
    {
      requestId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
    'Incoming request'
  );

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    };

    if (res.statusCode >= 500) {
      logger.error(logData, 'Request completed with server error');
    } else if (res.statusCode >= 400) {
      logger.warn(logData, 'Request completed with client error');
    } else {
      logger.info(logData, 'Request completed');
    }
  });

  next();
}
