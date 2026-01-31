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
    },

    log: async (data: any) => {
        const { habitId, ...payload } = data;
        // Check if entry exists for update or create new? 
        // For simple log, we use the create endpoint which usually handles upsert or plain create.
        // If the backend strictly separates create/update based on existing date, we might need logic.
        // Assuming POST /habits/:id/entry handles it.
        const response = await apiClient.post<ApiResponse<{ entry: HabitEntry }>>(`/habits/${habitId}/entry`, payload);
        return response.data;
    }
};
