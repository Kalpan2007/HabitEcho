'use client';

import { useActionState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { loginAction } from '@/actions/auth.actions';
import { Button, Input, useToast } from '@/components/ui';
import { useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@/lib/constants';
import type { FormState } from '@/types';

// ============================================
// LOGIN FORM - Client Component for interactivity
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
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Sign in to your account
      </h2>

      <form action={formAction} className="space-y-5">
        <Input
          label="Email address"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          error={state.errors?.email?.[0]}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
          error={state.errors?.password?.[0]}
        />

        <Button
          type="submit"
          className="w-full"
          isLoading={isPending}
        >
          Sign in
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              New to HabitEcho?
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href={ROUTES.SIGNUP}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
