import { cookies } from 'next/headers';
import Link from 'next/link';
import { API_BASE_URL, ROUTES } from '@/lib/constants';
import { Card, FrequencyBadge, Badge, Button } from '@/components/ui';
import { formatDisplayDate } from '@/lib/utils';
import type { Habit, PaginatedResponse, User } from '@/types';

// ============================================
// PROFILE PAGE
// ============================================

async function getUser(): Promise<User | null> {
    try {
        const cookieStore = await cookies();
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Cookie: cookieStore.toString() },
            cache: 'no-store'
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.data.user;
    } catch {
        return null;
    }
}

async function getInactiveHabits(): Promise<Habit[]> {
    try {
        const cookieStore = await cookies();
        // Fetch inactive habits, page 1, 100 limit just to be safe for a list
        const response = await fetch(`${API_BASE_URL}/habits?isActive=false&limit=100`, {
            headers: { Cookie: cookieStore.toString() },
            cache: 'no-store'
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.data || [];
    } catch {
        return [];
    }
}

async function getStatsCount() {
    try {
        const cookieStore = await cookies();
        const response = await fetch(`${API_BASE_URL}/performance/summary`, {
            headers: { Cookie: cookieStore.toString() },
            cache: 'no-store'
        });
        if (!response.ok) return { total: 0, active: 0 };
        const data = await response.json();
        // performance summary usually has totalHabits and activeHabits
        return {
            total: data.data.summary.totalHabits,
            active: data.data.summary.activeHabits
        };
    } catch {
        return { total: 0, active: 0 };
    }
}

export default async function ProfilePage() {
    const [user, inactiveHabits, stats] = await Promise.all([
        getUser(),
        getInactiveHabits(),
        getStatsCount()
    ]);

    if (!user) return <div>Load failed</div>;

    const endedCount = stats.total - stats.active;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* 1. Hero Profile Section */}
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl shadow-indigo-100 ring-1 ring-black/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none -mr-16 -mt-16"></div>

                <div className="relative z-10 p-8 flex flex-col md:flex-row items-center gap-8">
                    {/* Avatar */}
                    <div className="h-24 w-24 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-indigo-200 ring-4 ring-white">
                        {user.fullName.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl font-bold text-gray-900">{user.fullName}</h1>
                        <p className="text-gray-500 font-medium">{user.email}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3 justify-center md:justify-start">
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-1">
                                {user.occupation}
                            </Badge>
                            <span className="text-sm text-gray-400">Timezone: {user.timezone}</span>
                        </div>
                    </div>

                    {/* Quick Action */}
                    <div>
                        <Link href={ROUTES.PERFORMANCE}>
                            <Button className="bg-gray-900 text-white hover:bg-gray-800 shadow-xl shadow-gray-200">
                                View Full Analytics →
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* 2. Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-none shadow-lg shadow-blue-50 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <p className="text-blue-100 font-medium text-sm">Active Habits</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-4xl font-bold">{stats.active}</span>
                        <span className="text-sm opacity-80">ongoing</span>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-lg shadow-purple-50 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <p className="text-purple-100 font-medium text-sm">Ended Habits</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-4xl font-bold">{endedCount}</span>
                        <span className="text-sm opacity-80">archived</span>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-lg shadow-gray-50 bg-white ring-1 ring-gray-100">
                    <p className="text-gray-500 font-medium text-sm">Total Habits Created</p>
                    <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-4xl font-bold text-gray-900">{stats.total}</span>
                        <span className="text-sm text-gray-400">lifetime</span>
                    </div>
                </Card>
            </div>


            {/* 3. History / Archive Section */}
            <div className="pt-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Habit History</h2>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        {inactiveHabits.length} Archived
                    </Badge>
                </div>

                {inactiveHabits.length === 0 ? (
                    <Card className="py-12 border-dashed border-2 border-gray-100 bg-gray-50/50">
                        <div className="text-center">
                            <p className="text-gray-400">No archived habits found.</p>
                            <p className="text-sm text-gray-400 mt-1">When you end a habit, it will appear here.</p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {inactiveHabits.map(habit => (
                            <Link key={habit.id} href={ROUTES.HABIT_DETAIL(habit.id)}>
                                <Card className="p-5 hover:shadow-md transition-all hover:border-gray-300 group cursor-pointer bg-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                {habit.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{habit.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-500">Ended</Badge>
                                            <p className="text-xs text-gray-400 mt-2">
                                                Ended on {habit.endDate ? formatDisplayDate(habit.endDate) : 'Unknown'}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
