import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '../ui/Button';

interface ErrorScreenProps {
    message?: string;
    onRetry?: () => void;
}

export function ErrorScreen({ message = 'Something went wrong', onRetry }: ErrorScreenProps) {
    return (
        <View className="flex-1 items-center justify-center bg-white p-6">
            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
                <Text className="text-red-600 text-2xl">!</Text>
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2">Oops!</Text>
            <Text className="text-gray-500 text-center mb-6">{message}</Text>
            {onRetry && (
                <Button title="Try Again" onPress={onRetry} variant="primary" className="w-full" />
            )}
        </View>
    );
}
