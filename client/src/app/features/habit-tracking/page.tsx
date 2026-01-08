import { Metadata } from 'next';
import Link from 'next/link';
import { generateMetadata } from '@/lib/seo.config';
import { BreadcrumbSchema } from '@/components/seo/StructuredData';
import { ROUTES } from '@/lib/constants';

export const metadata: Metadata = generateMetadata({
  title: "Habit Tracking Features — Track Daily Habits & Build Streaks",
  description: "Discover HabitEcho's powerful habit tracking features: daily habit monitoring, streak tracking, custom schedules, smart reminders, and real-time analytics to help you build lasting habits.",
  path: "/features/habit-tracking",
  keywords: ["habit tracking", "streak tracker", "daily habit monitoring", "habit reminders", "custom habit schedules"],
});

export default function HabitTrackingPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Features", url: "/features/habit-tracking" },
    { name: "Habit Tracking", url: "/features/habit-tracking" },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <BreadcrumbSchema items={breadcrumbs} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="text-sm mb-6 opacity-90">
            <Link href="/" className="hover:underline">Home</Link> / 
            <span className="ml-1">Habit Tracking Features</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Advanced Habit Tracking Features for Building Consistent Routines
          </h1>
          <p className="text-xl text-indigo-100 max-w-3xl">
            Track daily habits with precision. Monitor streaks, analyze patterns, and build lasting routines 
            with HabitEcho's enterprise-grade habit tracking platform.
          </p>
          <div className="mt-8 flex gap-4">
            <Link 
              href={ROUTES.SIGNUP}
              className="bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-indigo-50 transition"
            >
              Start Tracking Habits Free
            </Link>
            <Link 
              href={ROUTES.LOGIN}
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
          Everything You Need to Track Habits Effectively
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Daily Habit Tracking",
              description: "Log habit completions with a single tap. Track multiple habits simultaneously with intuitive check-ins and quick logging.",
              keywords: "daily tracking, habit logging, quick check-in",
            },
            {
              title: "Streak Monitoring",
              description: "Visualize your consistency with automatic streak tracking. See current streaks, personal records, and momentum trends.",
              keywords: "streak counter, consistency tracking",
            },
            {
              title: "Custom Schedules",
              description: "Set habits for daily, weekly, or custom frequencies. Perfect for routines that don't repeat every day.",
              keywords: "flexible scheduling, custom frequency",
            },
            {
              title: "Smart Reminders",
              description: "Never miss a habit with intelligent reminder notifications. Customize timing to match your routine.",
              keywords: "habit reminders, notifications",
            },
            {
              title: "Performance Heatmaps",
              description: "See your activity patterns at a glance with visual heatmaps showing completion intensity over time.",
              keywords: "visual analytics, heatmap tracking",
            },
            {
              title: "Progress Analytics",
              description: "Track completion rates, identify trends, and measure improvement with detailed analytics and insights.",
              keywords: "habit analytics, progress tracking",
            },
          ].map((feature) => (
            <article key={feature.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 mb-4">{feature.description}</p>
              <p className="text-xs text-slate-400">{feature.keywords}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
            Perfect for Any Habit-Building Goal
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Whether you're building morning routines, fitness habits, or productivity practices, 
            HabitEcho adapts to your needs.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                category: "Health & Fitness Habits",
                habits: ["Daily exercise", "Meditation", "Drinking water", "Sleep tracking", "Healthy eating"],
                link: "/use-cases/fitness-habits",
              },
              {
                category: "Productivity Habits",
                habits: ["Deep work sessions", "Morning routine", "Evening planning", "Reading", "Skill practice"],
                link: "/use-cases/productivity-habits",
              },
              {
                category: "Personal Development",
                habits: ["Journaling", "Learning", "Gratitude practice", "Mindfulness", "Goal review"],
                link: "/use-cases/daily-habits",
              },
              {
                category: "Social & Lifestyle",
                habits: ["Networking", "Quality time", "Hobbies", "Creative work", "Self-care"],
                link: "/use-cases/daily-habits",
              },
            ].map((useCase) => (
              <article key={useCase.category} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">{useCase.category}</h3>
                <ul className="space-y-2 mb-4">
                  {useCase.habits.map((habit) => (
                    <li key={habit} className="flex items-center text-slate-600">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {habit}
                    </li>
                  ))}
                </ul>
                <Link href={useCase.link} className="text-indigo-600 font-semibold hover:text-indigo-700 text-sm">
                  Learn more →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Better Habits?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals using HabitEcho to build consistent daily routines 
            and achieve their personal growth goals.
          </p>
          <Link 
            href={ROUTES.SIGNUP}
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-50 transition"
          >
            Start Tracking Habits Free
          </Link>
        </div>
      </section>
    </main>
  );
}
