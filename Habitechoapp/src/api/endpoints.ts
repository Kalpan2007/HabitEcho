import { apiClient } from './client';
import type { AuthResponse, ApiResponse, User, SignupInput } from '../types';

export const authApi = {
    login: async (data: { email: string; password: string }) => {
        const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
        return response.data.data;
    },

    signup: async (data: SignupInput) => {
        const response = await apiClient.post<ApiResponse<{ user: User }>>('/auth/signup', data);
        return response.data;
    },

    verifyOtp: async (data: { email: string; otp: string }) => {
        const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/verify-otp', data);
        return response.data.data;
    },

    resendOtp: async (data: { email: string }) => {
        const response = await apiClient.post<ApiResponse<any>>('/auth/resend-otp', data);
        return response.data;
    },

    logout: async () => {
        return apiClient.post('/auth/logout');
    },

    getMe: async () => {
        const response = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
        return response.data.data;
    }
};
