import React, { useState } from 'react';
import { View, Text, ScrollView, Modal, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useCreateHabit } from '../../hooks/useHabits';
import type { Frequency } from '../../types';

export default function CreateHabitScreen() {
    const navigation = useNavigation<any>();
    const createMutation = useCreateHabit();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState<Frequency>('DAILY');
    const [scheduleDays, setScheduleDays] = useState<number[]>([]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name) {
            Alert.alert('Error', 'Please enter a habit name');
            return;
        }

        try {
            setLoading(true);
            await createMutation.mutateAsync({
                name,
                description,
                frequency,
                startDate,
                scheduleDays: frequency === 'DAILY' ? [] : scheduleDays,
                // Optional: Reminder time and end date could be added here
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create habit');
        } finally {
            setLoading(false);
        }
    };

    const frequencies: Frequency[] = ['DAILY', 'WEEKLY', 'MONTHLY'];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const toggleDay = (dayIndex: number) => {
        setScheduleDays(prev =>
            prev.includes(dayIndex)
                ? prev.filter(d => d !== dayIndex)
                : [...prev, dayIndex].sort()
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-100">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className="text-gray-500 text-lg">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold">New Habit</Text>
                <TouchableOpacity onPress={handleCreate} disabled={loading}>
                    <Text className="text-indigo-600 font-bold text-lg">Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="p-4">
                <Input
                    label="Name"
                    placeholder="e.g., Morning Meditation"
                    value={name}
                    onChangeText={setName}
                />

                <Input
                    label="Description (Optional)"
                    placeholder="Why do you want to build this habit?"
                    value={description}
                    onChangeText={setDescription}
                />

                <Text className="text-sm font-medium text-gray-700 mb-2">Frequency</Text>
                <View className="flex-row gap-2 mb-6">
                    {frequencies.map((freq) => (
                        <TouchableOpacity
                            key={freq}
                            onPress={() => { setFrequency(freq); setScheduleDays([]); }}
                            className={`px-4 py-2 rounded-full border ${frequency === freq
                                    ? 'bg-indigo-600 border-indigo-600'
                                    : 'bg-white border-gray-200'
                                }`}
                        >
                            <Text className={frequency === freq ? 'text-white' : 'text-gray-700'}>
                                {freq.charAt(0) + freq.slice(1).toLowerCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {frequency === 'WEEKLY' && (
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-gray-700 mb-2">Repeat On</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {weekDays.map((day, index) => (
                                <TouchableOpacity
                                    key={day}
                                    onPress={() => toggleDay(index)}
                                    className={`w-10 h-10 rounded-full items-center justify-center border ${scheduleDays.includes(index)
                                            ? 'bg-indigo-600 border-indigo-600'
                                            : 'bg-white border-gray-200'
                                        }`}
                                >
                                    <Text className={scheduleDays.includes(index) ? 'text-white' : 'text-gray-700'}>
                                        {day.charAt(0)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                <Input
                    label="Start Date (YYYY-MM-DD)"
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="2024-01-01"
                />

            </ScrollView>
        </SafeAreaView>
    );
}
