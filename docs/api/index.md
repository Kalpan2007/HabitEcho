# API Documentation

## Base URL

```
Production: https://api.habitecho.com/api/v1
Development: http://localhost:3000/api/v1
```

## Response Format

All API responses follow a consistent structure:

### Success Response
```typescript
{
  "success": true,
  "message": "Operation description",
  "data": { /* response payload */ }
}
```

### Error Response
```typescript
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": {} // Optional validation errors
  }
}
```

### Pagination Response (for list endpoints)
```typescript
{
  "success": true,
  "message": "...",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful deletion) |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate entry |
| 429 | Too Many Requests - Rate limited |
| 500 | Internal Server Error |

## API Versioning

The API uses URL-based versioning:
- Current version: `v1`
- Base path: `/api/v1`

## Request Headers

### Required Headers

```http
Content-Type: application/json
```

### Authentication Headers

For protected routes, the server automatically reads the JWT from HttpOnly cookies. No manual header required for browser requests.

For non-browser clients (mobile, external APIs):
```http
Authorization: Bearer <access_token>
```

### Rate Limiting Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| **Auth** |||
| POST | `/auth/signup` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | Logout user | Yes |
| POST | `/auth/verify-otp` | Verify email via OTP | No |
| POST | `/auth/resend-otp` | Resend OTP | No |
| GET | `/auth/me` | Get current user | Yes |
| PATCH | `/auth/preferences` | Update preferences | Yes |
| **Habits** |||
| GET | `/habits` | List all habits | Yes |
| POST | `/habits` | Create new habit | Yes |
| GET | `/habits/:id` | Get habit details | Yes |
| PUT | `/habits/:id` | Update habit | Yes |
| DELETE | `/habits/:id` | Delete habit | Yes |
| POST | `/habits/:id/log` | Log habit entry | Yes |
| PUT | `/habits/:id/log/:date` | Update entry | Yes |
| DELETE | `/habits/:id/log/:date` | Delete entry | Yes |
| GET | `/habits/:id/history` | Get habit history | Yes |
| **Performance** |||
| GET | `/performance/summary` | Overall performance | Yes |
| GET | `/performance/habit/:id` | Habit performance | Yes |
| **Health** |||
| GET | `/health` | API health check | No |

## Base Request/Response Types

### User Object
```typescript
{
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  preferences: {
    timezone: string;
    language: string;
    theme: 'light' | 'dark' | 'system';
  };
  createdAt: string;
  updatedAt: string;
}
```

### Habit Object
```typescript
{
  id: string;
  userId: string;
  name: string;
  description: string | null;
  schedule: {
    type: 'daily' | 'weekly' | 'custom';
    days: number[]; // 0-6 for weekly
    times: string[]; // HH:mm format
  };
  reminder: {
    enabled: boolean;
    times: string[];
  } | null;
  color: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### HabitLog Object
```typescript
{
  id: string;
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  status: 'DONE' | 'PARTIAL' | 'MISSED';
  value: number; // 0-100
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
```

---

**Next:** See [Authentication Endpoints](./authentication.md) for detailed auth API documentation.