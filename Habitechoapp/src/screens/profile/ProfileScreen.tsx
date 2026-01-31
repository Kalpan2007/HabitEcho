import React from 'react';
import { View, Text, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/ui/Button';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: signOut }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView contentContainerClassName="p-6">
                <View className="items-center mb-8">
                    <View className="w-20 h-20 bg-indigo-100 rounded-full items-center justify-center mb-4">
                        <Text className="text-2xl font-bold text-indigo-600">
                            {user?.fullName?.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text className="text-xl font-bold text-gray-900">{user?.fullName}</Text>
                    <Text className="text-gray-500">{user?.email}</Text>
                </View>

                <View className="mb-6">
                    <Text className="text-sm font-semibold text-gray-400 uppercase mb-2">Account</Text>
                    <View className="bg-gray-50 p-4 rounded-xl mb-2">
                        <Text className="text-gray-900">Occupation: {user?.occupation}</Text>
                    </View>
                    <View className="bg-gray-50 p-4 rounded-xl">
                        <Text className="text-gray-900">Timezone: {user?.timezone}</Text>
                    </View>
                </View>

                <View className="mt-auto">
                    <Button title="Sign Out" onPress={handleLogout} variant="outline" className="border-red-200" />
                </View>

                <Text className="text-center text-gray-300 mt-8 text-xs">
                    Version 1.0.0 (Phase 4 Build)
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}
