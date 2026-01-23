# HabitEcho API Documentation

## Base URL

```
http://localhost:3001/api/v1
```

## Authentication

All protected routes require authentication via **HttpOnly cookie**. The cookie is automatically set after successful login and sent with subsequent requests.

---

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Data retrieved",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `BAD_REQUEST` | 400 | Malformed request |
| `UNAUTHORIZED` | 401 | Authentication required or failed |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Server error |

---

## API Endpoints

### Health Check

#### Check API Health

```http
GET /api/v1/health
```

**Description:** Check if the API is running.

**Authentication:** Not required

**Response:**
```json
{
  "success": true,
  "message": "HabitEcho API is running",
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

---

## 🔐 Authentication Endpoints

### 1. Register User

```http
POST /api/v1/auth/signup
```

**Description:** Create a new user account. OTPs will be sent to email and phone for verification.

**Authentication:** Not required

**Rate Limit:** 10 requests / 15 minutes

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fullName` | string | Yes | User's full name (2-100 chars) |
| `email` | string | Yes | Valid email address |
| `phoneNumber` | string | Yes | Phone number (10-20 chars) |
| `password` | string | Yes | Password (min 8 chars, must include uppercase, lowercase, number, special char) |
| `occupation` | enum | Yes | `STUDENT`, `ENGINEER`, `DOCTOR`, or `OTHER` |
| `dateOfBirth` | string | No* | Date in `YYYY-MM-DD` format |
| `age` | number | No* | Age (13-120) |
| `timezone` | string | No | Timezone (default: `UTC`) |

*Either `dateOfBirth` or `age` must be provided.

**Example Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "password": "SecureP@ss123",
  "occupation": "ENGINEER",
  "dateOfBirth": "1990-05-15",
  "timezone": "America/New_York"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email and phone number.",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "occupation": "ENGINEER",
      "dateOfBirth": "1990-05-15",
      "age": null,
      "emailVerified": false,
      "phoneVerified": false,
      "timezone": "America/New_York",
      "createdAt": "2026-01-01T12:00:00.000Z"
    },
    "otpSent": true
  }
}
```

**Error Responses:**
- `400` - Validation error
- `409` - Email or phone already registered

---

### 2. Verify Email

```http
POST /api/v1/auth/verify-email
```

**Description:** Verify email address using OTP code.

**Authentication:** Not required

**Rate Limit:** 10 requests / 15 minutes

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Registered email address |
| `code` | string | Yes | 6-digit OTP code |

**Example Request:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "verified": true
  }
}
```

**Error Responses:**
- `400` - Invalid or expired OTP
- `404` - User not found

---

### 3. Verify Phone

```http
POST /api/v1/auth/verify-phone
```

**Description:** Verify phone number using OTP code.

**Authentication:** Not required

**Rate Limit:** 10 requests / 15 minutes

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Registered email address |
| `code` | string | Yes | 6-digit OTP code |

**Example Request:**
```json
{
  "email": "john@example.com",
  "code": "654321"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Phone number verified successfully",
  "data": {
    "verified": true
  }
}
```

---

### 4. Resend OTP

```http
POST /api/v1/auth/resend-otp
```

**Description:** Request a new OTP for email or phone verification. Requesting a new OTP invalidates all previous unused OTPs of the same type.

**Authentication:** Not required

**Rate Limit:** 3 requests / 1 minute

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Registered email address |
| `type` | enum | Yes | `EMAIL` or `PHONE` |

**Example Request:**
```json
{
  "email": "john@example.com",
  "type": "EMAIL"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to email",
  "data": {
    "sent": true
  }
}
```

> **Note:** When a new OTP is generated, all previous unused OTPs of the same type for this user are automatically invalidated.

---

### 5. Login

```http
POST /api/v1/auth/login
```

**Description:** Authenticate user and receive JWT in HttpOnly cookie.

**Authentication:** Not required

**Rate Limit:** 10 requests / 15 minutes

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Registered email address |
| `password` | string | Yes | User's password |

**Example Request:**
```json
{
  "email": "john@example.com",
  "password": "SecureP@ss123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "occupation": "ENGINEER",
      "dateOfBirth": "1990-05-15",
      "timezone": "America/New_York",
      "createdAt": "2026-01-01T12:00:00.000Z"
    }
  }
}
```

**Note:** JWT is set in `Set-Cookie` header as HttpOnly cookie, not returned in response body.

**Error Responses:**
- `401` - Invalid email or password

---

### 3. Logout

```http
POST /api/v1/auth/logout
```

**Description:** Clear authentication cookie and log out user.

**Authentication:** Required 🔒

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

**Error Responses:**
- `401` - Authentication required

---

### 4. Get Current User

```http
GET /api/v1/auth/me
```

**Description:** Get the currently authenticated user's profile.

**Authentication:** Required 🔒

**Success Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "occupation": "ENGINEER",
      "dateOfBirth": "1990-05-15",
      "timezone": "America/New_York",
      "createdAt": "2026-01-01T12:00:00.000Z"
    }
  }
}
```

---

## 📋 Habit Endpoints

All habit endpoints require authentication.

### 1. Create Habit

```http
POST /api/v1/habits
```

**Description:** Create a new habit.

**Authentication:** Required 🔒

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Habit name (1-100 chars) |
| `description` | string | No | Description (max 500 chars) |
| `frequency` | enum | Yes | `DAILY`, `WEEKLY`, `MONTHLY`, or `CUSTOM` |
| `scheduleDays` | number[] | No | Days to track (depends on frequency) |
| `startDate` | string | Yes | Start date in `YYYY-MM-DD` format |
| `endDate` | string | No | End date in `YYYY-MM-DD` format |

**Schedule Days by Frequency:**
- `DAILY`: Not needed (every day)
- `WEEKLY`: Days of week [0-6] where 0=Sunday, 6=Saturday
- `MONTHLY`: Days of month [1-31]
- `CUSTOM`: Same as weekly format

**Example - Daily Habit:**
```json
{
  "name": "Morning Meditation",
  "description": "10 minutes of mindfulness",
  "frequency": "DAILY",
  "startDate": "2026-01-01"
}
```

**Example - Weekly Habit (Mon/Wed/Fri):**
```json
{
  "name": "Gym Workout",
  "description": "Strength training session",
  "frequency": "WEEKLY",
  "scheduleDays": [1, 3, 5],
  "startDate": "2026-01-01"
}
```

**Example - Monthly Habit (1st and 15th):**
```json
{
  "name": "Budget Review",
  "description": "Review monthly expenses",
  "frequency": "MONTHLY",
  "scheduleDays": [1, 15],
  "startDate": "2026-01-01"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Habit created successfully",
  "data": {
    "habit": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Morning Meditation",
      "description": "10 minutes of mindfulness",
      "frequency": "DAILY",
      "scheduleDays": null,
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": null,
      "isActive": true,
      "createdAt": "2026-01-01T12:00:00.000Z",
      "updatedAt": "2026-01-01T12:00:00.000Z"
    }
  }
}
```

---

### 2. Get All Habits

```http
GET /api/v1/habits
```

**Description:** Retrieve all habits for the authenticated user.

**Authentication:** Required 🔒

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `isActive` | boolean | - | Filter by active status |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |

**Example Request:**
```http
GET /api/v1/habits?isActive=true&page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Habits retrieved successfully",
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Morning Meditation",
      "description": "10 minutes of mindfulness",
      "frequency": "DAILY",
      "scheduleDays": null,
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": null,
      "isActive": true,
      "createdAt": "2026-01-01T12:00:00.000Z",
      "updatedAt": "2026-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 3. Get Habit by ID

```http
GET /api/v1/habits/:id
```

**Description:** Get a specific habit by its ID.

**Authentication:** Required 🔒

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Habit ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Habit retrieved successfully",
  "data": {
    "habit": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Morning Meditation",
      "description": "10 minutes of mindfulness",
      "frequency": "DAILY",
      "scheduleDays": null,
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": null,
      "isActive": true,
      "createdAt": "2026-01-01T12:00:00.000Z",
      "updatedAt": "2026-01-01T12:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `404` - Habit not found
- `403` - Access denied (not your habit)

---

### 4. Update Habit

```http
PUT /api/v1/habits/:id
```

**Description:** Update an existing habit.

**Authentication:** Required 🔒

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Habit ID |

**Request Body (all fields optional):**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Habit name (1-100 chars) |
| `description` | string | Description (max 500 chars) |
| `frequency` | enum | `DAILY`, `WEEKLY`, `MONTHLY`, or `CUSTOM` |
| `scheduleDays` | number[] | Days to track |
| `startDate` | string | Start date in `YYYY-MM-DD` |
| `endDate` | string/null | End date or null to remove |
| `isActive` | boolean | Active status |

**Example Request:**
```json
{
  "name": "Evening Meditation",
  "description": "15 minutes of mindfulness before bed",
  "isActive": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Habit updated successfully",
  "data": {
    "habit": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Evening Meditation",
      "description": "15 minutes of mindfulness before bed",
      "frequency": "DAILY",
      "scheduleDays": null,
      "startDate": "2026-01-01T00:00:00.000Z",
      "endDate": null,
      "isActive": true,
      "createdAt": "2026-01-01T12:00:00.000Z",
      "updatedAt": "2026-01-01T14:00:00.000Z"
    }
  }
}
```

---

### 5. Delete Habit

```http
DELETE /api/v1/habits/:id
```

**Description:** Soft delete a habit. The habit is marked with a `deletedAt` timestamp but remains in the database along with its entries for analytics integrity. Soft-deleted habits are excluded from all queries.

**Authentication:** Required 🔒

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Habit ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Habit deleted successfully",
  "data": null
}
```

**Error Responses:**
- `404` - Habit not found
- `403` - Access denied

---

## ✅ Habit Entry Endpoints

All entry endpoints require authentication.

### 1. Create Entry

```http
POST /api/v1/habits/:id/entry
```

**Description:** Log a habit entry for a specific date.

**Authentication:** Required 🔒

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Habit ID |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `entryDate` | string | Yes | Date in `YYYY-MM-DD` format |
| `status` | enum | Yes | `DONE`, `NOT_DONE`, or `PARTIAL` |
| `percentComplete` | number | No | 0-100 (auto-set based on status if not provided) |
| `reason` | string | No | Reason for partial/not done (max 300 chars) |
| `notes` | string | No | Additional notes (max 1000 chars) |

**Status & PercentComplete Relationship:**
- `DONE` → percentComplete should be 100
- `NOT_DONE` → percentComplete should be 0
- `PARTIAL` → percentComplete should be 1-99

**Example Request:**
```json
{
  "entryDate": "2026-01-01",
  "status": "DONE",
  "percentComplete": 100,
  "notes": "Great meditation session!"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Habit entry created successfully",
  "data": {
    "entry": {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "habitId": "660e8400-e29b-41d4-a716-446655440001",
      "entryDate": "2026-01-01T00:00:00.000Z",
      "status": "DONE",
      "percentComplete": 100,
      "reason": null,
      "notes": "Great meditation session!",
      "createdAt": "2026-01-01T18:00:00.000Z",
      "updatedAt": "2026-01-01T18:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `409` - Entry already exists for this date

---

### 2. Update Entry

```http
PUT /api/v1/habits/:id/entry/:entryDate
```

**Description:** Update an existing habit entry.

**Authentication:** Required 🔒

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Habit ID |
| `entryDate` | string | Date in `YYYY-MM-DD` format |

**Request Body (all fields optional):**

| Field | Type | Description |
|-------|------|-------------|
| `status` | enum | `DONE`, `NOT_DONE`, or `PARTIAL` |
| `percentComplete` | number | 0-100 |
| `reason` | string | Reason (max 300 chars) |
| `notes` | string | Notes (max 1000 chars) |

**Example Request:**
```json
{
  "status": "PARTIAL",
  "percentComplete": 50,
  "reason": "Got interrupted halfway through"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Habit entry updated successfully",
  "data": {
    "entry": {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "habitId": "660e8400-e29b-41d4-a716-446655440001",
      "entryDate": "2026-01-01T00:00:00.000Z",
      "status": "PARTIAL",
      "percentComplete": 50,
      "reason": "Got interrupted halfway through",
      "notes": "Great meditation session!",
      "createdAt": "2026-01-01T18:00:00.000Z",
      "updatedAt": "2026-01-01T19:00:00.000Z"
    }
  }
}
```

---

### 3. Get Habit History

```http
GET /api/v1/habits/:id/history
```

**Description:** Get entry history for a habit.

**Authentication:** Required 🔒

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Habit ID |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `startDate` | string | - | Filter from date (YYYY-MM-DD) |
| `endDate` | string | - | Filter to date (YYYY-MM-DD) |
| `page` | number | 1 | Page number |
| `limit` | number | 30 | Items per page (max 365) |

**Example Request:**
```http
GET /api/v1/habits/660e8400.../history?startDate=2026-01-01&endDate=2026-01-31
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Habit history retrieved successfully",
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "habitId": "660e8400-e29b-41d4-a716-446655440001",
      "entryDate": "2026-01-01T00:00:00.000Z",
      "status": "DONE",
      "percentComplete": 100,
      "reason": null,
      "notes": "Great session!",
      "createdAt": "2026-01-01T18:00:00.000Z",
      "updatedAt": "2026-01-01T18:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 30,
    "total": 25,
    "totalPages": 1
  }
}
```

---

### 4. Delete Entry

```http
DELETE /api/v1/habits/:id/entry/:entryDate
```

**Description:** Delete a habit entry.

**Authentication:** Required 🔒

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Habit ID |
| `entryDate` | string | Date in `YYYY-MM-DD` format |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Habit entry deleted successfully",
  "data": null
}
```

---

## 📊 Performance Endpoints

All performance endpoints require authentication.

### 1. Get Overall Summary

```http
GET /api/v1/performance/summary
```

**Description:** Get overall performance summary across all habits.

**Authentication:** Required 🔒

**Success Response (200):**
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

**Summary Fields Explained:**

| Field | Description |
|-------|-------------|
| `totalHabits` | Total number of habits created |
| `activeHabits` | Number of habits with isActive=true |
| `overallCompletionRate` | Average completion % across all habits |
| `currentStreak` | Consecutive days with ≥50% habits completed |
| `longestStreak` | Best consecutive streak ever |
| `todayCompletion.completed` | Habits completed today |
| `todayCompletion.total` | Habits scheduled for today |
| `todayCompletion.percentage` | Today's completion rate |
| `rollingAverages.last7Days` | Average completion last 7 days |
| `rollingAverages.last14Days` | Average completion last 14 days |
| `rollingAverages.last30Days` | Average completion last 30 days |
| `momentum.current` | Last 7 days average |
| `momentum.previous` | Previous 7 days average |
| `momentum.trend` | `UP`, `DOWN`, or `STABLE` |
| `momentum.percentageChange` | % change between periods |

> **Streak Calculation Note:** A PARTIAL entry contributes to streak calculations only if `percentComplete >= 50`. Entries with less than 50% completion are treated as missed for streak purposes.

---

### 2. Get Habit Performance

```http
GET /api/v1/performance/habit/:id
```

**Description:** Get detailed performance analytics for a specific habit.

**Authentication:** Required 🔒

**URL Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Habit ID |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Habit performance retrieved successfully",
  "data": {
    "performance": {
      "habitId": "660e8400-e29b-41d4-a716-446655440001",
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
        {
          "date": "2025-01-01",
          "value": 100,
          "status": "DONE"
        },
        {
          "date": "2025-01-02",
          "value": 75,
          "status": "PARTIAL"
        },
        {
          "date": "2025-01-03",
          "value": 0,
          "status": null
        },
        {
          "date": "2025-01-04",
          "value": -1,
          "status": null
        }
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

**Heatmap Data Values:**

| Value | Meaning |
|-------|---------|
| `100` | Completed (DONE) |
| `1-99` | Partial completion |
| `0` | Missed (NOT_DONE or no entry for a scheduled day) |
| `-1` | Not scheduled for this day |

**Status Field Clarification:**
- `status: "DONE"` - Entry was marked as completed
- `status: "PARTIAL"` - Entry was marked as partially completed
- `status: "NOT_DONE"` - Entry was explicitly marked as not done
- `status: null` - **No entry exists for this date** (either missed or not yet logged)

---

## API Quick Reference

### Authentication Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/signup` | Register new user | ❌ |
| `POST` | `/auth/verify-email` | Verify email OTP | ❌ |
| `POST` | `/auth/verify-phone` | Verify phone OTP | ❌ |
| `POST` | `/auth/resend-otp` | Resend OTP | ❌ |
| `POST` | `/auth/login` | Login user | ❌ |
| `POST` | `/auth/logout` | Logout user | ✅ |
| `GET` | `/auth/me` | Get current user | ✅ |

### Habit Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/habits` | Create habit | ✅ |
| `GET` | `/habits` | List all habits | ✅ |
| `GET` | `/habits/:id` | Get habit by ID | ✅ |
| `PUT` | `/habits/:id` | Update habit | ✅ |
| `DELETE` | `/habits/:id` | Soft delete habit | ✅ |

### Habit Entry Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/habits/:id/entry` | Create entry | ✅ |
| `PUT` | `/habits/:id/entry/:entryDate` | Update entry | ✅ |
| `GET` | `/habits/:id/history` | Get history | ✅ |
| `DELETE` | `/habits/:id/entry/:entryDate` | Delete entry | ✅ |

### Performance Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/performance/summary` | Overall summary | ✅ |
| `GET` | `/performance/habit/:id` | Habit analytics | ✅ |

---

## Rate Limits

| Route Type | Limit | Window |
|------------|-------|--------|
| Auth routes | 10 requests | 15 minutes |
| OTP routes | 3 requests | 1 minute |
| General routes | 100 requests | 1 minute |

---

## Testing with cURL

### Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"john@example.com","password":"SecureP@ss123"}'
```

### Create Habit (with cookie)
```bash
curl -X POST http://localhost:3001/api/v1/habits \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Reading","frequency":"DAILY","startDate":"2026-01-01"}'
```

### Get Habits
```bash
curl http://localhost:3001/api/v1/habits \
  -b cookies.txt
```

### Log Entry
```bash
curl -X POST http://localhost:3001/api/v1/habits/{habitId}/entry \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"entryDate":"2026-01-01","status":"DONE"}'
```

### Get Performance
```bash
curl http://localhost:3001/api/v1/performance/summary \
  -b cookies.txt
```
