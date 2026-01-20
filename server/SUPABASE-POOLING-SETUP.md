# Supabase Connection Pooling Setup Guide

## 🎯 Overview

Your project now supports **two connection URLs** for optimal performance:

- **DATABASE_URL**: Transaction pooler (pgbouncer) for runtime queries
- **DIRECT_URL**: Direct connection for migrations

This configuration enables:
- ✅ Efficient connection pooling on Render (serverless)
- ✅ Reliable migrations with direct connection
- ✅ Local development with simple setup

---

## 🔧 How to Get Your Supabase URLs

### Step 1: Go to Supabase Dashboard

1. Visit https://supabase.com/dashboard
2. Select your project: `sqkwmtvdipulpcqsmguf`
3. Navigate to **Settings** → **Database**

### Step 2: Get Transaction Pooler URL (DATABASE_URL)

1. Scroll to **Connection Pooling** section
2. **Mode**: Select **Transaction**
3. Copy the connection string

**Format:**
```
postgresql://postgres.sqkwmtvdipulpcqsmguf:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

**Key details:**
- Port: `6543` (pooler)
- Host: `aws-0-[region].pooler.supabase.com`

### Step 3: Get Direct Connection URL (DIRECT_URL)

1. Scroll to **Connection String** section
2. Select **URI** tab
3. Copy the connection string

**Format:**
```
postgresql://postgres.sqkwmtvdipulpcqsmguf:[YOUR-PASSWORD]@db.sqkwmtvdipulpcqsmguf.supabase.co:5432/postgres
```

**Key details:**
- Port: `5432` (direct)
- Host: `db.sqkwmtvdipulpcqsmguf.supabase.co`

---

## 🔐 URL-Encode Your Password

If your password contains special characters, encode them:

| Character | Encoded | Example |
|-----------|---------|---------|
| `@` | `%40` | `Pass@123` → `Pass%40123` |
| `!` | `%21` | `Pass!123` → `Pass%21123` |
| `#` | `%23` | `Pass#123` → `Pass%23123` |
| `$` | `%24` | `Pass$123` → `Pass%24123` |
| `%` | `%25` | `Pass%123` → `Pass%25123` |
| `^` | `%5E` | `Pass^123` → `Pass%5E123` |
| `&` | `%26` | `Pass&123` → `Pass%26123` |
| `*` | `%2A` | `Pass*123` → `Pass%2A123` |

**Tool**: https://www.urlencoder.org/

---

## 📋 Add Required Parameters

### For DATABASE_URL (Pooler)

Add these parameters to the end:
```
?pgbouncer=true&sslmode=require
```

**Complete example:**
```
postgresql://postgres.sqkwmtvdipulpcqsmguf:MyPass%40123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
```

### For DIRECT_URL (Direct)

Add these parameters to the end:
```
?sslmode=require
```

**Complete example:**
```
postgresql://postgres.sqkwmtvdipulpcqsmguf:MyPass%40123@db.sqkwmtvdipulpcqsmguf.supabase.co:5432/postgres?sslmode=require
```

---

## ⚙️ Configure Render Environment Variables

### Go to Render Dashboard

1. Visit https://dashboard.render.com
2. Select your service: `habitecho-server`
3. Go to **Environment** tab

### Add These Variables

```bash
# Transaction Pooler (for Prisma Client runtime)
DATABASE_URL=postgresql://postgres.sqkwmtvdipulpcqsmguf:[ENCODED-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require

# Direct Connection (for migrations)
DIRECT_URL=postgresql://postgres.sqkwmtvdipulpcqsmguf:[ENCODED-PASSWORD]@db.sqkwmtvdipulpcqsmguf.supabase.co:5432/postgres?sslmode=require
```

**Replace:**
- `[ENCODED-PASSWORD]` with your actual URL-encoded password
- `[region]` with your Supabase region (e.g., `us-east-1`)

### Save and Deploy

1. Click **Save Changes**
2. Render will automatically redeploy

---

## 💻 Local Development Setup

Your local `.env` should have both variables pointing to the same direct connection:

```bash
# For local development (both can be the same)
DATABASE_URL="postgresql://postgres:password@localhost:5432/habitecho?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/habitecho?schema=public"
```

**Or if using Supabase for local development:**
```bash
DATABASE_URL="postgresql://postgres:password@db.sqkwmtvdipulpcqsmguf.supabase.co:5432/postgres?sslmode=require"
DIRECT_URL="postgresql://postgres:password@db.sqkwmtvdipulpcqsmguf.supabase.co:5432/postgres?sslmode=require"
```

---

## 🏗️ Build Commands

Your build process is already configured correctly:

**Production (Render):**
```bash
npm install
npx prisma generate  # Uses DATABASE_URL
npm run build
npx prisma migrate deploy  # Uses DIRECT_URL
```

**Local Development:**
```bash
npm install
npx prisma generate
npx prisma migrate dev  # For creating new migrations
```

---

## 🔍 How It Works

### Prisma Client (Runtime Queries)

Prisma automatically uses `DATABASE_URL` for all queries:

```typescript
// No code changes needed - uses DATABASE_URL automatically
await prisma.user.findMany();
await prisma.habit.create({ data: {...} });
```

**In production**: Connects via pooler (port 6543) ✅  
**In local**: Connects directly (port 5432) ✅

### Migrations

Prisma uses `DIRECT_URL` for migrations:

```bash
# Production
npx prisma migrate deploy  # Uses DIRECT_URL

# Local development
npx prisma migrate dev  # Uses DIRECT_URL
```

**Why?** Migrations need a direct, non-pooled connection for schema changes.

---

## ✅ Verification Checklist

Before deploying, ensure:

### Environment Variables Set in Render

- [ ] `DATABASE_URL` uses port **6543** (pooler)
- [ ] `DATABASE_URL` includes `?pgbouncer=true&sslmode=require`
- [ ] `DIRECT_URL` uses port **5432** (direct)
- [ ] `DIRECT_URL` includes `?sslmode=require`
- [ ] Password is URL-encoded in both
- [ ] Region matches your Supabase project
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` is set
- [ ] `COOKIE_SECRET` is set
- [ ] `CORS_ORIGIN` is set

### Local Development

- [ ] Both `DATABASE_URL` and `DIRECT_URL` in `.env`
- [ ] Can run `npx prisma generate` successfully
- [ ] Can run `npx prisma migrate dev` successfully
- [ ] Server starts without errors

---

## 🎯 Complete Example

Let's say:
- **Your password**: `SecurePass@2024!`
- **Encoded password**: `SecurePass%402024%21`
- **Region**: `us-east-1`

### Render Environment Variables

```bash
DATABASE_URL=postgresql://postgres.sqkwmtvdipulpcqsmguf:SecurePass%402024%21@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require

DIRECT_URL=postgresql://postgres.sqkwmtvdipulpcqsmguf:SecurePass%402024%21@db.sqkwmtvdipulpcqsmguf.supabase.co:5432/postgres?sslmode=require
```

### Local .env

```bash
DATABASE_URL=postgresql://postgres:SecurePass@2024!@db.sqkwmtvdipulpcqsmguf.supabase.co:5432/postgres?sslmode=require

DIRECT_URL=postgresql://postgres:SecurePass@2024!@db.sqkwmtvdipulpcqsmguf.supabase.co:5432/postgres?sslmode=require
```

---

## 🐛 Troubleshooting

### Error: "Can't reach database server" (P1001)

**Check:**
1. ✅ Port is `6543` for DATABASE_URL
2. ✅ Port is `5432` for DIRECT_URL
3. ✅ Both have `sslmode=require`
4. ✅ Password is correctly URL-encoded
5. ✅ Supabase database is active (not paused)

### Error: "Environment variable not found: DIRECT_URL"

**Solution:**
Add `DIRECT_URL` to your Render environment variables.

### Error: "Migration failed"

**Check:**
1. ✅ `DIRECT_URL` is set correctly
2. ✅ `DIRECT_URL` uses port `5432` (direct connection)
3. ✅ `DIRECT_URL` includes `sslmode=require`

### Error: "SSL connection required"

**Solution:**
Add `sslmode=require` to both connection strings.

---

## 📊 URL Comparison Table

| Feature | DATABASE_URL (Pooler) | DIRECT_URL (Direct) |
|---------|----------------------|---------------------|
| **Port** | 6543 | 5432 |
| **Host** | `aws-0-[region].pooler.supabase.com` | `db.[project].supabase.co` |
| **Usage** | Prisma Client queries | Migrations |
| **Parameters** | `?pgbouncer=true&sslmode=require` | `?sslmode=require` |
| **Connection Type** | Pooled (Transaction mode) | Direct |
| **When Used** | Runtime (app running) | Build time (migrations) |

---

## 🎉 Benefits

### With Connection Pooling

- ✅ **No more P1001 errors** on Render
- ✅ **Efficient connection management** in serverless
- ✅ **Faster queries** with connection reuse
- ✅ **Reliable migrations** with direct connection
- ✅ **Works locally** without changes

### Without Connection Pooling (Old Way)

- ❌ Connection timeouts on Render
- ❌ Exhausted connection pool
- ❌ Migration failures
- ❌ Slow performance

---

## 🔗 Resources

- **Prisma Docs**: https://www.prisma.io/docs/data-platform/data-proxy/prisma-cli-with-data-proxy
- **Supabase Docs**: https://supabase.com/docs/guides/database/connecting-to-postgres
- **Render Docs**: https://render.com/docs/databases
- **PgBouncer**: https://www.pgbouncer.org/

---

**Last Updated**: 2026-01-20  
**Status**: Ready for production deployment ✅
