import { ReactNode } from 'react';
import { Metadata } from 'next';

// ============================================
// AUTH LAYOUT - Modern Split Screen Design
// Server Component - wraps all auth pages
// ============================================

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Right Side - HabitEcho Dashboard Preview */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Purple gradient background with diagonal pattern */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)'
          }}
        />

        {/* HabitEcho Dashboard Preview Content */}
        <div className="relative z-10 flex items-center justify-center w-full p-12">
          <div className="space-y-6 max-w-xl w-full">
            {/* Active Habits Card */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl transform rotate-[-2deg]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Habits</p>
                  <h3 className="text-4xl font-bold text-gray-900">24</h3>
                  <p className="text-sm text-purple-600 flex items-center gap-1 mt-1 font-semibold">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    +15% from last month
                  </p>
                </div>
                <div className="w-16 h-16">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#A855F7" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset="50.24" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Weekly Progress Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl transform rotate-[1deg]">
              <div className="h-48 flex items-end justify-between gap-3">
                {[65, 80, 58, 75, 90, 68, 85].map((height, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-lg" style={{ height: `${height}%` }} />
                ))}
              </div>
              <div className="mt-6">
                <h4 className="text-2xl font-bold text-gray-900">89% Consistency</h4>
                <p className="text-sm text-green-600 flex items-center gap-1 font-semibold">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +12% improvement this week
                </p>
              </div>
            </div>

            {/* Promotional Banner */}
            <div className="text-center text-white px-4">
              <h2 className="text-3xl font-bold mb-3 drop-shadow-lg">Track Your Habits Effortlessly</h2>
              <p className="text-purple-100 text-lg font-medium drop-shadow">
                Build lasting habits with intelligent tracking, streak insights, and personalized analytics. Sign in to explore!
              </p>
            </div>

            {/* Page Indicators */}
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-2 rounded-full transition-all ${i === 2 ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
