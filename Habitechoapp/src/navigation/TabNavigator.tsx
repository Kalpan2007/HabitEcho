import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { useAuth } from '../auth/AuthContext';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import PerformanceScreen from '../screens/dashboard/PerformanceScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import HabitsListScreen from '../screens/habits/HabitsListScreen';

const Tab = createBottomTabNavigator();

// Icon components
const HomeIcon = ({ focused }: { focused: boolean }) => (
    <View className={`w-10 h-10 items-center justify-center rounded-xl ${focused ? 'bg-indigo-100' : ''}`}>
        <Text className={focused ? 'text-indigo-600' : 'text-gray-400'} style={{ fontSize: 20 }}>
            🏠
        </Text>
    </View>
);

const HabitsIcon = ({ focused }: { focused: boolean }) => (
    <View className={`w-10 h-10 items-center justify-center rounded-xl ${focused ? 'bg-indigo-100' : ''}`}>
        <Text className={focused ? 'text-indigo-600' : 'text-gray-400'} style={{ fontSize: 20 }}>
            ✅
        </Text>
    </View>
);

const ChartIcon = ({ focused }: { focused: boolean }) => (
    <View className={`w-10 h-10 items-center justify-center rounded-xl ${focused ? 'bg-indigo-100' : ''}`}>
        <Text className={focused ? 'text-indigo-600' : 'text-gray-400'} style={{ fontSize: 20 }}>
            📈
        </Text>
    </View>
);

const ProfileIcon = ({ focused }: { focused: boolean }) => (
    <View className={`w-10 h-10 items-center justify-center rounded-xl ${focused ? 'bg-indigo-100' : ''}`}>
        <Text className={focused ? 'text-indigo-600' : 'text-gray-400'} style={{ fontSize: 20 }}>
            👤
        </Text>
    </View>
);

export function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#4f46e5',
                tabBarInactiveTintColor: '#9ca3af',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#f3f4f6',
                    paddingTop: 8,
                    paddingBottom: 8,
                    height: 70,
                    elevation: 0,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 4,
                },
                tabBarItemStyle: {
                    paddingVertical: 4,
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
                    tabBarLabel: 'Home',
                }}
            />
            <Tab.Screen
                name="Habits"
                component={HabitsListScreen}
                options={{
                    tabBarIcon: ({ focused }) => <HabitsIcon focused={focused} />,
                }}
            />
            <Tab.Screen
                name="Performance"
                component={PerformanceScreen}
                options={{
                    tabBarIcon: ({ focused }) => <ChartIcon focused={focused} />,
                    tabBarLabel: 'Stats',
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
                }}
            />
        </Tab.Navigator>
    );
}
