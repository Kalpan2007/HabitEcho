# Middleware Documentation

The HabitEcho backend uses a comprehensive middleware stack to handle cross-cutting concerns like authentication, validation, rate limiting, and error handling.

## Middleware Stack Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                        REQUEST LIFECYCLE                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Incoming Request                                                  │
│         │                                                         │
│         ▼                                                         │
│  ┌─────────────────┐                                              │
│  │  1. Timeout     │  200s timeout for cold starts               │
│  └────────┬────────┘                                              │
│           │                                                        │
│           ▼                                                        │
│  ┌─────────────────┐                                              │
│  │  2. Security    │  Helmet - security headers                  │
│  │  (Helmet)       │  CORS - cross-origin requests                │
│  └────────┬────────┘                                              │
│           │                                                        │
│           ▼                                                        │
│  ┌─────────────────┐                                              │
│  │  3. Parsing     │  JSON body parsing                           │
│  │                 │  URL-encoded parsing                         │
│  │                 │  Cookie parsing                              │
│  └────────┬────────┘                                              │
│           │                                                        │
│           ▼                                                        │
│  ┌─────────────────┐                                              │
│  │  4. Logging     │  Request/response logging                   │
│  │  (Pino)         │  Performance tracking                        │
│  └────────┬────────┘                                              │
│           │                                                        │
│           ▼                                                        │
│  ┌─────────────────┐                                              │
│  │  5. Rate Limit  │  Global rate limiting                       │
│  │                 │  Endpoint-specific limits                    │
│  └────────┬────────┘                                              │
│           │                                                        │
│           ▼                                                        │
│  ┌─────────────────┐                                              │
│  │  6. Router      │  Route-specific middleware                  │
│  │  Middleware     │  Auth, Validation, Email verification          │
│  └────────┬────────┘                                              │
│           │                                                        │
│           ▼                                                        │
│  ┌─────────────────┐                                              │
│  │  7. Controller  │  Handle request                               │
│  │                 │  Call service                                │
│  └────────┬────────┘                                              │
│           │                                                        │
│           ▼                                                        │
│  ┌─────────────────┐                                              │
│  │  8. Error       │  Handle any errors                           │
│  │  Handler        │  Format error response                       │
│  └─────────────────┘                                              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Global Middleware

These middleware are applied to all requests in `app.ts`.

---

## 1. Request Timeout Middleware

Prevents requests from hanging indefinitely - crucial for serverless/cold starts.

```typescript
// src/middlewares/timeout.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const requestTimeout = (timeout: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Set timeout for the request
    res.setTimeout(timeout, () => {
      res.status(408).json({
        success: false,
        message: 'Request timeout',
        error: { code: 'REQUEST_TIMEOUT' }
      });
    });
    next();
  };
};

// Usage in app.ts
app.use(requestTimeout(200)); // 200 seconds
```

**Purpose:**
- Handle cold start delays in serverless environments
- Prevent resource exhaustion from long-running requests
- Force cleanup of stalled connections

---

## 2. Security Headers (Helmet)

Sets HTTP security headers to protect against common attacks.

```typescript
// src/middlewares/security.middleware.ts
import helmet from 'helmet';

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
```

**Headers Set:**

| Header | Purpose |
|--------|---------|
| Content-Security-Policy | Prevent XSS/injection attacks |
| X-Frame-Options | Prevent clickjacking |
| X-Content-Type-Options | Prevent MIME sniffing |
| X-XSS-Protection | XSS filter (legacy but still useful) |
| Strict-Transport-Security | Force HTTPS |
| Referrer-Policy | Control referrer information |

---

## 3. CORS Configuration

Controls which origins can access the API.

```typescript
// src/app.ts
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl)
      if (!origin) return callback(null, true);

      // Development: allow all
      if (config.isDevelopment) return callback(null, true);

      // Production: check against whitelist
      const allowedOrigins = config.cors.origin.split(',').map(o => o.trim());
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization'
    ],
    exposedHeaders: ['Set-Cookie'],
  })
);
```

**Configuration:**
- **Development:** Allow all origins
- **Production:** Only allow configured origins (comma-separated)
- **Credentials:** Allow cookies to be sent cross-origin
- **Methods:** Standard REST methods

---

## 4. Body Parsing

Parse incoming request bodies.

```typescript
// JSON body parser
app.use(express.json({ limit: '10kb' }));

// URL-encoded body parser
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser(config.cookie.secret));
```

**Limits:**
- JSON body: 10kb max
- URL-encoded: 10kb max

---

## 5. Request Logging

Logs all incoming requests and outgoing responses.

```typescript
// src/middlewares/logger.middleware.ts
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log request
  logger.info({
    type: 'request',
    method: req.method,
    url: req.url,
    headers: {
      userAgent: req.headers['user-agent'],
      origin: req.headers.origin,
    },
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      type: 'response',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
    });
  });

  next();
};
```

---

## 6. Rate Limiting

Global and endpoint-specific rate limiting.

```typescript
// src/middlewares/rateLimiter.middleware.ts
import rateLimit from 'express-rate-limit';

// Global rate limiter - 100 requests per 15 minutes
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    error: { code: 'RATE_LIMITED' },
  },
});

// Auth-specific rate limiter - stricter for login/signup
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    error: { code: 'RATE_LIMITED' },
  },
});

// Apply in app.ts
app.use(generalRateLimiter);

// Apply to specific routes
router.post('/login', authRateLimiter, authController.login);
```

**Rate Limits:**

| Endpoint | Requests | Window |
|----------|----------|--------|
| Global | 100 | 15 min |
| /auth/login | 10 | 15 min |
| /auth/signup | 5 | 15 min |
| /auth/verify-otp | 5 | 15 min |
| /auth/resend-otp | 3 | 1 hour |

---

## Route-Specific Middleware

Applied within route definitions.

---

## 7. Authentication Middleware

Verifies JWT token and attaches user to request.

```typescript
// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UnauthorizedError } from '../utils/errors.js';

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required', 'UNAUTHENTICATED');
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret) as {
      sub: string;
      email: string;
    };

    // Attach user to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired', 'TOKEN_EXPIRED'));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token', 'INVALID_TOKEN'));
    } else {
      next(error);
    }
  }
};
```

**Usage:**
```typescript
// All habit routes require authentication
router.use(authenticate);

router.get('/', habitController.getHabits);
router.post('/', habitController.createHabit);
```

---

## 8. Email Verification Middleware

Checks if user has verified their email.

```typescript
// src/middlewares/verifyEmail.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { UnauthorizedError } from '../utils/errors.js';

export const isEmailVerified = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError('Authentication required', 'UNAUTHENTICATED');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true },
    });

    if (!user || !user.emailVerified) {
      throw new UnauthorizedError(
        'Please verify your email first',
        'EMAIL_NOT_VERIFIED'
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
```

**Usage:**
```typescript
// Require email verification for creating habits
router.post('/', authenticate, isEmailVerified, validate(createHabitSchema), habitController.createHabit);
```

---

## 9. Validation Middleware

Validates request body/params/query against Zod schemas.

```typescript
// src/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors.js';

export const validate = (schema: ZodSchema, location: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[location];
      const parsed = schema.parse(data);

      // Replace with parsed data (with defaults applied)
      req[location] = parsed;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });

        next(
          new ValidationError('Validation failed', errors)
        );
      } else {
        next(error);
      }
    }
  };
};
```

**Usage:**
```typescript
// Validate request body
router.post('/', validate(createHabitSchema), habitController.createHabit);

// Validate URL parameters
router.get('/:id', validate(habitIdParamSchema, 'params'), habitController.getHabit);

// Validate query parameters
router.get('/', validate(getHabitsQuerySchema, 'query'), habitController.getHabits);
```

---

## 10. Error Handler Middleware

Catches and formats all errors.

```typescript
// src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log error
  logger.error({
    type: 'error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
  });

  // Handle known errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.code,
        details: err.details,
      },
    });
  }

  // Handle unknown errors
  const reference = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'An unexpected error occurred',
    error: {
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development'
        ? { stack: err.stack }
        : { reference },
    },
  });
};
```

---

## Middleware Order

The order of middleware is critical:

```typescript
// app.ts - Correct order
app.use(requestTimeout(200));           // 1. Timeout first
app.use(helmet({ ... }));               // 2. Security
app.use(cors({ ... }));                 // 3. CORS
app.use(express.json({ limit: '10kb' }));  // 4. Body parsing
app.use(express.urlencoded({ ... }));
app.use(cookieParser(config.cookie.secret));
app.use(requestLogger);                 // 5. Logging
app.use(generalRateLimiter);           // 6. Rate limiting
app.use('/api/v1', routes);            // 7. Routes with their middleware

// Error handler - MUST be last
app.use(notFoundHandler);
app.use(errorHandler);
```

---

## Custom Middleware Creation

To create a custom middleware:

```typescript
// src/middlewares/custom.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const customMiddleware = (options: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Logic here

    if (something) {
      // Continue to next middleware
      next();
    } else {
      // Pass error to error handler
      next(new Error('Something failed'));
    }
  };
};
```

---

**Next:** See [Security Implementation](./security.md) for detailed security measures.