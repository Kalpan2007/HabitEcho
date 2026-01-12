'use client';

import { cn } from '@/lib/utils';
import type { HeatmapDataPoint } from '@/types';

// ============================================
// HEATMAP COMPONENT - Client Component
// Visualizes habit completion over time
// ============================================

interface HeatmapProps {
  data: HeatmapDataPoint[];
  className?: string;
}

export function Heatmap({ data, className }: HeatmapProps) {
  // Get the value color based on completion
  const getColor = (value: number, status: string | null): string => {
    if (value === -1) {
      // Not scheduled
      return 'bg-gray-50';
    }
    if (value === 0) {
      // Missed or NOT_DONE
      if (status === 'NOT_DONE') {
        return 'bg-red-200';
      }
      return 'bg-gray-200'; // No entry
    }
    if (value === 100) {
      return 'bg-green-500';
    }
    if (value >= 75) {
      return 'bg-green-400';
    }
    if (value >= 50) {
      return 'bg-yellow-400';
    }
    if (value >= 25) {
      return 'bg-yellow-300';
    }
    return 'bg-orange-300';
  };

  // Group data by week
  const weeks: HeatmapDataPoint[][] = [];
  let currentWeek: HeatmapDataPoint[] = [];

  // Sort data by date (already in YYYY-MM-DD format)
  const sortedData = [...data].sort(
    (a, b) => a.date.localeCompare(b.date)
  );

  sortedData.forEach((point, index) => {
    // Parse YYYY-MM-DD date string
    const [year, month, day] = point.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();

    // Start new week on Sunday
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentWeek.push(point);

    // Push last week
    if (index === sortedData.length - 1) {
      weeks.push(currentWeek);
    }
  });

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={cn('overflow-x-auto', className)}>
      <div className="inline-flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-2">
          {dayLabels.map((day, i) => (
            <div
              key={day}
              className="h-3 w-8 text-[10px] text-gray-500 flex items-center"
            >
              {i % 2 === 0 ? day : ''}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((point) => {
              // Parse YYYY-MM-DD date string
              const [year, month, day] = point.date.split('-').map(Number);
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              const formattedDate = `${monthNames[month - 1]} ${day}`;

              return (
                <div
                  key={point.date}
                  className={cn(
                    'h-3 w-3 rounded-sm transition-colors',
                    getColor(point.value ?? 0, point.status)
                  )}
                  title={`${formattedDate}: ${
                    point.value === -1
                      ? 'Not scheduled'
                      : point.value === 0
                      ? point.status === 'NOT_DONE'
                        ? 'Missed'
                        : 'No entry'
                      : `${point.value}%`
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-gray-200" />
          <span>No entry</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-red-200" />
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-yellow-400" />
          <span>Partial</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-green-500" />
          <span>Done</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-gray-50" />
          <span>Not scheduled</span>
        </div>
      </div>
    </div>
  );
}
