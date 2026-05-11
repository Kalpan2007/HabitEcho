# Frontend Architecture Overview

The HabitEcho frontend is built with Next.js 16 using the App Router, React 19, and TanStack Query v5 for state management and data fetching.

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Next.js | 16.1.1 |
| React | React | 19.2.3 |
| Data Fetching | TanStack Query | 5.90.x |
| Styling | Tailwind CSS | 4.x |
| Charts | Recharts | 3.6.x |
| Date Utils | date-fns | 4.1.x |
| TypeScript | TypeScript | 5.x |

## Project Structure

```
client/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (routes)/           # Route groups
│   │   │   ├── auth/           # Auth pages (login, signup)
│   │   │   ├── dashboard/      # Protected dashboard
│   │   │   ├── features/       # Marketing pages
│   │   │   └── use-cases/      # Use case pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   └── error.tsx           # Error boundary
│   │
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── habits/             # Habit-specific components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── performance/        # Analytics components
│   │   ├── layout/             # Layout components
│   │   ├── charts/             # Chart components
│   │   ├── profile/           # Profile components
│   │   ├── providers/         # Context providers
│   │   └── seo/               # SEO components
│   │
│   ├── lib/                    # Utilities and constants
│   │   ├── constants.ts        # App constants (routes, etc.)
│   │   ├── utils.ts           # Helper functions
│   │   └── seo.config.ts      # SEO configuration
│   │
│   ├── api/                   # API client layer
│   │   ├── client.ts          # Fetch client setup
│   │   ├── endpoints.ts       # API endpoint definitions
│   │   ├── habits.ts          # Habit API functions
│   │   ├── performance.ts     # Performance API functions
│   │   └── auth.ts            # Auth API functions
│   │
│   └── types/                 # TypeScript types
│       └── index.ts           # Shared types
│
├── public/                    # Static assets
├── package.json
├── next.config.js
└── tailwind.config.ts
```

## Architecture Pattern

The frontend follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                            │
│  (React Components)                                                 │
│                                                                      │
│  - Page components (src/app/*/page.tsx)                            │
│  - UI components (Button, Input, Card, etc.)                       │
│  - Feature components (HabitCard, Heatmap, etc.)                  │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      COMPONENT LAYER                               │
│  (Hooks & Logic)                                                    │
│                                                                      │
│  - useQuery / useMutation (TanStack Query)                         │
│  - Custom hooks                                                    │
│  - Client components                                               │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API LAYER                                     │
│  (Data Fetching)                                                   │
│                                                                      │
│  - API client (axios/fetch wrapper)                                │
│  - API functions (getHabits, createHabit, etc.)                   │
│  - Type definitions                                                │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                                  │
│  (Backend API)                                                     │
│                                                                      │
│  Express + Prisma + PostgreSQL                                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## App Router Structure

### Route Hierarchy

```
src/app/
├── page.tsx                          # Landing page (/)
├── layout.tsx                        # Root layout
├── error.tsx                         # Error boundary
├── loading.tsx                      # Loading state
│
├── auth/
│   ├── login/
│   │   └── page.tsx                 # /auth/login
│   ├── signup/
│   │   └── page.tsx                 # /auth/signup
│   └── layout.tsx                   # Auth layout (no header/sidebar)
│
├── dashboard/
│   ├── page.tsx                      # /dashboard (main dashboard)
│   ├── habits/
│   │   ├── page.tsx                  # /dashboard/habits
│   │   ├── new/
│   │   │   └── page.tsx              # /dashboard/habits/new
│   │   └── [id]/
│   │       └── page.tsx              # /dashboard/habits/[id]
│   ├── performance/
│   │   └── page.tsx                  # /dashboard/performance
│   ├── profile/
│   │   └── page.tsx                  # /dashboard/profile
│   ├── layout.tsx                    # Dashboard layout (with sidebar)
│   ├── loading.tsx                   # Dashboard loading
│   └── error.tsx                     # Dashboard error boundary
│
├── features/
│   ├── habit-tracking/
│   │   └── page.tsx                  # /features/habit-tracking
│   └── analytics/
│       └── page.tsx                   # /features/analytics
│
└── use-cases/
    └── daily-habits/
        └── page.tsx                   # /use-cases/daily-habits
```

### Route Groups

Using Next.js route groups for organizing layouts:

```
(auth)       → Auth layout (no header/sidebar)
(dashboard)  → Dashboard layout (with sidebar)
(features)   → Marketing pages
(use-cases)  → Marketing pages
```

---

## Component Patterns

### Page Components

Pages are the top-level components for each route:

```tsx
// src/app/dashboard/habits/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { getHabits } from '@/api/habits';
import { HabitsListClient } from '@/components/habits/HabitsListClient';

export default function HabitsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: getHabits,
  });

  if (isLoading) return <LoadingSkeleton />;

  return <HabitsListClient habits={data?.items || []} />;
}
```

### Client Components

Components that use client-side features (hooks, state):

```tsx
// src/components/habits/HabitCard.tsx
'use client';

import { useState } from 'react';

export function HabitCard({ habit }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card onClick={() => setExpanded(!expanded)}>
      <CardContent>
        <h3>{habit.name}</h3>
      </CardContent>
    </Card>
  );
}
```

### Server Components

Components that render on the server for initial load:

```tsx
// src/components/dashboard/HabitDashboard.tsx
// No 'use client' directive - server component by default

export async function HabitDashboard() {
  // Can fetch data directly on server
  const habits = await getHabits();

  return (
    <div>
      {habits.map(habit => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </div>
  );
}
```

---

## Layout System

### Root Layout

```tsx
// src/app/layout.tsx
import { Inter } from 'next/font/google';
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Auth Layout

```tsx
// src/app/auth/layout.tsx
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {children}
    </div>
  );
}
```

### Dashboard Layout

```tsx
// src/app/dashboard/layout.tsx
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
```

---

## Data Fetching with TanStack Query

### Query Configuration

```tsx
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      gcTime: 10 * 60 * 1000,     // 10 minutes (formerly cacheTime)
      retry: 1,                    // Retry failed requests once
      refetchOnWindowFocus: false, // Don't refetch on window focus
    },
  },
});
```

### Query Provider Setup

```tsx
// src/components/providers/QueryProvider.tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Basic Query Usage

```tsx
// Fetch habits
const { data, isLoading, error } = useQuery({
  queryKey: ['habits'],
  queryFn: () => getHabits(),
});

// Create habit (mutation)
const mutation = useMutation({
  mutationFn: (data) => createHabit(data),
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ['habits'] });
  },
});

// Trigger mutation
mutation.mutate({ name: 'New Habit', ... });
```

---

## Styling with Tailwind CSS

### Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          // ...
          600: '#0284c7',
          700: '#0369a1',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### Component Styling

```tsx
// Using Tailwind classes
function Button({ children, variant = 'primary' }) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition';
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  );
}
```

---

## Error Handling

### Error Boundary

```tsx
// src/app/error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-4">
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### Loading States

```tsx
// src/app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
  );
}
```

---

## SEO Implementation

### Metadata

```tsx
// src/app/page.tsx
export const metadata = {
  title: 'HabitEcho — Best Free Habit Tracker',
  description: 'Build lasting habits with...',
  keywords: 'habit tracker, ...',
  openGraph: {
    title: 'HabitEcho — Best Free Habit Tracker',
    description: '...',
    type: 'website',
  },
};
```

### Structured Data

```tsx
// src/components/seo/StructuredData.tsx
export function FAQSchema({ faqs }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

---

## State Management

### Client State

- **React State:** useState for UI state
- **TanStack Query:** Server state & caching
- **URL State:** Query params for filters

### Server State

All server data managed via TanStack Query:

```tsx
// Automatic caching & invalidation
const { data } = useQuery({
  queryKey: ['habits'],
  queryFn: getHabits,
});

// Invalidate on mutations
await queryClient.invalidateQueries({ queryKey: ['habits'] });
```

---

## Performance Optimizations

### 1. Server Components

Fetch data on server when possible:

```tsx
// Server Component - initial render on server
async function Page() {
  const data = await fetchData();
  return <Component data={data} />;
}
```

### 2. Client-Side Caching

```tsx
// 5 minute stale time
const { data } = useQuery({
  queryKey: ['habits'],
  queryFn: getHabits,
  staleTime: 5 * 60 * 1000,
});
```

### 3. Prefetching

```tsx
// Prefetch on hover
function HabitCard({ habit }) {
  const queryClient = useQueryClient();

  const handleHover = () => {
    queryClient.prefetchQuery({
      queryKey: ['habit', habit.id],
      queryFn: () => getHabit(habit.id),
    });
  };

  return <div onMouseEnter={handleHover} />;
}
```

### 4. Optimistic Updates

```tsx
const mutation = useMutation({
  mutationFn: (data) => createHabit(data),
  onMutate: async (newHabit) => {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey: ['habits'] });

    // Snapshot previous value
    const previousHabits = queryClient.getQueryData(['habits']);

    // Optimistically update
    queryClient.setQueryData(['habits'], (old) => ({
      ...old,
      items: [...old.items, { ...newHabit, id: 'temp' }],
    }));

    return { previousHabits };
  },
  onError: (err, newHabit, context) => {
    // Rollback on error
    queryClient.setQueryData(['habits'], context.previousHabits);
  },
});
```

---

**Next:**
- [Routing Structure](./routing.md) - Detailed routing explanation
- [State Management](./state-management.md) - Client state patterns