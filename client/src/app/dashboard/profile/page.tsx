import { cookies } from 'next/headers';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { habitsApi, authApi, performanceApi } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/query-keys';
import { ProfileClient } from '@/components/profile/ProfileClient';

// ============================================
// PROFILE PAGE
// ============================================

export default async function ProfilePage({
    searchParams
}: {
    searchParams: Promise<{ view?: string }>
}) {
    const params = await searchParams;
    const activeTab = params.view || 'all';

    const queryClient = new QueryClient();
    const cookieStore = await cookies();
    const options = { headers: { Cookie: cookieStore.toString() } };

    // Prefetch all data needed for the profile page
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.auth.me,
            queryFn: () => authApi.me(options)
        }),
        queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.performance.summary,
            queryFn: () => performanceApi.getSummary(options)
        }),
        queryClient.prefetchQuery({
            queryKey: [...QUERY_KEYS.habits.all, { limit: 100 }],
            queryFn: () => habitsApi.getAll({ ...options, limit: 100 })
        })
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProfileClient initialTab={activeTab} />
        </HydrationBoundary>
    );
}
