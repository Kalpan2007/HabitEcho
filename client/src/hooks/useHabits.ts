import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsApi, authApi } from '@/lib/api';
import { devDelay } from '@/lib/dev-delay';
import { QUERY_KEYS } from '@/lib/query-keys';
import type { Habit, CreateHabitInput, UpdateHabitInput } from '@/types';

// Add a predicate to target all history queries for a given habitId
const historyPredicate = (habitId: string) => (query: { queryKey: unknown }) => {
    const key = query.queryKey as unknown[];
    return Array.isArray(key) && key[0] === 'habits' && key[1] === 'history' && key[2] === habitId;
};

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
        onSuccess: async (response) => {
            const newHabitId = response?.data?.habit?.id;
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.all }),
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performance.summary }),
                newHabitId ? queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.detail(newHabitId) }) : Promise.resolve(),
                newHabitId ? queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.performance(newHabitId) }) : Promise.resolve(),
                newHabitId ? queryClient.invalidateQueries({ predicate: historyPredicate(newHabitId) }) : Promise.resolve(),
            ]);
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
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.all }),
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.detail(id) }),
                queryClient.invalidateQueries({ predicate: historyPredicate(id) }),
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.performance(id) }),
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performance.summary }),
            ]);
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
        onSuccess: async (_response, id) => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.all }),
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.performance.summary }),
                id ? queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.detail(id) }) : Promise.resolve(),
                id ? queryClient.invalidateQueries({ queryKey: QUERY_KEYS.habits.performance(id) }) : Promise.resolve(),
                id ? queryClient.invalidateQueries({ predicate: historyPredicate(id) }) : Promise.resolve(),
            ]);
        },
    });
}
