import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsApi } from '../api/habits';

export function useHabits(params?: { isActive?: boolean; page?: number; limit?: number }) {
    return useQuery({
        queryKey: ['habits', params],
        queryFn: () => habitsApi.getAll(params)
    });
}

export function useCreateHabit() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: habitsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            queryClient.invalidateQueries({ queryKey: ['performance'] });
        }
    });
}

export function useUpdateHabit() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => habitsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            queryClient.invalidateQueries({ queryKey: ['performance'] });
        }
    });
}

export function useDeleteHabit() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => habitsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            queryClient.invalidateQueries({ queryKey: ['performance'] });
        }
    });
}
