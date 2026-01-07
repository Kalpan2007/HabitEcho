import { cookies } from 'next/headers';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { habitsApi } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/query-keys';
import { HabitsListClient } from '@/components/habits/HabitsListClient';

// ============================================
// HABITS LIST PAGE
// Server Component - prefetches habits for hydration
// ============================================

interface HabitsPageProps {
  searchParams: Promise<{ isActive?: string; page?: string; q?: string }>;
}

export default async function HabitsPage({ searchParams }: HabitsPageProps) {
  const params = await searchParams;
  const isActive = true;
  const search = params.q || '';
  const page = parseInt(params.page || '1', 10);

  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const options = {
    headers: { Cookie: cookieStore.toString() },
    isActive,
    search: search || undefined,
    page,
    limit: 20
  };

  // Prefetch habits
  await queryClient.prefetchQuery({
    queryKey: [...QUERY_KEYS.habits.all, { isActive, search: search || undefined, page, limit: 20 }],
    queryFn: () => habitsApi.getAll(options)
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HabitsListClient
        initialHabits={[]} // Data will be hydrated from the queryClient
        isActive={isActive}
        search={search}
        page={page}
      />
    </HydrationBoundary>
  );
}
