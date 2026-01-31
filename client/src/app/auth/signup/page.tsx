'use client';

import { useActionState, useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import { signupAction, verifyOtpAction, resendOtpAction } from '@/actions/auth.actions';
import { Button, Input, Select, useToast } from '@/components/ui';
import { ROUTES, OCCUPATION_OPTIONS } from '@/lib/constants';
import { getToday } from '@/lib/utils';
import type { FormState } from '@/types';

// ============================================
// SIGNUP PAGE - Minimal Design Multi-step Flow
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
    <div className="space-y-6">
      {/* Logo / Branding */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-xl">H</span>
        </div>
        <span className="text-xl font-bold text-gray-900">HabitEcho</span>
      </div>

      {step === 1 ? (
        <>
          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link href={ROUTES.LOGIN} className="text-purple-600 hover:text-purple-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>

          {/* Signup Form */}
          <form action={signupFormAction} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 mb-1.5">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
              />
              {signupState.errors?.fullName?.[0] && (
                <p className="mt-1 text-sm text-red-600">{signupState.errors.fullName[0]}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
              />
              {signupState.errors?.email?.[0] && (
                <p className="mt-1 text-sm text-red-600">{signupState.errors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
              />
              {signupState.errors?.password?.[0] && (
                <p className="mt-1 text-sm text-red-600">{signupState.errors.password[0]}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Min 8 chars, mixed case, numbers & special chars</p>
            </div>

            {/* Occupation */}
            <div>
              <label htmlFor="occupation" className="block text-sm font-semibold text-gray-900 mb-1.5">
                Occupation
              </label>
              <select
                id="occupation"
                name="occupation"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white text-gray-900"
              >
                <option value="">Select your occupation</option>
                {OCCUPATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {signupState.errors?.occupation?.[0] && (
                <p className="mt-1 text-sm text-red-600">{signupState.errors.occupation[0]}</p>
              )}
            </div>

            {/* Date of Birth / Age Toggle */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="block text-sm font-semibold text-gray-900">
                  {useAge ? 'Your Age' : 'Date of Birth'}
                </span>
                <button
                  type="button"
                  className="text-xs font-medium text-purple-600 hover:text-purple-700 px-2.5 py-1 bg-white rounded-md border border-gray-200 transition-all"
                  onClick={() => setUseAge(!useAge)}
                >
                  Use {useAge ? 'date of birth' : 'age'} instead
                </button>
              </div>

              {useAge ? (
                <input
                  name="age"
                  type="number"
                  min={13}
                  max={120}
                  placeholder="25"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                />
              ) : (
                <input
                  name="dateOfBirth"
                  type="date"
                  max={getToday()}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                />
              )}
              {signupState.errors?.age?.[0] && (
                <p className="mt-1 text-sm text-red-600">{signupState.errors.age[0]}</p>
              )}
              {signupState.errors?.dateOfBirth?.[0] && (
                <p className="mt-1 text-sm text-red-600">{signupState.errors.dateOfBirth[0]}</p>
              )}
            </div>

            <input
              type="hidden"
              name="timezone"
              value={Intl.DateTimeFormat().resolvedOptions().timeZone}
            />

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isSignupPending}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSignupPending ? 'Creating account...' : 'Sign Up & Send Code'}
            </button>

            {/* Server Loading Message */}
            {isSignupPending && (
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
        </>
      ) : (
        <div className="space-y-5">
          {/* Email Verification Icon */}
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify your email</h1>
            <p className="text-gray-600 text-sm">
              We've sent a 6-digit code to<br />
              <span className="font-semibold text-gray-900">{email}</span>
            </p>
          </div>

          {/* Verification Form */}
          <form action={verifyFormAction} className="space-y-5">
            <input type="hidden" name="email" value={email} />

            {/* OTP Input */}
            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-gray-900 mb-1.5">
                Verification Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-[1em] font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
              />
              {verifyState.message && !verifyState.success && (
                <p className="mt-1 text-sm text-red-600">{verifyState.message}</p>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isVerifyPending}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isVerifyPending ? 'Verifying...' : 'Verify & Complete'}
            </button>

            {/* Resend Code */}
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors font-medium"
                onClick={handleResend}
                disabled={isResending}
              >
                {isResending ? 'Sending...' : "Didn't receive the code? Resend"}
              </button>
            </div>

            {/* Back to Registration */}
            <button
              type="button"
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              onClick={() => setStep(1)}
            >
              ← Back to registration
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
