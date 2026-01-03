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
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href={ROUTES.HABIT_DETAIL(habit.id)}
            className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
          >
            {habit.name}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <FrequencyBadge frequency={habit.frequency} />
            <span className="text-sm text-gray-500">
              {formatScheduleDays(habit.frequency, habit.scheduleDays)}
            </span>
          </div>
        </div>
        <div className={`text-sm font-medium ${momentumDisplay.color}`}>
          {momentumDisplay.icon} {momentumDisplay.label}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xl font-bold text-gray-900">{performance.completionRate}%</p>
          <p className="text-xs text-gray-500">Completion</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xl font-bold text-gray-900">{performance.currentStreak}</p>
          <p className="text-xs text-gray-500">Current Streak</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xl font-bold text-gray-900">{performance.longestStreak}</p>
          <p className="text-xs text-gray-500">Longest Streak</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xl font-bold text-green-600">{performance.completedEntries}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xl font-bold text-red-600">{performance.missedEntries}</p>
          <p className="text-xs text-gray-500">Missed</p>
        </div>
      </div>

      {/* Rolling Averages */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Rolling Averages</h4>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {performance.rollingAverages.last7Days}%
            </span>
            <span className="text-xs text-gray-500">7 days</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {performance.rollingAverages.last14Days}%
            </span>
            <span className="text-xs text-gray-500">14 days</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {performance.rollingAverages.last30Days}%
            </span>
            <span className="text-xs text-gray-500">30 days</span>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      {performance.heatmapData && performance.heatmapData.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Activity Heatmap</h4>
          <Heatmap data={performance.heatmapData} />
        </div>
      )}
    </Card>
  );
}
