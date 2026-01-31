import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { clsx } from 'clsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { entriesApi } from '../../api/entries';
import type { Habit } from '../../types';
import dayjs from 'dayjs';

// We need to implement entriesApi in endpoints.ts first!
// Assuming it exists for now based on architecture plan.

interface HabitCardProps {
    habit: Habit;
    onPress: () => void;
}

export function HabitCard({ habit, onPress }: HabitCardProps) {
    const queryClient = useQueryClient();
    const today = dayjs().format('YYYY-MM-DD');

    // Check if completed today (mock logic until we have full heatmap data in the list)
    // Ideally backend returns 'todayStatus' or we check local cache.
    // For MVP, allow toggling visual state.

    const isCompleted = false; // To be replaced with real data check

    const toggleMutation = useMutation({
        mutationFn: async () => {
            // Logic to toggle
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
        }
    });

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100 flex-row items-center justify-between"
        >
            <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-lg">{habit.name}</Text>
                <Text className="text-gray-500 text-sm capitalize">{habit.frequency.toLowerCase()}</Text>
            </View>

            <TouchableOpacity
                className={clsx(
                    "w-10 h-10 rounded-full items-center justify-center border",
                    isCompleted ? "bg-green-500 border-green-500" : "bg-gray-50 border-gray-200"
                )}
            // onPress={() => toggleMutation.mutate()}
            >
                {isCompleted && <Text className="text-white font-bold">✓</Text>}
            </TouchableOpacity>
        </TouchableOpacity>
    );
}
