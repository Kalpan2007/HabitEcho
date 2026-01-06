'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type { HeatmapDataPoint } from '@/types';

interface ActivityChartProps {
    data: HeatmapDataPoint[];
}

import { useState, useEffect } from 'react';

export function ActivityChart({ data }: ActivityChartProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Process data for the chart
    // Filter last 30 days for better visibility or show all if density allows
    // Let's show last 30 days by default for clarity
    const recentData = data.slice(-30).map(point => ({
        ...point,
        score: point.status === 'DONE' ? 100 : point.status === 'PARTIAL' ? 50 : 0,
        displayDate: format(parseISO(point.date), 'MMM d'),
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const status = payload[0].payload.status;
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-xl text-sm">
                    <p className="font-bold text-gray-900">{label}</p>
                    <p className={`font-medium ${status === 'DONE' ? 'text-green-600' :
                        status === 'PARTIAL' ? 'text-yellow-600' : 'text-red-500'
                        }`}>
                        {status === 'DONE' ? 'Completed' : status === 'PARTIAL' ? 'Partial' : 'Missed'}
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
                    <BarChart data={recentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="displayDate"
                            tick={{ fontSize: 12, fill: '#9CA3AF' }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={20}
                        />
                        <YAxis
                            hide
                            domain={[0, 100]}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="score" radius={[4, 4, 4, 4]} barSize={20}>
                            {recentData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        entry.status === 'DONE' ? '#4F46E5' : // Indigo 600
                                            entry.status === 'PARTIAL' ? '#F59E0B' : // Amber 500
                                                '#EEF2FF' // Indigo 50 (for missed/placeholder appearance)
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
