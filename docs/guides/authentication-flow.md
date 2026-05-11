# Authentication Flow

This document explains the complete authentication flow in HabitEcho, from user registration to token refresh and logout.

## Authentication Overview

HabitEcho uses a **dual-token system** with:
- **Access Token:** Short-lived JWT (15 min) for API requests
- **Refresh Token:** Long-lived opaque token (7 days) stored in database

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION FLOW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   USER REGISTRATION                                                      │
│   ┌──────────┐                                                          │
│   │  Signup  │ ──▶ Create User ──▶ Send OTP ──▶ Await Verification     │
│   └──────────┘                                  │                       │
│                                                  ▼                       │
│   EMAIL VERIFICATION                             │                       │
│   ┌──────────┐         ┌────────────┐            │                       │
│   │ Enter    │────────▶│ Verify OTP │────────────┘                      │
│   │   OTP    │         └────────────┘                                    │
│   └──────────┘                │                                          │
│                               ▼                                          │
│   LOGIN                        │                                          │
│   ┌──────────┐         ┌────────────┐          ┌─────────────┐          │
│   │  Login  │────────▶│ Credentials│──────────▶│Set Cookies  │          │
│   │ Request │         │  Valid?    │          │ + Redirect  │          │
│   └──────────┘         └────────────┘          └─────────────┘          │
│                                                                          │
│   API REQUESTS                                                           │
│   ┌──────────┐         ┌────────────┐                                    │
│   │  API    │────────▶│Validate AT │─────────▶ Process Request          │
│   │ Request │         │ (cookie)   │               │                   │
│   └──────────┘         └────────────┘               │                   │
│                              │                      │                   │
│                    ┌─────────┴────────┐            │                   │
│                    ▼                   ▼            ▼                   │
│              401 (expired)        Success                                  │
│                    │                                                      │
│                    ▼                                                      │
│   TOKEN REFRESH                                                           │
│   ┌──────────┐         ┌────────────┐          ┌─────────────┐          │
│   │ Refresh  │────────▶│Validate RT │──────────▶│New Tokens   │          │
│   │ Request │         │ (cookie)   │          │ + Rotate    │          │
│   └──────────┘         └────────────┘          └─────────────┘          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Registration Flow

### 1. User Signs Up

```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Backend Actions:**
1. Validate email format
2. Check if email already exists → 409 if exists
3. Validate password strength (8+ chars, 1 uppercase, 1 number)
4. Hash password with bcrypt (cost factor 12)
5. Create user record with `emailVerified: false`
6. Generate 6-digit OTP
7. Store OTP in database (expires in 10 min)
8. Send OTP via email

**Response:**
```json
{
  "success": true,
  "message": "Account created. Check email for verification code.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "emailVerified": false
    }
  }
}
```

---

### 2. User Verifies Email

```http
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Backend Actions:**
1. Find pending OTP for email
2. Validate OTP matches
3. Check OTP not expired (10 min)
4. Update user `emailVerified: true`
5. Delete used OTP
6. Generate access token (JWT)
7. Generate refresh token (store in database)
8. Set cookies (HttpOnly, secure)

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": { ... }
  }
}
```

**Cookies Set:**
```http
Set-Cookie: accessToken=<jwt>; HttpOnly; Secure; SameSite=strict; Max-Age=900
Set-Cookie: refreshToken=<random-string>; HttpOnly; Secure; SameSite=strict; Max-Age=604800
```

---

## Login Flow

### 1. User Submits Credentials

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Backend Actions:**
1. Find user by email → 401 if not found
2. Check account not locked → 401 if locked
3. Compare password with bcrypt
4. Check email verified → 401 if not verified
5. Record failed attempt (for brute force protection)
6. Generate access token
7. Generate refresh token (rotate - delete old, create new)
8. Set cookies

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... }
  }
}
```

---

## Token Refresh Flow

### Automatic Refresh

When the access token expires, the client automatically requests a new one:

```http
POST /api/v1/auth/refresh
Cookie: refreshToken=<token>
```

**Backend Actions:**
1. Read refresh token from cookie
2. Find token in database
3. Check token not expired
4. Get associated user
5. Delete old refresh token (rotation)
6. Generate new access token
7. Generate new refresh token
8. Store new refresh token
9. Set new cookies

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "user": { ... }
  }
}
```

### Token Rotation

Every refresh generates new tokens - this prevents replay attacks:

```
Old: AT1 + RT1
       ↓ Refresh
New: AT2 + RT2  (RT1 invalidated, RT2 created)
```

---

## API Request Flow

### With Valid Access Token

```http
GET /api/v1/habits
Cookie: accessToken=<valid-jwt>
```

**Middleware Actions:**
1. Extract access token from cookie
2. Verify JWT with secret
3. Decode payload (user ID, email)
4. Attach user to request object
5. Pass to controller

**Response:** Process normally → 200 OK

---

### With Expired Access Token

```http
GET /api/v1/habits
Cookie: accessToken=<expired-jwt>
```

**Middleware Actions:**
1. Detect token expired
2. Check if refresh token cookie exists
3. Trigger token refresh

**Client-Side Handling (TanStack Query):**

```typescript
// queries automatically retry with new token
const query = useQuery({
  queryKey: ['habits'],
  queryFn: fetchHabits,
  retry: 1, // If 401, retry once (will use refreshed token)
});
```

---

## Logout Flow

```http
POST /api/v1/auth/logout
Cookie: accessToken=<token>
```

**Backend Actions:**
1. Extract access token
2. Decode to get user ID
3. Delete all refresh tokens for user (or specific device token)
4. Set cookie expiration to past (immediate deletion)

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Cookies Cleared:**
```
Set-Cookie: accessToken=; Max-Age=0
Set-Cookie: refreshToken=; Max-Age=0
```

---

## Frontend Implementation

### Auth Context

```typescript
// src/auth/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { login as apiLogin, logout as apiLogout, getMe } from '@/api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: getMe,
    retry: false,
    staleTime: Infinity, // Cache user until logout
  });

  const loginMutation = useMutation({
    mutationFn: apiLogin,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: apiLogout,
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data
    },
  });

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login: loginMutation.mutate,
      logout: logoutMutation.mutate,
      isLoggingIn: loginMutation.isPending,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### Protected Routes

```typescript
// src/components/auth/ProtectedRoute.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/AuthContext';
import { useEffect } from 'react';

export function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) return <LoadingScreen />;
  if (!user) return null;

  return children;
}
```

### Using Auth in Components

```typescript
function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## Security Features

### 1. Token Storage

| Token | Storage | Security |
|-------|---------|----------|
| Access Token | HttpOnly Cookie | Not accessible via JavaScript |
| Refresh Token | HttpOnly Cookie + DB | Not accessible, can be revoked |

### 2. Cookie Attributes

```typescript
// Production cookie settings
{
  httpOnly: true,    // JavaScript cannot read
  secure: true,      // HTTPS only
  sameSite: 'strict', // CSRF protection
  maxAge: 900,       // 15 minutes (access) / 7 days (refresh)
  path: '/'
}
```

### 3. Rate Limiting

- Login: 10 attempts per 15 minutes
- OTP verify: 5 attempts per 15 minutes
- Account lockout: After 5 failed logins, 15-minute lock

### 4. Password Security

- Bcrypt cost factor: 12
- Minimum requirements: 8 chars, 1 uppercase, 1 number

---

## Edge Cases

### 1. Refresh Token Expired

```typescript
// Backend returns 401
{
  "success": false,
  "message": "Session expired. Please login again.",
  "error": { "code": "SESSION_EXPIRED" }
}

// Frontend redirects to login
if (error.code === 'SESSION_EXPIRED') {
  router.push('/auth/login');
}
```

### 2. User Deleted While Logged In

```typescript
// Backend returns 401
{
  "success": false,
  "message": "Account not found",
  "error": { "code": "USER_NOT_FOUND" }
}

// Frontend logs out and redirects
if (error.code === 'USER_NOT_FOUND') {
  logout();
}
```

### 3. Multiple Tabs

When user logs out in one tab, other tabs should reflect this:

```typescript
// Use TanStack Query to sync state
useEffect(() => {
  const channel = new BroadcastChannel('auth');
  channel.onmessage = (event) => {
    if (event.data === 'logout') {
      queryClient.clear();
      router.push('/auth/login');
    }
  };
}, []);
```

---

## Testing Authentication

### Login Test

```typescript
test('login flow', async () => {
  // 1. Sign up
  const signupResponse = await api.signup({
    email: 'test@example.com',
    password: 'Password123',
    name: 'Test',
  });
  expect(signupResponse.success).toBe(true);

  // 2. Verify email (mock OTP)
  const verifyResponse = await api.verifyOtp({
    email: 'test@example.com',
    otp: '123456',
  });
  expect(verifyResponse.success).toBe(true);
  expect(verifyResponse.data.user.emailVerified).toBe(true);
});
```

---

**Next:** See [Database Schema](./database/schema.md) for database design.