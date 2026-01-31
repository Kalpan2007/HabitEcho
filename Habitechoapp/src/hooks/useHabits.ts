import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsApi } from '../api/habits';

export function useHabits(isActive = true) {
    return useQuery({
        queryKey: ['habits', { isActive }],
        queryFn: () => habitsApi.getAll({ isActive })
    });
}

export function useCreateHabit() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: habitsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
        }
    });
}
