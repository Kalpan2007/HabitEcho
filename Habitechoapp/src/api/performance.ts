import { apiClient } from './client';
import type { ApiResponse, PerformanceSummary, HabitPerformance } from '../types';

export const performanceApi = {
    /**
     * GET /api/performance/summary
     * Get overall performance summary
     */
    getSummary: async () => {
        const response = await apiClient.get<ApiResponse<{ summary: PerformanceSummary }>>('/performance/summary');
        return response.data.data;
    },

    /**
     * GET /api/performance/habits
     * Get performance for all habits
     */
    getHabitsPerformance: async (params?: { page?: number; limit?: number }) => {
        const response = await apiClient.get<ApiResponse<{ habits: HabitPerformance[]; pagination: any }>>('/performance/habits', { params });
        return response.data.data;
    },

    /**
     * GET /api/performance/habits/:id
     * Get performance for a specific habit
     */
    getHabitPerformance: async (habitId: string, params?: { startDate?: string; endDate?: string }) => {
        const response = await apiClient.get<ApiResponse<{ performance: HabitPerformance }>>(`/performance/habits/${habitId}`, { params });
        return response.data.data;
    }
};
