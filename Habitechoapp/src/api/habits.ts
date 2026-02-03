import { apiClient } from './client';
import type { ApiResponse, Habit, CreateHabitInput, UpdateHabitInput, PaginatedResponse } from '../types';

// Backend paginated response structure
interface BackendPaginatedResponse<T> {
    success: boolean;
    message: string;
    data: T[];  // Array directly, not wrapped
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const habitsApi = {
    /**
     * GET /api/habits
     * Get all habits with optional filters
     */
    getAll: async (params?: { isActive?: boolean; page?: number; limit?: number; search?: string }) => {
        const response = await apiClient.get<BackendPaginatedResponse<Habit>>('/habits', { params });
        // Backend returns { data: [...], pagination: {...} } directly
        return {
            habits: response.data.data,
            pagination: response.data.pagination
        };
    },

    /**
     * POST /api/habits
     * Create a new habit
     */
    create: async (data: CreateHabitInput) => {
        const response = await apiClient.post<ApiResponse<{ habit: Habit }>>('/habits', data);
        return response.data.data;
    },

    /**
     * GET /api/habits/:id
     * Get a single habit by ID
     */
    getById: async (id: string) => {
        const response = await apiClient.get<ApiResponse<{ habit: Habit }>>(`/habits/${id}`);
        return response.data.data;
    },

    /**
     * PUT /api/habits/:id
     * Update a habit
     */
    update: async (id: string, data: UpdateHabitInput) => {
        const response = await apiClient.put<ApiResponse<{ habit: Habit }>>(`/habits/${id}`, data);
        return response.data.data;
    },

    /**
     * DELETE /api/habits/:id
     * Soft delete a habit
     */
    delete: async (id: string) => {
        const response = await apiClient.delete<ApiResponse<null>>(`/habits/${id}`);
        return response.data;
    }
};
