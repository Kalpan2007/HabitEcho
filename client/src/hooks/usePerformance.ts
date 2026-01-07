import { useQuery } from '@tanstack/react-query';
import { performanceApi } from '@/lib/api';
import { QUERY_KEYS } from '@/lib/query-keys';

export function useSummary() {
    return useQuery({
        queryKey: QUERY_KEYS.performance.summary,
        queryFn: () => performanceApi.getSummary(),
    });
}

export function useHabitPerformance(id: string) {
    return useQuery({
        queryKey: QUERY_KEYS.habits.performance(id),
        queryFn: () => performanceApi.getHabitPerformance(id),
        enabled: !!id,
    });
}
