'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { Card, FrequencyBadge, Badge } from '@/components/ui';
import { formatScheduleDays, formatDisplayDate } from '@/lib/utils';
import { HabitSearch } from '@/components/habits/HabitSearch';
import { useHabits } from '@/hooks/useHabits';
import type { Habit } from '@/types';

interface HabitsListClientProps {
    initialHabits: Habit[];
    isActive: boolean;
    search: string;
    page: number;
}

export function HabitsListClient({
    initialHabits,
    isActive,
    search,
    page
}: HabitsListClientProps) {
    const habitsQuery = useHabits({
        isActive,
        search: search || undefined,
        page,
        limit: 20,
        initialData: initialHabits
    } as any);

    const habits = habitsQuery.data?.data || [];
    const pagination = habitsQuery.data?.pagination;

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Active Habits</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Track and manage your ongoing goals
                    </p>
                </div>
                <Link
                    href={ROUTES.NEW_HABIT}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Habit
                </Link>
            </div>

            {/* Search Bar */}
            <div className="w-full">
                <HabitSearch />
            </div>

            {/* Habits list */}
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
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No habits found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {isActive === false
                                ? "You don't have any inactive habits."
                                : "Get started by creating your first habit."}
                        </p>
                        {isActive !== false && (
                            <div className="mt-6">
                                <Link
                                    href={ROUTES.NEW_HABIT}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Create your first habit
                                </Link>
                            </div>
                        )}
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    {habits.map((habit: Habit) => (
                        <Link key={habit.id} href={ROUTES.HABIT_DETAIL(habit.id)}>
                            <Card className="hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-semibold text-gray-900 truncate">
                                                {habit.name}
                                            </h3>
                                            {!habit.isActive && (
                                                <Badge variant="default">Inactive</Badge>
                                            )}
                                        </div>
                                        {habit.description && (
                                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                                {habit.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 mt-3">
                                            <FrequencyBadge frequency={habit.frequency} />
                                            <span className="text-xs text-gray-500">
                                                {formatScheduleDays(habit.frequency, habit.scheduleDays)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right text-xs text-gray-500 ml-4">
                                        <p>Started {formatDisplayDate(habit.startDate)}</p>
                                        {habit.endDate && (
                                            <p className="mt-1">Ends {formatDisplayDate(habit.endDate)}</p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-gray-500">
                        Showing {habits.length} of {pagination.total} habits
                    </p>
                    <div className="flex gap-2">
                        {page > 1 && (
                            <Link
                                href={`${ROUTES.HABITS}?${isActive !== undefined ? `isActive=${isActive}&` : ''}page=${page - 1}`}
                                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Previous
                            </Link>
                        )}
                        {page < pagination.totalPages && (
                            <Link
                                href={`${ROUTES.HABITS}?${isActive !== undefined ? `isActive=${isActive}&` : ''}page=${page + 1}`}
                                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Next
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
