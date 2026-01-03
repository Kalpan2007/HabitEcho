import React from 'react';

interface LogoProps {
    className?: string;
    size?: number;
    showText?: boolean;
}

export function Logo({ className = '', size = 32, showText = true }: LogoProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative flex items-center justify-center">
                {/* Abstract "Wave/Echo" Logo */}
                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-indigo-600"
                >
                    {/* Outer Ring */}
                    <circle
                        cx="20"
                        cy="20"
                        r="18"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeOpacity="0.2"
                    />

                    {/* Middle Ring - Dynamic */}
                    <path
                        d="M20 8C13.3726 8 8 13.3726 8 20C8 26.6274 13.3726 32 20 32"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="opacity-60"
                    />

                    {/* Inner Shape - Core Growth */}
                    <path
                        d="M20 14V26M26 20H14"
                        stroke="url(#gradient-Growth)"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />

                    <defs>
                        <linearGradient id="gradient-Growth" x1="14" y1="14" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#4F46E5" />
                            <stop offset="1" stopColor="#EC4899" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Glow effect behind */}
                <div
                    className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 -z-10"
                    style={{ width: size, height: size }}
                />
            </div>

            {showText && (
                <div className="flex flex-col">
                    <span className="font-bold text-xl tracking-tight text-gray-900 leading-none">
                        Habit<span className="text-indigo-600">Echo</span>
                    </span>
                </div>
            )}
        </div>
    );
}
