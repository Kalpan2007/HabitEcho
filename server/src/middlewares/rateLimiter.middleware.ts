import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { TooManyRequestsError } from '../utils/errors.js';

/**
 * Rate limiter for authentication routes
 * More restrictive to prevent brute force attacks
 */
export const authRateLimiter = rateLimit({
  windowMs: config.rateLimit.auth.windowMs,
  max: config.rateLimit.auth.max,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('Too many authentication attempts, please try again later'));
  },
  skip: () => config.isTest, // Skip in test environment
});

/**
 * Rate limiter for general API routes
 */
export const generalRateLimiter = rateLimit({
  windowMs: config.rateLimit.general.windowMs,
  max: config.rateLimit.general.max,
  message: 'Too many requests, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('Too many requests, please slow down'));
  },
  skip: () => config.isTest,
});

/**
 * Stricter rate limiter for OTP requests
 */
export const otpRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 OTP requests per minute
  message: 'Too many OTP requests, please wait before requesting another code',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('Too many OTP requests, please wait before requesting another code'));
  },
  skip: () => config.isTest,
});
