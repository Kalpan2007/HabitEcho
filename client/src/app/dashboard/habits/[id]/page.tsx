import { cookies } from 'next/headers';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/query-keys';
import { habitsApi, performanceApi, entriesApi } from '@/lib/api';
import { HabitDetailsClient } from '@/components/habits/HabitDetailsClient';
import { getToday } from '@/lib/utils';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HabitDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const queryClient = new QueryClient();

  const today = getToday();

  // Prefetch Habit Detail
  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.habits.detail(id),
    queryFn: () => habitsApi.getById(id, {
      headers: { Cookie: cookieHeader }
    }),
  });

  // Prefetch Habit Performance
  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.habits.performance(id),
    queryFn: () => performanceApi.getHabitPerformance(id, {
      headers: { Cookie: cookieHeader }
    }),
  });

  // Prefetch Today's Entry
  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.habits.history(id, {
      startDate: today,
      endDate: today,
      limit: 1
    }),
    queryFn: () => entriesApi.getHistory(id, {
      startDate: today,
      endDate: today,
      limit: 1,
      headers: { Cookie: cookieHeader }
    }),
  });

  const state = dehydrate(queryClient);
  const detailData: any = state.queries.find(q =>
    JSON.stringify(q.queryKey) === JSON.stringify(QUERY_KEYS.habits.detail(id))
  )?.state.data;

  if (!detailData) {
    notFound();
  }

  return (
    <HydrationBoundary state={state}>
      <HabitDetailsClient habitId={id} />
    </HydrationBoundary>
  );
}
