'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { habitsApi } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { Card, FrequencyBadge, Badge, Button, SkeletonCard } from '@/components/ui';
import { formatDisplayDate } from '@/lib/utils';
import type { Habit } from '@/types';

interface HabitHistoryClientProps {
    initialHabits: Habit[];
    activeTab: string;
}

export default function HabitHistoryClient({
    initialHabits,
    activeTab: initialTab
}: HabitHistoryClientProps) {
    const [activeTab, setActiveTab] = useState(initialTab);

    const habitsQuery = useQuery({
        queryKey: ['habits', { limit: 100 }],
        queryFn: () => habitsApi.getAll({ limit: 100 }),
        initialData: {
            success: true,
            message: 'Initial data',
            data: initialHabits,
            pagination: { total: initialHabits.length, page: 1, limit: 100, totalPages: 1 }
        } as any,
        staleTime: 30000,
    });

    const habits = habitsQuery.data?.data || [];
    const isLoading = habitsQuery.isFetching && habits.length === 0;

    // Filter habits based on tab
    const filteredHabits = habits.filter((h: Habit) => {
        if (activeTab === 'active') return h.isActive;
        if (activeTab === 'archived') return !h.isActive;
        return true;
    });

    const tabs = [
        { id: 'all', label: 'All' },
        { id: 'active', label: 'Active' },
        { id: 'archived', label: 'Archived' }
    ];

    return (
        <div className="pt-4 scroll-mt-24" id="habits">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 rounded-2xl">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeTab} Habits</h2>
                </div>

                <div className="flex bg-gray-100 p-1.5 rounded-2xl self-start">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {habitsQuery.isPending && habits.length === 0 ? (
                <div className="grid grid-cols-1 gap-5">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            ) : filteredHabits.length === 0 ? (
                <Card className="py-20 border-dashed border-2 border-gray-100 bg-gray-50/50">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-600 font-semibold text-lg">No {activeTab} habits found</p>
                        <p className="text-sm text-gray-400 mt-2 max-w-[280px] mx-auto leading-relaxed">
                            {activeTab === 'archived'
                                ? "When you end an active habit, it will appear here for your records."
                                : activeTab === 'active'
                                    ? "You don't have any habits running right now. Time to start one!"
                                    : "Start tracking your journey by creating your first habit!"}
                        </p>
                        {activeTab !== 'archived' && (
                            <Link href={ROUTES.NEW_HABIT} className="mt-8 inline-block">
                                <Button className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                                    + Create New Habit
                                </Button>
                            </Link>
                        )}
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-5">
                    {filteredHabits.map((habit: Habit) => (
                        <Card key={habit.id} className="p-6 transition-all hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-100 group bg-white border-transparent ring-1 ring-gray-100 overflow-hidden relative">
                            <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${habit.isActive ? 'bg-blue-500' : 'bg-gray-300'} group-hover:bg-indigo-500`}></div>

                            <div className="flex items-center justify-between relative z-10 lg:pl-2">
                                <Link href={ROUTES.HABIT_DETAIL(habit.id)} className="flex-1">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                {habit.name}
                                            </h3>
                                            {!habit.isActive && <Badge className="bg-gray-100 text-gray-500 text-[10px] py-0 px-1.5 h-4 font-bold">ARC</Badge>}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FrequencyBadge frequency={habit.frequency} className="h-5 px-2 text-[10px] font-bold" />
                                            <p className="text-sm text-gray-500 font-medium line-clamp-1">{habit.description}</p>
                                        </div>
                                    </div>
                                </Link>

                                <div className="flex flex-col items-end gap-4 ml-4">
                                    <div className="text-right">
                                        <Badge variant="default" className={`font-bold px-3 py-0.5 text-[10px] ring-1 ${habit.isActive
                                            ? 'bg-blue-50 text-blue-600 ring-blue-100'
                                            : 'bg-gray-100 text-gray-400 ring-gray-200'
                                            }`}>
                                            {habit.isActive ? 'ACTIVE' : 'ARCHIVED'}
                                        </Badge>
                                        <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">
                                            {habit.isActive ? 'Started' : 'Ended'} {habit.isActive ? formatDisplayDate(habit.startDate) : (habit.endDate ? formatDisplayDate(habit.endDate) : 'Unknown')}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {habit.isActive ? (
                                            <Link href={ROUTES.HABIT_DETAIL(habit.id)}>
                                                <Button size="sm" variant="outline" className="text-xs h-9 px-4 border-gray-200 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 shadow-sm font-bold transition-all">
                                                    Track Progress
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link href={`${ROUTES.HABITS}/new?templateId=${habit.id}`}>
                                                <Button size="sm" variant="outline" className="text-xs h-9 px-4 border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-sm font-bold transition-all flex items-center gap-2">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Restart
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
