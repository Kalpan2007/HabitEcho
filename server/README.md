# HabitEcho Backend

A production-grade backend for a private, personal habit monitoring system built with Node.js, Express, TypeScript, PostgreSQL, and Prisma.

## Features

- **Secure Authentication**: JWT-based auth with HttpOnly cookies, OTP verification
- **Habit Management**: CRUD operations for habits with flexible scheduling
- **Habit Tracking**: Daily entry logging with completion status
- **Performance Analytics**: Streaks, completion rates, rolling averages, momentum tracking
- **Clean Architecture**: Layered structure with separation of concerns

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Logging**: Pino
- **Security**: Helmet, express-rate-limit

## Project Structure

```
src/
├── app.ts              # Express app configuration
├── server.ts           # Server entry point
├── config/             # Configuration and database setup
├── controllers/        # HTTP request handlers
├── middlewares/        # Auth, validation, error handling
├── routes/             # API route definitions
├── services/           # Business logic layer
├── types/              # TypeScript type definitions
├── utils/              # Helper utilities
└── validations/        # Zod schemas
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone and navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3001
   DATABASE_URL="postgresql://username:password@localhost:5432/habitecho?schema=public"
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   COOKIE_SECRET=your-cookie-secret-minimum-32-characters
   ```

4. **Generate Prisma client**
   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

The server will start at `http://localhost:3001`

## API Documentation

### Base URL
```
http://localhost:3001/api/v1
```

### Health Check
```
GET /api/v1/health
```

---

## Authentication Endpoints

### Register User
```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "password": "SecureP@ss123",
  "occupation": "ENGINEER",
  "dateOfBirth": "1990-01-15",
  "timezone": "America/New_York"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email and phone number.",
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "emailVerified": false,
      "phoneVerified": false
    },
    "otpSent": true
  }
}
```

### Verify Email
```http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
  "code": "123456"
}
```

### Verify Phone
```http
POST /api/v1/auth/verify-phone
Content-Type: application/json

{
  "email": "john@example.com",
  "code": "654321"
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecureP@ss123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "emailVerified": true,
      "phoneVerified": true
    }
  }
}
```
*Note: JWT is set in HttpOnly cookie, not returned in response body*

### Logout
```http
POST /api/v1/auth/logout
```

### Get Current User
```http
GET /api/v1/auth/me
Cookie: habitecho_token=<jwt>
```

---

## Habit Endpoints (Protected)

All habit endpoints require authentication via the HttpOnly cookie.

### Create Habit
```http
POST /api/v1/habits
Content-Type: application/json
Cookie: habitecho_token=<jwt>

{
  "name": "Morning Meditation",
  "description": "10 minutes of mindfulness meditation",
  "frequency": "DAILY",
  "startDate": "2026-01-01"
}
```

**Frequency Options:**
- `DAILY` - Every day
- `WEEKLY` - Specific days of week (use `scheduleDays: [0-6]` where 0=Sunday)
- `MONTHLY` - Specific days of month (use `scheduleDays: [1-31]`)
- `CUSTOM` - Custom schedule

**Weekly Example:**
```json
{
  "name": "Gym Workout",
  "frequency": "WEEKLY",
  "scheduleDays": [1, 3, 5],
  "startDate": "2026-01-01"
}
```

### Get All Habits
```http
GET /api/v1/habits?isActive=true&page=1&limit=20
Cookie: habitecho_token=<jwt>
```

### Get Habit by ID
```http
GET /api/v1/habits/:id
Cookie: habitecho_token=<jwt>
```

### Update Habit
```http
PUT /api/v1/habits/:id
Content-Type: application/json
Cookie: habitecho_token=<jwt>

{
  "name": "Updated Habit Name",
  "isActive": false
}
```

### Delete Habit
```http
DELETE /api/v1/habits/:id
Cookie: habitecho_token=<jwt>
```

---

## Habit Entry Endpoints (Protected)

### Create Entry
```http
POST /api/v1/habits/:habitId/entry
Content-Type: application/json
Cookie: habitecho_token=<jwt>

{
  "entryDate": "2026-01-01",
  "status": "DONE",
  "percentComplete": 100,
  "notes": "Great session today!"
}
```

**Status Options:**
- `DONE` - Fully completed (percentComplete = 100)
- `PARTIAL` - Partially completed (percentComplete = 1-99)
- `NOT_DONE` - Not completed (percentComplete = 0)

### Update Entry
```http
PUT /api/v1/habits/:habitId/entry/:entryDate
Content-Type: application/json
Cookie: habitecho_token=<jwt>

{
  "status": "PARTIAL",
  "percentComplete": 75,
  "reason": "Got interrupted"
}
```

### Get Habit History
```http
GET /api/v1/habits/:habitId/history?startDate=2026-01-01&endDate=2026-01-31&page=1&limit=30
Cookie: habitecho_token=<jwt>
```

### Delete Entry
```http
DELETE /api/v1/habits/:habitId/entry/:entryDate
Cookie: habitecho_token=<jwt>
```

---

## Performance Endpoints (Protected)

### Get Overall Summary
```http
GET /api/v1/performance/summary
Cookie: habitecho_token=<jwt>
```

**Response:**
```json
{
  "success": true,
  "message": "Performance summary retrieved successfully",
  "data": {
    "summary": {
      "totalHabits": 5,
      "activeHabits": 4,
      "overallCompletionRate": 78,
      "currentStreak": 12,
      "longestStreak": 30,
      "todayCompletion": {
        "completed": 3,
        "total": 4,
        "percentage": 75
      },
      "rollingAverages": {
        "last7Days": 82,
        "last14Days": 79,
        "last30Days": 75
      },
      "momentum": {
        "current": 82,
        "previous": 75,
        "trend": "UP",
        "percentageChange": 9
      }
    }
  }
}
```

### Get Habit Performance
```http
GET /api/v1/performance/habit/:habitId
Cookie: habitecho_token=<jwt>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "performance": {
      "habitId": "uuid",
      "habitName": "Morning Meditation",
      "completionRate": 85,
      "currentStreak": 7,
      "longestStreak": 21,
      "totalEntries": 45,
      "completedEntries": 38,
      "partialEntries": 4,
      "missedEntries": 3,
      "rollingAverages": {
        "last7Days": 90,
        "last14Days": 85,
        "last30Days": 82
      },
      "heatmapData": [
        { "date": "2026-01-01", "value": 100, "status": "DONE" },
        { "date": "2026-01-02", "value": 75, "status": "PARTIAL" },
        { "date": "2026-01-03", "value": 0, "status": null }
      ],
      "momentum": {
        "current": 90,
        "previous": 80,
        "trend": "UP",
        "percentageChange": 12
      }
    }
  }
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` (400) - Invalid input data
- `UNAUTHORIZED` (401) - Authentication required or failed
- `FORBIDDEN` (403) - Access denied
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Resource already exists
- `TOO_MANY_REQUESTS` (429) - Rate limit exceeded
- `INTERNAL_ERROR` (500) - Server error

---

## Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Compile TypeScript
npm start                # Run compiled code

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations (development)
npm run prisma:migrate:prod  # Run migrations (production)
npm run prisma:studio    # Open Prisma Studio

# Code Quality
npm run lint             # Run ESLint
npm run typecheck        # TypeScript type checking
```

## Security Features

- JWT stored in HttpOnly, Secure cookies (7-day expiry)
- Password hashing with bcrypt (12 rounds)
- Rate limiting on auth routes (10 req/15min)
- Rate limiting on OTP routes (3 req/min)
- Security headers via Helmet
- Input validation with Zod
- SQL injection protection via Prisma
- Centralized error handling (no stack traces in production)

## License

ISC
