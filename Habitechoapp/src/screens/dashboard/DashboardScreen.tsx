import React from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useHabits } from '../../hooks/useHabits';
import { Button } from '../../components/ui/Button';
import { HabitCard } from '../../components/habits/HabitCard';

export default function DashboardScreen() {
    const { user } = useAuth();
    const { data, isLoading, error, refetch } = useHabits(true);
    const navigation = useNavigation<any>();

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator color="#4f46e5" />
            </View>
        );
    }

    // Handle data structure: ApiResponse<Habit[]> wrapper
    // habitsApi.getAll returns { success: true, message: ..., data: [...] }
    const habits = data?.data || [];

    return (
        <SafeAreaView className="flex-1 bg-gray-50 px-4">
            <View className="mb-6 mt-4">
                <Text className="text-2xl font-bold text-gray-900">
                    Hello, {user?.fullName?.split(' ')[0] || 'User'}
                </Text>
                <Text className="text-gray-500">Here are your habits for today.</Text>
            </View>

            <FlatList
                data={habits}
                keyExtractor={(item) => item.id}
                refreshing={isLoading}
                onRefresh={refetch}
                renderItem={({ item }) => (
                    <HabitCard
                        habit={item}
                        onPress={() => { }} // Navigate to detail later
                    />
                )}
                ListEmptyComponent={
                    <View className="items-center py-10">
                        <Text className="text-gray-500 mb-4">No active habits found.</Text>
                        <Button
                            title="Create Your First Habit"
                            onPress={() => navigation.navigate('CreateHabit')}
                            variant="primary"
                        />
                    </View>
                }
            />
            <TouchableOpacity
                className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center shadow-lg"
                onPress={() => navigation.navigate('CreateHabit')}
            >
                <Text className="text-white text-3xl pb-1">+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
