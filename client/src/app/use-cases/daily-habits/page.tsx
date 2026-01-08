import { Metadata } from 'next';
import Link from 'next/link';
import { generateMetadata } from '@/lib/seo.config';
import { BreadcrumbSchema, FAQSchema } from '@/components/seo/StructuredData';
import { ROUTES } from '@/lib/constants';

export const metadata: Metadata = generateMetadata({
  title: "Daily Habit Tracking — Build Consistent Morning & Evening Routines",
  description: "Learn how to build and maintain daily habits with HabitEcho. Track morning routines, evening rituals, and daily practices to create lasting behavioral change.",
  path: "/use-cases/daily-habits",
  keywords: ["daily habits", "morning routine", "evening routine", "daily practice", "consistent habits"],
});

const dailyHabitsFAQ = [
  {
    question: "How do I start building daily habits?",
    answer: "Start small with 2-3 keystone habits that align with your goals. Use HabitEcho to track them daily, set reminders, and monitor your streak. Focus on consistency over intensity in the first 30 days.",
  },
  {
    question: "What are the best daily habits to track?",
    answer: "The best daily habits depend on your goals, but common high-impact habits include morning exercise, meditation, journaling, reading, drinking water, and evening planning. Choose habits that compound over time.",
  },
  {
    question: "How long does it take to form a daily habit?",
    answer: "Research shows habit formation takes 18-254 days depending on complexity, with an average of 66 days. HabitEcho's streak tracking and momentum scoring help you stay consistent through the entire formation period.",
  },
];

export default function DailyHabitsPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Use Cases", url: "/use-cases/daily-habits" },
    { name: "Daily Habits", url: "/use-cases/daily-habits" },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={dailyHabitsFAQ} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="text-sm mb-6 opacity-90">
            <Link href="/" className="hover:underline">Home</Link> / 
            <Link href="/use-cases/daily-habits" className="hover:underline ml-1">Use Cases</Link> /
            <span className="ml-1">Daily Habits</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Master Daily Habits: Build Powerful Morning & Evening Routines
          </h1>
          <p className="text-xl text-indigo-100 max-w-3xl">
            Transform your life one day at a time. Track daily habits, build consistent routines, 
            and create lasting behavioral change with HabitEcho's intelligent tracking system.
          </p>
        </div>
      </section>

      {/* Morning Routine Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Build an Unstoppable Morning Routine</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <p className="text-slate-600 mb-6">
              Your morning sets the tone for your entire day. With HabitEcho, track essential morning 
              habits that compound into extraordinary results over time.
            </p>
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Essential Morning Habits to Track:</h3>
            <ul className="space-y-3">
              {[
                "Wake up at consistent time (circadian rhythm optimization)",
                "Morning hydration (8oz water within 30 minutes)",
                "Exercise or movement (10-60 minutes)",
                "Meditation or mindfulness (5-20 minutes)",
                "Healthy breakfast (protein + nutrients)",
                "Morning planning (review goals and priorities)",
                "Reading or learning (15-30 minutes)",
              ].map((habit) => (
                <li key={habit} className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-700">{habit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">Sample Morning Routine</h3>
            <div className="space-y-4">
              {[
                { time: "6:00 AM", habit: "Wake up", icon: "🌅" },
                { time: "6:05 AM", habit: "Drink water + supplements", icon: "💧" },
                { time: "6:15 AM", habit: "Meditation", icon: "🧘" },
                { time: "6:30 AM", habit: "Exercise", icon: "💪" },
                { time: "7:15 AM", habit: "Shower + dress", icon: "🚿" },
                { time: "7:30 AM", habit: "Healthy breakfast", icon: "🥗" },
                { time: "8:00 AM", habit: "Review goals + plan day", icon: "📋" },
              ].map((item) => (
                <div key={item.time} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{item.habit}</p>
                    <p className="text-sm text-slate-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Evening Routine Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Create a Calming Evening Ritual</h2>
          <p className="text-slate-600 mb-8 max-w-3xl">
            Evening routines are crucial for quality sleep and next-day preparation. Track habits 
            that help you wind down, reflect, and set yourself up for success.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Reflection Habits", habits: ["Journaling", "Gratitude practice", "Day review", "Goal check-in"] },
              { title: "Preparation Habits", habits: ["Next day planning", "Lay out clothes", "Prep breakfast", "Review calendar"] },
              { title: "Wind-Down Habits", habits: ["No screens 1hr before bed", "Reading", "Stretching", "Consistent bedtime"] },
            ].map((category) => (
              <article key={category.title} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">{category.title}</h3>
                <ul className="space-y-2">
                  {category.habits.map((habit) => (
                    <li key={habit} className="flex items-start text-slate-600">
                      <span className="text-indigo-600 mr-2">•</span>
                      {habit}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
          Pro Tips for Building Consistent Daily Habits
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              tip: "Start Small",
              description: "Begin with 2-3 habits maximum. Master consistency before adding more. Use HabitEcho to track your starting habits until they become automatic.",
            },
            {
              tip: "Stack Habits",
              description: "Link new habits to existing routines. 'After I pour coffee, I will meditate for 5 minutes.' Habit stacking increases adherence rates by 40%.",
            },
            {
              tip: "Track Immediately",
              description: "Log completions right after doing them. HabitEcho's quick check-in makes this effortless, reinforcing positive behavior instantly.",
            },
            {
              tip: "Use Reminders Wisely",
              description: "Set reminders for specific times when you're most likely to complete the habit. Don't rely on motivation — build systems with HabitEcho's smart reminders.",
            },
            {
              tip: "Monitor Your Streak",
              description: "Streaks create momentum. HabitEcho's streak counter visualizes your consistency and creates psychological commitment to maintain progress.",
            },
            {
              tip: "Review Weekly",
              description: "Every Sunday, review your completion rates and adjust. HabitEcho's analytics show patterns you might miss day-to-day.",
            },
          ].map((item) => (
            <article key={item.tip} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.tip}</h3>
              <p className="text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Frequently Asked Questions About Daily Habits
          </h2>
          <div className="space-y-4">
            {dailyHabitsFAQ.map((faq, index) => (
              <details key={index} className="bg-white rounded-xl border border-slate-200 p-6">
                <summary className="text-lg font-semibold text-slate-900 cursor-pointer">{faq.question}</summary>
                <p className="mt-4 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Start Building Your Daily Habits Today</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands who've transformed their lives with consistent daily habits tracked in HabitEcho.
          </p>
          <Link 
            href={ROUTES.SIGNUP}
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-50 transition"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </main>
  );
}
