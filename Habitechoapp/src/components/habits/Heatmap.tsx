import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import dayjs from 'dayjs';
import { clsx } from 'clsx';
import type { HeatmapDataPoint } from '../../types';

interface HeatmapProps {
    data: HeatmapDataPoint[];
    year?: number;
}

export function Heatmap({ data, year = dayjs().year() }: HeatmapProps) {
    // Generate valid dates for the year to render the grid
    const daysInYear = [];
    const startOfYear = dayjs(`${year}-01-01`);

    // Create a map for quick lookup
    const dataMap = new Map();
    data.forEach(d => dataMap.set(d.date, d.status));

    // Generate 365/366 days
    for (let i = 0; i < 366; i++) {
        const date = startOfYear.add(i, 'day');
        if (date.year() !== year) break;
        daysInYear.push({
            date: date.format('YYYY-MM-DD'),
            status: dataMap.get(date.format('YYYY-MM-DD')) || 'EMPTY'
        });
    }

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
            <View className="flex-row flex-wrap h-32 w-[600px] gap-1">
                {daysInYear.map((day) => (
                    <View
                        key={day.date}
                        className={clsx(
                            "w-3 h-3 rounded-sm",
                            day.status === 'DONE' ? "bg-green-500" :
                                day.status === 'PARTIAL' ? "bg-green-300" :
                                    day.status === 'NOT_DONE' ? "bg-red-200" :
                                        "bg-gray-100"
                        )}
                        style={{ width: 12, height: 12, margin: 1 }}
                    />
                ))}
            </View>
        </ScrollView>
    );
}
