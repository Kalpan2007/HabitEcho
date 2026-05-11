# Production Deployment Guide

This guide covers the steps to deploy HabitEcho to production.

## Pre-Deployment Checklist

```markdown
## Code Review
- [ ] All features tested locally
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors
- [ ] Linting passes

## Security
- [ ] Environment variables configured
- [ ] JWT secret is strong (64+ chars)
- [ ] CORS origins configured
- [ ] Rate limiting enabled

## Database
- [ ] Migrations run
- [ ] Seed data applied (if needed)
- [ ] Connection string secure

## Monitoring
- [ ] Error tracking configured
- [ ] Logging configured
- [ ] Health check endpoint tested
```

---

## Environment Configuration

### Required Environment Variables

#### Server

```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database (Supabase)
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# JWT - Generate with: openssl rand -base64 32
JWT_SECRET=[64-character-random-string]

# CORS - Comma-separated allowed origins
CORS_ORIGIN=https://habitecho.com,https://app.habitecho.com

# Email (Brevo/SMTP)
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
EMAIL_FROM=HabitEcho <noreply@habitecho.com>

# Cookie
COOKIE_SECRET=[32-character-random-string]
```

#### Client

```bash
# .env.local.production
NEXT_PUBLIC_API_URL=https://api.habitecho.com/api/v1
```

---

## Server Deployment

### Build

```bash
cd server

# Install dependencies
npm ci

# Generate Prisma client
npm run prisma:generate

# Type check
npm run typecheck

# Lint
npm run lint

# Build TypeScript
npm run build
```

### Run Migrations

```bash
# Development
npm run prisma:migrate

# Production
npm run prisma:migrate:prod
```

### Start Server

```bash
# Direct
npm start

# With PM2 (process manager)
pm2 start dist/server.js --name habitecho-server

# With Docker
docker build -t habitecho-server .
docker run -p 3000:3000 habitecho-server
```

---

## Client Deployment

### Build

```bash
cd client

# Install dependencies
npm ci

# Build for production
npm run build
```

### Deployment Options

#### Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect GitHub repo to Vercel for automatic deployments.

#### Docker

```dockerfile
# client/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Supabase Configuration

### Database Setup

1. **Create Supabase Project**
   - Go to supabase.com
   - Create new project
   - Note database URL and credentials

2. **Run Migrations**
   ```bash
   cd server
   DATABASE_URL=[your-connection-string] npm run prisma:migrate
   ```

3. **Seed Data** (Optional)
   ```bash
   DATABASE_URL=[your-connection-string] npm run prisma:seed
   ```

### Row Level Security (RLS)

While Prisma handles access, you can add RLS policies for extra security:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can manage own habits" ON habits
  FOR ALL USING (auth.uid() = user_id);
```

---

## Health Checks

### Server Health Endpoint

```bash
curl https://api.habitecho.com/health

# Response
{
  "status": "ok",
  "timestamp": "2026-05-11T10:00:00Z",
  "uptime": 3600,
  "environment": "production"
}
```

### Database Health

```typescript
// In health check
const dbHealth = await prisma.$queryRaw`SELECT 1`;
if (dbHealth) {
  // Database connected
}
```

---

## Monitoring & Logging

### Server Logs

Use structured logging with Pino:

```bash
# View logs
pm2 logs habitecho-server

# Filter logs
pm2 logs habitecho-server --err --lines 100
```

### Error Tracking (Sentry)

```bash
# Install
npm install @sentry/node
```

```typescript
// src/utils/logger.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

export const logger = {
  error: (msg, data) => {
    Sentry.captureMessage(msg, { extra: data });
  },
};
```

### APM (Optional)

- **Datadog** - Full monitoring
- **New Relic** - Application performance
- **PM2 Plus** - Basic metrics

---

## SSL/TLS Configuration

### Using Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name api.habitecho.com;

    ssl_certificate /etc/letsencrypt/live/habitecho.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/habitecho.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name api.habitecho.com;
    return 301 https://$server_name$request_uri;
}
```

### Using Vercel (Automatic)

Vercel handles SSL automatically with Let's Encrypt.

---

## Performance Optimization

### Server

1. **Enable gzip compression**
   ```typescript
   app.use(compression());
   ```

2. **Connection pooling**
   ```typescript
   // Prisma uses connection pooling automatically
   // Ensure database has enough connections
   ```

3. **Cache responses**
   ```typescript
   // For public endpoints
   app.get('/api/v1/public/...', (req, res) => {
     res.set('Cache-Control', 'public, max-age=3600');
   });
   ```

### Client

1. **Use Next.js Image Optimization**
   ```tsx
   import Image from 'next/image';
   <Image src={...} alt={...} />
   ```

2. **Enable SWC minification** (default in Next.js)

3. **Use incremental static regeneration**
   ```typescript
   export const revalidate = 3600; // Revalidate every hour
   ```

---

## Backup & Recovery

### Database Backup

```bash
# Using pg_dump (Supabase)
pg_dump $DATABASE_URL > backup.sql

# Schedule with cron (daily)
0 2 * * * pg_dump $DATABASE_URL > /backups/habitecho-$(date +\%Y\%m\%d).sql
```

### Restore

```bash
psql $DATABASE_URL < backup.sql
```

---

## Troubleshooting

### Common Issues

#### 1. Connection Refused

```bash
# Check database connection
npm run prisma:studio

# Verify connection string format
postgresql://[user]:[password]@[host]:[port]/[database]
```

#### 2. CORS Errors

```typescript
// Check CORS configuration in app.ts
const allowedOrigins = config.cors.origin.split(',');
```

#### 3. JWT Errors

```bash
# Verify JWT secret matches in all environments
# Should be same in dev and production
```

#### 4. 504 Gateway Timeout

```typescript
// Increase timeout in app.ts
app.use(requestTimeout(200)); // Already set to 200s
```

### Debug Mode

```typescript
// In development only
if (config.isDevelopment) {
  console.log('Debug info:', data);
}
```

---

## Rollback Procedure

### If Deployment Fails

1. **Check logs**
   ```bash
   pm2 logs habitecho-server --err
   ```

2. **Revert to previous version**
   ```bash
   # If using Git
   git revert HEAD
   npm run build
   pm2 restart habitecho-server
   ```

3. **Database rollback**
   ```bash
   # If migration caused issues
   npm run prisma:migrate:rollback
   ```

---

## Environment Checklist

| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment | production |
| PORT | Server port | 3000 |
| DATABASE_URL | PostgreSQL connection | postgresql://... |
| JWT_SECRET | Token signing key | (64 char string) |
| CORS_ORIGIN | Allowed origins | https://app.com |
| COOKIE_SECRET | Cookie signing key | (32 char string) |
| EMAIL_HOST | SMTP host | smtp.example.com |
| EMAIL_USER | SMTP user | user@example.com |
| EMAIL_PASS | SMTP password | password |

---

**Next:** See [Project Structure](./project/structure.md) for complete folder overview.