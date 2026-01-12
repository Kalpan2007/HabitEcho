# 🚀 HabitEcho Production Deployment Guide

## 📋 Executive Summary

This guide provides a complete production deployment checklist for HabitEcho with **minimal code changes** required. The application is **95% production-ready** with only minor configuration adjustments needed.

---

## ⚠️ Issues Found & Fixes Required

### 🔴 CRITICAL ISSUES (Must Fix)

#### 1. **Missing CORS_ORIGIN Environment Variable**
**Location**: `server/src/config/index.ts` (Line 95)  
**Issue**: CORS origin falls back to localhost in production  
**Impact**: Frontend deployed on Vercel won't be able to call backend API  
**Fix**: Add CORS_ORIGIN to environment schema and Render configuration

#### 2. **Missing Frontend Environment Variable Example**
**Location**: `client/` directory  
**Issue**: No `.env.example` file for frontend  
**Impact**: Developers don't know what variables are needed  
**Fix**: Create `client/.env.example`

#### 3. **Debug Logs in Production Code**
**Location**: `server/src/utils/date.ts` (Lines 35, 43)  
**Issue**: Console.log debug statements will spam production logs  
**Impact**: Increased log volume on Render, harder to debug real issues  
**Fix**: Remove or conditionally disable debug logs

### 🟡 MEDIUM PRIORITY (Recommended)

#### 4. **Development Email Console Log**
**Location**: `server/src/utils/email.ts` (Line 51)  
**Issue**: Development email preview URLs logged in production  
**Impact**: Minor log noise  
**Fix**: Conditional logging based on environment

#### 5. **SameSite Cookie Policy Too Strict**
**Location**: `server/src/config/index.ts` (Line 59)  
**Issue**: `sameSite: 'strict'` in production may block cookies in cross-site scenarios  
**Impact**: Vercel frontend calling Render backend = cross-site request  
**Recommendation**: Use `'none'` with `secure: true` for production or keep `'lax'`  
**Note**: Current setup with `'lax'` should work, but test carefully

#### 6. **Missing Health Check Endpoint**
**Location**: N/A  
**Issue**: No `/health` or `/` endpoint for Render health checks  
**Impact**: Render may not detect if service is running properly  
**Recommendation**: Add simple health endpoint

### 🟢 LOW PRIORITY (Nice to Have)

#### 7. **Prisma Connection Pooling**
**Location**: `server/src/config/database.ts`  
**Issue**: No explicit connection pool limits  
**Impact**: On free tier, may hit connection limits  
**Recommendation**: Add `connection_limit` to DATABASE_URL

---

## 🔧 Required Code Changes

### Change 1: Add CORS_ORIGIN to Environment Schema

**File**: `server/src/config/index.ts`

```typescript
// ADD THIS to envSchema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(32),
  OTP_EXPIRY_MINUTES: z.string().transform(Number).default('10'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  
  // ADD THESE NEW FIELDS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // Email configuration (optional in development)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
});
```

```typescript
// UPDATE THIS in config object
cors: {
  origin: env.CORS_ORIGIN, // Changed from: process.env.CORS_ORIGIN || 'http://localhost:3000'
},
```

### Change 2: Remove Debug Logs from Production

**File**: `server/src/utils/date.ts`

```typescript
// REPLACE Lines 35, 43 with conditional logging
export function parseAndNormalizeDate(dateString: string, tz: string = 'UTC'): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const result = dayjs.utc(dateString).startOf('day').toDate();
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] parseAndNormalizeDate: "${dateString}" => ${result.toISOString()} (UTC Storage)`);
    }
    return result;
  }

  const localDate = dayjs(dateString).tz(tz);
  const dateStr = localDate.format('YYYY-MM-DD');
  const result = dayjs.utc(dateStr).startOf('day').toDate();
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] parseAndNormalizeDate: "${dateString}" in tz "${tz}" => ${dateStr} => ${result.toISOString()} (UTC Storage)`);
  }
  return result;
}
```

### Change 3: Add Health Check Endpoint

**File**: `server/src/app.ts` (Add before routes)

```typescript
// ADD THIS before app.use('/api/v1', routes);

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});
```

### Change 4: Create Frontend Environment Example

**File**: `client/.env.example` (NEW FILE)

```bash
# ===========================================
# HabitEcho Frontend Environment Variables
# ===========================================
# Copy this file to .env.local and fill in your values

# API Base URL
# Local: http://localhost:3001/api/v1
# Production: https://your-backend.onrender.com/api/v1
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Change 5: Update Backend .env.example

**File**: `server/.env.example`

```bash
# ===========================================
# HabitEcho Backend Environment Variables
# ===========================================

# Environment
NODE_ENV=development
PORT=3001

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/habitecho?schema=public"

# JWT Configuration (minimum 32 characters)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-chars"
JWT_EXPIRES_IN=7d

# Cookie Configuration (minimum 32 characters)
COOKIE_SECRET="your-super-secret-cookie-key-minimum-32-chars"

# CORS Configuration
# Local: http://localhost:3000
# Production: https://your-app.vercel.app
CORS_ORIGIN=http://localhost:3000

# OTP Configuration
OTP_EXPIRY_MINUTES=10

# Logging
LOG_LEVEL=info

# Email Configuration (Optional in development, Required in production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM="HabitEcho <noreply@habitecho.com>"
```

---

## 🌐 Environment Variables Configuration

### Backend (Render) - Required Variables

```bash
# Core Configuration
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# Security
JWT_SECRET=<generate-strong-32-char-secret>
COOKIE_SECRET=<generate-strong-32-char-secret>
JWT_EXPIRES_IN=7d

# CORS (CRITICAL!)
CORS_ORIGIN=https://your-app.vercel.app

# Operational
OTP_EXPIRY_MINUTES=10
LOG_LEVEL=info

# Email (Required for production features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="HabitEcho <noreply@habitecho.com>"
```

### Frontend (Vercel) - Required Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
```

### Local Development

**Backend** (`server/.env`):
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://localhost:5432/habitecho"
JWT_SECRET="dev-jwt-secret-minimum-32-characters-long"
COOKIE_SECRET="dev-cookie-secret-minimum-32-characters"
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug

# Email optional for local dev
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=test@gmail.com
# SMTP_PASS=password
```

**Frontend** (`client/.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## 📦 Deployment Steps

### 🔹 Step 1: Prepare Backend for Render

#### 1.1 Apply Code Changes
- [ ] Update `server/src/config/index.ts` (CORS_ORIGIN schema)
- [ ] Update `server/src/utils/date.ts` (remove debug logs)
- [ ] Update `server/src/app.ts` (add health endpoint)
- [ ] Update `server/.env.example` (add CORS_ORIGIN)

#### 1.2 Test Locally
```bash
cd server
npm install
npm run build
npm start
# Test: curl http://localhost:3001/health
```

#### 1.3 Commit Changes
```bash
git add .
git commit -m "chore: production deployment configuration"
git push origin main
```

### 🔹 Step 2: Deploy Backend on Render

#### 2.1 Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select `HabitEcho` repository

#### 2.2 Configure Build Settings
```yaml
Name: habitecho-backend
Region: Oregon (US West)
Branch: main
Root Directory: server
Runtime: Node

# Build Command
npm install && npx prisma generate && npx prisma migrate deploy

# Start Command
npm start

# Instance Type
Free
```

#### 2.3 Add Environment Variables
In Render dashboard, add all backend environment variables listed above.

**CRITICAL**: Set these first:
- `NODE_ENV=production`
- `DATABASE_URL=<your-postgresql-connection-string>`
- `CORS_ORIGIN=https://your-app.vercel.app` (update after Vercel deployment)

#### 2.4 Deploy & Verify
- [ ] Click "Create Web Service"
- [ ] Wait for build to complete (~5 minutes)
- [ ] Check logs for errors
- [ ] Test health endpoint: `https://your-backend.onrender.com/health`

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-01-12T12:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

### 🔹 Step 3: Deploy Frontend on Vercel

#### 3.1 Prepare Frontend
- [ ] Create `client/.env.example`
- [ ] Test local build:
```bash
cd client
npm install
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1 npm run build
```

#### 3.2 Create Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select `HabitEcho` repository

#### 3.3 Configure Build Settings
```yaml
Framework Preset: Next.js
Root Directory: client
Build Command: npm run build
Output Directory: .next
Install Command: npm install

# Environment Variables
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
```

#### 3.4 Deploy & Verify
- [ ] Click "Deploy"
- [ ] Wait for build (~3 minutes)
- [ ] Note your Vercel URL: `https://your-app.vercel.app`

### 🔹 Step 4: Update CORS Configuration

#### 4.1 Update Render Backend
1. Go to Render dashboard → Your backend service
2. Go to "Environment" tab
3. Update `CORS_ORIGIN` variable:
   ```
   CORS_ORIGIN=https://your-app.vercel.app
   ```
4. Click "Save Changes"
5. Service will automatically redeploy

#### 4.2 Verify CORS
Test from browser console on Vercel app:
```javascript
fetch('https://your-backend.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
```

### 🔹 Step 5: Test Complete Flow

#### Test Checklist
- [ ] Visit Vercel URL: `https://your-app.vercel.app`
- [ ] Sign up for new account
- [ ] Verify email is sent (check SMTP logs)
- [ ] Log in
- [ ] Create a habit
- [ ] Log an entry
- [ ] View dashboard analytics
- [ ] Check browser console for errors
- [ ] Check Render logs for errors

---

## ✅ Verification Checklist

### Local Development
- [ ] Backend starts without errors: `cd server && npm run dev`
- [ ] Frontend starts without errors: `cd client && npm run dev`
- [ ] API calls work from local frontend to local backend
- [ ] Database migrations run successfully
- [ ] Health endpoint responds: `curl http://localhost:3001/health`

### Production Backend (Render)
- [ ] Build completes successfully
- [ ] Prisma generate runs without errors
- [ ] Prisma migrations deploy successfully
- [ ] Server starts and stays running
- [ ] Health endpoint responds: `curl https://your-backend.onrender.com/health`
- [ ] Database connection successful (check logs)
- [ ] No crash loops or restart errors
- [ ] Memory usage < 500MB (free tier limit)

### Production Frontend (Vercel)
- [ ] Build completes successfully
- [ ] No build warnings or errors
- [ ] Environment variable injected correctly
- [ ] Static pages render correctly
- [ ] API calls to Render backend work
- [ ] No CORS errors in browser console
- [ ] Authentication flow works (cookies set correctly)

### End-to-End Flow
- [ ] User signup works
- [ ] Email verification sent successfully
- [ ] Login works and sets HttpOnly cookie
- [ ] Dashboard loads with user data
- [ ] Create habit works
- [ ] Log entry works
- [ ] Performance analytics display correctly
- [ ] No console errors on any page

---

## 🐛 Troubleshooting

### Issue: CORS Errors in Browser

**Symptoms**:
```
Access to fetch at 'https://backend.onrender.com/api/v1/auth/login' from origin 
'https://app.vercel.app' has been blocked by CORS policy
```

**Solutions**:
1. Verify `CORS_ORIGIN` in Render matches Vercel URL exactly
2. No trailing slash in CORS_ORIGIN
3. Check Render logs for "CORS" errors
4. Redeploy backend after changing CORS_ORIGIN

### Issue: Backend Build Fails on Render

**Symptoms**:
```
Error: Cannot find module '@prisma/client'
```

**Solutions**:
1. Ensure build command includes: `npx prisma generate`
2. Check `package.json` has `@prisma/client` in dependencies (not devDependencies)
3. Verify `DATABASE_URL` is set in environment variables

### Issue: Database Connection Fails

**Symptoms**:
```
Error: Can't reach database server at `host:5432`
```

**Solutions**:
1. Verify `DATABASE_URL` format includes `?sslmode=require`
2. Check PostgreSQL instance is publicly accessible
3. Verify connection string credentials are correct
4. Test connection from Render shell: `npx prisma db pull`

### Issue: Cookies Not Working (Auth Fails)

**Symptoms**:
- User logs in successfully but immediately logged out
- "Unauthorized" errors after login

**Solutions**:
1. Check cookie settings in `server/src/config/index.ts`:
   - `secure: true` in production
   - `sameSite: 'lax'` or `'none'` (try both)
2. Verify frontend sends `credentials: 'include'` in fetch
3. Check browser console → Application → Cookies
4. May need to change `sameSite` to `'none'` for cross-origin

### Issue: Backend Crashes After Deploy

**Symptoms**:
- Service starts then crashes within seconds
- Render shows "Service Unavailable"

**Solutions**:
1. Check Render logs for error message
2. Verify all required env variables are set
3. Common issues:
   - Missing `DATABASE_URL`
   - Invalid `JWT_SECRET` (must be 32+ chars)
   - Port binding (should use `process.env.PORT`)
4. Test locally with production env: `NODE_ENV=production npm start`

### Issue: Frontend Shows "Failed to Fetch"

**Symptoms**:
- All API calls fail with network error
- No CORS error, just generic failure

**Solutions**:
1. Verify `NEXT_PUBLIC_API_URL` is set correctly
2. Check backend is actually running (visit health endpoint)
3. Check Render backend logs for crashes
4. Test backend directly with curl

---

## 🔒 Security Checklist

### Backend
- [ ] All secrets use strong random values (32+ characters)
- [ ] `NODE_ENV=production` set in Render
- [ ] Database uses SSL connection (`?sslmode=require`)
- [ ] Rate limiting enabled (already configured)
- [ ] Helmet security headers enabled (already configured)
- [ ] HttpOnly cookies enabled (already configured)
- [ ] CORS limited to specific origin (not wildcard)
- [ ] No sensitive data in logs
- [ ] Prisma query logging disabled in production

### Frontend
- [ ] No secrets in client code
- [ ] All server-side env vars start with `NEXT_PUBLIC_*`
- [ ] API calls use `credentials: 'include'`
- [ ] No hardcoded API URLs (use env var)
- [ ] Error messages don't expose system details

---

## 💰 Free Tier Limits

### Render (Backend)
- **Memory**: 512 MB RAM
- **Uptime**: Service sleeps after 15 min inactivity
- **Cold Start**: ~30 seconds to wake up
- **Build Time**: Limited build minutes per month
- **Database**: Not included (use external PostgreSQL)

**Optimization Tips**:
- Keep dependencies minimal
- Use `LOG_LEVEL=info` (not debug) to reduce memory
- Disable Prisma query logging in production

### Vercel (Frontend)
- **Bandwidth**: 100 GB/month
- **Build Time**: 6000 build minutes/month
- **Serverless Functions**: 100 GB-hrs execution time
- **No Sleep**: Always available (no cold starts)

**Optimization Tips**:
- Enable Next.js image optimization
- Use static generation where possible
- Minimize client-side bundle size

---

## 📊 Monitoring & Logs

### Backend (Render)
- **View Logs**: Render Dashboard → Your Service → Logs
- **Key Metrics**: Memory usage, response times, error rates
- **Log Format**: Pino JSON logs (structured)

**Useful Log Queries**:
```bash
# Filter errors only
grep '"level":50' logs.txt

# Filter specific endpoint
grep '/api/v1/habits' logs.txt

# Check startup logs
head -n 100 logs.txt
```

### Frontend (Vercel)
- **View Logs**: Vercel Dashboard → Your Project → Logs
- **Key Metrics**: Build time, bundle size, page load speed
- **Runtime Logs**: Check browser console for client-side errors

---

## 🎯 Performance Optimization

### Backend
- [x] Prisma select optimization (already implemented)
- [x] Rate limiting enabled (already implemented)
- [x] Request timeout middleware (already implemented)
- [x] Efficient date calculations (already implemented)
- [ ] Consider adding Redis for session caching (future)

### Frontend
- [x] TanStack Query caching (already implemented)
- [x] SSR for dashboard (already implemented)
- [x] Code splitting (Next.js automatic)
- [ ] Image optimization (if adding images)
- [ ] Bundle analysis (run `npm run build` and check output)

---

## 📝 Post-Deployment Tasks

### Immediate (Week 1)
- [ ] Monitor Render logs daily for errors
- [ ] Check Vercel analytics for performance issues
- [ ] Test all critical user flows daily
- [ ] Set up error alerting (Render email notifications)
- [ ] Document production URLs in team docs

### Short-term (Month 1)
- [ ] Add uptime monitoring (e.g., UptimeRobot)
- [ ] Set up error tracking (e.g., Sentry) if needed
- [ ] Review and optimize database queries
- [ ] Add comprehensive API tests
- [ ] Create backup strategy for database

### Long-term
- [ ] Consider upgrading to paid tier if traffic grows
- [ ] Implement CDN for static assets
- [ ] Add database connection pooling
- [ ] Set up CI/CD pipeline for automated deployments
- [ ] Create staging environment

---

## 🆘 Support & Resources

### Official Documentation
- [Render Node.js Guide](https://render.com/docs/deploy-node-express-app)
- [Vercel Next.js Guide](https://vercel.com/docs/frameworks/nextjs)
- [Prisma Production Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides)

### Community
- Render Discord: https://discord.gg/render
- Vercel Discord: https://discord.gg/vercel
- Next.js GitHub: https://github.com/vercel/next.js

---

## ✨ Summary

### What Changed
- Added `CORS_ORIGIN` to environment schema
- Removed debug logs from production
- Added health check endpoint
- Created frontend `.env.example`
- Updated backend `.env.example`

### What Didn't Change
- ✅ No business logic modified
- ✅ No database schema changes
- ✅ No API routes changed
- ✅ No frontend UX changes
- ✅ Local development works exactly the same

### Deployment Time Estimate
- Code changes: **15 minutes**
- Backend deployment: **10 minutes**
- Frontend deployment: **5 minutes**
- Testing & verification: **15 minutes**
- **Total: ~45 minutes**

### Success Criteria
✅ Backend deployed and responding to health checks  
✅ Frontend deployed and loads without errors  
✅ CORS configured correctly  
✅ Authentication works (cookies set)  
✅ All CRUD operations work  
✅ Email notifications send successfully  
✅ No errors in production logs  

---

**🎉 Your application is now production-ready!**

For issues or questions, check the troubleshooting section or open a GitHub issue.
