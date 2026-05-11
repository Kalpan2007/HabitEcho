# Authentication API Documentation

The authentication system uses a dual-token strategy with HTTP-only cookies for maximum security. All authentication endpoints are prefixed with `/api/v1/auth`.

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION FLOW                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   SIGNUP                                                                 │
│   ┌──────────┐    ┌─────────────┐    ┌──────────────┐                  │
│   │  User    │───▶│  /signup    │───▶│  Create user │                  │
│   │ submits  │    │  endpoint   │    │  + send OTP  │                  │
│   └──────────┘    └─────────────┘    └──────────────┘                  │
│                                                                          │
│   VERIFY EMAIL                                                           │
│   ┌──────────┐    ┌─────────────┐    ┌──────────────┐                  │
│   │  User    │───▶│/verify-otp  │───▶│Verify email  │                  │
│   │ enters   │    │  endpoint   │    │  + set tokens │                  │
│   │   OTP    │    └─────────────┘    └──────────────┘                  │
│   └──────────┘         │                      │                        │
│                        ▼                      ▼                        │
│                   ┌──────────┐          ┌─────────────┐                │
│                   │  401 if  │          │ Set cookies │                │
│                   │ invalid  │          │ + redirect  │                │
│                   └──────────┘          └─────────────┘                │
│                                                                          │
│   LOGIN                                                                  │
│   ┌──────────┐    ┌─────────────┐    ┌──────────────┐                  │
│   │  User    │───▶│  /login     │───▶│Validate creds│                  │
│   │ submits  │    │  endpoint   │    │  + set tokens│                  │
│   └──────────┘    └─────────────┘    └──────────────┘                  │
│                                               │                         │
│   TOKEN REFRESH (Automatic)                                         │
│   ┌─────────────┐    ┌─────────────┐    ┌──────────────┐              │
│   │  Expired    │───▶│/refresh     │───▶│Validate RT   │              │
│   │  access     │    │  endpoint   │    │  + new AT    │              │
│   └─────────────┘    └─────────────┘    └──────────────┘              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Endpoints

---

## POST /auth/signup

Register a new user account.

### Request

```http
POST /api/v1/auth/signup
Content-Type: application/json
```

```typescript
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

### Request Body Schema

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format, max 255 chars |
| password | string | Yes | Min 8 chars, 1 uppercase, 1 number |
| name | string | Yes | Min 2 chars, max 100 chars |

### Success Response (201)

```typescript
{
  "success": true,
  "message": "Account created successfully. Please check your email for verification code.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "emailVerified": false,
      "createdAt": "2026-05-11T10:00:00Z"
    }
  }
}
```

### Error Responses

**400 - Validation Error**
```typescript
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "email": ["Invalid email format"],
      "password": ["Password must contain at least 8 characters, one uppercase letter, and one number"]
    }
  }
}
```

**409 - User Already Exists**
```typescript
{
  "success": false,
  "message": "User with this email already exists",
  "error": {
    "code": "USER_ALREADY_EXISTS"
  }
}
```

**429 - Rate Limited**
```typescript
{
  "success": false,
  "message": "Too many signup attempts. Please try again later.",
  "error": {
    "code": "RATE_LIMITED"
  }
}
```

### Rate Limit
- **Limit:** 5 requests per 15 minutes per IP
- **Headers:** X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

---

## POST /auth/login

Authenticate user and receive tokens via HTTP-only cookies.

### Request

```http
POST /api/v1/auth/login
Content-Type: application/json
```

```typescript
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Request Body Schema

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format |
| password | string | Yes | Non-empty |

### Success Response (200)

```typescript
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "emailVerified": true,
      "preferences": {
        "timezone": "UTC",
        "language": "en",
        "theme": "system"
      },
      "createdAt": "2026-05-11T10:00:00Z"
    }
  }
}
```

### Cookies Set

| Cookie Name | Type | Attributes | Purpose |
|-------------|------|------------|---------|
| accessToken | HttpOnly | Secure, SameSite=strict, Max-Age=15min | JWT access token |
| refreshToken | HttpOnly | Secure, SameSite=strict, Max-Age=7d | Refresh token stored in DB |

### Error Responses

**401 - Invalid Credentials**
```typescript
{
  "success": false,
  "message": "Invalid email or password",
  "error": {
    "code": "INVALID_CREDENTIALS"
  }
}
```

**401 - Email Not Verified**
```typescript
{
  "success": false,
  "message": "Please verify your email first",
  "error": {
    "code": "EMAIL_NOT_VERIFIED"
  }
}
```

**429 - Rate Limited**
```typescript
{
  "success": false,
  "message": "Too many login attempts. Please try again later.",
  "error": {
    "code": "RATE_LIMITED"
  }
}
```

### Security Features

1. **Rate Limiting:** 10 requests per 15 minutes per IP
2. **Account Lockout:** After 5 failed attempts, lock for 15 minutes
3. **Password Hashing:** bcrypt with cost factor 12
4. **Token Rotation:** Each login generates new refresh token

---

## POST /auth/refresh

Refresh expired access token using refresh token from cookie.

### Request

```http
POST /api/v1/auth/refresh
Content-Type: application/json
```

**Note:** No request body required. Refresh token is read from HttpOnly cookie.

### Success Response (200)

```typescript
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "emailVerified": true
    }
  }
}
```

### Cookies Updated

- New accessToken cookie (15 min expiry)
- New refreshToken cookie (7 day expiry, stored in DB)

### Error Responses

**401 - Invalid/Expired Refresh Token**
```typescript
{
  "success": false,
  "message": "Session expired. Please login again.",
  "error": {
    "code": "SESSION_EXPIRED"
  }
}
```

**401 - Refresh Token Revoked**
```typescript
{
  "success": false,
  "message": "Session revoked. Please login again.",
  "error": {
    "code": "SESSION_REVOKED"
  }
}
```

---

## POST /auth/logout

Logout user and invalidate refresh token.

### Request

```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>  // Required for browser
```

**Note:** Access token in cookie is sufficient for browser requests.

### Success Response (200)

```typescript
{
  "success": true,
  "message": "Logout successful"
}
```

### Cookies Cleared

- accessToken (expired immediately)
- refreshToken (expired immediately)

### Backend Actions

1. Remove refresh token from database
2. Clear all refresh tokens for user (optional: keep device tokens)

---

## POST /auth/verify-otp

Verify user's email address using OTP sent during signup.

### Request

```http
POST /api/v1/auth/verify-otp
Content-Type: application/json
```

```typescript
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Request Body Schema

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format |
| otp | string | Yes | 6-digit numeric string |

### Success Response (200)

```typescript
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "emailVerified": true
    }
  }
}
```

### Cookies Set

- accessToken
- refreshToken

### Error Responses

**400 - Invalid OTP**
```typescript
{
  "success": false,
  "message": "Invalid or expired verification code",
  "error": {
    "code": "INVALID_OTP"
  }
}
```

**400 - OTP Expired**
```typescript
{
  "success": false,
  "message": "Verification code has expired. Please request a new one.",
  "error": {
    "code": "OTP_EXPIRED"
  }
}
```

### OTP Details

- **Length:** 6 digits
- **Validity:** 10 minutes
- **Attempts:** Maximum 5 attempts before OTP is invalidated

---

## POST /auth/resend-otp

Resend OTP to user's email.

### Request

```http
POST /api/v1/auth/resend-otp
Content-Type: application/json
```

```typescript
{
  "email": "user@example.com"
}
```

### Request Body Schema

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format |

### Success Response (200)

```typescript
{
  "success": true,
  "message": "Verification code sent to your email",
  "data": {}
}
```

### Rate Limit

- **Limit:** 3 requests per hour per email

### Error Responses

**404 - User Not Found**
```typescript
{
  "success": false,
  "message": "No account found with this email",
  "error": {
    "code": "USER_NOT_FOUND"
  }
}
```

---

## GET /auth/me

Get current authenticated user's profile.

### Request

```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>  // or cookie
```

### Success Response (200)

```typescript
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "emailVerified": true,
      "preferences": {
        "timezone": "America/New_York",
        "language": "en",
        "theme": "dark"
      },
      "createdAt": "2026-05-11T10:00:00Z",
      "updatedAt": "2026-05-11T10:00:00Z"
    }
  }
}
```

### Error Responses

**401 - Not Authenticated**
```typescript
{
  "success": false,
  "message": "Authentication required",
  "error": {
    "code": "UNAUTHENTICATED"
  }
}
```

---

## PATCH /auth/preferences

Update user's preferences.

### Request

```http
PATCH /api/v1/auth/preferences
Authorization: Bearer <access_token>
Content-Type: application/json
```

```typescript
{
  "preferences": {
    "timezone": "America/Los_Angeles",
    "language": "es",
    "theme": "dark"
  }
}
```

### Request Body Schema

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| preferences.timezone | string | No | Valid IANA timezone |
| preferences.language | string | No | ISO 639-1 code (2 letters) |
| preferences.theme | string | No | 'light', 'dark', or 'system' |

### Success Response (200)

```typescript
{
  "success": true,
  "message": "Preferences updated successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "preferences": {
        "timezone": "America/Los_Angeles",
        "language": "es",
        "theme": "dark"
      }
    }
  }
}
```

### Error Responses

**400 - Invalid Preference Value**
```typescript
{
  "success": false,
  "message": "Invalid preference values",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "preferences.theme": ["Invalid theme value. Must be 'light', 'dark', or 'system'"]
    }
  }
}
```

---

## Security Implementation Details

### Token Structure

#### Access Token (JWT)
```typescript
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "type": "access",
  "iat": 1715433600,
  "exp": 1715434500  // +15 minutes
}
```

#### Refresh Token (Opaque token stored in DB)
```typescript
{
  "token": "random-uuid-string",
  "userId": "user-uuid",
  "expiresAt": "2026-05-18T10:00:00Z",  // +7 days
  "createdAt": "2026-05-11T10:00:00Z",
  "deviceId": "device-identifier"  // optional
}
```

### Cookie Configuration

```typescript
// Access Token
{
  name: 'accessToken',
  httpOnly: true,
  secure: true,  // production only
  sameSite: 'strict',
  maxAge: 15 * 60,  // 15 minutes in seconds
  path: '/'
}

// Refresh Token
{
  name: 'refreshToken',
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60,  // 7 days in seconds
  path: '/'
}
```

### Middleware Chain

```
Request → Rate Limiter → Timeout → Auth Middleware → Controller
```

1. **Rate Limiter:** Limits requests per IP
2. **Timeout Middleware:** 200s timeout for cold starts
3. **Auth Middleware:** Validates JWT from cookie/header

---

**Next:** See [Habits API](./habits.md) for habit CRUD endpoints.