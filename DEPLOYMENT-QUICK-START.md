# 🚀 Production Deployment Quick Reference

## ✅ Changes Applied (Minimal, Non-Breaking)

### Backend Changes
1. ✅ Added `CORS_ORIGIN` to environment schema (`server/src/config/index.ts`)
2. ✅ Removed debug console logs from production (`server/src/utils/date.ts`)
3. ✅ Added `/health` endpoint for monitoring (`server/src/app.ts`)
4. ✅ Updated `.env.example` with CORS configuration

### Frontend Changes
- ✅ No changes required - already production-ready!

---

## 📝 Environment Variables

### Backend (Render)
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
JWT_SECRET=<32-char-secret>
COOKIE_SECRET=<32-char-secret>
CORS_ORIGIN=https://your-app.vercel.app
LOG_LEVEL=info
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Frontend (Vercel)
```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
```

---

## 🎯 Deployment Commands

### Render (Backend)
```bash
# Build Command:
npm install && npx prisma generate && npx prisma migrate deploy

# Start Command:
npm start
```

### Vercel (Frontend)
```bash
# Auto-detected, but if needed:
# Build: npm run build
# Start: npm start
```

---

## 🔍 Verification Steps

### 1. Test Health Endpoint
```bash
curl https://your-backend.onrender.com/health
```
Expected: `{"status":"ok","timestamp":"...","uptime":123,"environment":"production"}`

### 2. Test CORS
From browser console on Vercel app:
```javascript
fetch('https://your-backend.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
```

### 3. Test Full Flow
- [ ] Sign up
- [ ] Verify email
- [ ] Log in
- [ ] Create habit
- [ ] Log entry
- [ ] View dashboard

---

## ⚠️ Critical Settings

### CORS Must Match Exactly
```
Backend CORS_ORIGIN = Frontend Vercel URL
Example: https://habitecho.vercel.app (no trailing slash!)
```

### Database URL Format
```
postgresql://user:pass@host:5432/db?sslmode=require
                                      ^^^^^^^^^^^^^^
                                      REQUIRED for Render
```

### Cookie Settings (Already Configured)
```typescript
httpOnly: true,
secure: true,              // Production only
sameSite: 'lax',          // Works with cross-origin
```

---

## 🐛 Quick Troubleshooting

### CORS Error?
- Check `CORS_ORIGIN` matches Vercel URL exactly
- Redeploy backend after changing

### Auth Not Working?
- Check cookies in browser DevTools
- Verify `credentials: 'include'` in API calls
- May need `sameSite: 'none'` if 'lax' doesn't work

### Backend Crashes?
- Check Render logs for error
- Verify all env variables are set
- Test locally: `NODE_ENV=production npm start`

---

## 📊 Free Tier Limits

| Platform | RAM | Sleep | Cold Start |
|----------|-----|-------|------------|
| Render   | 512MB | 15min inactive | ~30s |
| Vercel   | Unlimited | Never | None |

---

## 📚 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete guide including:
- Detailed step-by-step instructions
- Troubleshooting guide
- Security checklist
- Post-deployment tasks
- Monitoring & optimization tips

---

## ⏱️ Total Deployment Time

- Code changes: ✅ Already applied (15 min)
- Backend deploy: ~10 minutes
- Frontend deploy: ~5 minutes
- Testing: ~15 minutes
- **Total: ~30-45 minutes**

---

## 🎉 You're Ready!

1. Push changes to GitHub
2. Deploy backend on Render
3. Deploy frontend on Vercel
4. Update CORS_ORIGIN in Render
5. Test & celebrate! 🚀
