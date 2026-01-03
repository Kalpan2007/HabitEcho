# HabitEcho Backend Architecture Documentation

## Overview

HabitEcho is a **private, personal habit monitoring system** built with a production-grade backend architecture. This document explains the complete backend system, its architecture, and how all components work together.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture Overview](#architecture-overview)
3. [Folder Structure](#folder-structure)
4. [Request Flow](#request-flow)
5. [Database Design](#database-design)
6. [Authentication System](#authentication-system)
7. [Core Modules](#core-modules)
8. [Security Implementation](#security-implementation)
9. [Error Handling](#error-handling)
10. [Logging System](#logging-system)
11. [Configuration Management](#configuration-management)

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | Web application framework |
| **TypeScript** | Type-safe JavaScript superset |
| **PostgreSQL** | Relational database |
| **Prisma ORM** | Database toolkit and ORM |
| **JWT** | Stateless authentication tokens |
| **Zod** | Schema validation library |
| **Pino** | High-performance logging |
| **Helmet** | Security headers middleware |
| **Bcrypt** | Password hashing |
| **Day.js** | Date manipulation library |

---

## Architecture Overview

HabitEcho follows a **Clean Layered Architecture** pattern that separates concerns into distinct layers:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT REQUEST                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE LAYER                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐│
│  │  Helmet  │ │  Logger  │ │Rate Limit│ │ Cookie Parser    ││
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘│
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────────────┐ │
│  │   Auth   │ │Validation│ │      Error Handler           │ │
│  └──────────┘ └──────────┘ └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       ROUTES LAYER                           │
│         /auth    /habits    /performance                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    CONTROLLER LAYER                          │
│   - Handles HTTP Request/Response                            │
│   - Extracts data from requests                              │
│   - Sends appropriate responses                              │
│   - NO business logic here                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVICE LAYER                            │
│   - Contains ALL business logic                              │
│   - Data validation and processing                           │
│   - Calls database through Prisma                            │
│   - Throws custom errors                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                            │
│              Prisma ORM + PostgreSQL                         │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibility | Example |
|-------|---------------|---------|
| **Middleware** | Cross-cutting concerns (auth, logging, validation) | Verify JWT token |
| **Routes** | Define API endpoints and attach handlers | `POST /auth/login` |
| **Controller** | Handle HTTP request/response only | Extract body, send JSON |
| **Service** | All business logic and data processing | Calculate streaks |
| **Database** | Data persistence via Prisma ORM | CRUD operations |

---

## Folder Structure

```
server/
├── prisma/
│   └── schema.prisma          # Database schema definition
│
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   │
│   ├── config/
│   │   ├── index.ts           # Environment configuration
│   │   └── database.ts        # Prisma client setup
│   │
│   ├── controllers/           # HTTP handlers
│   │   ├── index.ts
│   │   ├── auth.controller.ts
│   │   ├── habit.controller.ts
│   │   ├── habitEntry.controller.ts
│   │   └── performance.controller.ts
│   │
│   ├── middlewares/           # Express middlewares
│   │   ├── index.ts
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── logger.middleware.ts
│   │   ├── rateLimiter.middleware.ts
│   │   └── validate.middleware.ts
│   │
│   ├── routes/                # API route definitions
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── habit.routes.ts
│   │   └── performance.routes.ts
│   │
│   ├── services/              # Business logic
│   │   ├── index.ts
│   │   ├── auth.service.ts
│   │   ├── habit.service.ts
│   │   ├── habitEntry.service.ts
│   │   └── performance.service.ts
│   │
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   │
│   ├── utils/                 # Utility functions
│   │   ├── index.ts
│   │   ├── crypto.ts          # Password hashing, OTP
│   │   ├── date.ts            # Date utilities
│   │   ├── errors.ts          # Custom error classes
│   │   ├── jwt.ts             # JWT utilities
│   │   ├── logger.ts          # Pino logger
│   │   └── response.ts        # Response helpers
│   │
│   └── validations/           # Zod schemas
│       ├── index.ts
│       ├── auth.validation.ts
│       ├── habit.validation.ts
│       └── habitEntry.validation.ts
│
├── .env                       # Environment variables
├── .env.example               # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

---

## Request Flow

Here's how a typical request flows through the system:

### Example: Creating a New Habit

```
1. CLIENT sends POST /api/v1/habits with habit data
                    │
                    ▼
2. EXPRESS receives request
                    │
                    ▼
3. MIDDLEWARE CHAIN executes:
   ├── Helmet (security headers)
   ├── JSON Parser (parse body)
   ├── Cookie Parser (parse cookies)
   ├── Request Logger (log request)
   ├── Rate Limiter (check limits)
   ├── Auth Middleware (verify JWT from cookie)
   └── Validation Middleware (validate body with Zod)
                    │
                    ▼
4. ROUTE matches POST /habits
                    │
                    ▼
5. CONTROLLER (habit.controller.ts)
   - Extracts userId from authenticated request
   - Extracts habit data from request body
   - Calls habitService.createHabit(userId, data)
                    │
                    ▼
6. SERVICE (habit.service.ts)
   - Validates business rules
   - Normalizes date fields
   - Calls Prisma to insert record
   - Returns formatted habit object
                    │
                    ▼
7. CONTROLLER receives result
   - Sends 201 response with habit data
                    │
                    ▼
8. CLIENT receives response
```

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────────┐
│      USER       │
├─────────────────┤
│ id (PK)         │
│ fullName        │
│ email (unique)  │
│ phoneNumber     │
│ password        │
│ occupation      │
│ dateOfBirth     │
│ age             │
│ timezone        │
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│      HABIT      │
├─────────────────┤
│ id (PK)         │
│ userId (FK)     │
│ name            │
│ description     │
│ frequency       │
│ scheduleDays    │
│ startDate       │
│ endDate         │
│ isActive        │
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│   HABIT_ENTRY   │
├─────────────────┤
│ id (PK)         │
│ habitId (FK)    │
│ entryDate       │◄── UNIQUE(habitId, entryDate)
│ status          │
│ percentComplete │
│ reason          │
│ notes           │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
```

### Enums

```typescript
// User occupation options
enum Occupation {
  STUDENT
  ENGINEER
  DOCTOR
  OTHER
}

// Habit frequency options
enum Frequency {
  DAILY      // Every day
  WEEKLY     // Specific days of week
  MONTHLY    // Specific days of month
  CUSTOM     // Custom schedule
}

// Entry status options
enum EntryStatus {
  DONE       // 100% completed
  NOT_DONE   // 0% completed
  PARTIAL    // 1-99% completed
}
```

---

## Authentication System

> **Authentication Model:** Password-based authentication is used. OTP verification has been removed for a streamlined signup experience.

### How Authentication Works

```
┌────────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                            │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User submits signup form                                     │
│              │                                                   │
│              ▼                                                   │
│  2. Server validates input (Zod)                                 │
│              │                                                   │
│              ▼                                                   │
│  3. Server checks if email/phone already exists                  │
│              │                                                   │
│              ▼                                                   │
│  4. Server hashes password (bcrypt, 12 rounds)                   │
│              │                                                   │
│              ▼                                                   │
│  5. Server creates user (active immediately)                     │
│              │                                                   │
│              ▼                                                   │
│  6. Server generates JWT token                                   │
│              │                                                   │
│              ▼                                                   │
│  7. Server sets JWT in HttpOnly cookie                           │
│              │                                                   │
│              ▼                                                   │
│  8. User is logged in                                            │
│                                                                  │
└────────────────────────────────────────────────────────────────┘


┌────────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User submits email + password                                │
│              │                                                   │
│              ▼                                                   │
│  2. Server finds user by email                                   │
│              │                                                   │
│              ▼                                                   │
│  3. Server compares password with bcrypt                         │
│              │                                                   │
│              ▼                                                   │
│  4. Server generates JWT token                                   │
│     Payload: { userId, iat, exp }                                │
│     Expiry: 7 days                                               │
│              │                                                   │
│              ▼                                                   │
│  5. Server sets JWT in HttpOnly cookie                           │
│     - HttpOnly: true (no JS access)                              │
│     - Secure: true (HTTPS only in production)                    │
│     - SameSite: strict (CSRF protection)                         │
│              │                                                   │
│              ▼                                                   │
│  6. Client receives response (no token in body)                  │
│                                                                  │
└────────────────────────────────────────────────────────────────┘


┌────────────────────────────────────────────────────────────────┐
│              PROTECTED ROUTE ACCESS                              │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Client makes request (cookie sent automatically)             │
│              │                                                   │
│              ▼                                                   │
│  2. Auth middleware extracts token from cookie                   │
│              │                                                   │
│              ▼                                                   │
│  3. Auth middleware verifies JWT signature                       │
│              │                                                   │
│              ▼                                                   │
│  4. Auth middleware checks token expiry                          │
│              │                                                   │
│              ▼                                                   │
│  5. Auth middleware fetches user from database                   │
│              │                                                   │
│              ▼                                                   │
│  6. Auth middleware attaches userId to request                   │
│              │                                                   │
│              ▼                                                   │
│  7. Request proceeds to controller                               │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### JWT Token Structure

```javascript
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload (kept minimal for security)
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "iat": 1735689600,  // Issued at
  "exp": 1736294400   // Expires (7 days later)
}

// Signature
HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```



---

## Core Modules

### 1. Auth Module

**Purpose:** Handle user registration, verification, and authentication.

| Function | Description |
|----------|-------------|
| `signup()` | Create new user, hash password, auto-login |
| `login()` | Authenticate user, issue JWT |
| `logout()` | Clear authentication cookie |

### 2. Habit Module

**Purpose:** CRUD operations for habits.

| Function | Description |
|----------|-------------|
| `createHabit()` | Create new habit with schedule |
| `getHabits()` | List all habits with pagination |
| `getHabitById()` | Get single habit details |
| `updateHabit()` | Update habit properties |
| `deleteHabit()` | Soft delete habit (set `deletedAt` timestamp) |

> **Deletion Strategy:** Habits use **soft delete**. When a habit is deleted, the `deletedAt` field is set to the current timestamp. The habit and all its entries are preserved in the database for analytics integrity. Soft-deleted habits are excluded from all queries by default.

### 3. Habit Entry Module

**Purpose:** Track daily habit completion.

| Function | Description |
|----------|-------------|
| `createHabitEntry()` | Log entry for a date |
| `updateHabitEntry()` | Update existing entry |
| `getHabitHistory()` | Get entries with date range filter |
| `deleteHabitEntry()` | Remove an entry |

### 4. Performance Module

**Purpose:** Calculate analytics and statistics.

| Function | Description |
|----------|-------------|
| `getPerformanceSummary()` | Overall user statistics |
| `getHabitPerformance()` | Detailed habit analytics |
| `calculateStreaks()` | Current and longest streaks |
| `calculateRollingAverages()` | 7/14/30 day averages |
| `calculateMomentum()` | Trend comparison |

---

## Security Implementation

### Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY MEASURES                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. HELMET MIDDLEWARE                                        │
│     ├── Content-Security-Policy                              │
│     ├── X-Frame-Options: DENY                                │
│     ├── X-Content-Type-Options: nosniff                      │
│     ├── Strict-Transport-Security (HSTS)                     │
│     ├── X-XSS-Protection                                     │
│     └── Referrer-Policy: strict-origin-when-cross-origin     │
│                                                              │
│  2. RATE LIMITING                                            │
│     ├── Auth routes: 10 requests / 15 minutes                │
│     ├── OTP routes: 3 requests / 1 minute                    │
│     └── General routes: 100 requests / 1 minute              │
│                                                              │
│  3. PASSWORD SECURITY                                        │
│     ├── Bcrypt hashing (12 salt rounds)                      │
│     ├── Min 8 characters                                     │
│     ├── Requires uppercase, lowercase, number, special char  │
│     └── Never stored or logged in plaintext                  │
│                                                              │
│  4. JWT SECURITY                                             │
│     ├── HttpOnly cookie (no JavaScript access)               │
│     ├── Secure flag (HTTPS only in production)               │
│     ├── SameSite: strict (CSRF protection)                   │
│     ├── 7-day expiry                                         │
│     └── Minimal payload (only userId)                        │
│                                                              │
│  5. INPUT VALIDATION                                         │
│     ├── Zod schema validation on all inputs                  │
│     ├── SQL injection prevention via Prisma                  │
│     └── Request body size limit (10KB)                       │
│                                                              │
│  6. ERROR HANDLING                                           │
│     ├── No stack traces in production                        │
│     ├── Generic error messages to client                     │
│     └── Detailed logging on server                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Handling

### Error Class Hierarchy

```typescript
AppError (Base Class)
├── BadRequestError (400)
├── UnauthorizedError (401)
├── ForbiddenError (403)
├── NotFoundError (404)
├── ConflictError (409)
├── ValidationError (400)
├── TooManyRequestsError (429)
└── InternalServerError (500)
```

### Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": {
    "code": "ERROR_CODE",
    "details": {} // Only in development
  }
}
```

### Error Flow

```
1. Error thrown in service layer
            │
            ▼
2. Error propagates to controller
            │
            ▼
3. Controller passes to next(error)
            │
            ▼
4. Global error handler catches
            │
            ▼
5. Error handler:
   - Logs error with Pino
   - Formats response based on error type
   - Removes sensitive info in production
   - Sends appropriate HTTP status
```

---

## Logging System

### Log Levels

| Level | When to Use |
|-------|-------------|
| `fatal` | Application crash, unrecoverable errors |
| `error` | Runtime errors, failed operations |
| `warn` | Deprecations, non-critical issues |
| `info` | Normal operations, state changes |
| `debug` | Detailed debugging information |
| `trace` | Very detailed tracing |

### What Gets Logged

```
REQUEST LOGGING:
{
  "requestId": "uuid",
  "method": "POST",
  "url": "/api/v1/habits",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "duration": "45ms",
  "statusCode": 201
}

ERROR LOGGING:
{
  "error": {
    "name": "ValidationError",
    "message": "Invalid input",
    "stack": "..." // Only in development
  },
  "request": {
    "method": "POST",
    "url": "/api/v1/habits",
    "userId": "uuid"
  }
}

DATABASE LOGGING (Development only):
{
  "query": "SELECT * FROM users WHERE id = $1",
  "duration": "2ms"
}
```

### Redacted Fields

The following are automatically removed from logs:
- `password`
- `token`
- `authorization`
- `cookie`

---

## Configuration Management

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret for signing JWTs | Required (min 32 chars) |
| `COOKIE_SECRET` | Secret for cookie signing | Required (min 32 chars) |
| `OTP_EXPIRY_MINUTES` | OTP validity period | `10` |
| `LOG_LEVEL` | Pino log level | `info` |

### Configuration Validation

All environment variables are validated at startup using Zod:

```typescript
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  COOKIE_SECRET: z.string().min(32),
  // ...
});
```

If validation fails, the server **will not start** and will display which variables are invalid.

---

## Performance Analytics Logic

### Scheduled Day Calculation

Analytics are computed only for **scheduled days** based on the habit's frequency configuration:

| Frequency | Scheduled Days Calculation |
|-----------|---------------------------|
| `DAILY` | Every day from startDate to endDate (or today) |
| `WEEKLY` | Only days matching `scheduleDays` array (0=Sunday, 6=Saturday) |
| `MONTHLY` | Only days of month matching `scheduleDays` array (1-31) |
| `CUSTOM` | Same as WEEKLY format |

Non-scheduled days are **ignored** in all analytics calculations (completion rate, streaks, rolling averages).

### Completion Rate Calculation

```
Completion Rate = (Completed + Partial * percentage/100) / Total Scheduled Days × 100
```

### Streak Calculation

> **Important:** A PARTIAL entry contributes to streak calculations ONLY if `percentComplete >= 50` (STREAK_THRESHOLD = 50).

```
Current Streak: Count consecutive scheduled days from today backwards
                where status = DONE or (PARTIAL and percentComplete >= 50)

Longest Streak: Maximum consecutive completed scheduled days in history
                using the same threshold rule
```

For user-level streaks, a day is counted if at least 50% of scheduled habits are completed.

### Rolling Averages

```
7-Day Average:  Sum of completion values for last 7 days / 7
14-Day Average: Sum of completion values for last 14 days / 14
30-Day Average: Sum of completion values for last 30 days / 30
```

### Momentum Calculation

```
Current Period:  Average completion for last 7 days
Previous Period: Average completion for 7 days before that

Trend:
  - UP:     Current > Previous + 5%
  - DOWN:   Current < Previous - 5%
  - STABLE: Otherwise

Percentage Change = (Current - Previous) / Previous × 100
```

---

## Running the Backend

### Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server with hot reload
npm run dev
```

### Production

```bash
# Build TypeScript
npm run build

# Run migrations
npm run prisma:migrate:prod

# Start server
npm start
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with hot reload (tsx) |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled code |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run migrations (dev) |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm run typecheck` | Check TypeScript types |

---

## Summary

HabitEcho's backend is built with:

- ✅ **Clean Architecture** - Separation of concerns across layers
- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **Security First** - Multiple security layers
- ✅ **Scalable Design** - Ready for production deployment
- ✅ **Comprehensive Logging** - Full request/error tracking
- ✅ **Input Validation** - Zod schemas on all endpoints
- ✅ **Analytics Engine** - Rich performance calculations
