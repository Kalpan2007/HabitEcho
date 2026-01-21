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
    <div className="max-w-md mx-auto space-y-8">
      <div className="space-y-3 text-center sm:text-left">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-indigo-600 sm:text-xs">
          Step {step} of 2
        </span>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            {step === 1 ? 'Create your private studio' : 'Verify your access'}
          </h2>
          <p className="text-sm text-slate-500">
            {step === 1
              ? 'We’ll tune HabitEcho to your cadence—share a few details to begin.'
              : `Enter the 6-digit verification code sent to ${email}.`}
          </p>
        </div>
        <div className="hidden gap-4 text-left sm:grid sm:grid-cols-2">
          {[
            { title: 'Enterprise-ready', value: 'Zero-trust security grid' },
            { title: 'Timezone aware', value: 'Intelligent reminder engine' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">{item.title}</p>
              <p className="text-sm font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {step === 1 ? (
        <>
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
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="block text-sm font-semibold text-slate-700">
                  {useAge ? 'Your Age' : 'Date of Birth'}
                </span>
                <button
                  type="button"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-500 px-2 py-1 bg-white rounded-md border border-slate-200 shadow-sm transition-all"
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

            {isSignupPending && (
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

      <div className="border-t border-slate-100 pt-6">
        <div className="flex justify-center text-sm">
          <span className="text-slate-500 mr-2">Already have an account?</span>
          <Link href={ROUTES.LOGIN} className="font-semibold text-indigo-600 hover:text-indigo-500 underline decoration-indigo-200 underline-offset-4">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
