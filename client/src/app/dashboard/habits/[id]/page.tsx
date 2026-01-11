import { cookies } from 'next/headers';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/query-keys';
import { habitsApi, performanceApi, entriesApi } from '@/lib/api';
import { HabitDetailsClient } from '@/components/habits/HabitDetailsClient';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HabitDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const queryClient = new QueryClient();

  // Prefetch Habit Detail first to get timezone
  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.habits.detail(id),
    queryFn: () => habitsApi.getById(id, {
      headers: { Cookie: cookieHeader }
    }),
  });

  // Get habit timezone from prefetched data
  const detailRes: any = queryClient.getQueryData(QUERY_KEYS.habits.detail(id));
  const habitTz: string = detailRes?.habit?.timezone || 'UTC';

  // Compute today in habit timezone (YYYY-MM-DD)
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: habitTz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  // Prefetch Habit Performance
  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.habits.performance(id),
    queryFn: () => performanceApi.getHabitPerformance(id, {
      headers: { Cookie: cookieHeader }
    }),
  });

  // Prefetch Today's Entry (using timezone-aware today)
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

  // Robustly check if we have data
  const detailQueryState = queryClient.getQueryState(QUERY_KEYS.habits.detail(id));
  const detailData = detailQueryState?.data as any;

  // Check if API returned success and has habit data
  if (detailQueryState?.status === 'error' || !detailData?.data?.habit) {
    notFound();
  }

  return (
    <HydrationBoundary state={state}>
      <HabitDetailsClient habitId={id} />
    </HydrationBoundary>
  );
}
