# Project Structure

This document provides a complete overview of the HabitEcho project folder structure.

## Root Directory

```
HabitEcho/
├── .github/                 # GitHub configuration
│   ├── appmod/              # App modules
│   └── appcat/              # App categories
│
├── client/                  # Next.js web frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities & constants
│   │   ├── api/             # API client functions
│   │   └── types/           # TypeScript types
│   ├── public/              # Static assets
│   ├── package.json
│   └── next.config.js
│
├── server/                  # Express.js backend
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── routes/          # API routes
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── middlewares/    # Express middleware
│   │   ├── validations/    # Zod schemas
│   │   ├── utils/          # Utilities
│   │   └── types/          # TypeScript types
│   ├── prisma/             # Database schema & migrations
│   ├── package.json
│   └── tsconfig.json
│
├── Habitechoapp/           # React Native (Expo) mobile app
│   ├── src/
│   │   ├── api/            # API client
│   │   ├── screens/        # Screen components
│   │   ├── components/     # Reusable components
│   │   ├── navigation/     # Navigation config
│   │   └── auth/           # Auth context
│   ├── package.json
│   └── app.json
│
├── docs/                   # Documentation (you're here!)
│   ├── api/                # API documentation
│   ├── architecture/        # Architecture docs
│   │   ├── backend/
│   │   └── frontend/
│   ├── database/           # Database docs
│   ├── deployment/         # Deployment guides
│   ├── guides/            # How-to guides
│   └── project/           # Project docs
│
├── README.md               # Main readme
└── package.json           # Workspaces config (optional)
```

---

## Client Structure (Web Frontend)

```
client/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── (routes)/              # Route groups
│   │   │   ├── auth/              # /auth/login, /auth/signup
│   │   │   ├── dashboard/         # Protected dashboard
│   │   │   │   ├── habits/        # /dashboard/habits
│   │   │   │   ├── habits/new/    # /dashboard/habits/new
│   │   │   │   ├── habits/[id]/   # /dashboard/habits/:id
│   │   │   │   ├── performance/   # /dashboard/performance
│   │   │   │   └── profile/       # /dashboard/profile
│   │   │   ├── features/          # Marketing pages
│   │   │   └── use-cases/         # Marketing pages
│   │   │
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Landing page (/)
│   │   ├── loading.tsx           # Global loading
│   │   └── error.tsx             # Global error boundary
│   │
│   ├── components/
│   │   ├── ui/                   # Reusable UI
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Logo.tsx
│   │   │
│   │   ├── habits/               # Habit-related components
│   │   │   ├── HabitCard.tsx
│   │   │   ├── HabitEntryForm.tsx
│   │   │   ├── HabitEntryLogger.tsx
│   │   │   ├── HabitDetailsClient.tsx
│   │   │   ├── HabitsListClient.tsx
│   │   │   ├── HabitSearch.tsx
│   │   │   ├── HabitActions.tsx
│   │   │   ├── PendingEntriesList.tsx
│   │   │   ├── LogEntryModal.tsx
│   │   │   ├── ArchiveHabitButton.tsx
│   │   │   └── TodayHabitActions.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── HabitDashboard.tsx
│   │   │
│   │   ├── performance/
│   │   │   ├── Heatmap.tsx
│   │   │   ├── YearlyHeatmap.tsx
│   │   │   └── HabitPerformanceCard.tsx
│   │   │
│   │   ├── charts/
│   │   │   ├── TrendChart.tsx
│   │   │   └── ActivityChart.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   ├── profile/
│   │   │   ├── ProfileClient.tsx
│   │   │   └── HabitHistoryClient.tsx
│   │   │
│   │   ├── providers/
│   │   │   └── QueryProvider.tsx
│   │   │
│   │   ├── seo/
│   │   │   └── StructuredData.tsx
│   │   │
│   │   └── shared/
│   │       ├── LoadingScreen.tsx
│   │       └── ErrorScreen.tsx
│   │
│   ├── lib/
│   │   ├── constants.ts         # App constants
│   │   ├── utils.ts            # Helper functions
│   │   ├── seo.config.ts       # SEO configuration
│   │   └── queryClient.ts      # TanStack Query setup
│   │
│   ├── api/                    # API client layer
│   │   ├── client.ts           # Fetch wrapper
│   │   ├── endpoints.ts       # Endpoint definitions
│   │   ├── habits.ts          # Habit API functions
│   │   ├── performance.ts     # Performance API
│   │   ├── entries.ts         # Habit entries API
│   │   └── auth.ts             # Auth API functions
│   │
│   └── types/
│       └── index.ts           # TypeScript types
│
├── public/
│   └── images/                 # Static images
│
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── postcss.config.js
```

---

## Server Structure (Backend)

```
server/
├── src/
│   ├── app.ts                 # Express app setup
│   ├── server.ts             # Server entry point
│   │
│   ├── config/
│   │   ├── index.ts          # Configuration
│   │   └── database.ts       # Prisma client
│   │
│   ├── routes/               # API routes
│   │   ├── index.ts          # Route aggregator
│   │   ├── auth.routes.ts    # Auth endpoints
│   │   ├── habit.routes.ts   # Habit endpoints
│   │   └── performance.routes.ts
│   │
│   ├── controllers/          # Request handlers
│   │   ├── index.ts          # Exports
│   │   ├── auth.controller.ts
│   │   ├── habit.controller.ts
│   │   ├── habitLog.controller.ts
│   │   └── performance.controller.ts
│   │
│   ├── services/             # Business logic
│   │   ├── index.ts          # Exports
│   │   ├── auth.service.ts
│   │   ├── habit.service.ts
│   │   ├── habitLog.service.ts
│   │   ├── performance.service.ts
│   │   ├── email.service.ts
│   │   ├── reminder.service.ts
│   │   └── cron.ts           # Scheduled tasks
│   │
│   ├── middlewares/          # Express middleware
│   │   ├── index.ts          # Exports
│   │   ├── auth.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── rateLimiter.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── logger.middleware.ts
│   │   ├── timeout.middleware.ts
│   │   └── verifyEmail.middleware.ts
│   │
│   ├── validations/          # Zod schemas
│   │   ├── index.ts          # Exports
│   │   ├── auth.validation.ts
│   │   ├── habit.validation.ts
│   │   └── habitLog.validation.ts
│   │
│   ├── utils/                # Utilities
│   │   ├── response.ts       # Response helpers
│   │   ├── errors.ts         # Error classes
│   │   ├── jwt.ts            # JWT helpers
│   │   ├── crypto.ts         # Crypto helpers
│   │   ├── date.ts          # Date utilities
│   │   ├── logger.ts        # Logger setup
│   │   └── index.ts
│   │
│   └── types/
│       └── index.ts         # Shared types
│
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts              # Seed script
│   ├── clear.ts             # Clear script
│   └── migrations/          # Database migrations
│
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Mobile App Structure (React Native)

```
Habitechoapp/
├── src/
│   ├── api/                 # API client
│   │   ├── client.ts        # Axios setup
│   │   ├── endpoints.ts    # Endpoints
│   │   ├── habits.ts      # Habit API
│   │   ├── entries.ts     # Entries API
│   │   └── performance.ts # Performance API
│   │
│   ├── screens/            # Screen components
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignupScreen.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardScreen.tsx
│   │   │   └── PerformanceScreen.tsx
│   │   ├── habits/
│   │   │   ├── HabitsListScreen.tsx
│   │   │   ├── CreateHabitScreen.tsx
│   │   │   ├── HabitDetailScreen.tsx
│   │   │   └── HabitEntryScreen.tsx
│   │   ├── profile/
│   │   │   └── ProfileScreen.tsx
│   │   └── HomeScreen.tsx
│   │
│   ├── components/        # Reusable components
│   │   ├── habits/
│   │   │   ├── HabitCard.tsx
│   │   │   └── Heatmap.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── LoadingScreen.tsx
│   │   └── shared/
│   │       ├── ErrorScreen.tsx
│   │       └── LoadingScreen.tsx
│   │
│   ├── navigation/        # Navigation config
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── RootNavigator.tsx
│   │   └── TabNavigator.tsx
│   │
│   ├── auth/
│   │   └── AuthContext.tsx
│   │
│   └── types/
│       └── index.ts
│
├── App.tsx
├── package.json
├── app.json
├── babel.config.js
└── tsconfig.json
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `HabitCard.tsx` |
| Hooks | camelCase | `useHabits.ts` |
| Utilities | camelCase | `dateUtils.ts` |
| Types | PascalCase | `HabitTypes.ts` |
| Routes | kebab-case | `habit-routes.ts` |
| Services | camelCase | `habitService.ts` |
| Controllers | camelCase | `habitController.ts` |

---

## Import Aliases

```typescript
// Client
@/components/*   → client/src/components/*
@/lib/*          → client/src/lib/*
@/api/*          → client/src/api/*
@/types/*        → client/src/types/*

// Server
@/config/*       → server/src/config/*
@/routes/*       → server/src/routes/*
@/controllers/*  → server/src/controllers/*
@/services/*     → server/src/services/*
@/middlewares/*  → server/src/middlewares/*
@/validations/*  → server/src/validations/*
@/utils/*       → server/src/utils/*
@/types/*       → server/src/types/*
```

---

## Key Files

### Server Key Files

| File | Purpose |
|------|---------|
| `src/app.ts` | Express app with all middleware |
| `src/server.ts` | Server startup |
| `src/routes/index.ts` | Route aggregation |
| `prisma/schema.prisma` | Database schema |

### Client Key Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout with providers |
| `src/lib/queryClient.ts` | TanStack Query setup |
| `src/api/client.ts` | Fetch client wrapper |
| `src/components/providers/QueryProvider.tsx` | Query provider |

---

**Next:** See [Contributing Guide](./contributing.md) for how to contribute to this project.