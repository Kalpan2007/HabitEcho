# 🔧 Authentication Token Fix - "Invalid Token" Error

## 🎯 Problem Summary

After logging in successfully, creating a habit fails with "Invalid token" error in production, but works fine locally.

## 🔍 Root Cause Analysis

### Issues Identified:

1. **Missing Environment Variables**
   - `ALLOW_INSECURE_COOKIES` was not set in server `.env`
   - `FRONTEND_URL` was not configured
   - `CORS_ORIGIN` only included localhost

2. **Cookie Security Misconfiguration**
   - Production requires `secure: true` and `sameSite: 'none'` for cross-origin
   - Without proper config, cookies fail to be sent/stored
   - Backend rejects requests without valid cookies

3. **CORS Configuration**
   - Backend only allowed `localhost:3000`
   - Production frontend URL was not in allowed origins
   - Cross-origin requests were being blocked

### Why It Worked Locally:
- Same-origin (both on localhost)
- No cookie security restrictions
- CORS not enforced for same-origin

### Why It Failed in Production:
- Cross-origin setup (different domains)
- Strict cookie security requirements
- CORS blocking requests

---

## ✅ Changes Applied

### 1. Server Environment Variables (`server/.env`)

```env
# Before:
CORS_ORIGIN="http://localhost:3000"

# After:
CORS_ORIGIN="http://localhost:3000,https://habitecho.onrender.com"
FRONTEND_URL="https://habitecho.onrender.com"
ALLOW_INSECURE_COOKIES="false"
```

**What this does:**
- `CORS_ORIGIN`: Allows requests from both local and production frontend
- `FRONTEND_URL`: Used for email links and as fallback
- `ALLOW_INSECURE_COOKIES`: 
  - `false` = Production mode → `secure: true`, `sameSite: 'none'`
  - `true` = Development mode → `secure: false`, `sameSite: 'lax'`

### 2. Render Deployment Config (`render.yaml`)

```yaml
- key: CORS_ORIGIN
  value: https://habitecho.onrender.com
- key: FRONTEND_URL
  value: https://habitecho.onrender.com
- key: ALLOW_INSECURE_COOKIES
  value: false
```

---

## 🚀 Deployment Instructions

### Option A: Backend Already Deployed on Render

If you're using Render's dashboard to manage environment variables:

1. **Update Render Environment Variables:**
   - Go to: https://dashboard.render.com/
   - Select your `habitecho-server` service
   - Go to "Environment" tab
   - Update/Add these variables:
     ```
     CORS_ORIGIN = https://habitecho.onrender.com
     FRONTEND_URL = https://habitecho.onrender.com
     ALLOW_INSECURE_COOKIES = false
     ```
   - Click "Save Changes"

2. **Trigger Manual Redeploy:**
   - Go to "Manual Deploy" section
   - Click "Deploy latest commit"
   - Wait for build to complete (~3-5 minutes)

### Option B: Using render.yaml (Automatic)

If you deploy via GitHub + render.yaml:

1. **Commit Changes:**
   ```bash
   git add .
   git commit -m "fix: update CORS and cookie configuration for production auth"
   git push origin main
   ```

2. **Render Auto-Deploys:**
   - Render will detect the push
   - Automatically redeploy with new config
   - Monitor at: https://dashboard.render.com/

---

## 🧪 Testing After Deployment

### 1. Wait for Deployment
- Check Render dashboard for "Live" status
- Usually takes 3-5 minutes

### 2. Test Authentication Flow

1. **Clear Browser Data:**
   ```
   - Press F12 (DevTools)
   - Go to Application tab
   - Clear all cookies for your frontend domain
   - Clear Local Storage
   - Close and reopen browser
   ```

2. **Test Complete Flow:**
   - [ ] Navigate to production frontend
   - [ ] Click "Sign Up" or "Log In"
   - [ ] Enter credentials
   - [ ] Verify successful login
   - [ ] Navigate to "Create Habit"
   - [ ] Fill in habit details
   - [ ] Click "Create"
   - [ ] **Should succeed without "Invalid token" error**

### 3. Verify Cookies in Browser

**In Browser DevTools (F12):**
```javascript
// 1. Go to Application → Cookies → your-frontend-domain
// 2. Look for: habitecho_access
// 3. Verify properties:
//    - HttpOnly: ✓
//    - Secure: ✓
//    - SameSite: None
//    - Path: /
```

### 4. Check Network Requests

**In Network Tab:**
```javascript
// 1. Create a habit
// 2. Check the POST /api/v1/habits request
// 3. Request Headers should include:
//    - Cookie: habitecho_access=...
//    - Authorization: Bearer ... (as fallback)
```

---

## 🔧 Configuration Deep Dive

### Cookie Behavior Matrix

| Environment | ALLOW_INSECURE_COOKIES | secure | sameSite | Use Case |
|-------------|------------------------|--------|----------|----------|
| Local Dev | `true` | `false` | `lax` | localhost → localhost |
| Production Same-Origin | `true` | `false` | `lax` | https://app.com → https://app.com/api |
| Production Cross-Origin | `false` | `true` | `none` | https://frontend.com → https://api.com |

### Current Setup

**Backend:** `https://habitecho.onrender.com/api/v1`  
**Frontend:** `https://habitecho.onrender.com` (assumed based on CORS config)

**Configuration:**
- `ALLOW_INSECURE_COOKIES = false`
- `secure = true` (HTTPS required)
- `sameSite = none` (allows cross-origin)
- `CORS_ORIGIN` includes frontend URL

---

## ⚠️ Important Notes

### 1. Frontend URL Clarification

**If your frontend is on a DIFFERENT domain** (e.g., Vercel):
```env
# Update server/.env:
CORS_ORIGIN="http://localhost:3000,https://your-app.vercel.app"
FRONTEND_URL="https://your-app.vercel.app"
```

**If your frontend is on SAME domain** (both Render):
```env
# Current config is correct:
CORS_ORIGIN="http://localhost:3000,https://habitecho.onrender.com"
FRONTEND_URL="https://habitecho.onrender.com"
```

### 2. HTTPS Requirement

For `sameSite: 'none'` to work:
- ✅ Backend MUST be HTTPS (Render provides this)
- ✅ Frontend MUST be HTTPS (Render/Vercel provide this)
- ❌ Won't work with HTTP in production

### 3. Authorization Header Fallback

The code includes a fallback mechanism:
```typescript
// In auth.middleware.ts
// 1. Try cookie first: habitecho_access
// 2. Fallback to Authorization header: Bearer <token>
```

This ensures tokens work even if cookies fail in some edge cases.

---

## 🐛 Troubleshooting

### Issue: Still Getting "Invalid Token"

**Check 1: Verify Environment Variables**
```bash
# On Render dashboard, verify:
CORS_ORIGIN = https://habitecho.onrender.com (or your frontend URL)
ALLOW_INSECURE_COOKIES = false
```

**Check 2: Clear All Caches**
```bash
# Browser:
- Clear cookies
- Clear local storage
- Hard refresh (Ctrl+Shift+R)

# Server:
- Verify deployment completed
- Check logs for errors
```

**Check 3: Verify CORS Headers**
```bash
# Test CORS from browser console on frontend:
fetch('https://habitecho.onrender.com/api/v1/health', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

### Issue: Cookies Not Being Set

**Symptoms:**
- Login succeeds
- Cookie not visible in DevTools → Application → Cookies

**Solution:**
```javascript
// Check response headers for:
Set-Cookie: habitecho_access=...; Secure; HttpOnly; SameSite=None

// If missing, verify:
1. ALLOW_INSECURE_COOKIES=false in Render
2. Both frontend and backend are HTTPS
3. CORS_ORIGIN matches your frontend URL exactly
```

### Issue: CORS Error

**Symptoms:**
```
Access to fetch at 'https://habitecho.onrender.com/api/v1/habits' 
from origin 'https://your-frontend.com' has been blocked by CORS policy
```

**Solution:**
```env
# Ensure CORS_ORIGIN includes EXACT frontend URL:
CORS_ORIGIN="http://localhost:3000,https://your-frontend.com"

# No trailing slash:
✅ https://your-frontend.com
❌ https://your-frontend.com/
```

---

## 📊 How Token Flow Works

```
┌─────────────┐
│   Login     │
│  (POST)     │
└──────┬──────┘
       │
       ▼
┌──────────────────────────┐
│ Backend generates JWT    │
│ - Access token (7 days)  │
│ - Refresh token (30 days)│
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│ Set cookies in response:         │
│ - habitecho_access (7d)          │
│ - habitecho_refresh (30d)        │
│ Properties:                      │
│   - HttpOnly: true               │
│   - Secure: true (production)    │
│   - SameSite: none (cross-origin)│
└──────┬───────────────────────────┘
       │
       ▼
┌─────────────────────────┐
│ Browser stores cookies  │
│ (if HTTPS + proper CORS)│
└──────┬──────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Create Habit (POST)          │
│ Request includes:            │
│ 1. Cookie: habitecho_access  │
│ 2. Authorization: Bearer ... │
└──────┬───────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Backend auth.middleware:    │
│ 1. Check cookie first       │
│ 2. Fallback to Bearer token │
│ 3. Verify JWT               │
│ 4. Attach userId to request │
└──────┬────────────────────────┘
       │
       ▼
┌─────────────┐
│ Create Habit│
│  (Success!) │
└─────────────┘
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Backend deployed successfully on Render
- [ ] Environment variables updated (CORS_ORIGIN, FRONTEND_URL, ALLOW_INSECURE_COOKIES)
- [ ] Backend health check works: `https://habitecho.onrender.com/health`
- [ ] Browser cookies cleared
- [ ] Can log in successfully
- [ ] Cookies are set (check DevTools)
- [ ] Can create habit without "Invalid token" error
- [ ] Can view habits on dashboard
- [ ] Can log entries

---

## 📞 Need Help?

If you still have issues:

1. **Check Render Logs:**
   ```
   Dashboard → habitecho-server → Logs
   Look for:
   - [Auth] Cookie token present
   - [Auth] Authorization header
   - [Auth] Using cookie token
   ```

2. **Check Browser Console:**
   ```javascript
   // Look for:
   - CORS errors
   - 401 Unauthorized
   - Network errors
   ```

3. **Verify URLs Match:**
   ```
   Frontend URL (where you access app) = CORS_ORIGIN in backend
   ```

---

## 🎉 Expected Outcome

After these changes:
- ✅ Login works in production
- ✅ Cookies are properly set and sent
- ✅ Create habit succeeds
- ✅ All authenticated endpoints work
- ✅ No "Invalid token" errors

---

**Last Updated:** January 23, 2026  
**Status:** Ready to Deploy 🚀
