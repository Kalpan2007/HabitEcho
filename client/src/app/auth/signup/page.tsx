'use client';

import { useActionState, useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import { signupAction, verifyOtpAction, resendOtpAction } from '@/actions/auth.actions';
import { Button, Input, Select, useToast } from '@/components/ui';
import { ROUTES, OCCUPATION_OPTIONS } from '@/lib/constants';
import { getToday } from '@/lib/utils';
import type { FormState } from '@/types';

// ============================================
// SIGNUP PAGE - Multi-step Verification Flow
// ============================================

const initialSignupState: FormState = {
  success: false,
  message: '',
};

const initialVerifyState: FormState = {
  success: false,
  message: '',
};

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [useAge, setUseAge] = useState(false);
  const [isResending, startResend] = useTransition();

  const { success, error, info } = useToast();

  // Step 1: Signup State
  const [signupState, signupFormAction, isSignupPending] = useActionState(signupAction, initialSignupState);

  // Step 2: Verification State
  const [verifyState, verifyFormAction, isVerifyPending] = useActionState(verifyOtpAction, initialVerifyState);

  const prevSignupStateRef = useRef(signupState);
  const prevVerifyStateRef = useRef(verifyState);

  // Handle Signup Response
  useEffect(() => {
    if (signupState === prevSignupStateRef.current) return;
    prevSignupStateRef.current = signupState;

    if (signupState.message) {
      if (signupState.success) {
        success('Check your email!', signupState.message);
        setEmail(signupState.data?.email || '');
        setStep(2);
      } else {
        error('Signup failed', signupState.message);
      }
    }
  }, [signupState, success, error]);

  // Handle Verification Response
  useEffect(() => {
    if (verifyState === prevVerifyStateRef.current) return;
    prevVerifyStateRef.current = verifyState;

    if (verifyState.message) {
      if (verifyState.success) {
        success('Verified!', verifyState.message);
      } else {
        error('Verification failed', verifyState.message);
      }
    }
  }, [verifyState, success, error]);

  const handleResend = async () => {
    startResend(async () => {
      const result = await resendOtpAction(email);
      if (result.success) {
        success('OTP Resent', result.message);
      } else {
        error('Failed to resend', result.message);
      }
    });
  };

  return (
    <div className="max-w-md mx-auto">
      {step === 1 ? (
        <>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 truncate">
            Begin your journey
          </h2>
          <p className="text-gray-500 mb-8 text-sm">
            Fill in your details to create an account.
          </p>

          <form action={signupFormAction} className="space-y-5">
            <Input
              label="Full name"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              required
              error={signupState.errors?.fullName?.[0]}
            />

            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              error={signupState.errors?.email?.[0]}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              hint="Min 8 chars, mixed case, numbers & special chars"
              required
              error={signupState.errors?.password?.[0]}
            />

            <Select
              label="Occupation"
              name="occupation"
              options={OCCUPATION_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
              placeholder="Select your occupation"
              required
              error={signupState.errors?.occupation?.[0]}
            />

            {/* Date of Birth / Age Toggle */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="block text-sm font-semibold text-gray-700">
                  {useAge ? 'Your Age' : 'Date of Birth'}
                </span>
                <button
                  type="button"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-500 px-2 py-1 bg-white rounded-md border border-gray-200 shadow-sm transition-all"
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
                  error={signupState.errors?.age?.[0]}
                />
              ) : (
                <Input
                  name="dateOfBirth"
                  type="date"
                  max={getToday()}
                  error={signupState.errors?.dateOfBirth?.[0]}
                />
              )}
            </div>

            <input
              type="hidden"
              name="timezone"
              value={Intl.DateTimeFormat().resolvedOptions().timeZone}
            />

            <Button
              type="submit"
              className="w-full py-3 text-base shadow-lg shadow-indigo-200"
              isLoading={isSignupPending}
            >
              Sign Up & Send Code
            </Button>
          </form>
        </>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verify your email</h2>
            <p className="text-gray-500 mt-2 text-sm">
              We've sent a 6-digit verification code to <br />
              <span className="font-semibold text-gray-700">{email}</span>
            </p>
          </div>

          <form action={verifyFormAction} className="space-y-6">
            <input type="hidden" name="email" value={email} />

            <Input
              label="Verification Code"
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              className="text-center text-2xl tracking-[1em] font-mono"
              maxLength={6}
              required
              error={verifyState.message}
            />

            <Button
              type="submit"
              className="w-full py-3"
              isLoading={isVerifyPending}
            >
              Verify & Complete
            </Button>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                onClick={handleResend}
                disabled={isResending}
              >
                {isResending ? 'Sending...' : "Didn't receive the code? Resend"}
              </button>
            </div>

            <button
              type="button"
              className="w-full text-xs text-gray-400 hover:text-gray-600 pt-4"
              onClick={() => setStep(1)}
            >
              ← Back to registration
            </button>
          </form>
        </div>
      )}

      <div className="mt-8 border-t border-gray-100 pt-6">
        <div className="flex justify-center text-sm">
          <span className="text-gray-500 mr-2">Already have an account?</span>
          <Link href={ROUTES.LOGIN} className="font-semibold text-indigo-600 hover:text-indigo-500 underline decoration-indigo-200 underline-offset-4">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
