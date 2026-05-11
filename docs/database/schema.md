# Database Schema

This document describes the HabitEcho database schema using Prisma. The database is PostgreSQL hosted on Supabase.

## Schema Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       DATABASE SCHEMA                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────┐     ┌───────────┐     ┌──────────┐     ┌──────────┐   │
│   │  User   │────▶│  Habit    │────▶│ HabitLog │     │  OTP     │   │
│   │         │     │           │     │          │     │  Code    │   │
│   └─────────┘     └───────────┘     └──────────┘     └──────────┘   │
│       │                 │                 │                │          │
│       │                 │                 │                │          │
│       ▼                 ▼                 ▼                ▼          │
│   ┌─────────┐     ┌───────────┐     ┌──────────┐     ┌──────────┐   │
│   │Refresh  │     │  User     │     │  User    │     │  User    │   │
│   │ Token   │     │  Preference│     │  ID      │     │  ID      │   │
│   └─────────┘     └───────────┘     └──────────┘     └──────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Entity Relationship Diagram

```
User (1) ──────< (N) Habit
User (1) ──────< (N) HabitLog
User (1) ──────< (N) RefreshToken
User (1) ──────< (N) OtpCode

Habit (1) ─────< (N) HabitLog
```

---

## Prisma Schema

```prisma
// server/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== USER ====================

model User {
  id              String    @id @default(uuid())
  email           String    @unique
  password        String    // bcrypt hashed
  name            String
  emailVerified   Boolean   @default(false)
  lockedUntil     DateTime? // Account lockout timestamp
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  habits          Habit[]
  habitLogs       HabitLog[]
  refreshTokens   RefreshToken[]
  otpCodes        OtpCode[]
  preferences     UserPreference?

  @@map("users")
}

// ==================== USER PREFERENCE ====================

model UserPreference {
  id         String   @id @default(uuid())
  userId     String   @unique
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  timezone   String   @default("UTC")
  language   String   @default("en")
  theme      String   @default("system") // light, dark, system

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("user_preferences")
}

// ==================== HABIT ====================

model Habit {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  name        String
  description String?  // Optional description
  schedule    Json     // { type: 'daily'|'weekly'|'custom', days: number[], times: string[] }
  reminder    Json?    // { enabled: boolean, times: string[] }

  color       String   @default("#6366F1")
  archived    Boolean  @default(false)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  logs        HabitLog[]

  // Indexes
  @@index([userId])
  @@index([userId, archived])
  @@map("habits")
}

// ==================== HABIT LOG ====================

model HabitLog {
  id        String   @id @default(uuid())
  habitId   String
  habit     Habit    @relation(fields: [habitId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  date      String   // YYYY-MM-DD format
  status    String   // 'DONE', 'PARTIAL', 'MISSED'
  value     Int      @default(0) // 0-100
  notes     String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Constraints
  @@unique([habitId, date]) // One entry per habit per day
  @@index([habitId])
  @@index([userId, date])
  @@map("habit_logs")
}

// ==================== REFRESH TOKEN ====================

model RefreshToken {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  token      String   @unique // Opaque token (not JWT)
  expiresAt  DateTime
  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([token])
  @@map("refresh_tokens")
}

// ==================== OTP CODE ====================

model OtpCode {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  code      String   // 6-digit OTP
  type      String   @default("EMAIL_VERIFICATION") // EMAIL_VERIFICATION, PASSWORD_RESET
  expiresAt DateTime

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([code])
  @@map("otp_codes")
}
```

---

## Entity Details

### User

```typescript
{
  id: string;              // UUID
  email: string;           // Unique
  password: string;        // Bcrypt hashed
  name: string;
  emailVerified: boolean;  // Email verification status
  lockedUntil: DateTime;  // Account lockout (null = not locked)
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### UserPreference

```typescript
{
  id: string;
  userId: string;          // FK to User (1:1)
  timezone: string;        // IANA timezone
  language: string;        // ISO 639-1 (2 chars)
  theme: string;          // 'light', 'dark', 'system'
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### Habit

```typescript
{
  id: string;
  userId: string;         // FK to User (1:N)
  name: string;
  description: string | null;
  schedule: {
    type: 'daily' | 'weekly' | 'custom';
    days: number[];       // 0-6 (weekly/custom)
    times: string[];      // ['06:00', '18:00']
  };
  reminder: {
    enabled: boolean;
    times: string[];
  } | null;
  color: string;          // Hex color
  archived: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### HabitLog

```typescript
{
  id: string;
  habitId: string;        // FK to Habit (1:N)
  userId: string;         // FK to User (denormalized for performance)
  date: string;           // YYYY-MM-DD
  status: 'DONE' | 'PARTIAL' | 'MISSED';
  value: number;         // 0-100
  notes: string | null;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### RefreshToken

```typescript
{
  id: string;
  userId: string;         // FK to User
  token: string;          // Opaque token (random string)
  expiresAt: DateTime;   // 7 days from creation
  createdAt: DateTime;
}
```

### OtpCode

```typescript
{
  id: string;
  userId: string;        // FK to User
  code: string;           // 6-digit numeric
  type: string;          // 'EMAIL_VERIFICATION'
  expiresAt: DateTime;   // 10 minutes
  createdAt: DateTime;
}
```

---

## Indexes

### Performance Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| users | email (unique) | Login lookups |
| habits | userId | Get user's habits |
| habits | userId, archived | Filter active/archived |
| habit_logs | habitId, date (unique) | Prevent duplicates |
| habit_logs | userId, date | User activity lookups |
| refresh_tokens | token | Token validation |
| refresh_tokens | userId | User's tokens |
| otp_codes | code | OTP verification |
| otp_codes | userId | User's OTPs |

---

## Migrations

### Creating a Migration

```bash
cd server
npm run prisma:migrate -- --name add_new_field
```

### Migration Workflow

1. **Modify schema.prisma**
2. **Run migration**
   ```bash
   npm run prisma:migrate
   ```
3. **Verify** - Check generated SQL
4. **Deploy to production**
   ```bash
   npm run prisma:migrate:prod
   ```

---

## Seed Data

### Running Seed

```bash
cd server
npm run prisma:seed
```

### Seed Script Example

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const password = await bcrypt.hash('Demo123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'demo@habitecho.com' },
    update: {},
    create: {
      email: 'demo@habitecho.com',
      password,
      name: 'Demo User',
      emailVerified: true,
      preferences: {
        create: {
          timezone: 'UTC',
          language: 'en',
          theme: 'system',
        },
      },
    },
  });

  // Create sample habits
  const habits = [
    {
      userId: user.id,
      name: 'Morning Meditation',
      description: '30 minutes of mindfulness',
      schedule: { type: 'daily', days: [0, 1, 2, 3, 4, 5, 6], times: ['06:00'] },
      reminder: { enabled: true, times: ['05:45'] },
      color: '#6366F1',
    },
    {
      userId: user.id,
      name: 'Exercise',
      description: '45 min workout',
      schedule: { type: 'weekly', days: [1, 3, 5], times: ['07:00'] },
      reminder: { enabled: true, times: ['06:45'] },
      color: '#10B981',
    },
  ];

  for (const habit of habits) {
    await prisma.habit.upsert({
      where: { id: habit.name }, // Use name as unique key for seed
      update: {},
      create: habit,
    });
  }

  console.log('Seed completed');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
```

---

## Database Constraints

| Constraint | Table | Purpose |
|------------|-------|---------|
| Unique | users.email | Prevent duplicate emails |
| Unique | habits.name + userId | One name per user (optional) |
| Unique | habit_logs.habitId + date | One entry per day per habit |
| Unique | refreshTokens.token | One token per row |
| Cascade Delete | All relations | Delete child when parent deleted |
| Not Null | All required fields | Prevent null values |
| Check | habitLogs.value | Ensure 0-100 range |

---

## API vs Database Correspondence

| API Endpoint | Database Tables |
|--------------|-----------------|
| POST /auth/signup | INSERT User, INSERT OtpCode |
| POST /auth/verify-otp | UPDATE User, DELETE OtpCode |
| POST /auth/login | SELECT User, INSERT RefreshToken |
| POST /auth/logout | DELETE RefreshToken |
| GET /habits | SELECT Habit (filtered by user) |
| POST /habits | INSERT Habit |
| PUT /habits/:id | UPDATE Habit |
| DELETE /habits/:id | DELETE Habit, CASCADE HabitLog |
| POST /habits/:id/log | INSERT HabitLog |
| GET /performance/summary | Aggregate from HabitLog |

---

## Query Optimization Tips

### Select Only Needed Fields

```typescript
// ✅ Good - minimal data transfer
const habits = await prisma.habit.findMany({
  where: { userId },
  select: {
    id: true,
    name: true,
    color: true,
    archived: true,
  },
});

// ❌ Bad - unnecessary data
const habits = await prisma.habit.findMany({
  where: { userId },
  include: { logs: true }, // Unnecessary
});
```

### Use Cursors for Pagination

```typescript
// Cursor-based pagination (more efficient)
const habits = await prisma.habit.findMany({
  take: 20,
  cursor: { id: lastId },
  skip: 1,
});
```

### Denormalize for Performance

The `userId` field in `HabitLog` allows efficient queries without joining through `Habit`:

```typescript
// Fast - direct user lookup
const logs = await prisma.habitLog.findMany({
  where: { userId },
});

// Alternative - requires join
const logs = await prisma.habitLog.findMany({
  where: { habit: { userId } },
});
```

---

**Next:** See [Deployment Guide](./deployment/production.md) for production deployment steps.