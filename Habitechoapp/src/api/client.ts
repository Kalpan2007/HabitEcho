import axios from 'axios';
import { authStorage } from '../auth/storage';
import Constants from 'expo-constants';

// For Android Emulator -> 10.0.2.2
// For Physical Device -> Use your machine's LAN IP (e.g., 192.168.1.5)
// Ideally this comes from valid env config
// Update this IP to your computer's local IP if testing on physical device
// For Android Emulator, use 'http://10.0.2.2:3001'
// For iOS Simulator, use 'http://localhost:3001'
const BASE_URL = 'http://10.239.64.5:3001/api/v1';

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

// Response Interceptor: Handle Refresh
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
                if (!refreshToken) throw new Error('No refresh token');

                // Manually allow "Cookie" header (requires specific backend acceptance or permissive fetch)
                // Note: Expo/RN Axios usually allows setting Cookie header manually
                const response = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
                    headers: {
                        Cookie: `habitecho_refresh=${refreshToken}`,
                    },
                });

                // Extract new tokens from Set-Cookie headers
                // Axios response.headers is usually an object with lowercase keys
                const setCookie = response.headers['set-cookie'];
                let newAccessToken = '';
                let newRefreshToken = '';

                if (Array.isArray(setCookie)) {
                    setCookie.forEach(cookie => {
                        if (cookie.includes('habitecho_access=')) {
                            newAccessToken = cookie.split('habitecho_access=')[1].split(';')[0];
                        }
                        if (cookie.includes('habitecho_refresh=')) {
                            newRefreshToken = cookie.split('habitecho_refresh=')[1].split(';')[0];
                        }
                    });
                }

                if (newAccessToken && newRefreshToken) {
                    await authStorage.setTokens(newAccessToken, newRefreshToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - Logout user
                await authStorage.clearTokens();
                // Here we might need to trigger a global event or rely on the next auth check
            }
        }
        return Promise.reject(error);
    }
);
