'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { Logo } from '@/components/ui';

const style = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(3deg); }
    50% { transform: translateY(-20px) rotate(3deg); }
  }
  @keyframes floatBadge {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  .app-float {
    animation: float 6s ease-in-out infinite;
  }
  .badge-float {
    animation: floatBadge 3s ease-in-out infinite;
  }
`;

const colors = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#E0E7FF',
  purple: '#8B5CF6',
  purpleDark: '#7C3AED',
  purpleLight: '#EDE9FE',
  background: '#FAFAFA',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#F3F4F6',
};

const features = [
  {
    title: 'Daily Habits',
    description: 'Build consistency with habits that repeat every day.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    title: 'Weekly Routines',
    description: 'Set habits for specific days of the week.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    )
  },
  {
    title: 'Streak Tracking',
    description: 'Watch your streaks grow day by day.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      </svg>
    )
  },
  {
    title: 'Smart Reminders',
    description: 'Get notified at the right time.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    )
  },
  {
    title: 'Visual Heatmaps',
    description: '365 days of history in one view.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    )
  },
  {
    title: 'Analytics',
    description: 'Understand your progress patterns.',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  }
];

const heatmapData = [1, 0.7, 0.4, 1, 1, 0.3, 0, 0.7, 1, 1, 0.7, 0.4, 1, 1, 1, 0.7, 0.3, 0, 0.7, 1, 1, 0.4, 1, 1, 0.7, 1, 0.7, 0.3, 0, 0.7, 1, 1, 0.4, 0.7, 1];

const getHeatmapColor = (value: number) => {
  if (value === 0) return '#F9FAFB';
  if (value < 0.3) return '#FECACA';
  if (value < 0.6) return '#FCA5A5';
  if (value < 0.8) return '#C7D2FE';
  return '#6366F1';
};

export default function LandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: style }} />
      <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Navigation - Premium Minimal */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between rounded-full px-5 py-2.5 bg-white/90 backdrop-blur-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" 
                   style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.purple})` }}>
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-base font-bold" style={{ color: colors.text }}>
                Habit<span style={{ color: colors.primary }}>Echo</span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-400 hover:text-gray-900 transition">Features</a>
              <a href="#testimonials" className="text-sm font-medium text-gray-400 hover:text-gray-900 transition">Stories</a>
              <a href="#faq" className="text-sm font-medium text-gray-400 hover:text-gray-900 transition">FAQ</a>
            </div>

            <div className="flex items-center gap-2">
              <Link href={ROUTES.LOGIN} className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-1.5">
                Sign in
              </Link>
              <Link 
                href={ROUTES.SIGNUP} 
                className="text-sm font-semibold text-white px-4 py-1.5 rounded-full hover:shadow-md transition"
                style={{ backgroundColor: colors.primary }}
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section - Premium Layout */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Side - Premium Text */}
            <div className="text-center lg:text-left lg:pr-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8" style={{ backgroundColor: colors.purpleLight }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: colors.primary }}></span>
                <span className="text-xs font-medium" style={{ color: colors.purpleDark }}>Join 10,000+ building better habits</span>
              </div>
              
              {/* Headline */}
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: colors.text }}>
                Build habits that{' '}
                <span className="relative">
                  <span style={{ color: colors.primary }}>actually stick</span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 8" preserveAspectRatio="none">
                    <path d="M0 6 Q50 8 100 4" stroke={colors.primary} strokeWidth="3" fill="none" />
                  </svg>
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-lg">
                Transform your daily routine with beautiful analytics and streak tracking that keeps you motivated. No complexity, just results.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
                <Link 
                  href={ROUTES.SIGNUP}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-white px-7 py-3.5 rounded-full font-semibold transition hover:shadow-xl hover:-translate-y-0.5"
                  style={{ backgroundColor: colors.primary }}
                >
                  Start building habits
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link 
                  href={ROUTES.LOGIN}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-gray-600 px-7 py-3.5 rounded-full font-semibold border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition"
                >
                  I already have an account
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6 mt-10 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 border-2 border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white"></div>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 border-2 border-white"></div>
                  </div>
                  <span>10K+ users</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <span>4.9 rating</span>
                </div>
              </div>
            </div>

            {/* Right Side - Floating 3D Card */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Glow Effect Behind */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100 rounded-[40px] blur-3xl opacity-60 scale-95" />

              {/* Main Floating Card with Auto Animation */}
              <div className="relative app-float" style={{ perspective: '1000px' }}>
                {/* Streak Badge Floating Top Right - Auto Floating */}
                <div className="absolute -top-5 -right-4 z-20 badge-float bg-white rounded-2xl shadow-xl p-3 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                      <span className="text-2xl">🔥</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: colors.text }}>47</p>
                      <p className="text-xs text-gray-400">Day Streak</p>
                    </div>
                  </div>
                </div>

                {/* Progress Ring Badge Top Left - Auto Floating */}
                <div className="absolute -top-4 -left-4 z-20 badge-float bg-white rounded-2xl shadow-xl p-3 border border-gray-100" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-2">
                    <div className="relative w-10 h-10">
                      <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke={colors.primary} strokeWidth="3" strokeDasharray="88" strokeDashoffset="0" strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: colors.primary }}>94%</span>
                    </div>
                    <div>
                      <p className="text-base font-bold" style={{ color: colors.text }}>Today</p>
                      <p className="text-xs text-gray-400">On Track</p>
                    </div>
                  </div>
                </div>

                {/* App Mockup Card - Wider & Shorter */}
                <div className="bg-white rounded-3xl shadow-2xl border overflow-hidden" style={{ borderColor: '#E5E7EB', boxShadow: '0 40px 80px -20px rgba(99, 102, 241, 0.3), 0 20px 40px -10px rgba(139, 92, 246, 0.2)' }}>
                  {/* Window Controls */}
                  <div className="px-6 py-4 border-b flex items-center gap-3" style={{ backgroundColor: '#F9FAFB', borderColor: '#F3F4F6' }}>
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="ml-3 px-2.5 py-1 rounded-md text-xs font-medium text-gray-500" style={{ backgroundColor: '#F3F4F6' }}>
                      habitecho.com
                    </div>
                  </div>
                  
                  {/* App Content - Compact */}
                  <div className="p-6">
                    {/* Habit Card */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
                           style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.purple})` }}>
                        M
                      </div>
                      <div>
                        <p className="text-lg font-bold" style={{ color: colors.text }}>Morning Routine</p>
                        <p className="text-sm text-gray-500">You're on a <span className="font-semibold text-emerald-500">47-day streak</span></p>
                      </div>
                    </div>

                    {/* Heatmap Grid - Wider */}
                    <div className="grid grid-cols-7 gap-2 mb-5">
                      {heatmapData.slice(0, 28).map((value, i) => (
                        <div 
                          key={i}
                          className="aspect-square rounded-lg shadow-sm"
                          style={{ backgroundColor: getHeatmapColor(value) }}
                        />
                      ))}
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-2xl font-bold" style={{ color: colors.text }}>94%</p>
                          <p className="text-xs text-gray-400">Completion</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold" style={{ color: colors.text }}>12</p>
                          <p className="text-xs text-gray-400">Habits</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold" style={{ color: colors.text }}>47</p>
                          <p className="text-xs text-gray-400">Best Streak</p>
                        </div>
                      </div>
                      <button className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-105 transition"
                              style={{ backgroundColor: colors.primary }}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: colors.text }}>
              Everything you need
            </h2>
            <p className="text-gray-500 text-lg">Simple tools that just work.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-7 rounded-3xl border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1"
                style={{ backgroundColor: colors.background }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform" style={{ backgroundColor: colors.purpleLight }}>
                  <span style={{ color: colors.purple }}>{feature.icon}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: colors.text }}>{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6" style={{ backgroundColor: colors.text }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Loved by thousands
            </h2>
            <p className="text-gray-400 text-lg">Real people, real results.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: "HabitEcho transformed my morning routine. 90 days straight!", author: "Sarah C.", role: "Product Designer" },
              { quote: "The streak tracking keeps me accountable. Can't break a 50-day streak!", author: "Marcus J.", role: "Engineer" },
              { quote: "Finally a habit tracker that looks beautiful and actually works.", author: "Emily R.", role: "Marketing" }
            ].map((t, i) => (
              <div key={i} className="p-8 rounded-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white/90 text-lg mb-6 italic leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                       style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.purple})` }}>
                    {t.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-white font-medium">{t.author}</p>
                    <p className="text-gray-500 text-sm">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6" style={{ backgroundColor: colors.background }}>
        <div className="max-w-3xl mx-auto text-center rounded-3xl p-16" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.purple})` }}>
          <h2 className="text-4xl font-bold text-white mb-5">
            Ready to build better habits?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Join thousands of people who've transformed their daily routines.
          </p>
          <Link 
            href={ROUTES.SIGNUP}
            className="inline-flex items-center justify-center bg-white text-indigo-600 px-8 py-3.5 rounded-full font-semibold text-lg hover:shadow-2xl hover:-translate-y-1 transition"
          >
            Start for free
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold" style={{ color: colors.text }}>FAQ</h2>
          </div>

          <div className="space-y-3">
            {[
              { q: "Is HabitEcho free?", a: "Yes! Completely free to use forever with all features." },
              { q: "Can I use on multiple devices?", a: "Yes, your data syncs across all your devices seamlessly." },
              { q: "How do reminders work?", a: "Set custom times for each habit and get notified at the perfect moment." }
            ].map((faq, i) => (
              <details key={i} className="group p-5 rounded-2xl border border-gray-100 bg-gray-50">
                <summary className="flex items-center justify-between cursor-pointer font-semibold list-none" style={{ color: colors.text }}>
                  <span>{faq.q}</span>
                  <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-gray-500 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t" style={{ borderColor: colors.border }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" 
                 style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.purple})` }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-base font-bold" style={{ color: colors.text }}>HabitEcho</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Contact</a>
          </div>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} HabitEcho</p>
        </div>
      </footer>
    </div>
    </>
  );
}