import Link from 'next/link';
import { Card, FrequencyBadge } from '@/components/ui';
import { ROUTES } from '@/lib/constants';
import { getMomentumDisplay, formatScheduleDays } from '@/lib/utils';
import { YearlyHeatmap } from './YearlyHeatmap';
import type { Habit, HabitPerformance } from '@/types';

// ============================================
// HABIT PERFORMANCE CARD - GitHub Style
// Displays analytics with yearly contribution graph
// ============================================

interface HabitPerformanceCardProps {
  habit: Habit;
  performance: HabitPerformance;
}

export function HabitPerformanceCard({ habit, performance }: HabitPerformanceCardProps) {
  const momentumDisplay = getMomentumDisplay(performance.momentum.trend);

  return (
    <Card>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <Link href={`${ROUTES.HABITS}/${habit.id}`}>
              <h3 className="text-base font-bold text-gray-900 hover:text-purple-600 transition-colors">
                {habit.name}
              </h3>
            </Link>
            <FrequencyBadge frequency={habit.frequency} />
            {habit.frequency === 'WEEKLY' && habit.scheduleDays && (
              <p className="text-xs text-gray-500">
                {formatScheduleDays(habit.frequency, habit.scheduleDays)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className={momentumDisplay.color}>{momentumDisplay.icon}</span>
            <span className="font-semibold text-gray-700">{momentumDisplay.label}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-6 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
            <span className="text-gray-600">
              <span className="font-bold text-gray-900">{performance.streaks.currentStreak}</span> day streak
            </span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-gray-600">
              <span className="font-bold text-gray-900">{performance.streaks.longestStreak}</span> longest
            </span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-gray-600">
              <span className="font-bold text-purple-600">{performance.rollingAverage}%</span> last 7 days
            </span>
          </div>
        </div>

        {/* Yearly Heatmap */}
        {performance.heatmap && performance.heatmap.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <YearlyHeatmap
              data={performance.heatmap}
              frequency={habit.frequency}
              scheduleDays={habit.scheduleDays}
              startDate={habit.startDate}
              endDate={habit.endDate}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
