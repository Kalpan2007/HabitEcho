'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { API_BASE_URL, ROUTES } from '@/lib/constants';
import { getToday } from '@/lib/utils';
import type { FormState, CreateHabitInput, UpdateHabitInput, Frequency, Habit } from '@/types';

// ============================================
// HELPER: Make authenticated API request
// ============================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message: string; error?: string }> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'An error occurred',
        error: data.error?.code,
      };
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ============================================
// CREATE HABIT ACTION
// ============================================

export async function createHabitAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const input: CreateHabitInput = {
    name: formData.get('name') as string,
    frequency: formData.get('frequency') as Frequency,
    startDate: formData.get('startDate') as string,
  };

  // Add optional fields
  const description = formData.get('description') as string;
  const endDate = formData.get('endDate') as string;
  const reminderTime = formData.get('reminderTime') as string;
  const timezone = (formData.get('timezone') as string) || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const scheduleDaysRaw = formData.get('scheduleDays') as string;

  if (description) input.description = description;
  if (endDate) input.endDate = endDate;
  if (reminderTime) input.reminderTime = reminderTime;
  input.timezone = timezone;
  if (scheduleDaysRaw) {
    try {
      input.scheduleDays = JSON.parse(scheduleDaysRaw);
    } catch {
      // Invalid JSON, ignore
    }
  }

  // Validate required fields
  const errors: Record<string, string[]> = {};

  if (!input.name || input.name.length < 1) {
    errors.name = ['Habit name is required'];
  }

  if (!input.frequency) {
    errors.frequency = ['Please select a frequency'];
  }

  if (!input.startDate) {
    errors.startDate = ['Start date is required'];
  }

  // Validate scheduleDays for non-daily frequencies
  if (input.frequency !== 'DAILY' && (!input.scheduleDays || input.scheduleDays.length === 0)) {
    errors.scheduleDays = ['Please select at least one day'];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Please fix the errors below',
      errors,
    };
  }

  const result = await apiRequest('/habits', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message,
    };
  }

  // Revalidate habits page and redirect
  revalidatePath(ROUTES.HABITS);
  redirect(ROUTES.HABITS);
}

// ============================================
// UPDATE HABIT ACTION
// ============================================

export async function updateHabitAction(
  habitId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const input: UpdateHabitInput = {};

  // Only include fields that are provided
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const frequency = formData.get('frequency') as Frequency;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const isActive = formData.get('isActive');
  const scheduleDaysRaw = formData.get('scheduleDays') as string;

  if (name) input.name = name;
  if (description !== null) input.description = description || undefined;
  if (frequency) input.frequency = frequency;
  if (startDate) input.startDate = startDate;
  if (endDate) input.endDate = endDate || null;
  if (isActive !== null) input.isActive = isActive === 'true';
  if (formData.get('reminderTime') !== null) {
    input.reminderTime = formData.get('reminderTime') as string || null;
  }
  if (formData.get('timezone')) {
    input.timezone = formData.get('timezone') as string;
  }
  if (scheduleDaysRaw) {
    try {
      input.scheduleDays = JSON.parse(scheduleDaysRaw);
    } catch {
      // Invalid JSON, ignore
    }
  }

  // Validate
  const errors: Record<string, string[]> = {};

  if (input.name !== undefined && input.name.length < 1) {
    errors.name = ['Habit name is required'];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Please fix the errors below',
      errors,
    };
  }

  const result = await apiRequest(`/habits/${habitId}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message,
    };
  }

  // Revalidate pages
  revalidatePath(ROUTES.HABITS);
  revalidatePath(ROUTES.HABIT_DETAIL(habitId));

  return {
    success: true,
    message: 'Habit updated successfully',
  };
}

// ============================================
// DELETE HABIT ACTION
// ============================================

export async function deleteHabitAction(habitId: string): Promise<FormState> {
  const result = await apiRequest(`/habits/${habitId}`, {
    method: 'DELETE',
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message,
    };
  }

  // Revalidate habits page and redirect
  revalidatePath(ROUTES.HABITS);
  revalidatePath(ROUTES.DASHBOARD);
  redirect(ROUTES.HABITS);
}

// ============================================
// TOGGLE HABIT ACTIVE STATUS
// ============================================

export async function toggleHabitActiveAction(
  habitId: string,
  isActive: boolean
): Promise<FormState> {
  const result = await apiRequest(`/habits/${habitId}`, {
    method: 'PUT',
    body: JSON.stringify({ isActive }),
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message,
    };
  }

  // Revalidate pages
  revalidatePath(ROUTES.HABITS);
  revalidatePath(ROUTES.DASHBOARD);

  return {
    success: true,
    message: isActive ? 'Habit activated' : 'Habit deactivated',
  };
}
// ============================================
// ARCHIVE HABIT ACTION
// ============================================

export async function archiveHabitAction(
  habitId: string
): Promise<FormState> {
  const result = await apiRequest(`/habits/${habitId}`, {
    method: 'PUT',
    body: JSON.stringify({
      isActive: false,
      endDate: getToday()
    }),
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message,
    };
  }

  revalidatePath(ROUTES.HABIT_DETAIL(habitId));
  revalidatePath(ROUTES.DASHBOARD);
  revalidatePath(ROUTES.HABITS);
  revalidatePath(ROUTES.PROFILE);

  return {
    success: true,
    message: 'Habit archived successfully',
  };
}

// ============================================
// GET HABIT BY ID
// ============================================

export async function getHabitAction(habitId: string) {
  return apiRequest<{ habit: Habit }>(`/habits/${habitId}`);
}

