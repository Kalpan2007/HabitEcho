import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps {
    onPress: () => void;
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
}

export function Button({
    onPress,
    title,
    variant = 'primary',
    isLoading,
    disabled,
    className
}: ButtonProps) {
    const baseStyles = "h-12 rounded-xl items-center justify-center flex-row px-6";

    const variants = {
        primary: "bg-indigo-600",
        secondary: "bg-white border border-gray-200",
        outline: "bg-transparent border border-gray-300",
        ghost: "bg-transparent"
    };

    const textVariants = {
        primary: "text-white font-semibold text-base",
        secondary: "text-gray-900 font-medium text-base",
        outline: "text-gray-700 font-medium text-base",
        ghost: "text-indigo-600 font-medium text-base"
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || isLoading}
            activeOpacity={0.7}
            className={cn(baseStyles, variants[variant], disabled && "opacity-50", className)}
        >
            {isLoading ? (
                <ActivityIndicator color={variant === 'primary' ? 'white' : '#4f46e5'} />
            ) : (
                <Text className={cn(textVariants[variant])}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}
