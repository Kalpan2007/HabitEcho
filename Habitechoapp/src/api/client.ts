import axios from 'axios';
import { authStorage } from '../auth/storage';
import Constants from 'expo-constants';

// For Android Emulator -> 10.0.2.2
// For Physical Device -> Use your machine's LAN IP (e.g., 192.168.1.5)
// Ideally this comes from valid env config
// Update this IP to your computer's local IP if testing on physical device
// For Android Emulator, use 'http://10.0.2.2:3001'
// For iOS Simulator, use 'http://localhost:3001'
const BASE_URL = 'http://10.116.100.5:3001/api/v1';

console.log('API Client initialized with Base URL:', BASE_URL);

export const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Inject Token
apiClient.interceptors.request.use(async (config) => {
    const token = await authStorage.getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor: Handle Errors and Token Refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.error('API Error:', error?.config?.url, error.message, error.response?.data);

        const originalRequest = error.config;

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await authStorage.getRefreshToken();
                if (!refreshToken) {
                    console.log('No refresh token available, clearing auth');
                    await authStorage.clearTokens();
                    throw new Error('No refresh token');
                }

                console.log('Attempting to refresh token...');
                // For mobile apps, we need the backend to return tokens in response body
                // Send refresh token in Authorization header
                const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
                    headers: {
                        Authorization: `Bearer ${refreshToken}`,
                    },
                });

                // Check if response contains new tokens in body (mobile-friendly approach)
                const data = response.data?.data;
                if (data?.accessToken && data?.refreshToken) {
                    console.log('Token refresh successful');
                    await authStorage.setTokens(data.accessToken, data.refreshToken);
                    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                    return apiClient(originalRequest);
                } else {
                    console.error('No tokens in refresh response');
                    throw new Error('Invalid refresh response');
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // Refresh failed - Clear tokens
                await authStorage.clearTokens();
                // The auth context will handle navigation to login
            }
        }
        return Promise.reject(error);
    }
);
