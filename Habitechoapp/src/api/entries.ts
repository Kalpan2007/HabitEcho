import { apiClient } from './client';
import type { ApiResponse, HabitEntry } from '../types';

export const entriesApi = {
    create: async (habitId: string, data: any) => {
        const response = await apiClient.post<ApiResponse<{ entry: HabitEntry }>>(`/habits/${habitId}/entry`, data);
        return response.data;
    },

    update: async (habitId: string, date: string, data: any) => {
        const response = await apiClient.put<ApiResponse<{ entry: HabitEntry }>>(`/habits/${habitId}/entry/${date}`, data);
        return response.data;
    },

    delete: async (habitId: string, date: string) => {
        await apiClient.delete(`/habits/${habitId}/entry/${date}`);
    }
};
