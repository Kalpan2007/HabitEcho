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

async function getAllHabits(): Promise<Habit[]> {
    try {
        const cookieStore = await cookies();
        // Fetch ALL habits, page 1, 100 limit
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

    if (!user) return <div>Load failed</div>;

    const archivedCount = stats.total - stats.active;

    // Filter habits based on tab
    const filteredHabits = habits.filter(h => {
        if (activeTab === 'active') return h.isActive;
        if (activeTab === 'archived') return !h.isActive;
        return true;
    });

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

            {/* 3. Tabbed Habit Section */}
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
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'active', label: 'Active' },
                            { id: 'archived', label: 'Archived' }
                        ].map(tab => (
                            <Link
                                key={tab.id}
                                href={`?view=${tab.id}#habits`}
                                className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {filteredHabits.length === 0 ? (
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
                        {filteredHabits.map(habit => (
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
        </div>
    );
}
