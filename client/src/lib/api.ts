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

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Base fetch helper that handles common configuration
 * - Always includes credentials for HttpOnly cookie
 * - Adds Content-Type header for JSON requests
 * - Handles response parsing and error formatting
 */
async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { params, ...fetchOptions } = options;

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

  const response = await fetch(url, {
    ...fetchOptions,
    credentials: 'include', // Always send HttpOnly cookies
    cache: 'no-store', // Disable caching for user-specific data
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(data.message || 'An error occurred', response.status, data.error?.code);
  }

  return data as ApiResponse<T>;
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
  async signup(input: SignupInput): Promise<ApiResponse<{ user: User; otpSent: boolean }>> {
    return apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Login user (sets HttpOnly cookie)
   */
  async login(input: LoginInput): Promise<ApiResponse<{ user: User }>> {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Logout user (clears HttpOnly cookie)
   */
  async logout(): Promise<ApiResponse<null>> {
    return apiFetch('/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Get current authenticated user
   */
  async me(): Promise<ApiResponse<{ user: User }>> {
    return apiFetch('/auth/me');
  },
};

// ============================================
// HABITS API
// ============================================

export const habitsApi = {
  /**
   * Create a new habit
   */
  async create(input: CreateHabitInput): Promise<ApiResponse<{ habit: Habit }>> {
    return apiFetch('/habits', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Get all habits with optional filtering and pagination
   */
  async getAll(options?: {
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Habit>> {
    const response = await apiFetch<Habit[]>('/habits', {
      params: {
        isActive: options?.isActive,
        page: options?.page,
        limit: options?.limit,
      },
    });
    return response as PaginatedResponse<Habit>;
  },

  /**
   * Get a single habit by ID
   */
  async getById(id: string): Promise<ApiResponse<{ habit: Habit }>> {
    return apiFetch(`/habits/${id}`);
  },

  /**
   * Update a habit
   */
  async update(id: string, input: UpdateHabitInput): Promise<ApiResponse<{ habit: Habit }>> {
    return apiFetch(`/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  /**
   * Delete a habit (soft delete)
   */
  async delete(id: string): Promise<ApiResponse<null>> {
    return apiFetch(`/habits/${id}`, {
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
  async create(habitId: string, input: CreateEntryInput): Promise<ApiResponse<{ entry: HabitEntry }>> {
    return apiFetch(`/habits/${habitId}/entry`, {
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
    input: UpdateEntryInput
  ): Promise<ApiResponse<{ entry: HabitEntry }>> {
    return apiFetch(`/habits/${habitId}/entry/${entryDate}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  /**
   * Get entry history for a habit
   */
  async getHistory(
    habitId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<PaginatedResponse<HabitEntry>> {
    const response = await apiFetch<HabitEntry[]>(`/habits/${habitId}/history`, {
      params: {
        startDate: options?.startDate,
        endDate: options?.endDate,
        page: options?.page,
        limit: options?.limit,
      },
    });
    return response as PaginatedResponse<HabitEntry>;
  },

  /**
   * Delete an entry
   */
  async delete(habitId: string, entryDate: string): Promise<ApiResponse<null>> {
    return apiFetch(`/habits/${habitId}/entry/${entryDate}`, {
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
  async getSummary(): Promise<ApiResponse<{ summary: PerformanceSummary }>> {
    return apiFetch('/performance/summary');
  },

  /**
   * Get detailed performance for a specific habit
   */
  async getHabitPerformance(habitId: string): Promise<ApiResponse<{ performance: HabitPerformance }>> {
    return apiFetch(`/performance/habit/${habitId}`);
  },
};
