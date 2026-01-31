import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PerformanceScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white p-6 justify-center items-center">
            <Text className="text-2xl font-bold text-gray-900 mb-2">Performance</Text>
            <Text className="text-gray-500 text-center">Charts and analytics coming soon in Phase 3 update.</Text>
        </SafeAreaView>
    );
}
