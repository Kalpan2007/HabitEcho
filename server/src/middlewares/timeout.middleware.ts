import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';

/**
 * Middleware to set a timeout for requests
 * Defaults to 30 seconds
 */
export const requestTimeout = (seconds: number = 30) => {
    return (_req: Request, res: Response, next: NextFunction) => {
        // Set timeout on the request
        const timeout = seconds * 1000;

        // Create a timer
        const timer = setTimeout(() => {
            if (!res.headersSent) {
                next(new AppError(`Request timed out after ${seconds} seconds`, 408, 'REQUEST_TIMEOUT'));
            }
        }, timeout);

        // Clear timer when response is finished
        res.on('finish', () => clearTimeout(timer));
        res.on('close', () => clearTimeout(timer));

        next();
    };
};
