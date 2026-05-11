# Backend Architecture Overview

The HabitEcho backend is built with Express.js following a layered architecture pattern. This document provides a high-level overview of the server architecture.

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Node.js | 18+ |
| Framework | Express.js | 4.21.x |
| ORM | Prisma | 5.22.x |
| Database | PostgreSQL | 16+ |
| Auth | JWT + Refresh Tokens | - |
| Validation | Zod | 3.23.x |
| Email | Nodemailer | 7.0.x |
| Logging | Pino | 9.5.x |
| Scheduling | node-cron | 4.2.x |
| Security | Helmet, CORS, Rate Limiter | - |

## Project Structure

```
server/
├── src/
│   ├── app.ts                 # Express app creation & middleware
│   ├── server.ts              # Server entry point
│   ├── config/
│   │   ├── index.ts           # Configuration management
│   │   └── database.ts        # Prisma client singleton
│   ├── routes/
│   │   ├── index.ts           # Route aggregator
│   │   ├── auth.routes.ts     # Authentication routes
│   │   ├── habit.routes.ts    # Habit CRUD routes
│   │   └── performance.routes.ts
│   ├── controllers/
│   │   ├── index.ts           # Controller exports
│   │   ├── auth.controller.ts
│   │   ├── habit.controller.ts
│   │   ├── habitLog.controller.ts
│   │   └── performance.controller.ts
│   ├── services/
│   │   ├── index.ts           # Service exports
│   │   ├── auth.service.ts    # Auth business logic
│   │   ├── habit.service.ts   # Habit business logic
│   │   ├── habitLog.service.ts
│   │   ├── performance.service.ts
│   │   ├── email.service.ts   # Email sending
│   │   └── reminder.service.ts
│   ├── middlewares/
│   │   ├── index.ts           # Middleware exports
│   │   ├── auth.middleware.ts # JWT verification
│   │   ├── validate.middleware.ts
│   │   ├── rateLimiter.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── logger.middleware.ts
│   │   └── timeout.middleware.ts
│   ├── validations/
│   │   ├── index.ts           # Schema exports
│   │   ├── auth.validation.ts
│   │   ├── habit.validation.ts
│   │   └── habitLog.validation.ts
│   ├── utils/
│   │   ├── response.ts         # Response helpers
│   │   ├── errors.ts          # Custom error classes
│   │   ├── jwt.ts             # JWT utilities
│   │   ├── crypto.ts          # Password/token helpers
│   │   ├── date.ts            # Date utilities
│   │   └── logger.ts          # Logger setup
│   └── types/
│       └── index.ts           # Shared TypeScript types
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Database seed script
│   └── migrations/            # Database migrations
└── package.json
```

## Request Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           REQUEST FLOW                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────┐                                                               │
│  │  HTTP   │  Incoming Request                                            │
│  │ Request │                                                               │
│  └────┬────┘                                                               │
│       │                                                                    │
│       ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                    EXPRESS MIDDLEWARE CHAIN                          │  │
│  │                                                                      │  │
│  │  1. Request Timeout (200s)                                          │  │
│  │  2. Helmet (Security Headers)                                        │  │
│  │  3. CORS                                                             │  │
│  │  4. Body Parser (JSON)                                               │  │
│  │  5. Cookie Parser                                                    │  │
│  │  6. Request Logger                                                   │  │
│  │  7. Rate Limiter                                                     │  │
│  │                                                                      │  │
│  └────────────────────────────────┬────────────────────────────────────┘  │
│                                   │                                       │
│                                   ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        ROUTING LAYER                                 │  │
│  │                                                                      │  │
│  │  /api/v1/auth/*         → auth.routes.ts                            │  │
│  │  /api/v1/habits/*       → habit.routes.ts                           │  │
│  │  /api/v1/performance/*  → performance.routes.ts                    │  │
│  │                                                                      │  │
│  └────────────────────────────────┬────────────────────────────────────┘  │
│                                   │                                       │
│                                   ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                     MIDDLEWARE STACK                                 │  │
│  │                                                                      │  │
│  │  Route-specific middleware:                                         │  │
│  │  - authenticate (checks JWT)                                        │  │
│  │  - isEmailVerified (checks email status)                            │  │
│  │  - validate (Zod schema validation)                                  │  │
│  │  - authRateLimiter (auth-specific limits)                           │  │
│  │                                                                      │  │
│  └────────────────────────────────┬────────────────────────────────────┘  │
│                                   │                                       │
│                                   ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                      CONTROLLER LAYER                                │  │
│  │                                                                      │  │
│  │  - Extracts request data                                            │  │
│  │  - Calls service methods                                            │  │
│  │  - Handles response formatting                                      │  │
│  │  - Catches errors and passes to error handler                       │  │
│  │                                                                      │  │
│  └────────────────────────────────┬────────────────────────────────────┘  │
│                                   │                                       │
│                                   ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                       SERVICE LAYER                                  │  │
│  │                                                                      │  │
│  │  - Business logic                                                   │  │
│  │  - Database operations via Prisma                                   │  │
│  │  - Complex computations                                             │  │
│  │  - Returns domain objects                                           │  │
│  │                                                                      │  │
│  └────────────────────────────────┬────────────────────────────────────┘  │
│                                   │                                       │
│                                   ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                      DATABASE LAYER                                 │  │
│  │                                                                      │  │
│  │  Prisma ORM → PostgreSQL                                            │  │
│  │                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                   │                                       │
│                                   ▼                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                   ERROR HANDLING MIDDLEWARE                         │  │
│  │                                                                      │  │
│  │  - Catches any unhandled errors                                    │  │
│  │  - Formats error response                                          │  │
│  │  - Logs error details                                              │  │
│  │                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Design Patterns

### 1. Controller-Service-Route Pattern

```
Route → Controller → Service → Database

Example: Creating a habit
────────────────────────────────────
1. POST /habits → habit.routes.ts
2. route calls habitController.createHabit()
3. controller validates input, calls habitService.create()
4. service performs business logic, uses Prisma
5. service returns created habit
6. controller formats response
7. response sent to client
```

### 2. Middleware Composition

Middleware are composed at multiple levels:

- **Global:** Applied in app.ts to all routes
- **Router-level:** Applied to specific routes in routes/*.ts
- **Route-level:** Applied to individual endpoints

### 3. Singleton Pattern

- Prisma client is a singleton (avoids connection exhaustion)
- Logger is a singleton
- Config is loaded once

### 4. Repository Pattern (via Prisma)

Services act as repositories, abstracting database operations:

```typescript
// Instead of direct Prisma calls in controllers:
const habits = await prisma.habit.findMany({ ... });

// We use:
const habits = await habitService.getHabits(userId, options);
```

## Security Implementation

### 1. Helmet Configuration

```typescript
app.use(helmet({
  contentSecurityPolicy: { ... },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  // ... other settings
}));
```

### 2. CORS Configuration

- Development: Allow all origins
- Production: Check against allowed origins list

### 3. Rate Limiting

| Type | Limit | Window |
|------|-------|--------|
| Global | 100 | 15 min |
| Auth (login) | 10 | 15 min |
| Auth (signup) | 5 | 15 min |

### 4. Request Timeout

- Global timeout: 200 seconds
- Handles cold starts on serverless

### 5. Input Validation

- All inputs validated with Zod schemas
- Validation middleware rejects invalid requests early

## Database Schema

The database uses PostgreSQL with the following core entities:

- **User:** Authentication & preferences
- **Habit:** User habits with schedules
- **HabitLog:** Daily entries/completions
- **RefreshToken:** Token management
- **OtpCode:** Email verification codes

See [Database Schema](./database/schema.md) for details.

## Environment Configuration

```typescript
// config/index.ts
export const config = {
  env: process.env.NODE_ENV,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  server: {
    port: parseInt(process.env.PORT || '3000'),
    timeout: 200000,
  },

  database: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpiry: '15m',
    refreshExpiry: '7d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN,
  },

  email: {
    // SMTP or Brevo config
  },
};
```

## Logging Strategy

Using Pino for structured logging:

```typescript
// All logs include:
{
  "level": "info",
  "time": 1715433600000,
  "pid": 12345,
  "hostname": "server-1",
  "msg": "Request completed",
  "req": {
    "method": "POST",
    "url": "/api/v1/habits",
    "headers": { ... }
  },
  "res": {
    "statusCode": 201
  },
  "duration": 45.3
}
```

## Error Handling

### Custom Error Classes

```typescript
class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string,
    public details?: unknown
  ) {
    super(message);
  }
}

class NotFoundError extends AppError { ... }
class ValidationError extends AppError { ... }
class UnauthorizedError extends AppError { ... }
```

### Global Error Handler

- Catches all unhandled errors
- Logs full stack trace in development
- Returns sanitized error in production
- Includes error reference ID for support

---

**Next:**
- [Layers Deep Dive](./layers.md) - Controller-Service patterns
- [Middleware Explained](./middleware.md) - All middleware details
- [Security Implementation](./security.md) - Security measures