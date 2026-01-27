'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { API_BASE_URL, ROUTES } from '@/lib/constants';
import type { FormState, CreateEntryInput, UpdateEntryInput, EntryStatus } from '@/types';

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
    
    // Get access token for Authorization header (cross-origin fallback)
    const accessToken = cookieStore.get('habitecho_access')?.value;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        // Always include Authorization header when token is available
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
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
// CREATE ENTRY ACTION
// ============================================

export async function createEntryAction(
  habitId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const input: CreateEntryInput = {
    date: formData.get('entryDate') as string,
    status: formData.get('status') as EntryStatus,
  };

  // Add optional fields
  const percentComplete = formData.get('percentComplete') as string;
  const reason = formData.get('reason') as string;
  const notes = formData.get('notes') as string;

  if (percentComplete) input.percentComplete = parseInt(percentComplete, 10);
  if (reason) input.reason = reason;
  if (notes) input.notes = notes;

  // Auto-set percentComplete based on status if not provided
  if (input.percentComplete === undefined) {
    if (input.status === 'DONE') input.percentComplete = 100;
    else if (input.status === 'NOT_DONE') input.percentComplete = 0;
  }

  // Validate
  const errors: Record<string, string[]> = {};

  if (!input.date) {
    errors.entryDate = ['Date is required'];
  }

  if (!input.status) {
    errors.status = ['Status is required'];
  }

  if (input.status === 'PARTIAL' && (input.percentComplete === undefined || input.percentComplete < 1 || input.percentComplete > 99)) {
    errors.percentComplete = ['Partial completion requires a percentage between 1-99'];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Please fix the errors below',
      errors,
    };
  }

  const result = await apiRequest(`/habits/${habitId}/entry`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message,
    };
  }

  // Revalidate pages
  revalidatePath(ROUTES.HABIT_DETAIL(habitId));
  revalidatePath(ROUTES.DASHBOARD);
  revalidatePath(ROUTES.PERFORMANCE);

  return {
    success: true,
    message: 'Entry logged successfully',
  };
}

// ============================================
// UPDATE ENTRY ACTION
// ============================================

export async function updateEntryAction(
  habitId: string,
  entryDate: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const input: UpdateEntryInput = {};

  const status = formData.get('status') as EntryStatus;
  const percentComplete = formData.get('percentComplete') as string;
  const reason = formData.get('reason') as string;
  const notes = formData.get('notes') as string;

  if (status) {
    input.status = status;
    // Auto-set percentComplete based on status
    if (status === 'DONE') input.percentComplete = 100;
    else if (status === 'NOT_DONE') input.percentComplete = 0;
  }

  if (percentComplete) input.percentComplete = parseInt(percentComplete, 10);
  if (reason !== null) input.reason = reason || undefined;
  if (notes !== null) input.notes = notes || undefined;

  const result = await apiRequest(`/habits/${habitId}/entry/${entryDate}`, {
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
  revalidatePath(ROUTES.HABIT_DETAIL(habitId));
  revalidatePath(ROUTES.DASHBOARD);
  revalidatePath(ROUTES.PERFORMANCE);

  return {
    success: true,
    message: 'Entry updated successfully',
  };
}

// ============================================
// QUICK LOG ENTRY ACTION
// Used for quick DONE/NOT_DONE logging from dashboard
// ============================================

export async function quickLogEntryAction(
  habitId: string,
  entryDate: string,
  status: EntryStatus,
  percentComplete?: number
): Promise<FormState> {
  const input = {
    date: entryDate, // Backend expects 'date', not 'entryDate'
    status,
    percentComplete: percentComplete !== undefined
      ? percentComplete
      : status === 'DONE' ? 100 : 0,
  };

  // Try to create, if conflict (already exists), update instead
  let result = await apiRequest(`/habits/${habitId}/entry`, {
    method: 'POST',
    body: JSON.stringify(input),
  });

  // If conflict (entry exists), update instead
  if (!result.success && result.error === 'CONFLICT') {
    result = await apiRequest(`/habits/${habitId}/entry/${entryDate}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  }

  if (!result.success) {
    return {
      success: false,
      message: result.message,
    };
  }

  // Revalidate pages
  revalidatePath(ROUTES.HABIT_DETAIL(habitId));
  revalidatePath(ROUTES.DASHBOARD);
  revalidatePath(ROUTES.PERFORMANCE);

  return {
    success: true,
    message: 'Entry logged',
  };
}

// ============================================
// DELETE ENTRY ACTION
// ============================================

export async function deleteEntryAction(
  habitId: string,
  entryDate: string
): Promise<FormState> {
  const result = await apiRequest(`/habits/${habitId}/entry/${entryDate}`, {
    method: 'DELETE',
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message,
    };
  }

  // Revalidate pages
  revalidatePath(ROUTES.HABIT_DETAIL(habitId));
  revalidatePath(ROUTES.DASHBOARD);
  revalidatePath(ROUTES.PERFORMANCE);

  return {
    success: true,
    message: 'Entry deleted',
  };
}
