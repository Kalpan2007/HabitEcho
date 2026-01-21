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
    <div className="space-y-8">
      <div className="space-y-3 text-center sm:text-left">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500 sm:text-xs">
          Access console
        </span>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Welcome back to <span className="text-transparent bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text">HabitEcho</span>
          </h2>
          <p className="text-sm text-slate-500">
            Authenticate to sync your streak radar, predictive prompts, and Supabase-secured telemetry.
          </p>
        </div>
        <div className="hidden gap-4 text-left sm:grid sm:grid-cols-2">
          {[
            { title: 'Dual-token security', value: 'Rotating refresh + HttpOnly' },
            { title: 'Realtime hydration', value: 'TanStack Query v5' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">{item.title}</p>
              <p className="text-sm font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <form action={formAction} className="space-y-5">
        <Input
          label="Work email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@habitecho.com"
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

        <div className="flex items-center justify-between text-sm text-slate-500">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="remember"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Remember device
          </label>
          <Link href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full py-3 text-base shadow-lg shadow-indigo-200"
          isLoading={isPending}
        >
          Enter studio
        </Button>

        {isPending && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <div className="text-sm">
                <p className="font-semibold text-blue-900">Server is waking up...</p>
                <p className="text-blue-700 mt-1">First request can take up to 3 minutes on free hosting. Please wait, don't refresh!</p>
              </div>
            </div>
          </div>
        )}
      </form>

      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>Need an account?</span>
          <Link
            href={ROUTES.SIGNUP}
            className="rounded-full border border-slate-200 px-4 py-1.5 font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
