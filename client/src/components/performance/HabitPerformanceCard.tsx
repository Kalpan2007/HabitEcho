import Link from 'next/link';
import { Card, FrequencyBadge } from '@/components/ui';
import { ROUTES } from '@/lib/constants';
import { getMomentumDisplay, formatScheduleDays } from '@/lib/utils';
import { Heatmap } from './Heatmap';
import type { Habit, HabitPerformance } from '@/types';

// ============================================
// HABIT PERFORMANCE CARD
// Displays detailed analytics for a single habit
// ============================================

interface HabitPerformanceCardProps {
  habit: Habit;
  performance: HabitPerformance;
}

export function HabitPerformanceCard({ habit, performance }: HabitPerformanceCardProps) {
  const momentumDisplay = getMomentumDisplay(performance.momentum.trend);

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <Link href={`${ROUTES.HABITS}/${habit.id}`}>
              <h3 className="text-lg font-bold text-gray-800 hover:text-indigo-600">
                {habit.name}
              </h3>
            </Link>
            <div className="mt-1 flex items-center gap-2">
              <FrequencyBadge frequency={habit.frequency} />
              {habit.frequency === 'WEEKLY' && habit.scheduleDays && (
                <p className="text-xs text-gray-500">
                  {formatScheduleDays(habit.scheduleDays)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={momentumDisplay.textColor}>{momentumDisplay.icon}</span>
            <span className="font-semibold text-gray-700">{momentumDisplay.text}</span>
          </div>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 gap-4 px-6 pb-6 border-b border-gray-100">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xl font-bold text-gray-900">{performance.streaks.currentStreak}</p>
          <p className="text-xs text-gray-500">Current Streak</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xl font-bold text-gray-900">{performance.streaks.longestStreak}</p>
          <p className="text-xs text-gray-500">Longest Streak</p>
        </div>
      </div>

      {/* Rolling Averages */}
      <div className="px-6 pt-4 pb-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Rolling Average</h4>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-indigo-600">
            {performance.rollingAverage}%
          </span>
          <span className="text-xs text-gray-500">7-day completion</span>
        </div>
      </div>

      {/* Heatmap */}
      {performance.heatmap && performance.heatmap.length > 0 && (
        <div className="px-2 pt-2 pb-4">
          <Heatmap data={performance.heatmap} />
        </div>
      )}
    </Card>
  );
}
