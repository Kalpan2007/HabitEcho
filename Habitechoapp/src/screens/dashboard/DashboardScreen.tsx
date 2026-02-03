import React from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { habitsApi } from '../../api/habits';
import { performanceApi } from '../../api/performance';
import { Button } from '../../components/ui/Button';
import { HabitCard } from '../../components/habits/HabitCard';

export default function DashboardScreen() {
    const { user } = useAuth();
    const navigation = useNavigation<any>();

    // Fetch habits
    const { data: habitsData, isLoading: habitsLoading, error: habitsError, refetch } = useQuery({
        queryKey: ['habits', { isActive: true }],
        queryFn: () => habitsApi.getAll({ isActive: true })
    });

    // Fetch performance summary
    const { data: summaryData, isLoading: summaryLoading } = useQuery({
        queryKey: ['performance', 'summary'],
        queryFn: () => performanceApi.getSummary()
    });

    if (habitsLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    // Extract data from response
    const habits = habitsData?.habits || [];
    const summary = summaryData?.summary;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="px-4">
                {/* Header */}
                <View className="mb-6 mt-4">
                    <Text className="text-2xl font-bold text-gray-900">
                        Hello, {user?.fullName?.split(' ')[0] || 'User'} 👋
                    </Text>
                    <Text className="text-gray-500">Welcome back! Here's your habit overview.</Text>
                </View>

                {/* Stats Grid */}
                {summary && !summaryLoading && (
                    <View className="flex-row flex-wrap gap-4 mb-6">
                        <View className="flex-1 min-w-[45%] bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <Text className="text-gray-600 text-xs font-medium mb-1">TODAY</Text>
                            <Text className="text-2xl font-bold text-indigo-600">
                                {summary.todayCompletion?.completed || 0}/{summary.todayCompletion?.total || summary.todayCompletion?.scheduled || 0}
                            </Text>
                            <Text className="text-gray-500 text-xs mt-1">Completed</Text>
                        </View>
                        <View className="flex-1 min-w-[45%] bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <Text className="text-gray-600 text-xs font-medium mb-1">STREAK</Text>
                            <Text className="text-2xl font-bold text-orange-600">{summary.currentStreak}</Text>
                            <Text className="text-gray-500 text-xs mt-1">Days</Text>
                        </View>
                        <View className="flex-1 min-w-[45%] bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <Text className="text-gray-600 text-xs font-medium mb-1">COMPLETION</Text>
                            <Text className="text-2xl font-bold text-green-600">{summary.overallCompletionRate}%</Text>
                            <Text className="text-gray-500 text-xs mt-1">Overall</Text>
                        </View>
                        <View className="flex-1 min-w-[45%] bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <Text className="text-gray-600 text-xs font-medium mb-1">HABITS</Text>
                            <Text className="text-2xl font-bold text-purple-600">{summary.activeHabits}</Text>
                            <Text className="text-gray-500 text-xs mt-1">Active</Text>
                        </View>
                    </View>
                )}

                {/* Today's Habits Section */}
                <View className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text className="text-xl font-bold text-gray-900">Today's Habits</Text>
                            <Text className="text-sm text-gray-500">Focus on what matters today</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('CreateHabit')}
                            className="bg-indigo-600 px-4 py-2 rounded-lg"
                        >
                            <Text className="text-white font-semibold">+ New</Text>
                        </TouchableOpacity>
                    </View>

                    {habits.length === 0 ? (
                        <View className="items-center py-8">
                            <Text className="text-gray-500 mb-4">No active habits found</Text>
                            <Button
                                title="Create Your First Habit"
                                onPress={() => navigation.navigate('CreateHabit')}
                                variant="primary"
                            />
                        </View>
                    ) : (
                        <View className="gap-3">
                            {habits.map((habit: any) => (
                                <HabitCard
                                    key={habit.id}
                                    habit={habit}
                                    onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
                                />
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                className="absolute bottom-6 right-6 w-16 h-16 bg-indigo-600 rounded-full items-center justify-center shadow-lg"
                onPress={() => navigation.navigate('CreateHabit')}
                style={{
                    shadowColor: '#4f46e5',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                }}
            >
                <Text className="text-white text-4xl pb-1">+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
