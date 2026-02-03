import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { habitsApi } from '../../api/habits';
import { HabitCard } from '../../components/habits/HabitCard';
import { LoadingScreen } from '../../components/shared/LoadingScreen';
import { ErrorScreen } from '../../components/shared/ErrorScreen';
import { Ionicons } from '@expo/vector-icons';

export default function HabitsListScreen() {
    const navigation = useNavigation<any>();
    const [search, setSearch] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['habits', { search }],
        queryFn: () => habitsApi.getAll(search ? { search } : undefined),
    });

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    if (isLoading && !refreshing) return <LoadingScreen />;
    if (error) return <ErrorScreen message="Failed to load habits" onRetry={refetch} />;

    // Extract habits from API response structure: { habits: [], pagination: {} }
    const habits = data?.habits || [];

    return (
        <SafeAreaView className="flex-1 bg-gray-50 p-4 pb-0">
            <View className="flex-row items-center justify-between mb-6">
                <Text className="text-3xl font-bold text-gray-900">Your Habits</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('CreateHabit')}
                    className="bg-indigo-600 p-2 rounded-full"
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View className="bg-white p-3 rounded-xl flex-row items-center border border-gray-200 mb-6">
                <Ionicons name="search" size={20} color="#9ca3af" />
                <TextInput
                    className="flex-1 ml-2 text-base text-gray-900"
                    placeholder="Search habits..."
                    value={search}
                    onChangeText={setSearch}
                    returnKeyType="search"
                />
            </View>

            <FlatList
                data={habits}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <HabitCard 
                        habit={item} 
                        onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}
                    />
                )}
                contentContainerStyle={{ paddingBottom: 96 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View className="items-center justify-center py-20">
                        <Text className="text-gray-500 mb-4">No habits found</Text>
                        <TouchableOpacity onPress={() => refetch()}>
                            <Text className="text-indigo-600 font-medium">Refresh</Text>
                        </TouchableOpacity>
                    </View>
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />
                }
            />
        </SafeAreaView>
    );
}
