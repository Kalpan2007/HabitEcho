import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsApi } from '../../api/habits';
import { entriesApi } from '../../api/entries';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isDateScheduled, formatScheduleDays } from '../../lib/utils';
import dayjs from 'dayjs';
import type { EntryStatus } from '../../types';

export default function HabitDetailScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { habitId } = route.params || {};
    const queryClient = useQueryClient();
    const today = dayjs().format('YYYY-MM-DD');

    const [showPartialModal, setShowPartialModal] = useState(false);
    const [percentComplete, setPercentComplete] = useState(50);

    const { data, isLoading } = useQuery({
        queryKey: ['habit', habitId],
        queryFn: () => habitsApi.getById(habitId),
        enabled: !!habitId
    });

    // Fetch today's entry
    const { data: historyData } = useQuery({
        queryKey: ['habitHistory', habitId, today],
        queryFn: () => entriesApi.getHistory(habitId, { startDate: today, endDate: today, limit: 1 }),
        enabled: !!habitId
    });

    const logMutation = useMutation({
        mutationFn: (payload: { status: EntryStatus; date: string; percentComplete?: number }) =>
            entriesApi.log(habitId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habitHistory', habitId] });
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            queryClient.invalidateQueries({ queryKey: ['performance'] });
        }
    });

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator color="#4f46e5" size="large" />
            </View>
        );
    }

    const habit = data?.habit;
    const todayEntry = historyData?.logs?.[0];
    const isLocked = !!todayEntry;
    const currentStatus = todayEntry?.status;
    const isScheduledToday = habit ? isDateScheduled(today, habit.frequency, habit.scheduleDays) : false;

    if (!habit) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center bg-gray-50">
                <Text className="text-gray-500 mb-4">Habit not found</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text className="text-indigo-600 font-semibold">← Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const handleLog = async (status: EntryStatus, percentage?: number) => {
        // Check if today is scheduled
        if (!isScheduledToday) {
            Alert.alert(
                'Not Scheduled', 
                `This habit is not scheduled for today.\n\nScheduled: ${formatScheduleDays(habit.frequency, habit.scheduleDays)}`
            );
            return;
        }

        // Check if already logged
        if (isLocked) {
            Alert.alert('Already Logged', 'You cannot change the status once logged.');
            return;
        }

        // Show modal for partial status
        if (status === 'PARTIAL' && percentage === undefined) {
            setShowPartialModal(true);
            return;
        }

        // Confirmation
        const message = 
            status === 'DONE' 
                ? 'Mark this habit as Completed?\n\nThis action cannot be undone.'
                : status === 'PARTIAL'
                    ? `Mark as Partial (${percentage}%)?\n\nThis action cannot be undone.`
                    : 'Mark this habit as Missed?\n\nThis action cannot be undone.';

        Alert.alert(
            'Confirm Action',
            message,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => {
                        logMutation.mutate(
                            { status, date: today, percentComplete: percentage },
                            {
                                onSuccess: () => {
                                    const text = 
                                        status === 'DONE' 
                                            ? '✅ Completed!' 
                                            : status === 'PARTIAL' 
                                                ? `✓ Marked as ${percentage}% complete`
                                                : '✗ Marked as missed';
                                    Alert.alert('Success', text);
                                    setShowPartialModal(false);
                                },
                                onError: (error: any) => {
                                    Alert.alert('Error', error?.message || 'Failed to log entry');
                                }
                            }
                        );
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="flex-1">
                {/* Header */}
                <View className="bg-white p-6 border-b border-gray-100">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text className="text-indigo-600 font-semibold">← Back</Text>
                    </TouchableOpacity>
                    <Text className="text-3xl font-bold text-gray-900 mt-4 mb-2">{habit.name}</Text>
                    {habit.description && <Text className="text-gray-600 mb-4">{habit.description}</Text>}
                    
                    <View className="flex-row items-center gap-2 mt-4">
                        {!isScheduledToday && (
                            <View className="bg-yellow-100 px-3 py-1 rounded-full">
                                <Text className="text-yellow-700 font-semibold text-xs">⚠️ Not scheduled today</Text>
                            </View>
                        )}
                        <View className="bg-indigo-50 px-3 py-1 rounded-full">
                            <Text className="text-indigo-700 font-semibold text-xs uppercase">{habit.frequency}</Text>
                        </View>
                        {isLocked && (
                            <View className="bg-gray-100 px-3 py-1 rounded-full flex-row items-center gap-1">
                                <Text className="text-gray-500 font-semibold text-xs">🔒 LOCKED</Text>
                            </View>
                        )}
                    </View>
                    {!isScheduledToday && (
                        <View className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <Text className="text-yellow-800 text-sm">
                                📅 Scheduled: {formatScheduleDays(habit.frequency, habit.scheduleDays)}
                            </Text>
                        </View>
                    )}
                </View>
                
                <View className="p-6">
                    <Text className="text-xl font-bold text-gray-900 mb-4">How did you do today?</Text>

                    <View className="gap-4">
                        {/* Completed Button */}
                        <TouchableOpacity
                            onPress={() => handleLog('DONE')}
                            disabled={isLocked || logMutation.isPending}
                            className={`p-6 rounded-2xl border-2 ${
                                currentStatus === 'DONE'
                                    ? 'bg-green-50 border-green-500'
                                    : isLocked
                                        ? 'bg-gray-50 border-gray-200 opacity-50'
                                        : 'bg-white border-gray-200'
                            }`}
                        >
                            <View className="flex-row items-center gap-4">
                                <View className={`w-14 h-14 rounded-full items-center justify-center ${
                                    currentStatus === 'DONE' ? 'bg-green-500' : 'bg-green-100'
                                }`}>
                                    <Text className={`text-2xl ${currentStatus === 'DONE' ? 'text-white' : 'text-green-600'}`}>✓</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className={`text-lg font-bold ${
                                        currentStatus === 'DONE' ? 'text-green-700' : 'text-gray-700'
                                    }`}>
                                        Completed
                                    </Text>
                                    <Text className="text-sm text-gray-500">100% done</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Partial Button */}
                        <TouchableOpacity
                            onPress={() => handleLog('PARTIAL')}
                            disabled={isLocked || logMutation.isPending || !isScheduledToday}
                            className={`p-6 rounded-2xl border-2 ${
                                currentStatus === 'PARTIAL'
                                    ? 'bg-yellow-50 border-yellow-500'
                                    : isLocked || !isScheduledToday
                                        ? 'bg-gray-50 border-gray-200 opacity-50'
                                        : 'bg-white border-gray-200'
                            }`}
                        >
                            <View className="flex-row items-center gap-4">
                                <View className={`w-14 h-14 rounded-full items-center justify-center ${
                                    currentStatus === 'PARTIAL' ? 'bg-yellow-500' : 'bg-yellow-100'
                                }`}>
                                    <Text className={`text-2xl ${currentStatus === 'PARTIAL' ? 'text-white' : 'text-yellow-600'}`}>◐</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className={`text-lg font-bold ${
                                        currentStatus === 'PARTIAL' ? 'text-yellow-700' : 'text-gray-700'
                                    }`}>
                                        Partial
                                    </Text>
                                    <Text className="text-sm text-gray-500">
                                        {currentStatus === 'PARTIAL' && todayEntry?.percentComplete
                                            ? `${todayEntry.percentComplete}% done`
                                            : 'Partially completed'}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Missed Button */}
                        <TouchableOpacity
                            onPress={() => handleLog('NOT_DONE')}
                            disabled={isLocked || logMutation.isPending || !isScheduledToday}
                            className={`p-6 rounded-2xl border-2 ${
                                currentStatus === 'NOT_DONE'
                                    ? 'bg-red-50 border-red-500'
                                    : isLocked || !isScheduledToday
                                        ? 'bg-gray-50 border-gray-200 opacity-50'
                                        : 'bg-white border-gray-200'
                            }`}
                        >
                            <View className="flex-row items-center gap-4">
                                <View className={`w-14 h-14 rounded-full items-center justify-center ${
                                    currentStatus === 'NOT_DONE' ? 'bg-red-500' : 'bg-red-100'
                                }`}>
                                    <Text className={`text-2xl ${currentStatus === 'NOT_DONE' ? 'text-white' : 'text-red-600'}`}>✗</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className={`text-lg font-bold ${
                                        currentStatus === 'NOT_DONE' ? 'text-red-700' : 'text-gray-700'
                                    }`}>
                                        Missed
                                    </Text>
                                    <Text className="text-sm text-gray-500">Didn't complete</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {isLocked && (
                        <View className="mt-6 p-4 bg-gray-50 rounded-xl flex-row items-center gap-2">
                            <Text className="text-gray-500 text-sm">🔒</Text>
                            <Text className="text-gray-500 text-sm flex-1">Entry locked. Great job staying consistent!</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Partial Modal */}
            <Modal
                visible={showPartialModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPartialModal(false)}
            >
                <View className="flex-1 bg-black/50 items-center justify-center p-6">
                    <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <Text className="text-xl font-bold text-gray-900 text-center mb-2">How much did you complete?</Text>
                        <Text className="text-sm text-gray-500 text-center mb-6">Use the slider to set your completion percentage.</Text>

                        <View className="mb-8">
                            <Text className="text-5xl font-bold text-indigo-600 text-center mb-4">{percentComplete}%</Text>
                            <View className="flex-row items-center justify-between mb-2">
                                <Text className="text-xs font-semibold text-gray-400">0%</Text>
                                <Text className="text-xs font-semibold text-gray-400">100%</Text>
                            </View>
                            {/* Note: React Native doesn't have a native slider in core, you'd need @react-native-community/slider */}
                            <View className="h-12 bg-gray-100 rounded-xl items-center justify-center">
                                <Text className="text-gray-500 text-xs">Tap buttons below to adjust</Text>
                            </View>
                            <View className="flex-row gap-2 mt-3">
                                {[25, 50, 75].map((value) => (
                                    <TouchableOpacity
                                        key={value}
                                        onPress={() => setPercentComplete(value)}
                                        className={`flex-1 py-2 rounded-lg ${
                                            percentComplete === value ? 'bg-indigo-600' : 'bg-gray-200'
                                        }`}
                                    >
                                        <Text className={`text-center font-semibold ${
                                            percentComplete === value ? 'text-white' : 'text-gray-600'
                                        }`}>
                                            {value}%
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setShowPartialModal(false)}
                                className="flex-1 py-3 border border-gray-300 rounded-xl"
                            >
                                <Text className="text-gray-700 font-semibold text-center">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleLog('PARTIAL', percentComplete)}
                                className="flex-1 py-3 bg-indigo-600 rounded-xl"
                            >
                                <Text className="text-white font-bold text-center">Save & Lock</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
