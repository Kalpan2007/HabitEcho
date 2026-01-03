import { cookies } from 'next/headers';
import Link from 'next/link';
import { API_BASE_URL, ROUTES } from '@/lib/constants';
import { Card, FrequencyBadge, Badge } from '@/components/ui';
import { formatScheduleDays, formatDisplayDate } from '@/lib/utils';
import type { Habit, PaginatedResponse } from '@/types';

// ============================================
// HABITS LIST PAGE
// Server Component - fetches habits server-side
// ============================================

interface HabitsPageProps {
  searchParams: Promise<{ isActive?: string; page?: string }>;
}

async function getHabits(isActive?: boolean, page = 1): Promise<PaginatedResponse<Habit> | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const params = new URLSearchParams();
    if (isActive !== undefined) params.append('isActive', String(isActive));
    params.append('page', String(page));
    params.append('limit', '20');

    const response = await fetch(`${API_BASE_URL}/habits?${params}`, {
      credentials: 'include',
      cache: 'no-store',
      headers: { Cookie: cookieHeader },
    });

    if (!response.ok) return null;

    return await response.json();
  } catch {
    return null;
  }
}

export default async function HabitsPage({ searchParams }: HabitsPageProps) {
  const params = await searchParams;
  const isActive = params.isActive === 'true' ? true : params.isActive === 'false' ? false : undefined;
  const page = parseInt(params.page || '1', 10);

  const habitsResponse = await getHabits(isActive, page);
  const habits = habitsResponse?.data || [];
  const pagination = habitsResponse?.pagination;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Habits</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your habits
          </p>
        </div>
        <Link
          href={ROUTES.NEW_HABIT}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Habit
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Link
          href={ROUTES.HABITS}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            isActive === undefined
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </Link>
        <Link
          href={`${ROUTES.HABITS}?isActive=true`}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            isActive === true
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active
        </Link>
        <Link
          href={`${ROUTES.HABITS}?isActive=false`}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            isActive === false
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Inactive
        </Link>
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
                ? 'You don\'t have any inactive habits.'
                : 'Get started by creating your first habit.'}
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
          {habits.map((habit) => (
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
