'use client';

import { cn, isScheduledDay } from '@/lib/utils';
import type { HeatmapDataPoint, Frequency } from '@/types';

// ============================================
// YEARLY HEATMAP - GitHub Contribution Style
// Displays full year activity in a compact grid
// ============================================

interface YearlyHeatmapProps {
    data: HeatmapDataPoint[];
    frequency: Frequency;
    scheduleDays: number[] | null;
    startDate: string;
    endDate: string | null;
    className?: string;
}

export function YearlyHeatmap({
    data,
    frequency,
    scheduleDays,
    startDate,
    endDate,
    className
}: YearlyHeatmapProps) {
    // Get color based on completion percentage
    const getColor = (value: number, status: string | null, isScheduled: boolean, isFuture: boolean): string => {
        if (!isScheduled || isFuture) {
            // Not scheduled or future date (grey)
            return 'bg-gray-200 border-gray-300';
        }
        if (value === -1) {
            // Not scheduled explicitly in data
            return 'bg-gray-200 border-gray-300';
        }
        if (status === 'DONE' || value === 100) {
            // Completed (green)
            return 'bg-green-500 border-green-600';
        }
        if (status === 'PARTIAL' || (value > 0 && value < 100)) {
            // Partial (yellow)
            return 'bg-yellow-400 border-yellow-500';
        }
        // Missed/Empty (red)
        return 'bg-red-400 border-red-500';
    };

    const getLabel = (value: number, status: string | null, isScheduled: boolean, isFuture: boolean): string => {
        if (!isScheduled) return 'Not scheduled';
        if (isFuture) return 'Future';
        if (value === -1) return 'Not scheduled';
        if (status === 'DONE' || value === 100) return 'Completed';
        if (status === 'PARTIAL') return `${value}% complete`;
        return 'Missed';
    };

    // Sort data by date
    const sortedData = [...data].sort((a, b) => a.date.localeCompare(b.date));

    if (sortedData.length === 0) return null;

    // Get date range
    const [firstYear, firstMonth, firstDay] = sortedData[0].date.split('-').map(Number);
    const firstDate = new Date(firstYear, firstMonth - 1, firstDay);

    const [lastYear, endMonth, lastDay] = sortedData[sortedData.length - 1].date.split('-').map(Number);
    const lastDate = new Date(lastYear, endMonth - 1, lastDay);


    // Create a map for quick lookup
    // Normalize date keys to YYYY-MM-DD to avoid mismatch with ISO strings
    const dataMap = new Map(sortedData.map(d => [d.date.split('T')[0], d]));

    // Generate weeks from first Sunday before/on start to last Saturday after/on end
    const start = new Date(firstDate);
    start.setDate(start.getDate() - start.getDay()); // Go to previous/current Sunday

    const end = new Date(lastDate);
    end.setDate(end.getDate() + (6 - end.getDay())); // Go to next/current Saturday

    // Build week structure
    const weeks: { date: Date; point?: HeatmapDataPoint }[][] = [];
    let currentWeek: { date: Date; point?: HeatmapDataPoint }[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const current = new Date(start);
    while (current <= end) {
        const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
        const point = dataMap.get(dateStr);

        currentWeek.push({ date: new Date(current), point });

        if (current.getDay() === 6) {
            weeks.push(currentWeek);
            currentWeek = [];
        }

        current.setDate(current.getDate() + 1);
    }

    // Get month labels
    const monthLabels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIndex) => {
        const firstDayOfWeek = week[0].date;
        const month = firstDayOfWeek.getMonth();
        if (month !== lastMonth && weekIndex > 0) {
            monthLabels.push({
                month: firstDayOfWeek.toLocaleDateString('en-US', { month: 'short' }),
                weekIndex,
            });
            lastMonth = month;
        } else if (weekIndex === 0) {
            monthLabels.push({
                month: firstDayOfWeek.toLocaleDateString('en-US', { month: 'short' }),
                weekIndex: 0,
            });
            lastMonth = month;
        }
    });

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className={cn('overflow-x-auto', className)}>
            <div className="inline-flex flex-col gap-1">
                {/* Month labels */}
                <div className="flex items-center gap-0.5 ml-16">
                    {monthLabels.map((label, i) => (
                        <div
                            key={i}
                            className="text-[10px] text-gray-500 font-medium"
                            style={{
                                marginLeft: i === 0 ? 0 : `${(label.weekIndex - (monthLabels[i - 1]?.weekIndex || 0)) * 14}px`
                            }}
                        >
                            {label.month}
                        </div>
                    ))}
                </div>

                {/* Heatmap grid */}
                <div className="flex gap-1">
                    {/* Day labels */}
                    <div className="flex flex-col gap-0.5">
                        {dayLabels.map((day, i) => (
                            <div
                                key={day}
                                className="h-3 w-12 text-[9px] text-gray-500 flex items-center"
                            >
                                {i % 2 === 1 ? day : ''}
                            </div>
                        ))}
                    </div>

                    {/* Weeks grid */}
                    <div className="flex gap-0.5">
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-0.5">
                                {week.map((day, dayIndex) => {
                                    const dateStr = day.date.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    });

                                    // Check if day is scheduled
                                    const isScheduled = isScheduledDay(
                                        day.date,
                                        frequency,
                                        scheduleDays,
                                        startDate,
                                        endDate
                                    );

                                    const isFuture = day.date > new Date(); // Simple check, more robust below

                                    // Use normalized date for future check
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const currentDay = new Date(day.date);
                                    currentDay.setHours(0, 0, 0, 0);
                                    const isFutureDate = currentDay > today;

                                    return (
                                        <div
                                            key={dayIndex}
                                            className={cn(
                                                'h-3 w-3 rounded-sm border transition-all cursor-pointer hover:ring-2 hover:ring-purple-400',
                                                getColor(day.point?.value ?? 0, day.point?.status ?? null, isScheduled, isFutureDate)
                                            )}
                                            title={`${dateStr}: ${getLabel(day.point?.value ?? 0, day.point?.status ?? null, isScheduled, isFutureDate)}`}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
