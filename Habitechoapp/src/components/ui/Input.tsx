import React from 'react';
import { View, TextInput, Text, type TextInputProps } from 'react-native';
import { cn } from './Button';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerClassName?: string;
}

export function Input({ label, error, containerClassName, className, ...props }: InputProps) {
    return (
        <View className={cn("mb-4", containerClassName)}>
            {label && <Text className="text-sm font-medium text-gray-700 mb-1.5">{label}</Text>}
            <TextInput
                placeholderTextColor="#9ca3af"
                className={cn(
                    "h-12 px-4 bg-white border border-gray-200 rounded-xl text-gray-900 text-base",
                    "focus:border-indigo-500 focus:border-2",
                    error && "border-red-500",
                    className
                )}
                {...props}
            />
            {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
        </View>
    );
}
