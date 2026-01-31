import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { entriesApi } from '../../api/entries';
import { Button } from '../../components/ui/Button';
import { clsx } from 'clsx';
import dayjs from 'dayjs';

export default function HabitEntryScreen() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { habitId, date = dayjs().format('YYYY-MM-DD') } = route.params || {};
    const queryClient = useQueryClient();

    const [status, setStatus] = useState<'DONE' | 'PARTIAL' | 'NOT_DONE'>('DONE');
    const [notes, setNotes] = useState('');
    const [percentComplete, setPercentComplete] = useState<string>('100');

    const mutation = useMutation({
        mutationFn: (data: any) => entriesApi.log(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['habits'] });
            Alert.alert('Success', 'Entry logged successfully');
            navigation.goBack();
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to log entry');
        }
    });

    const handleSubmit = () => {
        if (!habitId) return;

        mutation.mutate({
            habitId,
            date,
            status,
            percentComplete: status === 'DONE' ? 100 : (parseInt(percentComplete) || 0),
            notes
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-white p-4">
            <View className="mb-6">
                <Text className="text-xl font-bold text-gray-900">Log Activity</Text>
                <Text className="text-gray-500">{dayjs(date).format('MMMM D, YYYY')}</Text>
            </View>

            <ScrollView>
                <Text className="font-medium mb-3 text-gray-700">Status</Text>
                <View className="flex-row gap-3 mb-6">
                    {(['DONE', 'PARTIAL', 'NOT_DONE'] as const).map((s) => (
                        <TouchableOpacity
                            key={s}
                            onPress={() => setStatus(s)}
                            className={clsx(
                                "flex-1 py-3 rounded-xl items-center border",
                                status === s && s === 'DONE' ? "bg-green-100 border-green-500" :
                                    status === s && s === 'PARTIAL' ? "bg-yellow-100 border-yellow-500" :
                                        status === s && s === 'NOT_DONE' ? "bg-red-100 border-red-500" :
                                            "bg-white border-gray-200"
                            )}
                        >
                            <Text className={clsx(
                                "font-bold",
                                status === s && s === 'DONE' ? "text-green-700" :
                                    status === s && s === 'PARTIAL' ? "text-yellow-700" :
                                        status === s && s === 'NOT_DONE' ? "text-red-700" :
                                            "text-gray-600"
                            )}>
                                {s.replace('_', ' ')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {status === 'PARTIAL' && (
                    <View className="mb-6">
                        <Text className="font-medium mb-2 text-gray-700">Percentage (%)</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-lg"
                            keyboardType="numeric"
                            value={percentComplete}
                            onChangeText={setPercentComplete}
                        />
                    </View>
                )}

                <Text className="font-medium mb-2 text-gray-700">Notes (Optional)</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-base h-24 mb-6"
                    multiline
                    textAlignVertical="top"
                    placeholder="How did it go?"
                    value={notes}
                    onChangeText={setNotes}
                />

                <Button
                    title="Save Entry"
                    onPress={handleSubmit}
                    isLoading={mutation.isPending}
                />
            </ScrollView>
        </SafeAreaView>
    );
}
