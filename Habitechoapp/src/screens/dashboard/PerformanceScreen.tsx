import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { performanceApi } from '../../api/performance';
import { habitsApi } from '../../api/habits';

export default function PerformanceScreen() {
    // Fetch performance summary
    const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useQuery({
        queryKey: ['performance', 'summary'],
        queryFn: () => performanceApi.getSummary()
    });

    // Fetch active habits for counting
    const { data: habitsData, isLoading: habitsLoading } = useQuery({
        queryKey: ['habits', { isActive: true }],
        queryFn: () => habitsApi.getAll({ isActive: true })
    });

    if (summaryLoading || habitsLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text className="text-gray-500 mt-4">Loading performance data...</Text>
            </View>
        );
    }

    if (summaryError) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 items-center justify-center p-6">
                    <Text className="text-red-600 font-semibold mb-2">Error loading performance</Text>
                    <Text className="text-gray-500 text-center">
                        {summaryError instanceof Error ? summaryError.message : 'Failed to load data'}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    // Extract data from response structure
    const summary = summaryData?.summary;
    const habits = habitsData?.habits || [];
    const totalActive = habits.length;
    const completionRate = summary?.overallCompletionRate || 0;
    const currentStreak = summary?.currentStreak || 0;
    const longestStreak = summary?.longestStreak || 0;
    const todayCompletion = summary?.todayCompletion;
    const rollingAverage = summary?.rollingAverage;
    const momentum = summary?.momentum;

    const getMomentumColor = () => {
        if (!momentum) return 'text-gray-600';
        switch (momentum.trend) {
            case 'UP': return 'text-green-600';
            case 'DOWN': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getMomentumIcon = () => {
        if (!momentum) return '→';
        switch (momentum.trend) {
            case 'UP': return '↑';
            case 'DOWN': return '↓';
            default: return '→';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="p-6">
                <Text className="text-3xl font-bold text-gray-900 mb-6">Performance</Text>

                {/* Key Stats Grid */}
                <View className="flex-row flex-wrap gap-4 mb-6">
                    <View className="flex-1 min-w-[45%] bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Text className="text-3xl font-bold text-indigo-600">{totalActive}</Text>
                        <Text className="text-gray-500 text-sm">Active Habits</Text>
                    </View>
                    <View className="flex-1 min-w-[45%] bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Text className="text-3xl font-bold text-green-600">{completionRate}%</Text>
                        <Text className="text-gray-500 text-sm">Completion Rate</Text>
                    </View>
                    <View className="flex-1 min-w-[45%] bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Text className="text-3xl font-bold text-orange-600">{currentStreak}</Text>
                        <Text className="text-gray-500 text-sm">Current Streak</Text>
                    </View>
                    <View className="flex-1 min-w-[45%] bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Text className="text-3xl font-bold text-purple-600">{longestStreak}</Text>
                        <Text className="text-gray-500 text-sm">Longest Streak</Text>
                    </View>
                </View>

                {/* Today's Completion */}
                {todayCompletion && (
                    <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <Text className="text-lg font-bold text-gray-900 mb-4">Today's Progress</Text>
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-gray-600">Completed</Text>
                            <Text className="text-2xl font-bold text-indigo-600">
                                {todayCompletion.completed} / {todayCompletion.total || todayCompletion.scheduled}
                            </Text>
                        </View>
                        {/* Progress Bar */}
                        <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <View 
                                className="h-full bg-indigo-600"
                                style={{ width: `${todayCompletion.percentage}%` }}
                            />
                        </View>
                        <Text className="text-right text-gray-500 text-sm mt-1">
                            {todayCompletion.percentage}%
                        </Text>
                    </View>
                )}

                {/* Momentum */}
                {momentum && (
                    <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <Text className="text-lg font-bold text-gray-900 mb-4">Momentum</Text>
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-gray-600">Trend</Text>
                                <Text className={`text-3xl font-bold ${getMomentumColor()}`}>
                                    {getMomentumIcon()} {momentum.trend}
                                </Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-gray-600">Change</Text>
                                <Text className={`text-2xl font-bold ${getMomentumColor()}`}>
                                    {momentum.percentageChange > 0 ? '+' : ''}{momentum.percentageChange}%
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Rolling Averages */}
                {rollingAverage && (
                    <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <Text className="text-lg font-bold text-gray-900 mb-4">Rolling Averages</Text>
                        <View className="gap-4">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-600">Last 7 days</Text>
                                <Text className="text-2xl font-bold text-gray-900">{rollingAverage.last7Days}%</Text>
                            </View>
                            <View className="h-px bg-gray-100" />
                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-600">Last 14 days</Text>
                                <Text className="text-2xl font-bold text-gray-900">{rollingAverage.last14Days}%</Text>
                            </View>
                            <View className="h-px bg-gray-100" />
                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-600">Last 30 days</Text>
                                <Text className="text-2xl font-bold text-gray-900">{rollingAverage.last30Days}%</Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
