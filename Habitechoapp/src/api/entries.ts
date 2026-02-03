import { apiClient } from './client';
import type { ApiResponse, HabitLog, CreateLogInput, UpdateLogInput } from '../types';

export const entriesApi = {
    /**
     * POST /api/habits/:id/log
     * Create a habit log entry
     */
    create: async (habitId: string, data: CreateLogInput) => {
        const response = await apiClient.post<ApiResponse<{ log: HabitLog }>>(`/habits/${habitId}/log`, data);
        return response.data.data;
    },

    /**
     * PUT /api/habits/:id/log/:date
     * Update a habit log entry
     */
    update: async (habitId: string, date: string, data: UpdateLogInput) => {
        const response = await apiClient.put<ApiResponse<{ log: HabitLog }>>(`/habits/${habitId}/log/${date}`, data);
        return response.data.data;
    },

    /**
     * DELETE /api/habits/:id/log/:date
     * Delete a habit log entry
     */
    delete: async (habitId: string, date: string) => {
        const response = await apiClient.delete<ApiResponse<null>>(`/habits/${habitId}/log/${date}`);
        return response.data;
    },

    /**
     * GET /api/habits/:id/history
     * Get habit history/logs
     */
    getHistory: async (habitId: string, params?: { startDate?: string; endDate?: string; page?: number; limit?: number }) => {
        const response = await apiClient.get<ApiResponse<{ logs: HabitLog[]; pagination: any }>>(`/habits/${habitId}/history`, { params });
        return response.data.data;
    },

    /**
     * Convenience method to log a habit (create or update)
     */
    log: async (habitId: string, data: CreateLogInput) => {
        // Try to create, if it exists it will fail and we can update
        try {
            return await entriesApi.create(habitId, data);
        } catch (error: any) {
            // If entry already exists, update it
            if (error.response?.status === 409 || error.response?.status === 400) {
                return await entriesApi.update(habitId, data.date, data);
            }
            throw error;
        }
    }
};
