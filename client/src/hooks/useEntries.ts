import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entriesApi } from '@/lib/api';
import { devDelay } from '@/lib/dev-delay';
import { QUERY_KEYS } from '@/lib/query-keys';
import type { CreateEntryInput, UpdateEntryInput } from '@/types';

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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.history(habitId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.performance(habitId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performance.summary });
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.history(habitId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.performance(habitId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performance.summary });
        },
    });
}
