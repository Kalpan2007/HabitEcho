import { apiClient } from './client';
import type { ApiResponse, Habit } from '../types';

export const habitsApi = {
    getAll: async (params?: { isActive?: boolean }) => {
        const response = await apiClient.get<ApiResponse<Habit[]>>('/habits', { params });
        return response.data;
    },

    create: async (data: any) => {
        const response = await apiClient.post<ApiResponse<{ habit: Habit }>>('/habits', data);
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<{ habit: Habit }>>(`/habits/${id}`);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await apiClient.put<ApiResponse<{ habit: Habit }>>(`/habits/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        await apiClient.delete(`/habits/${id}`);
    }
};
