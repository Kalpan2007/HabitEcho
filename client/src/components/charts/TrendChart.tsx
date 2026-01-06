'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { format, parseISO, subDays, isAfter } from 'date-fns';
import type { HeatmapDataPoint } from '@/types';

interface TrendChartProps {
    data: HeatmapDataPoint[];
}

import { useState, useEffect } from 'react';

export function TrendChart({ data }: TrendChartProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Calculate a rolling 7-day completion rate for each day in the dataset
    const processedData = data.map((point, index, array) => {
        // Get entries from the last 7 days relative to this point's date
        const date = parseISO(point.date);
        const weekStart = subDays(date, 7);

        // Filter window: entries strictly within (date - 7 days, date]
        const windowEntries = array.filter(p => {
            const pDate = parseISO(p.date);
            return isAfter(pDate, weekStart) && !isAfter(pDate, date);
        });

        const totalInWindow = 7; // Fixed window size assumption or windowEntries.length? 
        // Usually rolling average is based on "last 7 days". If data is sparse, we assume 0 for missing days?
        // The heatmapData likely contains entries for days that exist. If days are missing from DB, they aren't in array.
        // For a smoother chart, we might need filled dates. But for now, let's use the simple logic:
        // Rolling Success = (Count of Done + 0.5 * Count of Partial) / 7 * 100

        // Better: Just use the data points we have if they are contiguous daily. 
        // Assuming backend provided filled data (seed script did).

        // Let's calculate simple score for the window
        let windowScore = 0;
        windowEntries.forEach(p => {
            if (p.status === 'DONE') windowScore += 1;
            if (p.status === 'PARTIAL') windowScore += 0.5;
        });

        // Normalize to 100%
        const rate = Math.round((windowScore / 7) * 100);

        return {
            date: point.date,
            displayDate: format(parseISO(point.date), 'MMM d'),
            rate
        };
    }).slice(-30); // Show last 30 days trend

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl text-sm">
                    <p className="font-bold text-gray-900">{label}</p>
                    <p className="text-indigo-600 font-medium">
                        Consistency: {payload[0].value}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="h-[250px] w-full">
            {mounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <AreaChart data={processedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="displayDate"
                            tick={{ fontSize: 12, fill: '#9CA3AF' }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            hide
                            domain={[0, 100]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="rate"
                            stroke="#4F46E5"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRate)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
