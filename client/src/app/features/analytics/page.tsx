import { Metadata } from 'next';
import Link from 'next/link';
import { generateMetadata } from '@/lib/seo.config';
import { BreadcrumbSchema } from '@/components/seo/StructuredData';
import { ROUTES } from '@/lib/constants';

export const metadata: Metadata = generateMetadata({
  title: "Habit Analytics — Behavioral Insights & Performance Tracking",
  description: "Leverage predictive habit analytics, momentum scoring, and data-driven insights to optimize your habit formation. Track trends, analyze patterns, and improve consistency.",
  path: "/features/analytics",
  keywords: ["habit analytics", "behavioral insights", "momentum scoring", "habit trends", "performance tracking"],
});

export default function AnalyticsPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Features", url: "/features/analytics" },
    { name: "Analytics", url: "/features/analytics" },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <BreadcrumbSchema items={breadcrumbs} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="text-sm mb-6 opacity-90">
            <Link href="/" className="hover:underline">Home</Link> / 
            <span className="ml-1">Habit Analytics</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Data-Driven Habit Analytics & Behavioral Insights
          </h1>
          <p className="text-xl text-purple-100 max-w-3xl">
            Go beyond simple tracking. Understand your behavioral patterns with predictive analytics, 
            momentum scoring, and actionable insights that optimize your habit-building journey.
          </p>
          <div className="mt-8">
            <Link 
              href={ROUTES.SIGNUP}
              className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-purple-50 transition"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Analytics Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
          Advanced Analytics for Serious Habit Builders
        </h2>
        
        <div className="space-y-16">
          {/* Momentum Scoring */}
          <article className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Predictive Momentum Scoring</h3>
              <p className="text-slate-600 mb-4">
                HabitEcho's proprietary momentum algorithm analyzes your completion patterns to predict 
                habit sustainability. See which habits are gaining strength and which need attention before streaks break.
              </p>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Real-time momentum calculation based on recent performance
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Early warning system for at-risk habits
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Trend forecasting for long-term consistency
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-200">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-sm text-slate-500 mb-2">Momentum Score</p>
                <p className="text-4xl font-bold text-indigo-600 mb-4">87%</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Current Streak</span>
                    <span className="font-semibold">14 days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Completion Rate</span>
                    <span className="font-semibold">92%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Trend</span>
                    <span className="font-semibold text-green-600">↑ Improving</span>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Performance Heatmaps */}
          <article className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-200">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-sm text-slate-500 mb-4">Activity Heatmap</p>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }).map((_, i) => {
                    const intensity = Math.random();
                    return (
                      <div
                        key={i}
                        className="aspect-square rounded"
                        style={{
                          backgroundColor: intensity > 0.7 ? '#4f46e5' : intensity > 0.4 ? '#818cf8' : intensity > 0.2 ? '#c7d2fe' : '#e0e7ff'
                        }}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-4">Last 35 days of activity</p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Visual Performance Heatmaps</h3>
              <p className="text-slate-600 mb-4">
                See your consistency patterns at a glance. Heatmaps reveal your most productive days, 
                identify weak spots, and help you optimize your schedule for maximum habit adherence.
              </p>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Daily, weekly, and monthly intensity views
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Pattern recognition for behavioral insights
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Compare multiple habits side-by-side
                </li>
              </ul>
            </div>
          </article>

          {/* Trend Analysis */}
          <article className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Comprehensive Trend Analysis</h3>
            <p className="text-slate-600 mb-6 max-w-3xl">
              Track completion rates, streak history, and long-term progress with detailed trend charts. 
              Identify seasonal patterns, measure improvement, and make data-driven decisions about your routines.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { metric: "Completion Rate", value: "89%", trend: "+12% vs last month", positive: true },
                { metric: "Average Streak", value: "18 days", trend: "+5 days longer", positive: true },
                { metric: "Total Completions", value: "247", trend: "This month", positive: true },
              ].map((stat) => (
                <div key={stat.metric} className="bg-slate-50 rounded-xl p-6">
                  <p className="text-sm text-slate-500 mb-1">{stat.metric}</p>
                  <p className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</p>
                  <p className={`text-sm ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      {/* Insights Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
            Actionable Insights That Drive Results
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            HabitEcho doesn't just show you data — it tells you what to do with it.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Optimal Timing", description: "Discover your most productive hours for each habit" },
              { title: "Streak Protection", description: "Get alerts before important streaks are at risk" },
              { title: "Pattern Detection", description: "Identify hidden correlations between habits" },
              { title: "Progress Milestones", description: "Celebrate achievements and track long-term growth" },
            ].map((insight) => (
              <article key={insight.title} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{insight.title}</h3>
                <p className="text-sm text-slate-600">{insight.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Start Making Data-Driven Habit Decisions</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Stop guessing. Start optimizing. Get the analytics you need to build habits that last.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href={ROUTES.SIGNUP}
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-50 transition"
            >
              Start Free Trial
            </Link>
            <Link 
              href="/features/habit-tracking"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
