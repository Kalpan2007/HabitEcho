# HabitEcho Documentation

Welcome to the HabitEcho project documentation. This folder contains comprehensive technical documentation covering all aspects of the application from API endpoints to frontend architecture.

## Documentation Structure

```
docs/
├── api/
│   ├── index.md                 # API Overview & Base URL
│   ├── authentication.md        # Auth endpoints detailed
│   ├── habits.md               # Habits CRUD endpoints
│   ├── performance.md          # Analytics & performance endpoints
│   └── errors.md                # Error codes & handling
├── architecture/
│   ├── backend/
│   │   ├── overview.md         # Backend architecture overview
│   │   ├── layers.md           # Controller-Service-Route pattern
│   │   ├── middleware.md       # Middleware explained
│   │   └── security.md         # Security implementation
│   └── frontend/
│       ├── overview.md         # Frontend architecture
│       ├── routing.md          # Next.js routing structure
│       └── state-management.md # Client state handling
├── guides/
│   ├── TanStack-query.md       # React Query best practices
│   ├── authentication-flow.md # Auth flow deep dive
│   ├── error-handling.md      # Error handling patterns
│   └── testing.md             # Testing guidelines
├── database/
│   ├── schema.md              # Database schema overview
│   ├── migrations.md          # Migration guide
│   └── seed-data.md           # Seed data explanation
├── deployment/
│   ├── production.md          # Production checklist
│   ├── environment-vars.md    # Environment variables
│   └── monitoring.md          # Logging & monitoring
├── project/
│   ├── structure.md           # Project folder structure
│   └── contributing.md       # Contribution guidelines
└── README.md                  # This file
```

## Quick Links

- **[API Documentation](./api/index.md)** - Complete API reference with all endpoints
- **[Backend Architecture](./architecture/backend/overview.md)** - Server-side architecture details
- **[Frontend Architecture](./architecture/frontend/overview.md)** - Client-side architecture
- **[TanStack Query Guide](./guides/TanStack-query.md)** - Data fetching patterns
- **[Database Schema](./database/schema.md)** - Database design documentation

## Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** JWT + Refresh Tokens
- **Validation:** Zod
- **Email:** Nodemailer + Brevo/SMTP

### Frontend (Web)
- **Framework:** Next.js 16 (App Router)
- **React:** Version 19
- **Data Fetching:** TanStack Query v5
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts

### Frontend (Mobile)
- **Framework:** React Native (Expo)
- **Navigation:** React Navigation
- **State:** React Query + Context

## Getting Started

1. **Backend Setup:**
   ```bash
   cd server
   npm install
   npm run prisma:migrate
   npm run dev
   ```

2. **Frontend Setup:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. **Mobile App:**
   ```bash
   cd Habitechoapp
   npm install
   npm start
   ```

## Environment Variables

See [Environment Variables Guide](./deployment/environment-vars.md) for required configuration.

## Common Issues & Solutions

Check the [Error Handling Guide](./guides/error-handling.md) for common problems and solutions.