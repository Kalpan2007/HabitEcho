import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entriesApi } from '@/lib/api';
import { devDelay } from '@/lib/dev-delay';
import { QUERY_KEYS } from '@/lib/query-keys';
import type { CreateEntryInput, UpdateEntryInput } from '@/types';

const historyPredicate = (habitId: string) => (query: { queryKey: unknown }) => {
    const key = query.queryKey as unknown[];
    return Array.isArray(key) && key[0] === 'habits' && key[1] === 'history' && key[2] === habitId;
};

export function useHabitHistory(habitId: string, options?: { startDate?: string; endDate?: string; limit?: number }) {
    return useQuery({
        queryKey: QUERY_KEYS.habits.history(habitId, options),
        queryFn: () => entriesApi.getHistory(habitId, options),
        enabled: !!habitId,
    });
}

export function useLogEntry(habitId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['entry', 'create', habitId],
        mutationFn: async (input: CreateEntryInput) => {
            await devDelay(1000);
            return entriesApi.create(habitId, input);
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.detail(habitId) }),
                queryClient.invalidateQueries({ predicate: historyPredicate(habitId) }),
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.performance(habitId) }),
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performance.summary })
            ]);
        },
        onError: (error) => {
            // Log detailed error information for debugging
            console.error('[useLogEntry] Failed to create entry:', error);
            console.error('[useLogEntry] Habit ID:', habitId);
            
            // If it's an auth error, suggest user to refresh or re-login
            if (error instanceof Error && error.message.includes('Authentication')) {
                console.error('[useLogEntry] Authentication error detected. User may need to re-login.');
            }
        },
    });
}

export function useUpdateEntry(habitId: string, entryDate: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['entry', 'update', habitId, entryDate],
        mutationFn: async (input: UpdateEntryInput) => {
            await devDelay(1000);
            return entriesApi.update(habitId, entryDate, input);
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.detail(habitId) }),
                queryClient.invalidateQueries({ predicate: historyPredicate(habitId) }),
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.performance(habitId) }),
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performance.summary })
            ]);
        },
    });
}
