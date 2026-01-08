import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes.js';
import habitRoutes from './habit.routes.js';
import performanceRoutes from './performance.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'HabitEcho API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/habits', habitRoutes);
router.use('/performance', performanceRoutes);

export default router;
