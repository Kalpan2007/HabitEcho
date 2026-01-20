# ✅ Connection Pooling - Quick Setup Checklist

## 🎯 What Changed

Your project now uses **two database URLs** for optimal performance:

✅ **DATABASE_URL** - Transaction pooler (port 6543) for runtime queries  
✅ **DIRECT_URL** - Direct connection (port 5432) for migrations

---

## 🚀 Action Required: Update Render Environment Variables

### Step 1: Get Your Supabase URLs

**Go to Supabase Dashboard:**
1. https://supabase.com/dashboard → Your Project
2. Settings → Database

**Get Transaction Pooler URL:**
- Section: **Connection Pooling**
- Mode: **Transaction**
- Copy the URL (port **6543**)

**Get Direct Connection URL:**
- Section: **Connection String**
- Tab: **URI**
- Copy the URL (port **5432**)

### Step 2: Add Parameters

**DATABASE_URL:**
```
[your-pooler-url]?pgbouncer=true&sslmode=require
```

**DIRECT_URL:**
```
[your-direct-url]?sslmode=require
```

### Step 3: URL-Encode Password

If your password has special characters:
- `@` → `%40`
- `!` → `%21`
- `#` → `%23`

### Step 4: Set in Render

**Render Dashboard → Your Service → Environment:**

```bash
DATABASE_URL=postgresql://postgres.sqkwmtvdipulpcqsmguf:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require

DIRECT_URL=postgresql://postgres.sqkwmtvdipulpcqsmguf:[PASSWORD]@db.sqkwmtvdipulpcqsmguf.supabase.co:5432/postgres?sslmode=require
```

**Replace:**
- `[PASSWORD]` - your URL-encoded password
- `[region]` - your Supabase region (e.g., us-east-1)

### Step 5: Save & Deploy

1. Click **Save Changes**
2. Render will auto-deploy with the latest code

---

## ✅ Verification

Your deployment should show:

```
✔ Generated Prisma Client
npm run build completed successfully
Applying migrations...
All migrations have been successfully applied
HabitEcho server is running
```

---

## 📚 Full Guide

See [SUPABASE-POOLING-SETUP.md](SUPABASE-POOLING-SETUP.md) for comprehensive documentation.

---

## 💻 Local Development

Your local `.env` already updated! No changes needed for local development.

Both variables can point to the same direct connection locally.

---

**Time Required:** 5 minutes  
**Status:** Ready to deploy! 🚀
