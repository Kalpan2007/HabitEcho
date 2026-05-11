# Error Codes Documentation

This document lists all error codes used across the HabitEcho API, their meanings, and how to handle them.

## Error Response Structure

All error responses follow this structure:

```typescript
{
  "success": false,
  "message": "Human readable error message",
  "error": {
    "code": "ERROR_CODE",
    "details": {}  // Optional: validation errors or additional context
  }
}
```

---

## Authentication Errors

| Code | HTTP Status | Description | Resolution |
|------|-------------|-------------|-------------|
| `UNAUTHENTICATED` | 401 | No valid authentication token | Login or refresh token |
| `INVALID_TOKEN` | 401 | Token is malformed or invalid | Re-authenticate |
| `TOKEN_EXPIRED` | 401 | Access token has expired | Use refresh token |
| `SESSION_EXPIRED` | 401 | Refresh token expired | Login again |
| `SESSION_REVOKED` | 401 | Token was explicitly revoked | Login again |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password | Check credentials |
| `EMAIL_NOT_VERIFIED` | 401 | Account not verified | Verify email via OTP |
| `USER_ALREADY_EXISTS` | 409 | Email already registered | Use different email |
| `USER_NOT_FOUND` | 404 | User doesn't exist | Check email |
| `INVALID_OTP` | 400 | Wrong OTP entered | Re-enter correct OTP |
| `OTP_EXPIRED` | 400 | OTP timeout (10 min) | Request new OTP |
| `OTP_EXHAUSTED` | 400 | Too many failed attempts | Request new OTP |
| `RATE_LIMITED` | 429 | Too many requests | Wait and retry |

### Auth Error Examples

**Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "error": {
    "code": "INVALID_CREDENTIALS"
  }
}
```

**Email Not Verified:**
```json
{
  "success": false,
  "message": "Please verify your email first",
  "error": {
    "code": "EMAIL_NOT_VERIFIED"
  }
}
```

---

## Habit Errors

| Code | HTTP Status | Description | Resolution |
|------|-------------|-------------|-------------|
| `HABIT_NOT_FOUND` | 404 | Habit doesn't exist | Check habit ID |
| `HABITArchived` | 400 | Cannot modify archived habit | Unarchive first |
| `DUPLICATE_ENTRY` | 409 | Entry exists for date | Use PUT to update |
| `ENTRY_NOT_FOUND` | 404 | Entry doesn't exist | Check date |
| `INVALID_SCHEDULE` | 400 | Invalid schedule configuration | Fix schedule params |

### Habit Error Examples

**Habit Not Found:**
```json
{
  "success": false,
  "message": "Habit not found",
  "error": {
    "code": "HABIT_NOT_FOUND",
    "details": {
      "habitId": "550e8400-e29b-41d4-a716-446655440000"
    }
  }
}
```

**Duplicate Entry:**
```json
{
  "success": false,
  "message": "Entry already exists for this date",
  "error": {
    "code": "DUPLICATE_ENTRY",
    "details": {
      "date": "2026-05-11",
      "existingEntryId": "550e8400-e29b-41d4-a716-446655440001"
    }
  }
}
```

---

## Validation Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request body validation failed |

### Validation Error Example

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "email": ["Invalid email format"],
      "password": ["Password must be at least 8 characters"],
      "name": ["Name is required"]
    }
  }
}
```

### Common Validation Rules

**Email:**
- Must be valid email format
- Maximum 255 characters

**Password:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character recommended

**Name:**
- Minimum 2 characters
- Maximum 100 characters

**Habit Name:**
- Minimum 1 character
- Maximum 100 characters

**Schedule:**
- type: 'daily' | 'weekly' | 'custom'
- days: array of 0-6 for weekly/custom
- times: array of HH:mm strings

---

## Rate Limiting Errors

| Code | HTTP Status | Description | Headers |
|------|-------------|-------------|---------|
| `RATE_LIMITED` | 429 | Too many requests | X-RateLimit-* |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1715433600
X-Retry-After: 60
```

### Rate Limit Response

```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "error": {
    "code": "RATE_LIMITED",
    "details": {
      "retryAfter": 60
    }
  }
}
```

### Rate Limits by Endpoint

| Endpoint | Limit | Window |
|----------|-------|--------|
| /auth/signup | 5 | 15 min |
| /auth/login | 10 | 15 min |
| /auth/verify-otp | 5 | 15 min |
| /auth/resend-otp | 3 | 1 hour |
| /habits (GET) | 100 | 15 min |
| /habits (POST) | 30 | 15 min |
| /habits/:id/log | 60 | 15 min |
| /performance/* | 50 | 15 min |
| Global | 100 | 15 min |

---

## Server Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Maintenance or overload |
| `DATABASE_ERROR` | 500 | Database operation failed |

### Server Error Example

```json
{
  "success": false,
  "message": "An unexpected error occurred. Please try again later.",
  "error": {
    "code": "INTERNAL_ERROR",
    "details": {
      "reference": "ERR-2026-0511-001"
    }
  }
}
```

**Note:** A reference ID is included for support. Save this ID when reporting issues.

---

## Frontend Error Handling

### React Query Error Handling

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

function Component() {
  const mutation = useMutation({
    mutationFn: (data) => api.post('/habits', data),
    onError: (error) => {
      if (error.response?.data?.error?.code === 'EMAIL_NOT_VERIFIED') {
        // Redirect to verification
        router.push('/verify-email');
      }
    }
  });
}
```

### Error Boundary Example

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';

function HabitList() {
  const { data, error, isError } = useQuery({
    queryKey: ['habits'],
    queryFn: fetchHabits
  });

  if (isError) {
    if (error.code === 'UNAUTHENTICATED') {
      return <LoginPrompt />;
    }
    return <ErrorDisplay message={error.message} />;
  }

  return <HabitCards habits={data} />;
}
```

### Toast Notifications

```typescript
function handleApiError(error: ApiError) {
  switch (error.code) {
    case 'RATE_LIMITED':
      showToast('Too many requests. Please wait.', 'warning');
      break;
    case 'INVALID_CREDENTIALS':
      showToast('Wrong email or password.', 'error');
      break;
    default:
      showToast(error.message, 'error');
  }
}
```

---

## Error Code Enum Reference

```typescript
// Backend error codes (for reference)
enum ErrorCode {
  // Auth
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_REVOKED = 'SESSION_REVOKED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  USER_ALREADY_EXISTS = 'USER_ALREADY_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_OTP = 'INVALID_OTP',
  OTP_EXPIRED = 'OTP_EXPIRED',
  OTP_EXHAUSTED = 'OTP_EXHAUSTED',
  RATE_LIMITED = 'RATE_LIMITED',

  // Habits
  HABIT_NOT_FOUND = 'HABIT_NOT_FOUND',
  HABIT_ARCHIVED = 'HABIT_ARCHIVED',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  ENTRY_NOT_FOUND = 'ENTRY_NOT_FOUND',
  INVALID_SCHEDULE = 'INVALID_SCHEDULE',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR'
}
```

---

## Testing Error Responses

### Using curl

```bash
# Test 401 response
curl -X GET http://localhost:3000/api/v1/habits \
  -H "Content-Type: application/json"

# Test 404 response
curl -X GET http://localhost:3000/api/v1/habits/invalid-uuid \
  -H "Authorization: Bearer <valid-token>"

# Test validation error
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid"}'
```

---

**Next:** See [Backend Architecture](./architecture/backend/overview.md) for server-side implementation details.