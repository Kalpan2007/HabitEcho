import React, { useState } from 'react';
import { View, Text, Alert, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../auth/AuthContext';
import { authApi } from '../../api/endpoints';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigation = useNavigation<any>();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            const data = await authApi.login({ email, password });

            // Store tokens and set user -> This will trigger main nav switch automatically in RootNavigator
            await signIn(
                { accessToken: data.accessToken, refreshToken: data.refreshToken },
                data.user
            );
        } catch (error: any) {
            console.error('Login Error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
            Alert.alert('Login Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerClassName="flex-grow justify-center p-6">
                    <View className="mb-8 items-center">
                        <Text className="text-3xl font-bold text-gray-900 mb-2">HabitEcho</Text>
                        <Text className="text-gray-500 text-center">
                            Your personal habit monitoring system. Private, simple, effective.
                        </Text>
                    </View>

                    <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                        <Input
                            label="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="you@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Input
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••"
                            secureTextEntry
                        />

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            isLoading={loading}
                            className="mt-2"
                        />
                    </View>

                    <View className="flex-row justify-center">
                        <Text className="text-gray-500">Don't have an account? </Text>
                        <Text
                            className="text-indigo-600 font-semibold"
                            onPress={() => navigation.navigate('Signup')}
                        >
                            Sign Up
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
