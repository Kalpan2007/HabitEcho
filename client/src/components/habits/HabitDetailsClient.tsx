'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { Card, StatusBadge, FrequencyBadge, Button } from '@/components/ui';
import { HabitEntryLogger } from '@/components/habits/HabitEntryLogger';
import { ArchiveHabitButton } from '@/components/habits/ArchiveHabitButton';
import { ActivityChart } from '@/components/charts/ActivityChart';
import { TrendChart } from '@/components/charts/TrendChart';
import { getMomentumDisplay, formatScheduleDays } from '@/lib/utils';
import { useHabitDetail } from '@/hooks/useHabits';
import { useHabitPerformance } from '@/hooks/usePerformance';
import { useHabitHistory } from '@/hooks/useEntries';
import { getToday } from '@/lib/utils';

export function HabitDetailsClient({ habitId }: { habitId: string }) {
    const { data: detailData, isLoading: isDetailLoading } = useHabitDetail(habitId);
    const { data: performanceData, isLoading: isPerfLoading } = useHabitPerformance(habitId);

    const today = getToday();
    const { data: historyData } = useHabitHistory(habitId, {
        startDate: today,
        endDate: today,
        limit: 1
    });

    const habit = detailData?.data?.habit;
    const performance = performanceData?.data?.performance;
    const todayEntry = historyData?.data?.[0];

    if (isDetailLoading || isPerfLoading) {
        return <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-100 rounded-3xl"></div>
            <div className="h-96 bg-gray-100 rounded-3xl"></div>
        </div>;
    }

    if (!habit || !performance) return <div>Habit not found</div>;

    const momentumDisplay = getMomentumDisplay(performance.momentum.trend);
    const completionColor =
        performance.completionRate >= 80 ? 'text-green-600' :
            performance.completionRate >= 50 ? 'text-indigo-600' :
                'text-gray-600';

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header Section with Glassmorphism */}
            <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl shadow-indigo-100 ring-1 ring-black/5">
                <div className="absolute top-0 right-0 -tr-16 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <Link
                                href={ROUTES.DASHBOARD}
                                className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                                ← Back to Dashboard
                            </Link>
                            <span className="text-gray-300">•</span>
                            <FrequencyBadge frequency={habit.frequency} />
                        </div>

                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">
                            {habit.name}
                        </h1>

                        {habit.description && (
                            <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
                                {habit.description}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-4 mt-8">
                            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-700 font-medium text-sm border border-indigo-100">
                                <span className="text-xl">🔥</span>
                                {performance.currentStreak} Day Streak
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm border ${performance.momentum.trend === 'UP' ? 'bg-green-50 text-green-700 border-green-100' :
                                performance.momentum.trend === 'DOWN' ? 'bg-red-50 text-red-700 border-red-100' :
                                    'bg-gray-50 text-gray-700 border-gray-100'
                                }`}>
                                <span>{momentumDisplay.icon}</span>
                                Momentum {performance.momentum.trend === 'UP' ? 'Rising' : 'Dropping'}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center justify-center p-6 bg-gray-50 rounded-2xl border border-gray-100 min-w-[160px]">
                            <div className="text-center">
                                <div className="relative inline-flex items-center justify-center">
                                    <svg className="w-24 h-24 transform -rotate-90">
                                        <circle
                                            className="text-gray-200"
                                            strokeWidth="8"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="40"
                                            cx="48"
                                            cy="48"
                                        />
                                        <circle
                                            className={`${completionColor} transition-all duration-1000 ease-out`}
                                            strokeWidth="8"
                                            strokeDasharray={251.2}
                                            strokeDashoffset={251.2 - (251.2 * performance.completionRate) / 100}
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="40"
                                            cx="48"
                                            cy="48"
                                        />
                                    </svg>
                                    <span className={`absolute text-2xl font-bold ${completionColor}`}>
                                        {performance.completionRate}%
                                    </span>
                                </div>
                                <p className="mt-2 text-sm font-medium text-gray-500">Completion Rate</p>
                            </div>
                        </div>

                        {habit.isActive && (
                            <ArchiveHabitButton habitId={habit.id} habitName={habit.name} />
                        )}
                    </div>
                </div>
            </div>

            {/* Today's Logger Section */}
            <HabitEntryLogger
                habitId={habit.id}
                habitName={habit.name}
                initialEntry={todayEntry || null}
                frequency={habit.frequency}
                scheduleDays={habit.scheduleDays}
            />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Activity Chart */}
                    <Card className="overflow-hidden border-none shadow-lg shadow-gray-100">
                        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                            <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-500">Last 30 Days</span>
                        </div>
                        <div className="p-6">
                            <ActivityChart data={performance.heatmapData} />
                        </div>
                    </Card>

                    {/* Trend Chart */}
                    <Card className="border-none shadow-lg shadow-gray-100">
                        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Consistency Trend</h3>
                            <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">Rolling Average</span>
                        </div>
                        <div className="p-6">
                            <TrendChart data={performance.heatmapData} />
                        </div>
                    </Card>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <Card className="border-none shadow-lg shadow-gray-100 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                        <div className="p-6">
                            <h3 className="text-lg font-bold mb-1 opacity-90">Longest Streak</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-bold tracking-tighter">{performance.longestStreak}</span>
                                <span className="text-lg font-medium opacity-75">days</span>
                            </div>
                            <p className="mt-4 text-sm opacity-80 leading-relaxed">
                                Keep pushing! Consistency is the key to building lasting habits.
                            </p>
                        </div>
                    </Card>

                    <Card className="border-none shadow-lg shadow-gray-100">
                        <div className="px-6 py-4 border-b border-gray-50">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Stats Overview</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                <span className="text-gray-500">Total Entries</span>
                                <span className="font-bold text-gray-900">{performance.totalEntries}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                <span className="text-gray-500">Completed</span>
                                <span className="font-bold text-green-600">{performance.completedEntries}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                <span className="text-gray-500">Missed</span>
                                <span className="font-bold text-red-500">{performance.missedEntries}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Partials</span>
                                <span className="font-bold text-yellow-600">{performance.partialEntries}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
