import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { habitsApi } from '../../api/habits';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heatmap } from '../../components/habits/Heatmap';

export default function HabitDetailScreen() {
    const route = useRoute<any>();
    const { habitId } = route.params || {};

    const { data, isLoading } = useQuery({
        queryKey: ['habit', habitId],
        queryFn: () => habitsApi.getById(habitId),
        enabled: !!habitId
    });

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator color="#4f46e5" />
            </View>
        );
    }

    const habit = data?.data?.habit;

    if (!habit) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center">
                <Text>Habit not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold text-gray-900 mb-2">{habit.name}</Text>
            <Text className="text-gray-500 mb-6">{habit.description || 'No description'}</Text>

            <Text className="text-lg font-semibold mb-3">Consistency</Text>
            {/* Mock data for MVP */}
            <Heatmap data={[]} />

            <Text className="text-lg font-semibold mt-6 mb-3">Stats</Text>
            <View className="flex-row gap-4">
                <View className="bg-indigo-50 p-4 rounded-xl flex-1">
                    <Text className="text-indigo-800 font-bold text-xl">0</Text>
                    <Text className="text-indigo-600 text-xs">Current Streak</Text>
                </View>
                <View className="bg-green-50 p-4 rounded-xl flex-1">
                    <Text className="text-green-800 font-bold text-xl">0%</Text>
                    <Text className="text-green-600 text-xs">Completion</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}
