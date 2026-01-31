import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authApi } from '../../api/endpoints';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { SignupInput } from '../../types';

export default function SignupScreen() {
    const [form, setForm] = useState<SignupInput>({
        fullName: '',
        email: '',
        password: '',
        occupation: 'STUDENT',
        age: 18
    });
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();

    const handleSignup = async () => {
        if (!form.fullName || !form.email || !form.password || !form.occupation || !form.age) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            await authApi.signup(form);
            Alert.alert('Success', 'Account created! Please login.');
            navigation.goBack();
        } catch (error: any) {
            console.error('Signup Error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create account';
            Alert.alert('Signup Failed', errorMessage);
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
                        <Text className="text-3xl font-bold text-gray-900 mb-2">Create Account</Text>
                        <Text className="text-gray-500 text-center">Join HabitEcho today</Text>
                    </View>

                    <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                        <Input
                            label="Full Name"
                            value={form.fullName}
                            onChangeText={t => setForm(p => ({ ...p, fullName: t }))}
                            placeholder="John Doe"
                        />

                        <Input
                            label="Email"
                            value={form.email}
                            onChangeText={t => setForm(p => ({ ...p, email: t }))}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Input
                            label="Password"
                            value={form.password}
                            onChangeText={t => setForm(p => ({ ...p, password: t }))}
                            secureTextEntry
                        />

                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-1.5">Occupation</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {(['STUDENT', 'ENGINEER', 'DOCTOR', 'OTHER'] as const).map((occ) => (
                                    <TouchableOpacity
                                        key={occ}
                                        onPress={() => setForm(p => ({ ...p, occupation: occ }))}
                                        className={`px-3 py-2 rounded-lg border ${form.occupation === occ ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-200'}`}
                                    >
                                        <Text className={form.occupation === occ ? 'text-white' : 'text-gray-700'}>{occ}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    <Input
                        label="Age"
                        value={form.age ? form.age.toString() : ''}
                        onChangeText={t => setForm(p => ({ ...p, age: t ? parseInt(t) : 0 }))}
                        keyboardType="numeric"
                        placeholder="e.g. 25"
                    />

                    <Button
                        title="Create Account"
                        onPress={handleSignup}
                        isLoading={loading}
                        className="mt-4"
                    />

                    <Button
                        title="Back to Login"
                        variant="ghost"
                        onPress={() => navigation.goBack()}
                        className="mt-2"
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
