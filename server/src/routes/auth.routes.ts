import { Router } from 'express';
import { authController } from '../controllers/index.js';
import { authenticate, validate } from '../middlewares/index.js';
import { authRateLimiter } from '../middlewares/index.js';
import { signupSchema, loginSchema, updatePreferencesSchema, verifyOtpSchema, resendOtpSchema } from '../validations/index.js';

const router = Router();

/**
 * POST /auth/signup
 * Register a new user
 */
router.post(
  '/signup',
  authRateLimiter,
  validate(signupSchema),
  authController.signup
);

/**
 * POST /auth/login
 * Login and receive JWT in HttpOnly cookie
 */
router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  authController.login
);

/**
 * POST /auth/refresh
 * Refresh access token using refresh token in cookie
 */
router.post('/refresh', authController.refresh);

/**
 * POST /auth/logout
 * Logout and clear authentication cookie
 */
router.post('/logout', authenticate, authController.logout);

/**
 * POST /auth/verify-otp
 * Complete email verification via OTP
 */
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);

/**
 * POST /auth/resend-otp
 * Resend a new OTP code
 */
router.post('/resend-otp', validate(resendOtpSchema), authController.resendOtp);

/**
 * GET /auth/me
 * Get current authenticated user profile
 */
router.get('/me', authenticate, authController.getMe);

/**
 * PATCH /auth/preferences
 * Update current user preferences
 */
router.patch(
  '/preferences',
  authenticate,
  validate(updatePreferencesSchema),
  authController.updatePreferences
);

export default router;
