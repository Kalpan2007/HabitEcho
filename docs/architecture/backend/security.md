# Security Implementation

This document details all security measures implemented in the HabitEcho backend.

## Security Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐   │
│   │  LAYER 1: TRANSPORT SECURITY                                    │   │
│   │  - HTTPS/TLS                                                    │   │
│   │  - HSTS (HTTP Strict Transport Security)                         │   │
│   │  - Secure cookies                                               │   │
│   └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐   │
│   │  LAYER 2: APPLICATION SECURITY                                  │   │
│   │  - Helmet (Security headers)                                    │   │
│   │  - CORS configuration                                           │   │
│   │  - Input validation                                             │   │
│   │  - Rate limiting                                                │   │
│   │  - Request timeout                                             │   │
│   └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐   │
│   │  LAYER 3: AUTHENTICATION & AUTHORIZATION                       │   │
│   │  - JWT access tokens                                            │   │
│   │  - Refresh token rotation                                       │   │
│   │  - HttpOnly cookies                                            │   │
│   │  - Password hashing (bcrypt)                                   │   │
│   └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐   │
│   │  LAYER 4: DATA SECURITY                                         │   │
│   │  - Database access via Prisma                                  │   │
│   │  - SQL injection prevention                                     │   │
│   │  - Input sanitization                                           │   │
│   │  - Audit logging                                                │   │
│   └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Transport Security

### HTTPS/TLS

All production traffic must use HTTPS:

```bash
# Required environment configuration
NODE_ENV=production
HTTPS=true
```

### HSTS (HTTP Strict Transport Security)

```typescript
// Helmet configuration
hsts: {
  maxAge: 31536000,        // 1 year in seconds
  includeSubDomains: true, // Apply to all subdomains
  preload: true,           // Include in HSTS preload list
}
```

This tells browsers to:
1. Only access the server via HTTPS
2. Automatically convert HTTP to HTTPS
3. Remember this for 1 year

### Secure Cookies

```typescript
// Access Token Cookie
{
  name: 'accessToken',
  httpOnly: true,       // Not accessible via JavaScript
  secure: true,        // Only sent over HTTPS
  sameSite: 'strict',  // CSRF protection
  maxAge: 900,         // 15 minutes
  path: '/'
}

// Refresh Token Cookie
{
  name: 'refreshToken',
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 604800,      // 7 days
  path: '/'
}
```

**Cookie Security Attributes:**

| Attribute | Value | Purpose |
|-----------|-------|---------|
| httpOnly | true | Prevents XSS from reading cookies |
| secure | true | Only sent over encrypted connection |
| sameSite | 'strict' | CSRF protection |
| path | '/' | Available across all routes |

---

## 2. Application Security

### Helmet.js

Comprehensive security headers:

```typescript
app.use(helmet({
  // Prevent XSS attacks
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
    },
  },
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  // Prevent MIME sniffing
  noSniff: true,
  // XSS filter (legacy)
  xssFilter: true,
}));
```

### CORS Configuration

```typescript
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server and non-browser clients
    if (!origin) return callback(null, true);

    // Production: whitelist specific origins
    const allowedOrigins = config.cors.origin.split(',');
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization'],
}));
```

### Input Validation

All user input is validated using Zod schemas:

```typescript
// Example: Signup validation
export const signupSchema = z.object({
  email: z.string().email().max(255),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
  name: z.string().min(2).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
```

**Validation Coverage:**
- Request body validation
- URL parameter validation
- Query string validation

---

## 3. Authentication & Authorization

### JWT Implementation

#### Access Token

```typescript
// Generate access token
const accessToken = jwt.sign(
  {
    sub: user.id,         // User ID
    email: user.email,
    type: 'access',
  },
  config.jwt.secret,
  { expiresIn: '15m' }    // Short expiry
);
```

**Access Token Properties:**
- **Algorithm:** HS256
- **Expiry:** 15 minutes
- **Payload:** User ID, email, token type

#### Refresh Token (Database-backed)

```typescript
// Generate refresh token
const refreshToken = crypto.randomBytes(64).toString('hex');

// Store in database
await prisma.refreshToken.create({
  data: {
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
});
```

**Refresh Token Properties:**
- **Type:** Opaque (random string, not JWT)
- **Storage:** Database (enables revocation)
- **Expiry:** 7 days

### Token Rotation

Every token refresh generates new tokens:

```typescript
// Token refresh process
async function refreshTokens(refreshToken: string) {
  // 1. Validate refresh token in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  // 2. Delete old refresh token (rotation)
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  // 3. Generate new access and refresh tokens
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken();

  // 4. Store new refresh token
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}
```

### Password Security

```typescript
// Hash password with bcrypt
const hash = await bcrypt.hash(password, 12); // Cost factor 12

// Verify password
const isValid = await bcrypt.compare(password, hash);
```

**Password Configuration:**
- **Algorithm:** bcrypt
- **Cost factor:** 12 (good balance of security/performance)
- **Min requirements:** 8 chars, 1 uppercase, 1 number

### Login Protection

```typescript
// Track failed login attempts
const loginAttempts = await prisma.loginAttempt.findMany({
  where: {
    email,
    attemptedAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
  },
});

// Lock account after 5 failed attempts
if (loginAttempts.length >= 5) {
  await prisma.user.update({
    where: { email },
    data: { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) },
  });
  throw new UnauthorizedError('Account locked. Try again in 15 minutes.');
}
```

---

## 4. Rate Limiting

### Global Rate Limiting

```typescript
const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  message: {
    success: false,
    message: 'Too many requests',
    error: { code: 'RATE_LIMITED' },
  },
});
```

### Endpoint-Specific Limits

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| /auth/signup | 5 | 15 min | Prevent spam accounts |
| /auth/login | 10 | 15 min | Brute force protection |
| /auth/verify-otp | 5 | 15 min | OTP guessing |
| /auth/resend-otp | 3 | 1 hour | Email abuse |
| /habits (create) | 30 | 15 min | Habit spam |
| /habits/:id/log | 60 | 15 min | Entry spam |

---

## 5. Request Timeout

Prevents resource exhaustion from slow/stalled requests:

```typescript
app.use(requestTimeout(200)); // 200 seconds
```

**Purpose:**
- Handle serverless cold starts
- Prevent connection pool exhaustion
- Force cleanup of slow clients

---

## 6. Database Security

### Prisma Query Safety

Prisma automatically prevents SQL injection through:
- Parameterized queries
- Type-safe query building

```typescript
// Safe - Prisma handles escaping
const user = await prisma.user.findFirst({
  where: {
    email: userInput, // Automatically escaped
  },
});

// Never do raw SQL with user input
// await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`;
```

### Data Access Patterns

All database access goes through service layer:

```typescript
// Service layer - all DB access here
const habits = await prisma.habit.findMany({
  where: { userId: req.user.id }, // Always filter by user
  select: { id: true, name: true }, // Select only needed fields
});
```

---

## 7. Logging & Monitoring

### Security Event Logging

```typescript
// Log authentication events
logger.info({
  type: 'auth',
  event: 'login',
  userId: user.id,
  success: true,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
});

// Log security warnings
logger.warn({
  type: 'security',
  event: 'failed_login_attempt',
  email: email,
  attempts: count,
  ip: req.ip,
});
```

### What to Log

| Event | Log Level | Include |
|-------|------------|---------|
| Login success | INFO | User ID, timestamp, IP |
| Login failure | WARN | Email, timestamp, IP |
| Token refresh | INFO | User ID, timestamp |
| Account lockout | WARN | User ID, reason |
| Rate limit hit | WARN | IP, endpoint |
| Invalid token | WARN | Token type, timestamp |
| Server error | ERROR | Stack trace (dev only) |

---

## 8. Environment Security

### Required Environment Variables

```bash
# .env.production - NEVER commit this file

# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=<64-character-random-string>

# Email
EMAIL_HOST=smtp.example.com
EMAIL_USER=api@example.com
EMAIL_PASS=<password>

# CORS
CORS_ORIGIN=https://habitecho.com,https://app.habitecho.com
```

### Secrets Rotation

```typescript
// JWT secret should be rotated periodically
// Recommended: Every 90 days in production
```

---

## Security Checklist

### Before Production Deployment

- [ ] HTTPS enabled and configured
- [ ] HSTS enabled with preload
- [ ] CORS configured for specific origins
- [ ] Rate limiting enabled on all endpoints
- [ ] JWT expiry set to 15 minutes
- [ ] Bcrypt cost factor is 12+
- [ ] Cookies have httpOnly, secure, sameSite
- [ ] Security headers configured via Helmet
- [ ] Request timeout configured
- [ ] Error messages don't leak sensitive info
- [ ] Logging captures security events
- [ ] Environment variables are secure

### Security Headers Verification

Run this in browser console on production:

```javascript
fetch('/').then(r => {
  console.log('Content-Security-Policy:', r.headers.get('Content-Security-Policy'));
  console.log('Strict-Transport-Security:', r.headers.get('Strict-Transport-Security'));
  console.log('X-Frame-Options:', r.headers.get('X-Frame-Options'));
});
```

---

## Common Attacks & Mitigations

| Attack | Mitigation |
|--------|------------|
| XSS | Content-Security-Policy, httpOnly cookies |
| CSRF | sameSite cookies, CSRF tokens |
| SQL Injection | Prisma ORM, no raw SQL |
| Brute Force | Rate limiting, account lockout |
| Token Theft | Short access token expiry, refresh rotation |
| Clickjacking | X-Frame-Options: deny |
| MIME Sniffing | X-Content-Type-Options: nosniff |

---

**Next:** See [Frontend Architecture](./frontend/overview.md) for client-side implementation.