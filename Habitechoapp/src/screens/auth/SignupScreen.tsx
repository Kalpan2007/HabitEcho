import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../auth/AuthContext';
import { authApi } from '../../api/endpoints';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SignupInput } from '../../types';

export default function SignupScreen() {
    const [step, setStep] = useState<1 | 2>(1); // 1: Signup, 2: Verify OTP
    const [form, setForm] = useState<SignupInput>({
        fullName: '',
        email: '',
        password: '',
        occupation: 'STUDENT',
        age: 18,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    });
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation<any>();
    const { signIn } = useAuth();

    const handleSignup = async () => {
        if (!form.fullName || !form.email || !form.password || !form.occupation || !form.age) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        // Validate password (8+ chars, uppercase, lowercase, number, special char)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!passwordRegex.test(form.password)) {
            Alert.alert('Invalid Password', 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character');
            return;
        }

        try {
            setLoading(true);
            await authApi.signup(form);
            Alert.alert('Success', 'Account created! Please check your email for the verification code.');
            setStep(2);
        } catch (error: any) {
            console.error('Signup Error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create account';
            Alert.alert('Signup Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('Error', 'Please enter a 6-digit verification code');
            return;
        }

        try {
            setLoading(true);
            const data = await authApi.verifyOtp({ email: form.email, otp });
            
            // OTP verified successfully, login user
            await signIn(
                { accessToken: data.accessToken, refreshToken: data.refreshToken },
                data.user
            );
            Alert.alert('Success', 'Email verified! Welcome to HabitEcho!');
        } catch (error: any) {
            console.error('OTP Verification Error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Invalid verification code';
            Alert.alert('Verification Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            setLoading(true);
            await authApi.resendOtp({ email: form.email });
            Alert.alert('Success', 'A new verification code has been sent to your email');
        } catch (error: any) {
            console.error('Resend OTP Error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to resend code';
            Alert.alert('Resend Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (step === 2) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView contentContainerClassName="flex-grow justify-center p-6">
                        <View className="mb-8 items-center">
                            <Text className="text-3xl font-bold text-gray-900 mb-2">Verify Email</Text>
                            <Text className="text-gray-500 text-center">
                                We sent a 6-digit code to {form.email}
                            </Text>
                        </View>

                        <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                            <Input
                                label="Verification Code"
                                value={otp}
                                onChangeText={setOtp}
                                placeholder="123456"
                                keyboardType="number-pad"
                                maxLength={6}
                            />

                            <Button
                                title="Verify & Continue"
                                onPress={handleVerifyOtp}
                                isLoading={loading}
                                className="mt-2"
                            />

                            <Button
                                title="Resend Code"
                                variant="ghost"
                                onPress={handleResendOtp}
                                disabled={loading}
                                className="mt-2"
                            />
                        </View>

                        <View className="flex-row justify-center">
                            <Text
                                className="text-indigo-600 font-semibold"
                                onPress={() => setStep(1)}
                            >
                                ← Back to Signup
                            </Text>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

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
                            placeholder="you@example.com"
                        />

                        <Input
                            label="Password"
                            value={form.password}
                            onChangeText={t => setForm(p => ({ ...p, password: t }))}
                            secureTextEntry
                            placeholder="••••••••"
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

                        <Input
                            label="Age"
                            value={form.age ? form.age.toString() : ''}
                            onChangeText={t => setForm(p => ({ ...p, age: t ? parseInt(t) || 0 : 0 }))}
                            keyboardType="numeric"
                            placeholder="e.g. 25"
                        />

                        <Button
                            title="Create Account"
                            onPress={handleSignup}
                            isLoading={loading}
                            className="mt-4"
                        />
                    </View>

                    <View className="flex-row justify-center">
                        <Text className="text-gray-500">Already have an account? </Text>
                        <Text
                            className="text-indigo-600 font-semibold"
                            onPress={() => navigation.goBack()}
                        >
                            Sign In
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
