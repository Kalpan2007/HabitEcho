# Supabase Connection Configuration for Render

## 🔧 Critical Fix for P1001 Error

The P1001 error occurs because you're using the **wrong port and missing SSL configuration**. Here's how to fix it:

---

## ✅ Correct Supabase Connection Strings

### For Render (Production)

You need **TWO** connection strings:

#### 1. DATABASE_URL (Connection Pooler)
Use this for runtime queries:
```bash
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

#### 2. DIRECT_URL (Direct Connection)
Use this for migrations only:
```bash
postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres?sslmode=require
```

---

## 📋 How to Get Your Connection Strings

### Step 1: Get Connection Pooler URL

1. Go to https://supabase.com/dashboard
2. Select your project (`sqkwmtvdipulpcqsmguf`)
3. Click **Settings** → **Database**
4. Scroll to **Connection Pooling** section
5. **Mode:** Select **Transaction**
6. Copy the connection string

**It should look like:**
```
postgresql://postgres.sqkwmtvdipulpcqsmguf:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Step 2: Get Direct Connection URL

1. In the same **Database** settings page
2. Scroll to **Connection String** section
3. Select **URI** tab
4. Copy the connection string

**It should look like:**
```
postgresql://postgres.sqkwmtvdipulpcqsmguf:[YOUR-PASSWORD]@db.sqkwmtvdipulpcqsmguf.supabase.co:5432/postgres
```

### Step 3: Add SSL and Parameters

Add these parameters to BOTH connection strings:

**For DATABASE_URL (pooler):**
```
?pgbouncer=true&connection_limit=1&sslmode=require
```

**For DIRECT_URL (direct):**
```
?sslmode=require
```

---

## 🔐 URL Encode Your Password

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

**Online tool:** https://www.urlencoder.org/

---

## ⚙️ Update Render Environment Variables

Go to Render Dashboard → Your Service → **Environment** and add/update:

### Required Variables:

```bash
# Connection Pooler (for app runtime) - PORT 6543
DATABASE_URL=postgresql://postgres.sqkwmtvdipulpcqsmguf:[ENCODED-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require

# Direct Connection (for migrations) - PORT 5432
DIRECT_URL=postgresql://postgres.sqkwmtvdipulpcqsmguf:[ENCODED-PASSWORD]@db.sqkwmtvdipulpcqsmguf.supabase.co:5432/postgres?sslmode=require
```

**Replace:**
- `[ENCODED-PASSWORD]` with your actual password (URL-encoded)
- `us-east-1` with your actual region (check Supabase dashboard)

---

## 📝 Complete Example

Let's say your password is `MySecure@Pass!123`

**Encoded password:** `MySecure%40Pass%21123`

**DATABASE_URL:**
```bash
postgresql://postgres.sqkwmtvdipulpcqsmguf:MySecure%40Pass%21123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
```

**DIRECT_URL:**
```bash
postgresql://postgres.sqkwmtvdipulpcqsmguf:MySecure%40Pass%21123@db.sqkwmtvdipulpcqsmguf.supabase.co:5432/postgres?sslmode=require
```

---

## 🚀 Updated Build Process

Make sure your build command in Render uses the DIRECT_URL for migrations:

```bash
npm ci && npx prisma generate && npm run build && npx prisma migrate deploy
```

Prisma will automatically:
- Use `DIRECT_URL` for migrations
- Use `DATABASE_URL` for runtime queries

---

## ✅ Verification Checklist

Before deploying, verify:

- [ ] `DATABASE_URL` uses port **6543** (pooler)
- [ ] `DIRECT_URL` uses port **5432** (direct)
- [ ] Both have `sslmode=require` parameter
- [ ] `DATABASE_URL` has `pgbouncer=true&connection_limit=1`
- [ ] Password is URL-encoded
- [ ] Both environment variables are set in Render
- [ ] Region matches your Supabase project location

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**Solutions:**
1. ✅ Verify you're using port **6543** for DATABASE_URL
2. ✅ Check `sslmode=require` is present
3. ✅ Ensure password is correctly URL-encoded
4. ✅ Confirm Supabase database is active (not paused)

### Error: "SSL connection required"

**Solution:**
Add `sslmode=require` to both connection strings

### Error: "Password authentication failed"

**Solution:**
Double-check:
1. Password is correct
2. Special characters are URL-encoded
3. No extra spaces in the connection string

### Error: "Migration failed"

**Solution:**
Ensure `DIRECT_URL` environment variable is set correctly

---

## 📊 Key Differences: Pooler vs Direct

| Feature | DATABASE_URL (Pooler) | DIRECT_URL (Direct) |
|---------|----------------------|---------------------|
| **Port** | 6543 | 5432 |
| **Host** | `pooler.supabase.com` | `db.supabase.co` |
| **Use Case** | Runtime queries | Migrations |
| **Connection Limit** | Yes (`connection_limit=1`) | No |
| **PgBouncer** | Yes (`pgbouncer=true`) | No |
| **SSL** | Yes (`sslmode=require`) | Yes (`sslmode=require`) |

---

## 🎯 Why This Matters

1. **Port 6543 (Pooler):** Required for serverless environments like Render to handle connection pooling
2. **Port 5432 (Direct):** Required for migrations and schema changes
3. **SSL:** Required by Supabase for secure connections in production
4. **Connection Limit:** Prevents exhausting connection pool in serverless environments

---

## 🔗 Additional Resources

- **Supabase Docs:** https://supabase.com/docs/guides/database/connecting-to-postgres
- **Prisma Docs:** https://www.prisma.io/docs/data-platform/data-proxy/prisma-cli-with-data-proxy
- **Render Docs:** https://render.com/docs/databases

---

**Last Updated:** 2026-01-20  
**Status:** Configuration updated to support Supabase with SSL ✅
