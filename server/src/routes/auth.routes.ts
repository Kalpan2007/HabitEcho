import { Router } from 'express';
import { authController } from '../controllers/index.js';
import { authenticate, validate } from '../middlewares/index.js';
import { authRateLimiter } from '../middlewares/index.js';
import { signupSchema, loginSchema } from '../validations/index.js';

const router = Router();

/**
 * POST /auth/signup
 * Register a new user
 * 
 * Request Body:
 * {
 *   "fullName": "John Doe",
 *   "email": "john@example.com",
 *   "phoneNumber": "+1234567890",
 *   "password": "SecureP@ss123",
 *   "occupation": "ENGINEER",
 *   "dateOfBirth": "1990-01-15",
 *   "timezone": "America/New_York"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Registration successful. Please verify your email.",
 *   "data": {
 *     "user": { ... },
 *     "otpSent": true
 *   }
 * }
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
 * 
 * Request Body:
 * {
 *   "email": "john@example.com",
 *   "password": "SecureP@ss123"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "data": {
 *     "user": { ... }
 *   }
 * }
 * 
 * Note: JWT is set in HttpOnly cookie, not returned in response body
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
 * Requires authentication
 */
router.post('/logout', authenticate, authController.logout);

/**
 * GET /auth/me
 * Get current authenticated user profile
 * Requires authentication
 */
router.get('/me', authenticate, authController.getMe);

export default router;
