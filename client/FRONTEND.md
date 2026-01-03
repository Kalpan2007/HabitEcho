# HabitEcho Frontend Architecture Documentation

## Overview

HabitEcho is a **private, personal habit monitoring web application** built with Next.js 15+ (App Router), React 19, and TypeScript. This document explains the complete frontend architecture, patterns, and design decisions.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture Overview](#architecture-overview)
3. [Folder Structure](#folder-structure)
4. [Rendering Strategy](#rendering-strategy)
5. [Component Architecture](#component-architecture)
6. [Data Flow](#data-flow)
7. [Authentication](#authentication)
8. [Form Handling](#form-handling)
9. [Toast Notifications](#toast-notifications)
10. [Error Handling](#error-handling)
11. [Styling System](#styling-system)
12. [Design Philosophy](#design-philosophy)

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.1 | React framework with App Router |
| **React** | 19.2.3 | UI library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **Native Fetch API** | - | HTTP requests (no axios) |

### Constraints (by design)

| What | Why |
|------|-----|
| No UI component libraries | Custom components for full control |
| No state management libraries | React Server Components + URL state |
| App Router only | Modern Next.js patterns |
| Server Components by default | Better performance, reduced JS bundle |
| Server Actions for mutations | Type-safe form handling |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      BROWSER REQUEST                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS APP ROUTER                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                     layout.tsx                         │   │
│  │  - Root HTML structure                                 │   │
│  │  - ToastProvider context                               │   │
│  │  - Global CSS imports                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
│                              ▼                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              SERVER COMPONENTS (default)               │   │
│  │  - Fetch data directly                                 │   │
│  │  - No JavaScript shipped to client                     │   │
│  │  - Can use async/await at component level              │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
│                              ▼                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           CLIENT COMPONENTS ('use client')             │   │
│  │  - Interactive forms                                   │   │
│  │  - useActionState for form state                       │   │
│  │  - useTransition for pending states                    │   │
│  │  - Toast notifications                                 │   │
│  │  - Backfilling missed days (date picker)               │   │
│  │                                                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVER ACTIONS                           │
│  - Form validation                                           │
│  - API calls to backend                                      │
│  - Cache revalidation                                        │
│  - Redirects                                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND API                              │
│              (Express.js + PostgreSQL)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
client/src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with ToastProvider
│   ├── page.tsx                  # Root redirect
│   ├── error.tsx                 # Global error boundary
│   ├── loading.tsx               # Global loading state
│   ├── not-found.tsx             # 404 page
│   ├── globals.css               # Global styles and design tokens
│   │
│   ├── auth/                     # Authentication routes
│   │   ├── layout.tsx            # Auth layout (centered card)
│   │   ├── login/page.tsx        # Login form
│   │   ├── signup/page.tsx       # Signup form

│   │
│   └── dashboard/                # Protected routes
│       ├── layout.tsx            # Dashboard layout with auth check
│       ├── page.tsx              # Dashboard overview
│       ├── loading.tsx           # Dashboard skeleton
│       ├── habits/
│       │   ├── page.tsx          # Habits list
│       │   ├── loading.tsx       # Habits skeleton
│       │   ├── new/page.tsx      # New habit form
│       │   └── [id]/page.tsx     # Habit detail
│       └── performance/
│           ├── page.tsx          # Performance analytics
│           └── loading.tsx       # Performance skeleton
│
├── actions/                      # Server Actions
│   ├── auth.actions.ts           # Auth mutations
│   ├── habit.actions.ts          # Habit CRUD
│   └── entry.actions.ts          # Entry logging
│
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── index.ts              # Barrel export
│   │   ├── Button.tsx            # Button with variants
│   │   ├── Input.tsx             # Form input
│   │   ├── Select.tsx            # Dropdown select
│   │   ├── Textarea.tsx          # Multi-line input
│   │   ├── Card.tsx              # Card containers
│   │   ├── Badge.tsx             # Status badges
│   │   ├── Skeleton.tsx          # Loading skeletons
│   │   └── Toast.tsx             # Toast notifications
│   │
│   ├── layout/                   # Layout components
│   │   ├── index.ts
│   │   ├── Sidebar.tsx           # Desktop navigation
│   │   ├── MobileNav.tsx         # Mobile bottom nav
│   │   └── Header.tsx            # Top header with user menu
│   │
│   ├── habits/                   # Habit-specific components
│   │   ├── index.ts
│   │   ├── TodayHabitActions.tsx # Quick done/not-done buttons
│   │   ├── HabitEntryForm.tsx    # Full entry logging form
│   │   └── HabitActions.tsx      # Toggle active, delete
│   │
│   └── performance/              # Analytics components
│       ├── index.ts
│       ├── Heatmap.tsx           # Activity heatmap
│       └── HabitPerformanceCard.tsx
│
├── lib/                          # Utilities and helpers
│   ├── constants.ts              # API URL, routes, options
│   ├── utils.ts                  # Date, schedule, status helpers
│   ├── api.ts                    # Backend API fetch helpers
│   └── auth.ts                   # Server-side auth utilities
│
└── types/                        # TypeScript types
    └── index.ts                  # All type definitions
```

---

## Rendering Strategy

### Server Components (Default)

All components are Server Components by default. They:
- Fetch data directly using `async/await`
- Never ship JavaScript to the client
- Can access server-only resources (cookies, env vars)

```tsx
// app/dashboard/page.tsx - Server Component
export default async function DashboardPage() {
  // Direct data fetching - no useEffect needed
  const user = await requireAuth();
  const summary = await performanceApi.getSummary();
  
  return (
    <div>
      <h1>Welcome, {user.fullName}</h1>
      <StatCard label="Completion Rate" value={summary.completionRate} />
    </div>
  );
}
```

### Client Components

Components that need interactivity use `'use client'` directive:

```tsx
// components/habits/TodayHabitActions.tsx - Client Component
'use client';

import { useTransition, useState } from 'react';
import { quickLogEntryAction } from '@/actions/entry.actions';
import { getToday } from '@/lib/utils';

export function TodayHabitActions({ habitId, currentStatus }) {
  const [isPending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState(getToday());
  
  const handleQuickLog = (status) => {
    startTransition(async () => {
      // Log for the selected date, not just today
      await quickLogEntryAction(habitId, selectedDate, status);
    });
  };
  
  return (
    <div>
      <input type="date" value={selectedDate} onChange={...} />
      <button onClick={() => handleQuickLog('DONE')}>Done</button>
    </div>
  );
}
```

### When to Use Client Components

| Use Client Component | Use Server Component |
|---------------------|---------------------|
| Form inputs | Data display |
| onClick/onChange handlers | Static content |
| useEffect, useState | Database queries |
| useActionState | Cookie/session access |
| Browser APIs | Redirects |
| Toast notifications | - |

---

## Component Architecture

### UI Component Pattern

All UI components follow this pattern:

```tsx
// components/ui/Button.tsx
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'base-styles',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  );
}
```

### Component Composition

```tsx
// Dashboard layout composition
<DashboardLayout>          {/* Auth check + layout */}
  <Sidebar />              {/* Desktop nav - Server Component */}
  <Header user={user} />   {/* User menu - Client Component */}
  <MobileNav />            {/* Mobile nav - Server Component */}
  {children}               {/* Page content */}
</DashboardLayout>
```

---

## Data Flow

### Reading Data (Server Components)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Server Page    │────▶│   lib/api.ts    │────▶│  Backend API    │
│  (async)        │     │  (fetch helper) │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

```tsx
// Direct fetch in Server Component
const habits = await habitsApi.getAll({ isActive: true });
```

### Mutating Data (Server Actions)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Client Form    │────▶│  Server Action  │────▶│  Backend API    │
│  (useActionState)│     │  (validation)   │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐     ┌─────────────────┐
│  Toast/Error    │     │  revalidatePath │
│  Display        │     │  (cache bust)   │
└─────────────────┘     └─────────────────┘
```

---

## Authentication

### HttpOnly Cookie Authentication

Authentication uses **HttpOnly cookies only** - no localStorage or sessionStorage.

```tsx
// lib/auth.ts
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: 'include',
    headers: { Cookie: cookieHeader },
    cache: 'no-store',  // Always fresh user data
  });
  
  if (!response.ok) return null;
  const data = await response.json();
  return data.data;
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');
  return user;
}
```

### Protected Routes

```tsx
// app/dashboard/layout.tsx
export default async function DashboardLayout({ children }) {
  const user = await requireAuth();  // Redirects if not authenticated
  
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <Header user={user} />
      {children}
    </div>
  );
}
```

---

## Form Handling

### Server Actions Pattern

```tsx
// actions/habit.actions.ts
'use server';

export async function createHabitAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // 1. Extract data
  const input = {
    name: formData.get('name') as string,
    frequency: formData.get('frequency') as Frequency,
  };
  
  // 2. Validate
  const errors: Record<string, string[]> = {};
  if (!input.name) errors.name = ['Name is required'];
  
  if (Object.keys(errors).length > 0) {
    return { success: false, message: 'Please fix errors', errors };
  }
  
  // 3. API call
  const result = await apiRequest('/habits', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  
  if (!result.success) {
    return { success: false, message: result.message };
  }
  
  // 4. Revalidate cache and redirect
  revalidatePath('/dashboard/habits');
  redirect('/dashboard/habits');
}
```

### Client Form Pattern

```tsx
// app/dashboard/habits/new/page.tsx
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { createHabitAction } from '@/actions/habit.actions';
import { useToast } from '@/components/ui';

export default function NewHabitPage() {
  const [state, formAction, isPending] = useActionState(
    createHabitAction,
    { success: false, message: '' }
  );
  
  const { success, error } = useToast();
  const prevStateRef = useRef(state);
  
  // Show toast on state change
  useEffect(() => {
    if (state === prevStateRef.current) return;
    prevStateRef.current = state;
    
    if (state.message) {
      if (state.success) {
        success('Habit created!', state.message);
      } else {
        error('Failed', state.message);
      }
    }
  }, [state, success, error]);
  
  return (
    <form action={formAction}>
      <Input name="name" error={state.errors?.name?.[0]} />
      <Button type="submit" isLoading={isPending}>Create</Button>
    </form>
  );
}
```

---

## Toast Notifications

### Toast System Architecture

```
┌─────────────────┐
│  ToastProvider  │  (Root layout - provides context)
│  (Context)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ToastContainer │  (Fixed position, renders toasts)
│  (Portal)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   ToastItem     │  (Individual toast with animation)
│   (Component)   │
└─────────────────┘
```

### Toast Usage

```tsx
import { useToast } from '@/components/ui';

function MyComponent() {
  const { success, error, warning, info } = useToast();
  
  const handleAction = async () => {
    const result = await someAction();
    if (result.success) {
      success('Done!', 'Action completed successfully');
    } else {
      error('Failed', result.message);
    }
  };
}
```

### Toast Types

| Type | Color | Duration | Use Case |
|------|-------|----------|----------|
| `success` | Green | 5s | Successful operations |
| `error` | Red | 7s | Failed operations |
| `warning` | Amber | 5s | Warnings |
| `info` | Blue | 5s | Informational |

---

## Error Handling

### Error Boundaries

```tsx
// app/error.tsx - Global error boundary
'use client';

export default function Error({ error, reset }) {
  return (
    <div className="error-page">
      <h1>Something went wrong</h1>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

### Loading States

```tsx
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <SkeletonStatCard />
      <SkeletonCard />
    </div>
  );
}
```

### 404 Page

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="error-page">
      <p className="text-6xl">404</p>
      <h1>Page not found</h1>
    </div>
  );
}
```

---

## Styling System

### Tailwind CSS with Design Tokens

```css
/* globals.css */
:root {
  /* Brand colors */
  --color-primary: #4f46e5;
  --color-primary-hover: #4338ca;
  
  /* Status colors */
  --color-success: #10b981;
  --color-error: #ef4444;
  
  /* Spacing scale */
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  
  /* Transitions */
  --transition-fast: 150ms ease;
}
```

### Utility Function

```tsx
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Component Styling

```tsx
<button
  className={cn(
    // Base styles
    'inline-flex items-center justify-center rounded-lg font-medium',
    'transition-colors focus-visible:outline-none focus-visible:ring-2',
    // Variant styles
    variant === 'primary' && 'bg-indigo-600 text-white hover:bg-indigo-700',
    variant === 'outline' && 'border border-gray-300 bg-white hover:bg-gray-50',
    // Size styles
    size === 'sm' && 'h-8 px-3 text-sm',
    size === 'md' && 'h-10 px-4 text-sm',
    // Custom overrides
    className
  )}
/>
```

---

## Design Philosophy

### Core Principles

| Principle | Implementation |
|-----------|---------------|
| **Calm** | Neutral colors, minimal animations |
| **Focused** | One action per screen, clear hierarchy |
| **Professional** | Clean typography, consistent spacing |
| **Private-first** | No tracking, no analytics, local-first mindset |
| **Data clarity** | Numbers > decorations, clear status indicators |

### Color Palette

```
Primary:    Indigo (#4f46e5)     - Actions, links
Success:    Emerald (#10b981)    - Done, positive
Warning:    Amber (#f59e0b)      - Partial, attention
Error:      Red (#ef4444)        - Failed, negative
Neutral:    Gray (#6b7280)       - Text, borders
Background: Gray-50 (#f9fafb)    - Page background
Surface:    White (#ffffff)      - Cards, inputs
```

### Responsive Design

```
Mobile-first approach:
- sm (640px): Small tablets
- md (768px): Tablets
- lg (1024px): Desktop
- xl (1280px): Large desktop

Mobile: Bottom navigation
Desktop: Sidebar navigation
```

---

## Hydration Mismatch Prevention

### Common Causes

1. **Browser extensions** - Modify HTML before React hydration
2. **Date/time values** - Server vs client timezone
3. **Math.random()** - Different on server and client

### Solutions Applied

```tsx
// app/layout.tsx
<html lang="en" suppressHydrationWarning>
  {/* Prevents hydration errors from browser extensions */}
```

```tsx
// Use stable date formatting
const getToday = () => new Date().toISOString().split('T')[0];
// Returns YYYY-MM-DD which is timezone-agnostic
```

---

## Running the Frontend

### Development

```bash
cd client
npm install
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

---

## Summary

HabitEcho frontend is built with:

- ✅ **Server Components** - Default for all data fetching
- ✅ **Server Actions** - Type-safe mutations with validation
- ✅ **HttpOnly Cookies** - Secure authentication
- ✅ **Toast System** - User feedback for all operations
- ✅ **Error Boundaries** - Graceful error handling
- ✅ **Loading States** - Skeleton loaders everywhere
- ✅ **No External Dependencies** - Custom UI components
- ✅ **TypeScript Strict** - Full type safety
- ✅ **Mobile-first** - Responsive design
