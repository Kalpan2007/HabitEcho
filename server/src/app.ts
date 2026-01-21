import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import routes from './routes/index.js';
import {
  errorHandler,
  notFoundHandler,
  requestLogger,
  generalRateLimiter,
  requestTimeout,
} from './middlewares/index.js';

/**
 * Create and configure the Express application
 */
export function createApp(): Express {
  const app = express();

  // ============================================
  // GLOBAL MIDDLEWARE
  // ============================================

  // Request timeout (60s to handle Render cold starts)
  app.use(requestTimeout(60));

  // ============================================
  // SECURITY MIDDLEWARE
  // ============================================

  // Set security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: { policy: 'same-origin' },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: 'deny' },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permittedCrossDomainPolicies: { permittedPolicies: 'none' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
    })
  );

  // ============================================
  // PARSING MIDDLEWARE
  // ============================================

  // Parse JSON bodies
  app.use(express.json({ limit: '10kb' }));

  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Parse cookies
  app.use(cookieParser(config.cookie.secret));

  // ============================================
  // LOGGING & RATE LIMITING
  // ============================================

  // Request logging
  app.use(requestLogger);

  // General rate limiting
  app.use(generalRateLimiter);

  // ============================================
  // CORS CONFIGURATION
  // ============================================

  app.use(
    cors({
      origin: config.isDevelopment ? true : config.cors.origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    })
  );

  // ============================================
  // TRUST PROXY (for rate limiting behind reverse proxy)
  // ============================================

  if (config.isProduction) {
    app.set('trust proxy', 1);
  }

  // ============================================
  // HEALTH CHECK ENDPOINT
  // ============================================

  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.env,
    });
  });

  // ============================================
  // API ROUTES
  // ============================================

  // Mount all routes under /api/v1
  app.use('/api/v1', routes);

  // ============================================
  // ERROR HANDLING
  // ============================================

  // Handle 404 for unmatched routes
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}

export const app = createApp();
