import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'habitecho_access_token';
const REFRESH_TOKEN_KEY = 'habitecho_refresh_token';
const USER_DATA_KEY = 'habitecho_user_data';

export const authStorage = {
    async setTokens(accessToken: string, refreshToken: string) {
        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    },

    async getAccessToken() {
        return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    },

    async getRefreshToken() {
        return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    },

    async clearTokens() {
        await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    },

    async setUser(user: any) {
        await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user));
    },

    async getUser() {
        const data = await SecureStore.getItemAsync(USER_DATA_KEY);
        return data ? JSON.parse(data) : null;
    },

    async clearUser() {
        await SecureStore.deleteItemAsync(USER_DATA_KEY);
    }
};
