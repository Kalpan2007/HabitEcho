# HabitEcho API Documentation

**Base URL**: `http://localhost:3001/api`  
**Version**: 1.0.0  
**Last Updated**: February 3, 2026

---

## Table of Contents

1. [Authentication](#authentication)
2. [Habits](#habits)
3. [Habit Logs](#habit-logs)
4. [Performance](#performance)
5. [Error Responses](#error-responses)
6. [Common Headers](#common-headers)

---

## Authentication

All requests (except signup, login, verify-otp, resend-otp, and health check) require authentication via JWT token stored in an HttpOnly cookie.

### Common Headers

```
Content-Type: application/json
Cookie: habitecho_token=<jwt_token>
```

---

## 1. Health Check

### Check API Status

**Endpoint**: `GET /api/health`  
**Authentication**: Not required

**Response** (200 OK):
```json
{
  "success": true,
  "message": "HabitEcho API is running",
  "timestamp": "2026-02-03T10:30:00.000Z"
}
```

---

## 2. Authentication Endpoints

### 2.1 Signup

**Endpoint**: `POST /api/auth/signup`  
**Authentication**: Not required  
**Rate Limit**: 10 requests per 15 minutes

**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "occupation": "ENGINEER",
  "age": 25,
  "timezone": "America/New_York"
}
```

**Request Body (Alternative with DOB)**:
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "occupation": "STUDENT",
  "dateOfBirth": "1998-05-15",
  "timezone": "UTC"
}
```

**Field Validations**:
- `fullName`: 2-100 characters, required
- `email`: Valid email format, max 255 characters, required
- `password`: 8-128 characters, must contain uppercase, lowercase, number, and special character, required
- `occupation`: One of `STUDENT`, `ENGINEER`, `DOCTOR`, `OTHER`, required
- `age`: Integer 13-120, optional (either `age` or `dateOfBirth` required)
- `dateOfBirth`: Format `YYYY-MM-DD`, optional (either `age` or `dateOfBirth` required)
- `timezone`: Max 50 characters, defaults to "UTC"

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email.",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "occupation": "ENGINEER",
      "dateOfBirth": null,
      "age": 25,
      "timezone": "America/New_York",
      "emailVerified": false,
      "emailRemindersEnabled": true,
      "createdAt": "2026-02-03T10:30:00.000Z"
    }
  }
}
```

**Note**: After signup, user needs to verify email via OTP before creating habits.

---

### 2.2 Login

**Endpoint**: `POST /api/auth/login`  
**Authentication**: Not required  
**Rate Limit**: 10 requests per 15 minutes

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "occupation": "ENGINEER",
      "dateOfBirth": null,
      "age": 25,
      "timezone": "America/New_York",
      "emailVerified": true,
      "emailRemindersEnabled": true,
      "createdAt": "2026-02-03T10:30:00.000Z"
    }
  }
}
```

**Note**: JWT tokens are set in HttpOnly cookies (`habitecho_token` and `habitecho_refresh`).

---

### 2.3 Verify OTP

**Endpoint**: `POST /api/auth/verify-otp`  
**Authentication**: Not required

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

**Field Validations**:
- `email`: Valid email format, required
- `otp`: Exactly 6 numeric digits, required

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john.doe@example.com",
      "emailVerified": true
    }
  }
}
```

---

### 2.4 Resend OTP

**Endpoint**: `POST /api/auth/resend-otp`  
**Authentication**: Not required

**Request Body**:
```json
{
  "email": "john.doe@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "OTP sent successfully to your email"
}
```

---

### 2.5 Refresh Token

**Endpoint**: `POST /api/auth/refresh`  
**Authentication**: Requires refresh token in cookie

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Token refreshed successfully"
}
```

**Note**: New access token is set in HttpOnly cookie.

---

### 2.6 Get Current User

**Endpoint**: `GET /api/auth/me`  
**Authentication**: Required

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "occupation": "ENGINEER",
      "dateOfBirth": null,
      "age": 25,
      "timezone": "America/New_York",
      "emailVerified": true,
      "emailRemindersEnabled": true,
      "createdAt": "2026-02-03T10:30:00.000Z"
    }
  }
}
```

---

### 2.7 Update User Preferences

**Endpoint**: `PATCH /api/auth/preferences`  
**Authentication**: Required

**Request Body**:
```json
{
  "emailRemindersEnabled": false,
  "timezone": "Europe/London"
}
```

**Field Validations**:
- `emailRemindersEnabled`: Boolean, optional
- `timezone`: String max 50 characters, optional

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "emailRemindersEnabled": false,
      "timezone": "Europe/London"
    }
  }
}
```

---

### 2.8 Logout

**Endpoint**: `POST /api/auth/logout`  
**Authentication**: Required

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Note**: Clears authentication cookies.

---

## 3. Habits

All habit endpoints require authentication.

### 3.1 Create Habit

**Endpoint**: `POST /api/habits`  
**Authentication**: Required  
**Email Verification**: Required

**Request Body**:
```json
{
  "name": "Morning Meditation",
  "description": "10 minutes of mindful meditation",
  "frequency": "DAILY",
  "startDate": "2026-02-01",
  "endDate": "2026-12-31",
  "reminderTime": "07:00",
  "timezone": "America/New_York"
}
```

**Request Body (Weekly Habit)**:
```json
{
  "name": "Gym Workout",
  "description": "Full body workout",
  "frequency": "WEEKLY",
  "scheduleDays": [1, 3, 5],
  "startDate": "2026-02-01",
  "reminderTime": "18:00",
  "timezone": "America/New_York"
}
```

**Request Body (Monthly Habit)**:
```json
{
  "name": "Monthly Review",
  "description": "Review goals and progress",
  "frequency": "MONTHLY",
  "scheduleDays": [1, 15],
  "startDate": "2026-02-01",
  "reminderTime": "09:00"
}
```

**Field Validations**:
- `name`: 1-100 characters, required
- `description`: Max 500 characters, optional
- `frequency`: One of `DAILY`, `WEEKLY`, `MONTHLY`, `CUSTOM`, required
- `scheduleDays`: Array of integers, optional
  - For `WEEKLY`: 0-6 (0=Sunday, 6=Saturday)
  - For `MONTHLY`: 1-31 (day of month)
- `startDate`: Format `YYYY-MM-DD`, required
- `endDate`: Format `YYYY-MM-DD`, must be >= startDate, optional
- `reminderTime`: Format `HH:mm` (24-hour), optional
- `timezone`: Max 50 characters, optional

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Habit created successfully",
  "data": {
    "habit": {
      "id": "650e8400-e29b-41d4-a716-446655440000",
      "name": "Morning Meditation",
      "description": "10 minutes of mindful meditation",
      "frequency": "DAILY",
      "scheduleDays": null,
      "startDate": "2026-02-01T00:00:00.000Z",
      "endDate": "2026-12-31T00:00:00.000Z",
      "isActive": true,
      "reminderTime": "07:00",
      "timezone": "America/New_York",
      "createdAt": "2026-02-03T10:30:00.000Z",
      "updatedAt": "2026-02-03T10:30:00.000Z"
    }
  }
}
```

---

### 3.2 Get All Habits

**Endpoint**: `GET /api/habits`  
**Authentication**: Required

**Query Parameters**:
- `isActive`: `true` | `false` (optional, filters active/inactive habits)
- `page`: Integer > 0 (default: 1)
- `limit`: Integer 1-100 (default: 20)

**Example**: `GET /api/habits?isActive=true&page=1&limit=10`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Habits retrieved successfully",
  "data": {
    "habits": [
      {
        "id": "650e8400-e29b-41d4-a716-446655440000",
        "name": "Morning Meditation",
        "description": "10 minutes of mindful meditation",
        "frequency": "DAILY",
        "scheduleDays": null,
        "startDate": "2026-02-01T00:00:00.000Z",
        "endDate": "2026-12-31T00:00:00.000Z",
        "isActive": true,
        "reminderTime": "07:00",
        "timezone": "America/New_York",
        "createdAt": "2026-02-03T10:30:00.000Z",
        "updatedAt": "2026-02-03T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

### 3.3 Get Single Habit

**Endpoint**: `GET /api/habits/:id`  
**Authentication**: Required

**Path Parameters**:
- `id`: UUID of the habit

**Example**: `GET /api/habits/650e8400-e29b-41d4-a716-446655440000`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Habit retrieved successfully",
  "data": {
    "habit": {
      "id": "650e8400-e29b-41d4-a716-446655440000",
      "name": "Morning Meditation",
      "description": "10 minutes of mindful meditation",
      "frequency": "DAILY",
      "scheduleDays": null,
      "startDate": "2026-02-01T00:00:00.000Z",
      "endDate": "2026-12-31T00:00:00.000Z",
      "isActive": true,
      "reminderTime": "07:00",
      "timezone": "America/New_York",
      "createdAt": "2026-02-03T10:30:00.000Z",
      "updatedAt": "2026-02-03T10:30:00.000Z"
    }
  }
}
```

---

### 3.4 Update Habit

**Endpoint**: `PUT /api/habits/:id`  
**Authentication**: Required

**Path Parameters**:
- `id`: UUID of the habit

**Request Body** (all fields optional):
```json
{
  "name": "Evening Meditation",
  "description": "15 minutes of mindful meditation",
  "frequency": "DAILY",
  "scheduleDays": null,
  "startDate": "2026-02-01",
  "endDate": "2026-12-31",
  "isActive": true,
  "reminderTime": "19:00",
  "timezone": "America/New_York"
}
```

**Field Validations**:
- All fields are optional
- `name`: 1-100 characters if provided
- `description`: Max 500 characters, nullable
- `frequency`: One of `DAILY`, `WEEKLY`, `MONTHLY`, `CUSTOM`
- `scheduleDays`: Array of integers, nullable
- `startDate`: Format `YYYY-MM-DD`
- `endDate`: Format `YYYY-MM-DD`, must be >= startDate, nullable
- `isActive`: Boolean
- `reminderTime`: Format `HH:mm`, nullable
- `timezone`: Max 50 characters

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Habit updated successfully",
  "data": {
    "habit": {
      "id": "650e8400-e29b-41d4-a716-446655440000",
      "name": "Evening Meditation",
      "description": "15 minutes of mindful meditation",
      "frequency": "DAILY",
      "scheduleDays": null,
      "startDate": "2026-02-01T00:00:00.000Z",
      "endDate": "2026-12-31T00:00:00.000Z",
      "isActive": true,
      "reminderTime": "19:00",
      "timezone": "America/New_York",
      "createdAt": "2026-02-03T10:30:00.000Z",
      "updatedAt": "2026-02-03T12:00:00.000Z"
    }
  }
}
```

---

### 3.5 Delete Habit (Soft Delete)

**Endpoint**: `DELETE /api/habits/:id`  
**Authentication**: Required

**Path Parameters**:
- `id`: UUID of the habit

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Habit deleted successfully"
}
```

**Note**: This performs a soft delete. The habit is marked as deleted but not removed from the database.

---

## 4. Habit Logs

All habit log endpoints require authentication.

### 4.1 Create Habit Log

**Endpoint**: `POST /api/habits/:id/log`  
**Alternative (Legacy)**: `POST /api/habits/:id/entry`  
**Authentication**: Required

**Path Parameters**:
- `id`: UUID of the habit

**Request Body**:
```json
{
  "date": "2026-02-03",
  "status": "DONE",
  "completed": true,
  "percentComplete": 100,
  "notes": "Great session today!"
}
```

**Request Body (Partial Completion)**:
```json
{
  "date": "2026-02-03",
  "status": "PARTIAL",
  "completed": false,
  "percentComplete": 50,
  "reason": "Had to cut it short due to meeting",
  "notes": "Will complete later"
}
```

**Request Body (Not Done)**:
```json
{
  "date": "2026-02-03",
  "status": "NOT_DONE",
  "completed": false,
  "percentComplete": 0,
  "reason": "Feeling unwell"
}
```

**Field Validations**:
- `date`: Format `YYYY-MM-DD`, required
- `status`: One of `DONE`, `NOT_DONE`, `PARTIAL`, required
- `completed`: Boolean, optional
- `percentComplete`: Integer 0-100, optional (must be 100 if status is `DONE`)
- `reason`: Max 300 characters, optional
- `notes`: Max 1000 characters, optional

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Habit log created successfully",
  "data": {
    "log": {
      "id": "750e8400-e29b-41d4-a716-446655440000",
      "habitId": "650e8400-e29b-41d4-a716-446655440000",
      "date": "2026-02-03",
      "status": "DONE",
      "completed": true,
      "percentComplete": 100,
      "reason": null,
      "notes": "Great session today!",
      "reminderSent": false,
      "createdAt": "2026-02-03T10:30:00.000Z",
      "updatedAt": "2026-02-03T10:30:00.000Z"
    }
  }
}
```

---

### 4.2 Update Habit Log

**Endpoint**: `PUT /api/habits/:id/log/:date`  
**Alternative (Legacy)**: `PUT /api/habits/:id/entry/:date`  
**Authentication**: Required

**Path Parameters**:
- `id`: UUID of the habit
- `date`: Date in format `YYYY-MM-DD`

**Request Body** (all fields optional):
```json
{
  "status": "DONE",
  "completed": true,
  "percentComplete": 100,
  "reason": null,
  "notes": "Completed successfully!"
}
```

**Field Validations**:
- All fields are optional
- `status`: One of `DONE`, `NOT_DONE`, `PARTIAL`
- `completed`: Boolean
- `percentComplete`: Integer 0-100, nullable
- `reason`: Max 300 characters, nullable
- `notes`: Max 1000 characters, nullable

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Habit log updated successfully",
  "data": {
    "log": {
      "id": "750e8400-e29b-41d4-a716-446655440000",
      "habitId": "650e8400-e29b-41d4-a716-446655440000",
      "date": "2026-02-03",
      "status": "DONE",
      "completed": true,
      "percentComplete": 100,
      "reason": null,
      "notes": "Completed successfully!",
      "reminderSent": false,
      "createdAt": "2026-02-03T10:30:00.000Z",
      "updatedAt": "2026-02-03T12:00:00.000Z"
    }
  }
}
```

---

### 4.3 Delete Habit Log

**Endpoint**: `DELETE /api/habits/:id/log/:date`  
**Authentication**: Required

**Path Parameters**:
- `id`: UUID of the habit
- `date`: Date in format `YYYY-MM-DD`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Habit log deleted successfully"
}
```

---

### 4.4 Get Habit History

**Endpoint**: `GET /api/habits/:id/history`  
**Authentication**: Required

**Path Parameters**:
- `id`: UUID of the habit

**Query Parameters**:
- `startDate`: Format `YYYY-MM-DD` (optional)
- `endDate`: Format `YYYY-MM-DD` (optional)
- `page`: Integer > 0 (default: 1)
- `limit`: Integer 1-365 (default: 30)

**Example**: `GET /api/habits/650e8400-e29b-41d4-a716-446655440000/history?startDate=2026-01-01&endDate=2026-01-31&page=1&limit=31`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Habit history retrieved successfully",
  "data": {
    "logs": [
      {
        "id": "750e8400-e29b-41d4-a716-446655440000",
        "habitId": "650e8400-e29b-41d4-a716-446655440000",
        "date": "2026-02-03",
        "status": "DONE",
        "completed": true,
        "percentComplete": 100,
        "reason": null,
        "notes": "Great session!",
        "reminderSent": false,
        "createdAt": "2026-02-03T10:30:00.000Z",
        "updatedAt": "2026-02-03T10:30:00.000Z"
      },
      {
        "id": "850e8400-e29b-41d4-a716-446655440000",
        "habitId": "650e8400-e29b-41d4-a716-446655440000",
        "date": "2026-02-02",
        "status": "PARTIAL",
        "completed": false,
        "percentComplete": 50,
        "reason": "Short on time",
        "notes": null,
        "reminderSent": true,
        "createdAt": "2026-02-02T10:30:00.000Z",
        "updatedAt": "2026-02-02T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 30,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

---

## 5. Performance

All performance endpoints require authentication.

### 5.1 Get Performance Summary

**Endpoint**: `GET /api/performance/summary`  
**Authentication**: Required

**Response** (200 OK):
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
        "scheduled": 4,
        "total": 4,
        "percentage": 75
      },
      "rollingAverage": {
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

**Field Descriptions**:
- `totalHabits`: Total number of habits created by user
- `activeHabits`: Number of currently active habits
- `overallCompletionRate`: Overall completion percentage across all habits
- `currentStreak`: Current consecutive days of habit completion
- `longestStreak`: Longest streak ever achieved
- `todayCompletion.completed`: Number of habits completed today
- `todayCompletion.scheduled`: Number of habits scheduled for today
- `todayCompletion.total`: Same as scheduled (for compatibility)
- `todayCompletion.percentage`: Percentage of today's habits completed
- `rollingAverage`: Completion rates for different time periods
- `momentum.trend`: One of `UP`, `DOWN`, `STABLE`
- `momentum.percentageChange`: Percentage change in recent performance

---

### 5.2 Get Habit Performance

**Endpoint**: `GET /api/performance/habit/:id`  
**Authentication**: Required

**Path Parameters**:
- `id`: UUID of the habit

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Habit performance retrieved successfully",
  "data": {
    "performance": {
      "habitId": "650e8400-e29b-41d4-a716-446655440000",
      "name": "Morning Meditation",
      "rollingAverage": 85,
      "momentum": {
        "current": 90,
        "previous": 80,
        "trend": "UP",
        "percentageChange": 12
      },
      "streaks": {
        "currentStreak": 7,
        "longestStreak": 21
      },
      "heatmap": [
        {
          "date": "2026-01-01",
          "value": 100,
          "status": "DONE"
        },
        {
          "date": "2026-01-02",
          "value": 75,
          "status": "PARTIAL"
        },
        {
          "date": "2026-01-03",
          "value": 0,
          "status": "NOT_DONE"
        },
        {
          "date": "2026-01-04",
          "value": 100,
          "status": "DONE"
        }
      ],
      "completionRate": 85,
      "totalEntries": 45,
      "completedEntries": 38,
      "partialEntries": 4,
      "missedEntries": 3,
      "rollingAverages": {
        "last7Days": 90,
        "last14Days": 85,
        "last30Days": 82
      }
    }
  }
}
```

**Field Descriptions**:
- `heatmap`: Array of daily performance data for visualization
- `value`: 0-100 representing completion percentage for that day
- `status`: One of `DONE`, `PARTIAL`, `NOT_DONE`, or `null` (no log)
- `completionRate`: Overall completion percentage for this habit
- `totalEntries`: Total number of logged entries
- `completedEntries`: Number of entries with status `DONE`
- `partialEntries`: Number of entries with status `PARTIAL`
- `missedEntries`: Number of entries with status `NOT_DONE`

---

## 6. Error Responses

All error responses follow this format:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required",
  "error": {
    "code": "UNAUTHORIZED"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Email verification required",
  "error": {
    "code": "EMAIL_NOT_VERIFIED"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found",
  "error": {
    "code": "NOT_FOUND"
  }
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Email already registered",
  "error": {
    "code": "CONFLICT"
  }
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": {
    "code": "INTERNAL_ERROR"
  }
}
```

---

## 7. Common Headers

### Request Headers

```
Content-Type: application/json
Cookie: habitecho_token=<jwt_token>; habitecho_refresh=<refresh_token>
```

### Response Headers

```
Content-Type: application/json
Set-Cookie: habitecho_token=<jwt_token>; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800
Set-Cookie: habitecho_refresh=<refresh_token>; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800
```

---

## 8. Authentication Flow

### Initial Registration & Login Flow

1. **Signup**: `POST /api/auth/signup`
   - User registers with email and password
   - OTP is sent to email
   - Returns user data (emailVerified: false)

2. **Verify Email**: `POST /api/auth/verify-otp`
   - User enters 6-digit OTP
   - Email is verified
   - User can now create habits

3. **Login**: `POST /api/auth/login`
   - User logs in with email and password
   - JWT tokens set in HttpOnly cookies
   - Returns user profile

### Token Refresh Flow

1. Access token expires (7 days)
2. **Refresh**: `POST /api/auth/refresh`
   - Frontend calls refresh endpoint
   - New access token is issued
   - Continues session

### Resend OTP Flow

If user doesn't receive OTP or it expires:
- **Resend OTP**: `POST /api/auth/resend-otp`
- New OTP is generated and sent

---

## 9. Frequency & Schedule Days

### DAILY Frequency
```json
{
  "frequency": "DAILY",
  "scheduleDays": null
}
```
- Habit is scheduled every day

### WEEKLY Frequency
```json
{
  "frequency": "WEEKLY",
  "scheduleDays": [1, 3, 5]
}
```
- `scheduleDays`: Days of week (0=Sunday, 1=Monday, ..., 6=Saturday)
- Example: [1, 3, 5] = Monday, Wednesday, Friday

### MONTHLY Frequency
```json
{
  "frequency": "MONTHLY",
  "scheduleDays": [1, 15, 28]
}
```
- `scheduleDays`: Days of month (1-31)
- Example: [1, 15, 28] = 1st, 15th, and 28th of each month

### CUSTOM Frequency
```json
{
  "frequency": "CUSTOM",
  "scheduleDays": [1, 2, 3, 4, 5]
}
```
- Custom schedule defined by application logic

---

## 10. Date & Time Formats

### Date Format
- All dates use ISO 8601 format: `YYYY-MM-DD`
- Example: `2026-02-03`

### Time Format
- Reminder times use 24-hour format: `HH:mm`
- Example: `07:00`, `18:30`, `23:45`

### Timestamp Format
- ISO 8601 with timezone: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Example: `2026-02-03T10:30:00.000Z`

---

## 11. Pagination

All list endpoints support pagination:

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: varies by endpoint)

**Response Format**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

## 12. Rate Limiting

### Authentication Endpoints
- **Limit**: 10 requests per 15 minutes
- **Applies to**: `/auth/signup`, `/auth/login`

### General Endpoints
- **Limit**: 100 requests per minute
- **Applies to**: All other endpoints

**Rate Limit Response**:
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED"
  }
}
```

---

## 13. Environment Configuration

The API behavior varies based on environment:

### Development
- `NODE_ENV=development`
- Insecure cookies allowed for localhost
- Detailed error messages
- CORS origin: `http://localhost:3000`

### Production
- `NODE_ENV=production`
- Secure cookies required (HTTPS)
- Generic error messages
- CORS origin: Production frontend URL
- SameSite: `none`

---

## 14. Email Reminders

Users can receive email reminders for their habits:

### Enable/Disable Reminders
```
PATCH /api/auth/preferences
{
  "emailRemindersEnabled": true
}
```

### Set Habit Reminder Time
```
POST /api/habits
{
  "name": "Morning Meditation",
  "reminderTime": "07:00",
  "timezone": "America/New_York"
}
```

**Note**: Requires Brevo API configuration on the server.

---

## 15. Testing Endpoints with cURL

### Signup
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "occupation": "ENGINEER",
    "age": 25
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Habits (with cookie)
```bash
curl -X GET http://localhost:3001/api/habits \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

### Create Habit
```bash
curl -X POST http://localhost:3001/api/habits \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Morning Meditation",
    "description": "10 minutes daily",
    "frequency": "DAILY",
    "startDate": "2026-02-01"
  }'
```

### Create Habit Log
```bash
curl -X POST http://localhost:3001/api/habits/{habit-id}/log \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "date": "2026-02-03",
    "status": "DONE",
    "completed": true,
    "percentComplete": 100
  }'
```

---

## 16. Frontend Integration Guide

### Setting Up API Client

```typescript
// api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // Important: Include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  },

  // Auth methods
  signup: (body: SignupInput) => 
    apiClient.request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  
  login: (body: LoginInput) => 
    apiClient.request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  
  logout: () => 
    apiClient.request('/auth/logout', { method: 'POST' }),
  
  getMe: () => 
    apiClient.request('/auth/me'),

  // Habit methods
  createHabit: (body: CreateHabitInput) => 
    apiClient.request('/habits', { method: 'POST', body: JSON.stringify(body) }),
  
  getHabits: (query?: string) => 
    apiClient.request(`/habits${query ? `?${query}` : ''}`),
  
  updateHabit: (id: string, body: UpdateHabitInput) => 
    apiClient.request(`/habits/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  
  deleteHabit: (id: string) => 
    apiClient.request(`/habits/${id}`, { method: 'DELETE' }),

  // Habit log methods
  createLog: (habitId: string, body: CreateHabitLogInput) => 
    apiClient.request(`/habits/${habitId}/log`, { method: 'POST', body: JSON.stringify(body) }),
  
  updateLog: (habitId: string, date: string, body: UpdateHabitLogInput) => 
    apiClient.request(`/habits/${habitId}/log/${date}`, { method: 'PUT', body: JSON.stringify(body) }),
  
  deleteLog: (habitId: string, date: string) => 
    apiClient.request(`/habits/${habitId}/log/${date}`, { method: 'DELETE' }),
  
  getHistory: (habitId: string, query?: string) => 
    apiClient.request(`/habits/${habitId}/history${query ? `?${query}` : ''}`),

  // Performance methods
  getPerformanceSummary: () => 
    apiClient.request('/performance/summary'),
  
  getHabitPerformance: (habitId: string) => 
    apiClient.request(`/performance/habit/${habitId}`),
};
```

### Example: Login and Fetch Habits

```typescript
// Login
const loginData = await apiClient.login({
  email: 'john@example.com',
  password: 'SecurePass123!',
});
console.log('Logged in:', loginData.data.user);

// Fetch habits
const habitsData = await apiClient.getHabits('isActive=true&page=1&limit=10');
console.log('Habits:', habitsData.data.habits);
```

---

## 17. Common Use Cases

### Use Case 1: User Registration & Email Verification

```
1. POST /api/auth/signup (register user)
2. User receives OTP via email
3. POST /api/auth/verify-otp (verify email with OTP)
4. POST /api/auth/login (login)
5. GET /api/auth/me (get user profile)
```

### Use Case 2: Creating and Tracking a Daily Habit

```
1. POST /api/habits (create habit)
2. POST /api/habits/:id/log (log today's completion)
3. GET /api/habits/:id/history (view history)
4. GET /api/performance/habit/:id (view performance metrics)
```

### Use Case 3: Dashboard Overview

```
1. GET /api/habits?isActive=true (get active habits)
2. GET /api/performance/summary (get overall performance)
3. For each habit: GET /api/performance/habit/:id (detailed metrics)
```

---

## Contact & Support

For issues or questions, please contact the development team.

**API Version**: 1.0.0  
**Last Updated**: February 3, 2026
