import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_BASE_URL, ROUTES } from './constants';
import type { User, ApiResponse } from '@/types';

// ============================================
// SERVER-SIDE AUTH UTILITIES
// ============================================

// Timeout for auth requests (200 seconds to handle Render cold starts)
// Render free tier can take 50-180 seconds to wake up from sleep
const AUTH_TIMEOUT_MS = 200 * 1000;

/**
 * Helper to create a fetch with timeout for server-side requests
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = AUTH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Get the current authenticated user on the server side
 * Makes a request to /auth/me with the HttpOnly cookie
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    
    // Get access token for Authorization header (cross-origin fallback)
    const accessToken = cookieStore.get('habitecho_access')?.value;

    // console.log('[Auth] Checking current user, cookies:', cookieHeader ? 'Present' : 'Missing');

    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
      cache: 'no-store',
      headers: {
        Cookie: cookieHeader,
        // Include Authorization header for cross-origin scenarios
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

    if (!response.ok) {
      console.error('[Auth] getCurrentUser failed:', response.status, response.statusText);
      return null;
    }

    const data: ApiResponse<{ user: User }> = await response.json();
    return data.data.user;
  } catch (error) {
    // Handle timeout errors gracefully
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[Auth] getCurrentUser timeout - server may be cold starting');
    } else {
      console.error('[Auth] getCurrentUser error:', error);
    }
    return null;
  }
}

/**
 * Require authentication for a page
 * Redirects to login if not authenticated
 * Returns the authenticated user if successful
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  return user;
}

/**
 * Redirect authenticated users away from auth pages
 * Use this on login/signup pages to redirect to dashboard if already logged in
 */
export async function redirectIfAuthenticated(): Promise<void> {
  const user = await getCurrentUser();

  if (user) {
    redirect(ROUTES.DASHBOARD);
  }
}

/**
 * Get cookie header for server-side API requests
 * Used by Server Actions to forward the auth cookie
 */
export async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.toString();
}
