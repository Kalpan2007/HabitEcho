import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';

import CreateHabitScreen from '../screens/habits/CreateHabitScreen';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
    const { user } = useAuth();

    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
            {user ? (
                <Stack.Group>
                    <Stack.Screen name="App" component={TabNavigator} />
                    <Stack.Screen
                        name="CreateHabit"
                        component={CreateHabitScreen}
                        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                    />
                    <Stack.Screen
                        name="HabitDetail"
                        component={HabitDetailScreen}
                        options={{ headerTitle: '', presentation: 'card' }}
                    />
                </Stack.Group>
            ) : (
                <Stack.Screen name="Auth" component={AuthNavigator} />
            )}
        </Stack.Navigator>
    );
}
