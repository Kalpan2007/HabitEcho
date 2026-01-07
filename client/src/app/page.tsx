import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Logo } from '@/components/ui';

const display = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HabitEcho — Precision Habit Intelligence',
  description: 'A private-first habit intelligence platform with adaptive insights, effortless tracking, and deep accountability.',
};

const differentiators = [
  {
    title: '⚡ Low-Latency Hydration',
    description: 'TanStack Query v5 with server-side hydration keeps dashboards reactive without flicker.',
  },
  {
    title: '🛡️ Dual-Token Security',
    description: 'Access + refresh rotation with HttpOnly cookies and timeout middleware protects every session.',
  },
  {
    title: '📊 Predictive Analytics Engine',
    description: 'Momentum scoring, streak logic, heatmaps, and precision summaries are computed on dedicated services.',
  },
  {
    title: '🚀 Optimized Data Layer',
    description: 'Prisma select clauses and targeted payloads cut response sizes by up to 60% versus naïve includes.',
  },
  {
    title: '✨ Production-Grade UX',
    description: 'Skeleton states, Framer Motion micro-interactions, and responsive charts maintain focus.',
  },
];

const featureMatrix = [
  {
    category: 'Analytics',
    feature: 'Momentum Trend Analysis',
    benefit: 'Visualize whether streaks are accelerating or stagnating in real time.',
  },
  {
    category: 'Domain Engine',
    feature: 'Granular Scheduling',
    benefit: 'Custom, weekly, and monthly cadences with precision logging and reminders.',
  },
  {
    category: 'Experience',
    feature: 'Optimistic UI Updates',
    benefit: 'Actions feel instantaneous while TanStack Query syncs on the background thread.',
  },
  {
    category: 'Security',
    feature: 'Token Rotation Flow',
    benefit: 'Rotated refresh tokens keep long-lived sessions resilient to replay attacks.',
  },
  {
    category: 'Backend',
    feature: 'Request Pipeline Control',
    benefit: 'Rate limits and global timeouts prevent stalled resources and abusive workloads.',
  },
];

const techBadges = [
  { label: 'Next.js 16 — App Router', color: '#000000' },
  { label: 'TypeScript 5.x', color: '#1f6feb' },
  { label: 'TanStack Query v5', color: '#eab308' },
  { label: 'Express + Prisma', color: '#2d3748' },
  { label: 'PostgreSQL 16', color: '#1d4ed8' },
];

const architecturePoints = [
  'Decoupled Next.js + Express services with Supabase/PostgreSQL as the single source of truth.',
  'Service-oriented backend layers keep controllers slim and aggressively typed end-to-end.',
  'Stateless JWT access tokens backed by database refresh tokens for horizontal scaling.',
  'React Query cache hygiene ensures logout clears user data immediately.',
];

export default function LandingPage() {
  return (
    <main className={`${display.className} bg-slate-50`}>
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.2),transparent_55%),radial-gradient(circle_at_80%_0,rgba(79,70,229,0.18),transparent_45%)]" />
        <div className="relative flex min-h-screen flex-col">
          <header className="mt-6 flex justify-center px-4 lg:mt-12 lg:px-6">
            <div className="flex w/full max-w-4xl flex-wrap items-center gap-3 rounded-full bg-slate-900 px-4 py-2 shadow-2xl shadow-slate-900/30 text-slate-200 sm:gap-4 sm:px-6 sm:py-2.5">
              <span className="flex items-center gap-3 rounded-full bg-white px-3 py-1 text-slate-900 shadow">
                <Logo size={28} showText={false} />
              </span>
              <nav className="flex flex-1 items-center justify-center gap-4 text-xs font-semibold whitespace-nowrap overflow-x-auto sm:text-sm">
                <a href="#platform" className="transition hover:text-white px-1">Platform</a>
                <a href="#intelligence" className="transition hover:text-white px-1">Intelligence</a>
                <a href="#evidence" className="transition hover:text-white px-1">Evidence</a>
                <a href="#architecture" className="transition hover:text-white px-1">Architecture</a>
              </nav>
              <button className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-white/80 hover:text-white whitespace-nowrap">
                Get access
              </button>
            </div>
          </header>

          <section id="platform" className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-8 lg:flex-row lg:items-start lg:py-12">
            <div className="flex-1 space-y-8">
              <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                High-Performance Behavioral Engineering Platform
              </div>
              <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl lg:text-[2.9rem] lg:leading-snug">
                HabitEcho
                <span className="block bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  high-fidelity habit telemetry
                </span>
                engineered for enterprise-grade personal growth.
              </h1>
              <p className="text-base text-slate-600 sm:text-lg">
                Built with Next.js 16, TanStack Query v5, and an Express + Prisma backend, HabitEcho couples predictive analytics,
                low-latency hydration, and a zero-trust security posture so serious performers can stay in flow.
              </p>
              <div className="flex flex-wrap gap-2">
                {techBadges.map((badge) => (
                  <span
                    key={badge.label}
                    className="rounded-full border px-3 py-1 text-xs font-semibold text-slate-700"
                    style={{ borderColor: badge.color }}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={ROUTES.SIGNUP}
                  className="group inline-flex flex-col rounded-2xl bg-indigo-600 px-6 py-4 text-white shadow-xl shadow-indigo-600/30 transition hover:-translate-y-0.5 hover:bg-indigo-500"
                >
                  <span className="text-lg font-semibold">Enter HabitEcho</span>
                  <span className="text-xs text-white/80">3 min onboarding • encrypted</span>
                </Link>
                <Link
                  href={ROUTES.LOGIN}
                  className="inline-flex flex-col rounded-2xl border border-slate-200 bg-white px-6 py-4 text-slate-900 shadow-sm transition hover:-translate-y-0.5"
                >
                  <span className="text-lg font-semibold">I already have an account</span>
                  <span className="text-xs text-slate-500">Continue where you left off</span>
                </Link>
              </div>
            </div>

            <div className="flex w/full max-w-lg flex-col self-start rounded-[32px] border border-white/80 bg-white/95 p-6 shadow-2xl">
              <div className="rounded-[26px] bg-linear-to-br from-slate-900 to-indigo-900 p-6 text-white">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-indigo-200">Momentum scoring</p>
                    <p className="text-3xl font-semibold">Precision 100%</p>
                  </div>
                  <span className="self-start rounded-full bg-emerald-500/15 px-4 py-1 text-xs font-semibold text-emerald-200">
                    Server verified
                  </span>
                </div>
                <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
                  <div className="flex flex-1 flex-col gap-3">
                    <div className="grid grid-cols-6 gap-2">
                      {[40, 55, 72, 88, 64, 90].map((value, idx) => (
                        <div key={idx} className="flex h-28 items-end rounded-full bg-white/10 p-1">
                          <span
                            className="w-full rounded-full bg-linear-to-t from-white/60 to-white"
                            style={{ height: `${value}%` }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-3 text-sm text-slate-200 lg:grid-cols-3">
                      {[
                        { label: 'Heatmap Engine', detail: 'Realtime completion intensity' },
                        { label: 'Latency Guard', detail: 'SLO < 120ms' },
                        { label: 'Cache Hygiene', detail: 'Logout clears query data' },
                      ].map((item) => (
                        <div key={item.label}>
                          <p className="font-semibold">{item.label}</p>
                          <p className="text-xs text-slate-300">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 rounded-3xl border border-white/10 bg-white/10 p-6 text-center">
                    <p className="text-xs uppercase tracking-[0.35em] text-indigo-200">Security telemetry</p>
                    <p className="mt-3 text-4xl font-semibold">Dual Token</p>
                    <p className="text-sm text-slate-200">Access + refresh rotation</p>
                    <div className="mt-6 rounded-2xl bg-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-indigo-100">Pipeline Health</p>
                      <p className="mt-2 text-lg text-white">Rate limiting • timeout control</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid gap-4 rounded-[26px] border border-slate-100 bg-white/90 p-4 text-slate-900 shadow-lg md:grid-cols-3">
                {[
                  { label: 'Zero-Trust Security', detail: 'Dual-token flow • HttpOnly cookies' },
                  { label: 'Predictive Momentum', detail: 'Heatmaps • streak precision' },
                  { label: 'Live Supabase Edge', detail: 'Migrations + seed data applied' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

        <section className="landing-section" id="intelligence">
          <div className="section-heading">
            <p>Why HabitEcho is different</p>
            <h2>Everything here mirrors the production architecture documented in our README.</h2>
          </div>
          <div className="differentiator-grid">
            {differentiators.map((item) => (
              <article key={item.title} className="differentiator-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section landing-evidence" id="evidence">
          <div className="evidence-card">
            <p className="badge">User Signals</p>
            <blockquote>
              “Switching HabitEcho to my morning ritual felt like switching on ambient intelligence.
              It surfaces the exact friction I’m ignoring, then quietly nudges me back into cadence.”
            </blockquote>
            <div className="author">
              <div>
                <p>Sasha Martin</p>
                <span>Product Lead • Ritual Labs</span>
              </div>
              <div className="author-stats">
                <p>+27%</p>
                <span>Consistent weeks</span>
              </div>
            </div>
          </div>
          <div className="evidence-stack">
            <div className="stack-card">
              <p className="text-sm text-indigo-600 font-semibold">Architecture</p>
              <h3>Service-Oriented Logic</h3>
              <p>Habits, analytics, and performance run on dedicated services so controllers stay testable and thin.</p>
            </div>
            <div className="stack-card">
              <p className="text-sm text-indigo-600 font-semibold">Typed end-to-end</p>
              <h3>Strict TypeScript</h3>
              <p>Schema → API → React components share the same types for predictable deploys.</p>
            </div>
            <div className="stack-card">
              <p className="text-sm text-indigo-600 font-semibold">Stateless auth</p>
              <h3>Token Rotation</h3>
              <p>JWT access tokens pair with DB-backed refresh tokens for horizontal scaling.</p>
            </div>
          </div>
        </section>

        <section className="landing-section feature-matrix">
          <div className="section-heading">
            <p>Key capabilities</p>
            <h2>Production features shipping today.</h2>
          </div>
          <div className="matrix-grid">
            {featureMatrix.map((row) => (
              <div key={row.feature} className="matrix-row">
                <p className="matrix-category">{row.category}</p>
                <div>
                  <h3>{row.feature}</h3>
                  <p>{row.benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-section architecture" id="architecture">
          <div className="section-heading">
            <p>Architecture snapshot</p>
            <h2>Decoupled Next.js + Express stack with Supabase/Postgres at the core.</h2>
          </div>
          <div className="architecture-card">
            <div className="architecture-diagram">
              <div className="layer">Next.js Client <span>App Router • React 19</span></div>
              <div className="layer">Gateway &amp; Middleware <span>Auth • rate limit • timeout</span></div>
              <div className="layer">Service Layer <span>Habit • Analytics • Performance</span></div>
              <div className="layer">Supabase Postgres <span>Prisma ORM • migrations + seeds</span></div>
            </div>
            <ul>
              {architecturePoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </section>

        <footer className="landing-footer">
          <p>© {new Date().getFullYear()} HabitEcho. Built for focused humans.</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href={ROUTES.LOGIN} className="hover:text-indigo-600">Login</Link>
            <Link href={ROUTES.SIGNUP} className="hover:text-indigo-600">Signup</Link>
          </div>
        </footer>
        </div>
      </div>
    </main>
  );
}
