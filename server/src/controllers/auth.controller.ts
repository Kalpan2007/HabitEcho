import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/index.js';
import { config } from '../config/index.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * POST /auth/signup
 * Register a new user
 */
/**
 * POST /auth/signup
 * Register a new user
 */
export async function signup(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.signup(req.body);

    // Set JWT in HttpOnly cookie
    res.cookie(config.cookie.name, result.token, config.cookie.options);

    sendCreated(res, { user: result.user }, 'Registration successful');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/login
 * Login user and issue JWT
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.login(req.body);

    // Set JWT in HttpOnly cookie
    res.cookie(config.cookie.name, result.token, config.cookie.options);

    sendSuccess(res, { user: result.user }, 'Login successful');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/logout
 * Logout user and clear cookie
 */
export async function logout(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Clear the auth cookie
    res.clearCookie(config.cookie.name, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: config.isProduction ? 'strict' : 'lax',
      path: '/',
    });

    sendSuccess(res, null, 'Logout successful');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /auth/me
 * Get current authenticated user
 */
export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const user = await authService.getUserById(userId);

    sendSuccess(res, { user }, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
}
