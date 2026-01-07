'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_BASE_URL, ROUTES } from '@/lib/constants';
import type { FormState, SignupInput, LoginInput } from '@/types';

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
// SIGNUP ACTION
// ============================================

export async function signupAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const input: SignupInput = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    occupation: formData.get('occupation') as SignupInput['occupation'],
  };

  // Add optional fields
  const dateOfBirth = formData.get('dateOfBirth') as string;
  const age = formData.get('age') as string;
  const timezone = formData.get('timezone') as string;

  if (dateOfBirth) input.dateOfBirth = dateOfBirth;
  if (age) input.age = parseInt(age, 10);
  if (timezone) input.timezone = timezone;

  // Validate required fields
  const errors: Record<string, string[]> = {};

  if (!input.fullName || input.fullName.length < 2) {
    errors.fullName = ['Full name must be at least 2 characters'];
  }

  if (!input.email || !input.email.includes('@')) {
    errors.email = ['Please enter a valid email address'];
  }

  if (!input.password || input.password.length < 8) {
    errors.password = ['Password must be at least 8 characters'];
  }

  if (!input.occupation) {
    errors.occupation = ['Please select an occupation'];
  }

  if (!dateOfBirth && !age) {
    errors.dateOfBirth = ['Please provide either date of birth or age'];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Please fix the errors below',
      errors,
    };
  }

  // Make signup request
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: data.message || 'An error occurred during signup',
      errors: data.error?.details as Record<string, string[]> | undefined,
    };
  }

  return {
    success: true,
    message: 'Verification code sent to your email. Please check your inbox.',
    data: { email: input.email },
  };
}

/**
 * VERIFY OTP ACTION
 */
export async function verifyOtpAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get('email') as string;
  const otp = formData.get('otp') as string;

  if (!otp || otp.length !== 6) {
    return {
      success: false,
      message: 'Please enter a valid 6-digit code',
    };
  }

  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: data.message || 'Invalid or expired code',
    };
  }

  // Handle login by forwarding cookies
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    const cookieStore = await cookies();
    const cookieParts = setCookie.split(';');
    const [nameValue] = cookieParts;
    const [name, ...valueParts] = nameValue.split('=');
    const value = valueParts.join('=');

    cookieStore.set(name.trim(), value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  redirect(ROUTES.DASHBOARD);
}

/**
 * RESEND OTP ACTION
 */
export async function resendOtpAction(email: string): Promise<FormState> {
  const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: data.message || 'Failed to resend code',
    };
  }

  return {
    success: true,
    message: 'New verification code sent',
  };
}



// ============================================
// LOGIN ACTION
// ============================================

export async function loginAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const input: LoginInput = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  // Validate
  const errors: Record<string, string[]> = {};

  if (!input.email || !input.email.includes('@')) {
    errors.email = ['Please enter a valid email address'];
  }

  if (!input.password) {
    errors.password = ['Please enter your password'];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Please fix the errors below',
      errors,
    };
  }

  // Make login request
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: data.message || 'Invalid email or password',
    };
  }

  // Forward the Set-Cookie from the backend response
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    const cookieStore = await cookies();
    // Parse the cookie - format: habitecho_token=value; Path=/; HttpOnly; ...
    const cookieParts = setCookie.split(';');
    const [nameValue] = cookieParts;
    const [name, ...valueParts] = nameValue.split('=');
    const value = valueParts.join('='); // Handle values that might contain =

    cookieStore.set(name.trim(), value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Use 'lax' to allow redirects
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  redirect(ROUTES.DASHBOARD);
}

// ============================================
// LOGOUT ACTION
// ============================================

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Cookie: cookieHeader,
    },
  });

  // Clear the auth cookie - use the correct cookie name
  cookieStore.delete('habitecho_token');

  redirect(ROUTES.LOGIN);
}

