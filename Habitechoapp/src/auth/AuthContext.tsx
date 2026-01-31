import React, { createContext, useState, useEffect, useContext } from 'react';
import { authStorage } from './storage';
import { authApi } from '../api/endpoints';
import type { User } from '../types';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signIn: (tokens: { accessToken: string; refreshToken: string }, user: User) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStorageData();
    }, []);

    async function loadStorageData() {
        try {
            const storedUser = await authStorage.getUser();
            const token = await authStorage.getAccessToken();

            if (storedUser && token) {
                // Optional: Verify token with backend
                try {
                    const { user: freshUser } = await authApi.getMe();
                    setUser(freshUser);
                    await authStorage.setUser(freshUser);
                } catch (e) {
                    // Token might be expired but refresh logic in client.ts should handle it.
                    // If we fall through here, it means even refresh failed.
                    setUser(null);
                    await authStorage.clearTokens();
                    await authStorage.clearUser();
                }
            }
        } catch (e) {
            console.error('Failed to load auth storage', e);
        } finally {
            setIsLoading(false);
        }
    }

    const signIn = async (tokens: { accessToken: string; refreshToken: string }, userData: User) => {
        await authStorage.setTokens(tokens.accessToken, tokens.refreshToken);
        await authStorage.setUser(userData);
        setUser(userData);
    };

    const signOut = async () => {
        try {
            await authApi.logout();
        } catch (e) {
            console.log('Logout API failed, clearing local only');
        }
        await authStorage.clearTokens();
        await authStorage.clearUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
