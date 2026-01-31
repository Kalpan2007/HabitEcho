import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { habitsApi } from '../../api/habits';
import { Heatmap } from '../../components/habits/Heatmap';

export default function PerformanceScreen() {
    const habits = data?.data?.habits || [];
    const totalActive = habits.length;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView contentContainerClassName="p-6">
                <Text className="text-3xl font-bold text-gray-900 mb-6">Performance</Text>

                <View className="flex-row gap-4 mb-6">
                    <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Text className="text-3xl font-bold text-indigo-600">{totalActive}</Text>
                        <Text className="text-gray-500 text-sm">Active Habits</Text>
                    </View>
                    <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Text className="text-3xl font-bold text-green-600">--</Text>
                        <Text className="text-gray-500 text-sm">Completion Rate</Text>
                    </View>
                </View>

                <Text className="text-lg font-bold text-gray-800 mb-4">Activity Heatmap (Mock)</Text>
                {/* 
                    Ideally we fetch aggregated user entries for the heatmap. 
                    For now, passing empty or mock data until backend supports 'get all entries'.
                 */}
                <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <Heatmap data={[]} />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
