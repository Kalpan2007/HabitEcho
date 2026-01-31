'use client';

import { useActionState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { loginAction } from '@/actions/auth.actions';
import { Button, Input, useToast } from '@/components/ui';
import { useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@/lib/constants';
import type { FormState } from '@/types';

// ============================================
// LOGIN FORM - Minimal Modern Design
// ============================================

const initialState: FormState = {
  success: false,
  message: '',
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const { success, error } = useToast();
  const prevStateRef = useRef(state);

  const queryClient = useQueryClient();

  // Show toast on state change
  useEffect(() => {
    if (state === prevStateRef.current) return;
    prevStateRef.current = state;

    if (state.message) {
      if (state.success) {
        success('Welcome back!', state.message);
        // Refresh protected data after login
        queryClient.invalidateQueries();
      } else {
        error('Login failed', state.message);
      }
    }
  }, [state, success, error, queryClient]);

  return (
    <div className="space-y-6">
      {/* Logo / Branding */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-xl">H</span>
        </div>
        <span className="text-xl font-bold text-gray-900">HabitEcho</span>
      </div>

      {/* Heading */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-gray-600 text-sm">
          New to HabitEcho?{' '}
          <Link href={ROUTES.SIGNUP} className="text-purple-600 hover:text-purple-700 font-semibold">
            Create an account
          </Link>
        </p>
      </div>

      {/* Login Form */}
      <form action={formAction} className="space-y-4">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
          />
          {state.errors?.email?.[0] && (
            <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-1.5">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
          />
          {state.errors?.password?.[0] && (
            <p className="mt-1 text-sm text-red-600">{state.errors.password[0]}</p>
          )}
        </div>

        {/* Remember & Forgot Password */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="remember"
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-gray-700">Remember for 30 days</span>
          </label>
          <Link href="#" className="text-purple-600 hover:text-purple-700 font-semibold">
            Forgot password
          </Link>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isPending ? 'Signing in...' : 'Sign in'}
        </button>

        {/* Google Sign In Button */}
        <button
          type="button"
          className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>

        {/* Server Loading Message */}
        {isPending && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 animate-spin flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="text-sm">
                <p className="font-semibold text-blue-900">Server is waking up...</p>
                <p className="text-blue-700 mt-0.5">First request can take up to 3 minutes. Please wait!</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
