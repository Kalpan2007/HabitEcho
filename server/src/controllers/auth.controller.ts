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

    // Set Access JWT in HttpOnly cookie
    res.cookie('habitecho_access', result.accessToken, config.cookie.options);

    // Set Refresh JWT in HttpOnly cookie
    res.cookie('habitecho_refresh', result.refreshToken, {
      ...config.cookie.options,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

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

    // Set Access JWT in HttpOnly cookie
    res.cookie('habitecho_access', result.accessToken, config.cookie.options);

    // Set Refresh JWT in HttpOnly cookie
    res.cookie('habitecho_refresh', result.refreshToken, {
      ...config.cookie.options,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    sendSuccess(res, { user: result.user }, 'Login successful');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken = req.cookies.habitecho_refresh;

    if (!refreshToken) {
      res.status(401).json({ success: false, message: 'Refresh token missing' });
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAuthToken(refreshToken);

    // Update tokens in cookies
    res.cookie('habitecho_access', accessToken, config.cookie.options);
    res.cookie('habitecho_refresh', newRefreshToken, {
      ...config.cookie.options,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, null, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/logout
 * Logout user and clear cookie
 */
export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken = req.cookies.habitecho_refresh;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    // Clear all auth cookies
    const clearOptions = {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: config.isProduction ? ('strict' as const) : ('lax' as const),
      path: '/',
    };

    res.clearCookie('habitecho_access', clearOptions);
    res.clearCookie('habitecho_refresh', clearOptions);

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
