import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { useAuth } from '../auth/AuthContext';

function PlaceholderScreen({ title }: { title: string }) {
    const { signOut } = useAuth();
    return (
        <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center p-4">
            <Text className="text-xl font-bold mb-4">{title}</Text>
            <Text className="text-gray-500 text-center mb-6">This feature is coming in Phase 3.</Text>
            <Button title="Sign Out (Test)" onPress={signOut} variant="outline" />
        </SafeAreaView>
    );
}

import DashboardScreen from '../screens/dashboard/DashboardScreen';

import PerformanceScreen from '../screens/dashboard/PerformanceScreen';

import ProfileScreen from '../screens/profile/ProfileScreen';
import HabitsListScreen from '../screens/habits/HabitsListScreen';

const Tab = createBottomTabNavigator();

export function TabNavigator() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#4f46e5' }}>
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Habits" component={HabitsListScreen} />
            <Tab.Screen name="Performance" component={PerformanceScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
