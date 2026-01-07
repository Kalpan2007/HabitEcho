import { cookies } from 'next/headers';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/lib/constants';
import { QUERY_KEYS } from '@/lib/query-keys';
import { HabitDashboard } from '@/components/dashboard/HabitDashboard';
import { habitsApi, performanceApi } from '@/lib/api';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const queryClient = new QueryClient();

  // Prefetch Performance Summary
  await queryClient.prefetchQuery({
    queryKey: QUERY_KEYS.performance.summary,
    queryFn: () => performanceApi.getSummary({
      headers: { Cookie: cookieHeader }
    }),
  });

  // Prefetch Active Habits
  await queryClient.prefetchQuery({
    queryKey: [...QUERY_KEYS.habits.all, true], // isActive: true
    queryFn: () => habitsApi.getAll({
      isActive: true,
      headers: { Cookie: cookieHeader }
    }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HabitDashboard />
    </HydrationBoundary>
  );
}
