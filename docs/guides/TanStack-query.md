# TanStack Query Guide

This guide covers best practices for using TanStack Query (React Query) v5 in the HabitEcho frontend.

## Overview

TanStack Query manages **server state** - data that comes from the backend API. It handles:
- Fetching data from APIs
- Caching responses
- Optimistic updates
- Background refetching
- Error handling

## Setup

### Query Client Configuration

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time before data is considered stale
      staleTime: 5 * 60 * 1000, // 5 minutes

      // Time before unused data is garbage collected
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

      // Number of retries on failure
      retry: 1,

      // Don't refetch when window regains focus
      refetchOnWindowFocus: false,

      // Don't refetch on mount if data exists
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});
```

### Provider Setup

```tsx
// src/components/providers/QueryProvider.tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## Basic Queries

### Fetching Data

```tsx
import { useQuery } from '@tanstack/react-query';
import { getHabits } from '@/api/habits';

function HabitsList() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['habits'],
    queryFn: getHabits,
  });

  if (isLoading) return <Skeleton />;

  if (isError) return <ErrorMessage message={error.message} />;

  return (
    <ul>
      {data?.items.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </ul>
  );
}
```

### Query Options

```typescript
const query = useQuery({
  // Required - unique key for this query
  queryKey: ['habits'],

  // Required - function that returns a promise
  queryFn: getHabits,

  // Optional configurations
  enabled: boolean,        // Only run if true
  staleTime: number,       // Time before refetch needed
  gcTime: number,         // Garbage collection time
  refetchOnWindowFocus: boolean,
  refetchOnMount: boolean,
  refetchInterval: number, // Polling interval (ms)
  retry: number | false,
  select: (data) => transformedData, // Transform data
});
```

---

## Mutations

### Creating Data

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreateHabitForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createHabit,
    onSuccess: () => {
      // Invalidate and refetch habits list
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      // Or manually set data
      // queryClient.setQueryData(['habits'], (old) => ...)
    },
    onError: (error) => {
      // Handle error
      toast.error(error.message);
    },
  });

  const handleSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input {...register('name')} />
      {mutation.isPending && <Spinner />}
      <button type="submit" disabled={mutation.isPending}>
        Create Habit
      </button>
    </form>
  );
}
```

### Updating Data

```tsx
function UpdateHabitButton({ habitId }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => updateHabit(habitId, data),
    onSuccess: (updatedHabit) => {
      // Update specific item in cache
      queryClient.setQueryData(['habits'], (old) => ({
        ...old,
        items: old.items.map((h) =>
          h.id === habitId ? { ...h, ...updatedHabit } : h
        ),
      }));
    },
  });

  return <button onClick={() => mutation.mutate({ name: 'New Name' })} />;
}
```

### Deleting Data

```tsx
function DeleteHabitButton({ habitId }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => deleteHabit(habitId),
    onSuccess: () => {
      // Remove from cache
      queryClient.setQueryData(['habits'], (old) => ({
        ...old,
        items: old.items.filter((h) => h.id !== habitId),
      }));
    },
  });

  return <button onClick={() => mutation.mutate()} />;
}
```

---

## Optimistic Updates

Optimistic updates provide instant feedback while the server processes the request.

### Create with Optimistic Update

```tsx
function CreateHabitForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createHabit,
    onMutate: async (newHabit) => {
      // 1. Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['habits'] });

      // 2. Snapshot current value
      const previousHabits = queryClient.getQueryData(['habits']);

      // 3. Optimistically update
      queryClient.setQueryData(['habits'], (old) => ({
        ...old,
        items: [
          ...old.items,
          { ...newHabit, id: 'temp-' + Date.now() },
        ],
      }));

      // 4. Return context for rollback
      return { previousHabits };
    },
    onError: (err, newHabit, context) => {
      // Rollback on error
      queryClient.setQueryData(['habits'], context.previousHabits);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}
```

### Update with Optimistic Update

```tsx
function ToggleHabitComplete({ habit }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => toggleHabitComplete(habit.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['habits'] });

      const previousHabits = queryClient.getQueryData(['habits']);

      queryClient.setQueryData(['habits'], (old) => ({
        ...old,
        items: old.items.map((h) =>
          h.id === habit.id
            ? { ...h, completed: !h.completed }
            : h
        ),
      }));

      return { previousHabits };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['habits'], context.previousHabits);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}
```

---

## Query Keys

### Naming Convention

```typescript
// Format: [resource, filters?]
queryKey: ['habits']
queryKey: ['habits', habitId]
queryKey: ['habits', { status: 'active', page: 1 }]
queryKey: ['performance', 'summary']
queryKey: ['performance', 'habit', habitId]
```

### Examples

```typescript
// List query
useQuery({ queryKey: ['habits'], ... })

// Single item
useQuery({ queryKey: ['habits', id], ... })

// Filtered list
useQuery({
  queryKey: ['habits', { archived: true }],
  ...
})

// Nested resource
useQuery({
  queryKey: ['habits', habitId, 'logs'],
  ...
})
```

---

## Pagination

### Manual Pagination

```tsx
function PaginatedHabits() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['habits', page],
    queryFn: () => getHabits({ page, limit: 10 }),
  });

  return (
    <>
      {data?.items.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
      <Pagination
        currentPage={page}
        totalPages={data?.pagination.totalPages}
        onPageChange={setPage}
      />
    </>
  );
}
```

### Infinite Scroll (Placeholder for future implementation)

```tsx
// Future: useInfiniteQuery
function InfiniteHabits() {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['habits', 'infinite'],
    queryFn: getHabits,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  return (
    <InfiniteScroll onLoadMore={fetchNextPage}>
      {data?.pages.map((page) => (
        page.items.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))
      ))}
    </InfiniteScroll>
  );
}
```

---

## Prefetching

### Prefetch on Hover

```tsx
function HabitCard({ habit }) {
  const queryClient = useQueryClient();

  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: ['habit', habit.id],
      queryFn: () => getHabit(habit.id),
    });
  };

  return (
    <div onMouseEnter={handleMouseEnter}>
      <HabitContent habit={habit} />
    </div>
  );
}
```

### Prefetch in Layout

```tsx
// src/app/dashboard/layout.tsx
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

export default async function DashboardLayout({ children }) {
  const queryClient = new QueryClient();

  // Prefetch dashboard data on server
  await queryClient.prefetchQuery({
    queryKey: ['habits'],
    queryFn: getHabits,
  });

  await queryClient.prefetchQuery({
    queryKey: ['performance', 'summary'],
    queryFn: getPerformanceSummary,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
```

---

## Error Handling

### Global Error Handler

```tsx
// Error boundary component
function QueryErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <div>
          <p>Something went wrong</p>
          <button onClick={reset}>Try again</button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### Per-Query Error Handling

```tsx
function HabitsList() {
  const { data, isError, error } = useQuery({
    queryKey: ['habits'],
    queryFn: getHabits,
    retry: 3, // Retry 3 times before showing error
  });

  if (isError) {
    if (error.code === 'UNAUTHENTICATED') {
      return <Redirect to="/login" />;
    }
    return <ErrorDisplay message={error.message} />;
  }

  return <HabitList items={data?.items} />;
}
```

---

## DevTools

### React Query Devtools

```tsx
// In development only
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {
  return (
    <QueryClientProvider>
      <AppContent />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### DevTools Features

- View all queries and their state
- Inspect query data
- Manually refetch queries
- Clear specific queries or all cache
- View query timing

---

## Best Practices

### 1. Use the Query Key Properly

```typescript
// ✅ Good - descriptive, consistent
queryKey: ['habits', habitId, 'logs']

// ❌ Bad - magic strings
queryKey: ['habit-logs', 'list', habitId]
```

### 2. Don't Over-Fetch

```typescript
// ✅ Good - specific key for specific data
queryKey: ['habits', habitId]

// ❌ Bad - too broad, causes unnecessary refetches
queryKey: ['habits']
```

### 3. Handle Loading/Error States

```tsx
// ✅ Good - explicit states
if (isLoading) return <Skeleton />;
if (isError) return <Error />;
return <Data data={data} />;

// ❌ Bad - no loading state
return <Data data={data} />;
```

### 4. Use Optimistic Updates

```typescript
// ✅ Good - instant feedback
onMutate: async (newData) => {
  queryClient.setQueryData(['habits'], (old) => ({
    ...old,
    items: [...old.items, newData],
  }));
}

// ❌ Bad - wait for server response
// User sees delay between action and update
```

### 5. Invalidate After Mutations

```typescript
// ✅ Good - ensures data consistency
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['habits'] });
}

// ⚠️ Be specific - invalidate only what's needed
queryClient.invalidateQueries({ queryKey: ['habits'] });
queryClient.invalidateQueries({ queryKey: ['performance'] });
```

### 6. Keep Query Functions Pure

```typescript
// ✅ Good - pure function
async function getHabits() {
  const response = await fetch('/api/v1/habits');
  return response.json();
}

// ❌ Bad - side effects
async function getHabits() {
  const response = await fetch('/api/v1/habits');
  setGlobalState(response.data); // Side effect!
  return response.json();
}
```

---

## API Layer Integration

### API Functions

```typescript
// src/api/habits.ts

export async function getHabits(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<ApiResponse<HabitList>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.search) searchParams.set('search', params.search);

  const response = await fetchClient.get(`/habits?${searchParams}`);
  return response.data;
}

export async function createHabit(data: CreateHabitRequest): Promise<Habit> {
  const response = await fetchClient.post('/habits', data);
  return response.data;
}

export async function getHabit(id: string): Promise<Habit> {
  const response = await fetchClient.get(`/habits/${id}`);
  return response.data;
}
```

### Using in Components

```tsx
function HabitsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: () => getHabits({ page: 1, limit: 20 }),
  });

  const createMutation = useMutation({
    mutationFn: createHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });

  return (
    <div>
      <CreateHabitForm onSubmit={createMutation.mutate} />
      <HabitList habits={data?.items} isLoading={isLoading} />
    </div>
  );
}
```

---

## Testing

### Mocking Queries

```typescript
// In tests
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

render(<HabitsList />, { wrapper });

await waitFor(() => {
  expect(screen.getByText('Habit 1')).toBeInTheDocument();
});
```

---

**Next:** See [Authentication Flow](./authentication-flow.md) for auth implementation details.