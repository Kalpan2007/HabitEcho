import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
    const [reminderTime, setReminderTime] = useState('09:00'); // Required with default
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name) {
            Alert.alert('Error', 'Please enter a habit name');
            return;
        }

        if (!reminderTime) {
            Alert.alert('Error', 'Please select a reminder time');
            return;
        }

        try {
            setLoading(true);
            await createMutation.mutateAsync({
                name,
                description: description || undefined,
                frequency,
                startDate,
                scheduleDays: frequency === 'DAILY' ? undefined : scheduleDays,
                reminderTime,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            });
            Alert.alert('Success', 'Habit created successfully!');
            navigation.goBack();
        } catch (error: any) {
            console.error('Create Habit Error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to create habit');
        } finally {
            setLoading(false);
        }
    };

    const handleTimeChange = (event: any, selectedDate?: Date) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedDate) {
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            setReminderTime(`${hours}:${minutes}`);
        }
    };

    const getTimeDate = () => {
        const [hours, minutes] = reminderTime.split(':');
        const date = new Date();
        date.setHours(parseInt(hours) || 9);
        date.setMinutes(parseInt(minutes) || 0);
        return date;
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
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className="text-gray-500 text-lg">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold">New Habit</Text>
                <TouchableOpacity onPress={handleCreate} disabled={loading}>
                    <Text className="text-indigo-600 font-bold text-lg">{loading ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="p-4">
                <Input
                    label="Habit Name *"
                    placeholder="e.g., Morning Meditation"
                    value={name}
                    onChangeText={setName}
                />

                <Input
                    label="Description (Optional)"
                    placeholder="What does this habit involve?"
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
                                    <Text className={scheduleDays.includes(index) ? 'text-white font-bold' : 'text-gray-700'}>
                                        {day.charAt(0)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {frequency === 'MONTHLY' && (
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-gray-700 mb-2">Days of Month</Text>
                        <Text className="text-xs text-gray-500 mb-2">Select days (1-31)</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                <TouchableOpacity
                                    key={day}
                                    onPress={() => toggleDay(day)}
                                    className={`w-10 h-10 rounded-lg items-center justify-center border ${scheduleDays.includes(day)
                                            ? 'bg-indigo-600 border-indigo-600'
                                            : 'bg-white border-gray-200'
                                        }`}
                                >
                                    <Text className={scheduleDays.includes(day) ? 'text-white font-bold text-xs' : 'text-gray-700 text-xs'}>
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                <Input
                    label="Start Date *"
                    value={startDate}
                    onChangeText={setStartDate}
                    placeholder="YYYY-MM-DD"
                />

                {/* Email Reminder Time - Required with Time Picker */}
                <View className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 mb-6">
                    <View className="mb-3">
                        <Text className="text-sm font-bold text-gray-900 mb-1">Email Reminders *</Text>
                        <Text className="text-xs text-indigo-600 leading-relaxed">
                            We'll send you a nudge at your preferred time to keep your streak alive.
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            onPress={() => setShowTimePicker(true)}
                            className="flex-1 bg-white px-4 py-3 rounded-xl border border-indigo-200 flex-row items-center justify-between"
                        >
                            <Text className="text-lg font-medium text-gray-900">🕔 {reminderTime}</Text>
                            <Text className="text-indigo-600 text-sm font-semibold">Change</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {showTimePicker && (
                    <DateTimePicker
                        value={getTimeDate()}
                        mode="time"
                        is24Hour={false}
                        display="default"
                        onChange={handleTimeChange}
                    />
                )}

                <Button
                    title={loading ? 'Creating...' : 'Create Habit'}
                    onPress={handleCreate}
                    isLoading={loading}
                    className="mb-6"
                />
            </ScrollView>
        </SafeAreaView>
    );
}
