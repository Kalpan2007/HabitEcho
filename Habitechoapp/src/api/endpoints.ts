import { apiClient } from './client';
import type { AuthResponse, ApiResponse, User, SignupInput } from '../types';

export const authApi = {
    login: async (data: any) => {
        const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
        return response.data.data;
    },

    signup: async (data: SignupInput) => {
        const response = await apiClient.post<ApiResponse<{ message: string, email: string }>>('/auth/signup', data);
        return response.data;
    },

    verifyOtp: async (data: any) => {
        const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/verify-otp', data);
        return response.data.data;
    },

    logout: async () => {
        // We send the cookie manually if we have it, or just rely on secure store clearing
        return apiClient.post('/auth/logout');
    },

    getMe: async () => {
        const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
        return response.data.data;
    }
};
