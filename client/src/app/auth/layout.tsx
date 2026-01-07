import { ReactNode } from 'react';
import { Logo } from '@/components/ui';

// ============================================
// AUTH LAYOUT
// Server Component - wraps all auth pages
// ============================================

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[linear-gradient(135deg,#f0f4ff_0%,#e6ecff_45%,#f8f3ff_100%)] text-slate-900">
      <div className="absolute inset-0">
        <div className="absolute -top-32 left-12 h-60 w-60 rounded-full bg-indigo-200/50 blur-[150px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-purple-200/40 blur-[180px]" />
      </div>
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-8 sm:px-8">
        <div className="mb-6 flex items-center gap-3 text-slate-500">
          <Logo size={34} />
          <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Habit Intelligence
          </span>
        </div>
        <div className="w-full max-w-3xl rounded-[32px] border border-white bg-white/90 p-5 shadow-[0_45px_120px_rgba(15,23,42,0.12)] backdrop-blur-lg sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr] items-center">
            <div className="space-y-5 text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-500/80">
                Private-first habit OS
              </p>
              <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
                Sign in to your <span className="text-transparent bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text">HabitEcho</span> console.
              </h1>
              <p className="text-sm text-slate-500">
                Zero-trust security, predictive momentum, and Supabase-backed telemetry—available once you authenticate.
              </p>
              <div className="grid gap-3 text-xs text-slate-600 sm:grid-cols-2">
                {[
                  { label: 'Dual token', detail: 'HttpOnly access + refresh' },
                  { label: 'Realtime hydration', detail: 'TanStack Query v5' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 shadow-sm">
                    <p className="text-xs font-semibold text-slate-900">{item.label}</p>
                    <p>{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="max-h-[70vh] overflow-y-auto rounded-[24px] border border-slate-100 bg-white p-5 sm:p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
