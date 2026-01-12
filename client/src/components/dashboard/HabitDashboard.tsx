'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { StatCard, Card, StatusBadge, FrequencyBadge } from '@/components/ui';
import { formatScheduleDays, getToday, getMomentumDisplay, formatDisplayDate } from '@/lib/utils';
import { useHabits } from '@/hooks/useHabits';
import { useSummary } from '@/hooks/usePerformance';
import { useHabitHistory } from '@/hooks/useEntries';
import type { Habit, HabitEntry } from '@/types';

function HabitItem({ habit }: { habit: Habit }) {
    const today = getToday();
    const { data: historyData } = useHabitHistory(habit.id, {
        startDate: today,
        endDate: today,
        limit: 1
    });

    const entry = historyData?.data?.[0];

    return (
        <Link
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

            <div>
                <StatusBadge
                    status={entry?.status || null}
                    percentComplete={entry?.percentComplete}
                />
            </div>
        </Link>
    );
}

export function HabitDashboard() {
    const { data: summaryData, isLoading: isSummaryLoading } = useSummary();
    const { data: habitsData, isLoading: isHabitsLoading } = useHabits({ isActive: true });

    const summary = summaryData?.data?.summary;
    const habits = habitsData?.data || [];

    const momentumDisplay = summary?.momentum
        ? getMomentumDisplay(summary.momentum.trend)
        : null;

    if (isSummaryLoading || isHabitsLoading) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-gray-100 rounded-2xl border border-gray-200"></div>
                    ))}
                </div>
                <div className="h-64 bg-gray-100 rounded-2xl border border-gray-200"></div>
            </div>
        );
    }

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
                        value={`${summary.todayCompletion?.completed ?? 0}/${summary.todayCompletion?.total ?? summary.todayCompletion?.scheduled ?? 0}`}
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
                                    <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                                    <circle
                                        cx="18" cy="18" r="16" fill="none" stroke="#4f46e5" strokeWidth="4"
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
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No habits yet</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating your first habit.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {habits.map((habit: Habit) => (
                            <HabitItem key={habit.id} habit={habit} />
                        ))}
                    </div>
                )}
            </Card>

            {/* Rolling averages */}
            {summary?.rollingAverage && (
                <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Rolling Averages</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900">{summary.rollingAverage.last7Days}%</p>
                            <p className="text-sm text-gray-500">Last 7 days</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900">{summary.rollingAverage.last14Days}%</p>
                            <p className="text-sm text-gray-500">Last 14 days</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900">{summary.rollingAverage.last30Days}%</p>
                            <p className="text-sm text-gray-500">Last 30 days</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
