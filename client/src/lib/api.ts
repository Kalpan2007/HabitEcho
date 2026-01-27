import { API_BASE_URL } from './constants';
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  Habit,
  HabitEntry,
  PerformanceSummary,
  HabitPerformance,
  CreateHabitInput,
  UpdateHabitInput,
  CreateEntryInput,
  UpdateEntryInput,
  SignupInput,
  LoginInput,
} from '@/types';

// ============================================
// BASE FETCH HELPER
// ============================================

// Timeout for API requests (200 seconds to handle Render cold starts on free tier)
// Render free tier can take 50-180 seconds to wake up from sleep
const API_TIMEOUT_MS = 200 * 1000;

// Track if we're currently refreshing to avoid duplicate refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Get access token from cookie (client-side)
 * Returns the token value or null if not found
 */
function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'habitecho_access' && value) {
        return decodeURIComponent(value);
      }
    }
  } catch (error) {
    console.error('[API] Failed to extract token from cookie:', error);
  }
  return null;
}

/**
 * Attempt to refresh the access token using the refresh token
 * Returns true if refresh succeeded, false otherwise
 */
async function tryRefreshToken(): Promise<boolean> {
  // If already refreshing, wait for that to complete
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      console.log('[API] Attempting to refresh access token...');
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('[API] Token refresh successful');
        return true;
      }
      
      console.error('[API] Token refresh failed:', response.status);
      return false;
    } catch (error) {
      console.error('[API] Token refresh error:', error);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeout?: number; // Custom timeout in milliseconds
}

/**
 * Base fetch helper that handles common configuration
 * - Always includes credentials for HttpOnly cookie
 * - Adds Content-Type header for JSON requests
 * - Handles response parsing and error formatting
 * - Includes timeout handling for Render cold starts
 */
async function apiFetch<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { params, timeout = API_TIMEOUT_MS, ...fetchOptions } = options;

  // Build URL with query params
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Create AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Get access token for Authorization header (primary auth method)
  const accessToken = getAccessToken();

  try {
    const response = await fetch(url, {
      credentials: 'include', // Always send HttpOnly cookies as fallback
      cache: 'no-store', // Disable caching for user-specific data
      signal: controller.signal,
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        // Always include Authorization header when token is available (required for cross-domain)
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      // Special handling for authentication errors
      if (response.status === 401) {
        console.error('[API] Authentication failed for:', url);
        console.error('[API] Token present:', !!accessToken);
        
        // Try to refresh the token once
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          console.log('[API] Token refreshed, retrying request...');
          // Retry the original request with new token
          return apiFetch(endpoint, options);
        }
        
        throw new ApiError(
          data.message || 'Authentication required. Please log in again.',
          401,
          data.error?.code || 'UNAUTHORIZED'
        );
      }
      
      throw new ApiError(data.message || 'An error occurred', response.status, data.error?.code);
    }

    return data as ApiResponse<T>;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle timeout/abort errors
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        'Server is waking up (Render free tier). This can take up to 3 minutes on first request. Please wait and try again.',
        408,
        'REQUEST_TIMEOUT'
      );
    }
    
    // Handle network errors (server unreachable)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        'Unable to connect to server. Please check your connection and try again.',
        503,
        'NETWORK_ERROR'
      );
    }
    
    throw error;
  }
}

// ============================================
// ERROR CLASS
// ============================================

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================
// AUTH API
// ============================================

export const authApi = {
  /**
   * Register a new user
   */
  async signup(input: SignupInput, options?: ApiOptions): Promise<ApiResponse<{ user: User; otpSent: boolean }>> {
    return apiFetch('/auth/signup', {
      ...options,
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Login user (sets HttpOnly cookie)
   */
  async login(input: LoginInput, options?: ApiOptions): Promise<ApiResponse<{ user: User }>> {
    return apiFetch('/auth/login', {
      ...options,
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Logout user (clears HttpOnly cookie)
   */
  async logout(options?: ApiOptions): Promise<ApiResponse<null>> {
    return apiFetch('/auth/logout', {
      ...options,
      method: 'POST',
    });
  },

  /**
   * Get current authenticated user
   */
  async me(options?: ApiOptions): Promise<ApiResponse<{ user: User }>> {
    return apiFetch('/auth/me', options);
  },
};

// ============================================
// HABITS API
// ============================================

export const habitsApi = {
  /**
   * Create a new habit
   */
  async create(input: CreateHabitInput, options?: ApiOptions): Promise<ApiResponse<{ habit: Habit }>> {
    return apiFetch('/habits', {
      ...options,
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Get all habits with optional filtering and pagination
   */
  async getAll(options?: ApiOptions & {
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Habit>> {
    const { isActive, page, limit, ...fetchOptions } = options || {};
    const response = await apiFetch<Habit[]>('/habits', {
      ...fetchOptions,
      params: {
        isActive,
        page,
        limit,
        ...fetchOptions.params,
      },
    });
    return response as PaginatedResponse<Habit>;
  },

  /**
   * Get a single habit by ID
   */
  async getById(id: string, options?: ApiOptions): Promise<ApiResponse<{ habit: Habit }>> {
    return apiFetch(`/habits/${id}`, options);
  },

  /**
   * Update a habit
   */
  async update(id: string, input: UpdateHabitInput, options?: ApiOptions): Promise<ApiResponse<{ habit: Habit }>> {
    return apiFetch(`/habits/${id}`, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  /**
   * Delete a habit (soft delete)
   */
  async delete(id: string, options?: ApiOptions): Promise<ApiResponse<null>> {
    return apiFetch(`/habits/${id}`, {
      ...options,
      method: 'DELETE',
    });
  },
};

// ============================================
// HABIT ENTRIES API
// ============================================

export const entriesApi = {
  /**
   * Create a new entry for a habit
   */
  async create(habitId: string, input: CreateEntryInput, options?: ApiOptions): Promise<ApiResponse<{ entry: HabitEntry }>> {
    return apiFetch(`/habits/${habitId}/entry`, {
      ...options,
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Update an existing entry
   */
  async update(
    habitId: string,
    entryDate: string,
    input: UpdateEntryInput,
    options?: ApiOptions
  ): Promise<ApiResponse<{ entry: HabitEntry }>> {
    return apiFetch(`/habits/${habitId}/entry/${entryDate}`, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  /**
   * Get entry history for a habit
   */
  async getHistory(
    habitId: string,
    options?: ApiOptions & {
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<HabitEntry>> {
    const { startDate, endDate, page, limit, ...fetchOptions } = options || {};
    const response = await apiFetch<HabitEntry[]>(`/habits/${habitId}/history`, {
      ...fetchOptions,
      params: {
        startDate,
        endDate,
        page,
        limit,
        ...fetchOptions.params,
      },
    });
    return response as PaginatedResponse<HabitEntry>;
  },

  /**
   * Delete an entry
   */
  async delete(habitId: string, entryDate: string, options?: ApiOptions): Promise<ApiResponse<null>> {
    return apiFetch(`/habits/${habitId}/entry/${entryDate}`, {
      ...options,
      method: 'DELETE',
    });
  },
};

// ============================================
// PERFORMANCE API
// ============================================

export const performanceApi = {
  /**
   * Get overall performance summary
   */
  async getSummary(options?: ApiOptions): Promise<ApiResponse<{ summary: PerformanceSummary }>> {
    return apiFetch('/performance/summary', options);
  },

  /**
   * Get detailed performance for a specific habit
   */
  async getHabitPerformance(habitId: string, options?: ApiOptions): Promise<ApiResponse<{ performance: HabitPerformance }>> {
    return apiFetch(`/performance/habit/${habitId}`, options);
  },
};
