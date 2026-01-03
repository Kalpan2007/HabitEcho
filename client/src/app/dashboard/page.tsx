import { cookies } from 'next/headers';
import Link from 'next/link';
import { API_BASE_URL, ROUTES } from '@/lib/constants';
import { StatCard, Card, StatusBadge, FrequencyBadge } from '@/components/ui';
import { formatScheduleDays, getToday, getMomentumDisplay } from '@/lib/utils';
import type { PerformanceSummary, Habit, HabitEntry } from '@/types';

// ============================================
// DASHBOARD PAGE
// Server Component - fetches data server-side
// ============================================

// Fetch performance summary
async function getPerformanceSummary(): Promise<PerformanceSummary | null> {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${API_BASE_URL}/performance/summary`, {
      credentials: 'include',
      cache: 'no-store',
      headers: { Cookie: cookieStore.toString() },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.data.summary;
  } catch {
    return null;
  }
}

// Fetch habits
async function getHabits(): Promise<Habit[]> {
  try {
    const cookieStore = await cookies();
    const response = await fetch(`${API_BASE_URL}/habits?isActive=true&limit=100`, {
      credentials: 'include',
      cache: 'no-store',
      headers: { Cookie: cookieStore.toString() },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch {
    return [];
  }
}

// Fetch today's entries for all habits
async function getTodayEntries(habitIds: string[]): Promise<Map<string, HabitEntry>> {
  const entries = new Map<string, HabitEntry>();
  const today = getToday();

  try {
    const cookieStore = await cookies();
    const results = await Promise.all(
      habitIds.map(async (id) => {
        const response = await fetch(
          `${API_BASE_URL}/habits/${id}/history?startDate=${today}&endDate=${today}&limit=1`,
          {
            credentials: 'include',
            cache: 'no-store',
            headers: { Cookie: cookieStore.toString() },
          }
        );
        if (!response.ok) return null;
        const data = await response.json();
        const entry = data.data?.[0];
        return entry ? { habitId: id, entry } : null;
      })
    );

    results.forEach((result) => {
      if (result) {
        entries.set(result.habitId, result.entry);
      }
    });
  } catch {
    // Ignore errors
  }
  return entries;
}

export default async function DashboardPage() {
  const [summary, habits] = await Promise.all([
    getPerformanceSummary(),
    getHabits(),
  ]);

  const todayEntries = await getTodayEntries(habits.map((h) => h.id));

  const momentumDisplay = summary?.momentum
    ? getMomentumDisplay(summary.momentum.trend)
    : null;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here&apos;s your habit overview.
        </p>
      </div>

      {/* Stats grid */}
      {summary && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Today's Progress"
            value={`${summary.todayCompletion.completed}/${summary.todayCompletion.total}`}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
            label="Completion Rate"
            value={`${summary.overallCompletionRate}%`}
            icon={
              <div className="relative flex items-center justify-center">
                <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="text-indigo-600 drop-shadow-sm"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${summary.overallCompletionRate}, 100`}
                  />
                </svg>
              </div>
            }
          />
          <StatCard
            label="Momentum"
            value={momentumDisplay?.icon || '→'}
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

      {/* Today's habits */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Today&apos;s Habits</h2>
            <p className="text-sm text-gray-500 mt-1">Focus on what matters today</p>
          </div>
          <Link
            href={ROUTES.NEW_HABIT}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-lg shadow-indigo-200 text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-105"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Habit
          </Link>
        </div>

        {habits.length === 0 ? (
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No habits yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first habit.</p>
            <div className="mt-6">
              <Link
                href={ROUTES.NEW_HABIT}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Create your first habit
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => {
              const entry = todayEntries.get(habit.id);

              return (
                <Link
                  key={habit.id}
                  href={ROUTES.HABIT_DETAIL(habit.id)}
                  className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-indigo-100 group"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {habit.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <FrequencyBadge frequency={habit.frequency} />
                      <span className="text-xs text-gray-500">
                        {formatScheduleDays(habit.frequency, habit.scheduleDays)}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge Only */}
                  <div>
                    <StatusBadge
                      status={entry?.status || null}
                      percentComplete={entry?.percentComplete}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      {/* Rolling averages */}
      {summary && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rolling Averages</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{summary.rollingAverages.last7Days}%</p>
              <p className="text-sm text-gray-500">Last 7 days</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{summary.rollingAverages.last14Days}%</p>
              <p className="text-sm text-gray-500">Last 14 days</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{summary.rollingAverages.last30Days}%</p>
              <p className="text-sm text-gray-500">Last 30 days</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
