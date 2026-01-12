import { cookies } from 'next/headers';
import Link from 'next/link';
import { API_BASE_URL, ROUTES } from '@/lib/constants';
import { Card, StatCard } from '@/components/ui';
import { getMomentumDisplay } from '@/lib/utils';
import { Heatmap } from '@/components/performance/Heatmap';
import { HabitPerformanceCard } from '@/components/performance/HabitPerformanceCard';
import type { PerformanceSummary, Habit, HabitPerformance } from '@/types';

// ============================================
// PERFORMANCE PAGE
// Server Component - fetches analytics data
// ============================================

async function getPerformanceSummary(): Promise<PerformanceSummary | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const response = await fetch(`${API_BASE_URL}/performance/summary`, {
      credentials: 'include',
      cache: 'no-store',
      headers: { Cookie: cookieHeader },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.data.summary;
  } catch {
    return null;
  }
}

async function getActiveHabits(): Promise<Habit[]> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const response = await fetch(`${API_BASE_URL}/habits?isActive=true&limit=100`, {
      credentials: 'include',
      cache: 'no-store',
      headers: { Cookie: cookieHeader },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.data || [];
  } catch {
    return [];
  }
}

async function getHabitPerformances(habitIds: string[]): Promise<Map<string, HabitPerformance>> {
  const performances = new Map<string, HabitPerformance>();

  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const results = await Promise.all(
      habitIds.map(async (id) => {
        const response = await fetch(`${API_BASE_URL}/performance/habit/${id}`, {
          credentials: 'include',
          cache: 'no-store',
          headers: { Cookie: cookieHeader },
        });

        if (!response.ok) return null;

        const data = await response.json();
        return { id, performance: data.data.performance };
      })
    );

    results.forEach((result) => {
      if (result) {
        performances.set(result.id, result.performance);
      }
    });
  } catch {
    // Ignore errors
  }

  return performances;
}

export default async function PerformancePage() {
  const [summary, habits] = await Promise.all([
    getPerformanceSummary(),
    getActiveHabits(),
  ]);

  const performances = await getHabitPerformances(habits.map((h) => h.id));

  const momentumDisplay = summary?.momentum
    ? getMomentumDisplay(summary.momentum.trend)
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Performance</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your habit analytics and progress
        </p>
      </div>

      {/* Overall Stats */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Overall Completion"
            value={`${summary.overallCompletionRate}%`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <StatCard
            label="Current Streak"
            value={`${summary.currentStreak} days`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            }
          />
          <StatCard
            label="Longest Streak"
            value={`${summary.longestStreak} days`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            }
          />
          <StatCard
            label="Momentum"
            value={momentumDisplay?.label || 'Stable'}
            change={
              summary.momentum
                ? {
                    value: summary.momentum.percentageChange,
                    trend: summary.momentum.trend.toLowerCase() as 'up' | 'down' | 'stable',
                  }
                : undefined
            }
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </div>
      )}

      {/* Rolling Averages */}
      {summary?.rollingAverage && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rolling Averages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-indigo-600">{summary.rollingAverage.last7Days}%</p>
              <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-indigo-600">{summary.rollingAverage.last14Days}%</p>
              <p className="text-sm text-gray-500 mt-1">Last 14 days</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-indigo-600">{summary.rollingAverage.last30Days}%</p>
              <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
            </div>
          </div>
        </Card>
      )}

      {/* Individual Habit Performance */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Habit Analytics</h2>
        
        {habits.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No habits to analyze</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create some habits to see your performance analytics.
              </p>
              <div className="mt-6">
                <Link
                  href={ROUTES.NEW_HABIT}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create your first habit
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {habits.map((habit) => {
              const performance = performances.get(habit.id);
              if (!performance) return null;

              return (
                <HabitPerformanceCard
                  key={habit.id}
                  habit={habit}
                  performance={performance}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
