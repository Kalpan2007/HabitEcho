import { cookies } from 'next/headers';
import Link from 'next/link';
import { API_BASE_URL, ROUTES } from '@/lib/constants';
import { Card, Badge, Button } from '@/components/ui';
import HabitHistoryClient from '@/components/profile/HabitHistoryClient';
import type { Habit, User } from '@/types';

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

async function getAllHabits(): Promise<Habit[]> {
    try {
        const cookieStore = await cookies();
        const response = await fetch(`${API_BASE_URL}/habits?limit=100`, {
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
        return {
            total: data.data.summary.totalHabits,
            active: data.data.summary.activeHabits
        };
    } catch {
        return { total: 0, active: 0 };
    }
}

export default async function ProfilePage({
    searchParams
}: {
    searchParams: Promise<{ view?: string }>
}) {
    const params = await searchParams;
    const activeTab = params.view || 'all';

    const [user, habits, stats] = await Promise.all([
        getUser(),
        getAllHabits(),
        getStatsCount()
    ]);

    if (!user) return <div className="p-8 text-center">Authentication session expired. Please login again.</div>;

    const archivedCount = stats.total - stats.active;

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
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
                            <Badge variant="default" className="bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-1">
                                {user.occupation}
                            </Badge>
                            <span className="text-sm text-gray-400 font-medium">Timezone: {user.timezone}</span>
                        </div>
                    </div>

                    {/* Quick Action */}
                    <div>
                        <Link href={ROUTES.PERFORMANCE}>
                            <Button className="bg-gray-900 text-white hover:bg-gray-800 shadow-xl shadow-gray-200 flex items-center gap-2 group">
                                View Full Analytics
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* 2. Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="?view=active#habits" className="block transition-transform hover:scale-[1.02] active:scale-[0.98]">
                    <Card className={`p-6 border-none shadow-lg transition-all ${activeTab === 'active' ? 'ring-4 ring-blue-200 shadow-blue-100' : 'shadow-blue-50'} bg-gradient-to-br from-blue-500 to-blue-600 text-white`}>
                        <p className="text-blue-100 font-medium text-sm">Active Habits</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-4xl font-bold">{stats.active}</span>
                            <span className="text-sm opacity-80">ongoing</span>
                        </div>
                    </Card>
                </Link>

                <Link href="?view=archived#habits" className="block transition-transform hover:scale-[1.02] active:scale-[0.98]">
                    <Card className={`p-6 border-none shadow-lg transition-all ${activeTab === 'archived' ? 'ring-4 ring-purple-200 shadow-purple-100' : 'shadow-purple-50'} bg-gradient-to-br from-purple-500 to-purple-600 text-white`}>
                        <p className="text-purple-100 font-medium text-sm">Ended Habits</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-4xl font-bold">{archivedCount}</span>
                            <span className="text-sm opacity-80">archived</span>
                        </div>
                    </Card>
                </Link>

                <Link href="?view=all#habits" className="block transition-transform hover:scale-[1.02] active:scale-[0.98]">
                    <Card className={`p-6 border-none shadow-lg transition-all ${activeTab === 'all' ? 'ring-4 ring-gray-200 shadow-gray-100' : 'shadow-gray-50'} bg-white ring-1 ring-gray-100`}>
                        <p className="text-gray-500 font-medium text-sm">Total Habits Tracking</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-4xl font-bold text-gray-900">{stats.total}</span>
                            <span className="text-sm text-gray-400">lifetime</span>
                        </div>
                    </Card>
                </Link>
            </div>

            {/* 3. Tabbed Habit Section (Client Side) */}
            <HabitHistoryClient initialHabits={habits} activeTab={activeTab} />
        </div>
    );
}
