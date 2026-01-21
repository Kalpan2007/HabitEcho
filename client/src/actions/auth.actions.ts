'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_BASE_URL, ROUTES } from '@/lib/constants';
import type { FormState, SignupInput, LoginInput } from '@/types';

// Helper to check if an error is a Next.js redirect
function isRedirectError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'digest' in error &&
    typeof (error as { digest?: string }).digest === 'string' &&
    (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
  );
}

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

    // Create AbortController with 200s timeout for Render cold starts (can take 50-180s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 200 * 1000);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        ...options.headers,
      },
    }).finally(() => clearTimeout(timeoutId));

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('[API] Non-JSON response:', text.substring(0, 200));
      return {
        success: false,
        message: 'Server returned an invalid response. Please ensure the backend is running.',
      };
    }

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
    // Handle timeout errors specifically
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        message: 'Request timed out. The server is starting up (can take up to 3 minutes on Render free tier). Please wait and try again in a moment.',
      };
    }
    
    // Handle other errors
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error. Please check your connection and try again.',
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
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('[Signup] Non-JSON response:', text.substring(0, 200));
      return {
        success: false,
        message: 'Unable to connect to server. Please ensure the backend is running on ' + API_BASE_URL,
      };
    }

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
  } catch (error) {
    console.error('[Signup] Network error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection and ensure the backend is running.',
    };
  }
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

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('[VerifyOTP] Non-JSON response');
      return {
        success: false,
        message: 'Unable to connect to server. Please ensure the backend is running.',
      };
    }

    const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: data.message || 'Invalid or expired code',
    };
  }

  // Handle login by forwarding cookies from backend
  const setCookieHeaders = response.headers.getSetCookie?.() || [];
  if (setCookieHeaders.length > 0) {
    const cookieStore = await cookies();
    
    for (const cookieHeader of setCookieHeaders) {
      const cookieParts = cookieHeader.split(';');
      const [nameValue] = cookieParts;
      const [name, ...valueParts] = nameValue.split('=');
      const value = valueParts.join('=');
      
      // Parse cookie options
      const options: any = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
      };
      
      // Extract max-age from cookie parts
      cookieParts.forEach(part => {
        const trimmed = part.trim().toLowerCase();
        if (trimmed.startsWith('max-age=')) {
          const maxAge = parseInt(trimmed.split('=')[1]);
          if (!isNaN(maxAge)) {
            options.maxAge = maxAge;
          }
        }
      });
      
      cookieStore.set(name.trim(), value, options);
    }
  }

  redirect(ROUTES.DASHBOARD);
  } catch (error) {
    // Re-throw redirect errors - they are expected behavior
    if (isRedirectError(error)) {
      throw error;
    }
    console.error('[VerifyOTP] Network error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

/**
 * RESEND OTP ACTION
 */
export async function resendOtpAction(email: string): Promise<FormState> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {
        success: false,
        message: 'Unable to connect to server.',
      };
    }

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
  } catch (error) {
    console.error('[ResendOTP] Error:', error);
    return {
      success: false,
      message: 'Network error. Please try again.',
    };
  }
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
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('[Login] Non-JSON response');
      return {
        success: false,
        message: 'Unable to connect to server. Please ensure the backend is running on ' + API_BASE_URL,
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Invalid email or password',
      };
    }

    // Forward all Set-Cookie headers from the backend response
    const setCookieHeaders = response.headers.getSetCookie?.() || [];
    if (setCookieHeaders.length > 0) {
      const cookieStore = await cookies();
      
      for (const cookieHeader of setCookieHeaders) {
        const cookieParts = cookieHeader.split(';');
        const [nameValue] = cookieParts;
        const [name, ...valueParts] = nameValue.split('=');
        const value = valueParts.join('=');
        
        // Parse cookie options
        const options: any = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          path: '/',
        };
        
        // Extract max-age from cookie parts
        cookieParts.forEach(part => {
          const trimmed = part.trim().toLowerCase();
          if (trimmed.startsWith('max-age=')) {
            const maxAge = parseInt(trimmed.split('=')[1]);
            if (!isNaN(maxAge)) {
              options.maxAge = maxAge;
            }
          }
        });
        
        cookieStore.set(name.trim(), value, options);
      }
    }

    redirect(ROUTES.DASHBOARD);
  } catch (error) {
    // Re-throw redirect errors - they are expected behavior
    if (isRedirectError(error)) {
      throw error;
    }
    console.error('[Login] Network error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection and ensure the backend is running.',
    };
  }
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

