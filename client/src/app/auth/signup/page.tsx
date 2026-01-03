'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { signupAction } from '@/actions/auth.actions';
import { Button, Input, Select, useToast } from '@/components/ui';
import { ROUTES, OCCUPATION_OPTIONS } from '@/lib/constants';
import { getToday } from '@/lib/utils';
import type { FormState } from '@/types';

// ============================================
// SIGNUP FORM - Client Component for interactivity
// ============================================

const initialState: FormState = {
  success: false,
  message: '',
};

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState);
  const [useAge, setUseAge] = useState(false);
  const { success, error } = useToast();
  const prevStateRef = useRef(state);

  // Show toast on state change
  useEffect(() => {
    if (state === prevStateRef.current) return;
    prevStateRef.current = state;

    if (state.message) {
      if (state.success) {
        success('Account created!', state.message);
      } else {
        error('Signup failed', state.message);
      }
    }
  }, [state, success, error]);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Create your account
      </h2>

      <form action={formAction} className="space-y-5">
        <Input
          label="Full name"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="John Doe"
          required
          error={state.errors?.fullName?.[0]}
        />

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
          autoComplete="new-password"
          placeholder="••••••••"
          hint="Min 8 chars, include uppercase, lowercase, number, and special character"
          required
          error={state.errors?.password?.[0]}
        />

        <Select
          label="Occupation"
          name="occupation"
          options={OCCUPATION_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
          placeholder="Select your occupation"
          required
          error={state.errors?.occupation?.[0]}
        />

        {/* Date of Birth / Age Toggle */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="block text-sm font-medium text-gray-700">
              {useAge ? 'Age' : 'Date of birth'}
            </span>
            <button
              type="button"
              className="text-sm text-indigo-600 hover:text-indigo-500"
              onClick={() => setUseAge(!useAge)}
            >
              Use {useAge ? 'date of birth' : 'age'} instead
            </button>
          </div>

          {useAge ? (
            <Input
              name="age"
              type="number"
              min={13}
              max={120}
              placeholder="25"
              error={state.errors?.age?.[0]}
            />
          ) : (
            <Input
              name="dateOfBirth"
              type="date"
              max={getToday()}
              error={state.errors?.dateOfBirth?.[0]}
            />
          )}
        </div>

        {/* Hidden timezone field - auto-detected */}
        <input
          type="hidden"
          name="timezone"
          value={Intl.DateTimeFormat().resolvedOptions().timeZone}
        />

        <Button
          type="submit"
          className="w-full"
          isLoading={isPending}
        >
          Create account
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Already have an account?
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href={ROUTES.LOGIN}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
