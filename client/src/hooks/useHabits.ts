import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsApi, authApi } from '@/lib/api';
import { devDelay } from '@/lib/dev-delay';
import { QUERY_KEYS } from '@/lib/query-keys';
import type { Habit, CreateHabitInput, UpdateHabitInput } from '@/types';

export function useHabits(options?: { isActive?: boolean; limit?: number; page?: number; initialData?: Habit[] }) {
    const { initialData, ...queryOptions } = options || {};
    return useQuery({
        queryKey: [...QUERY_KEYS.habits.all, queryOptions],
        queryFn: () => habitsApi.getAll(queryOptions),
        initialData: initialData ? {
            success: true,
            message: 'Initial data',
            data: initialData,
            pagination: { total: initialData.length, page: 1, limit: options?.limit || 10, totalPages: 1 }
        } as any : undefined,
    });
}

export function useHabitDetail(id: string) {
    return useQuery({
        queryKey: QUERY_KEYS.habits.detail(id),
        queryFn: () => habitsApi.getById(id),
        enabled: !!id,
    });
}

export function useAuthMe() {
    return useQuery({
        queryKey: QUERY_KEYS.auth.me,
        queryFn: () => authApi.me(),
    });
}

export function useCreateHabit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['habit', 'create'],
        mutationFn: async (input: CreateHabitInput) => {
            await devDelay(1000);
            return habitsApi.create(input);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.all });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performance.summary });
        },
    });
}

export function useUpdateHabit(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['habit', 'update', id],
        mutationFn: async (input: UpdateHabitInput) => {
            await devDelay(1000);
            return habitsApi.update(id, input);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.all });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.detail(id) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.performance(id) });
        },
    });
}

export function useDeleteHabit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ['habit', 'delete'],
        mutationFn: async (id: string) => {
            await devDelay(1000);
            return habitsApi.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.all });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performance.summary });
        },
    });
}
