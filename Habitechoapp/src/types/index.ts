export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
export type EntryStatus = 'DONE' | 'NOT_DONE' | 'PARTIAL';
export type Occupation = 'STUDENT' | 'ENGINEER' | 'DOCTOR' | 'OTHER';

export interface User {
    id: string;
    fullName: string;
    email: string;
    occupation: Occupation;
    dateOfBirth: string | null;
    age: number | null;
    timezone: string;
}

export interface Habit {
    id: string;
    name: string;
    description: string | null;
    frequency: Frequency;
    scheduleDays: number[] | null;
    startDate: string;
    endDate: string | null;
    isActive: boolean;
    reminderTime: string | null;
}

export interface HabitEntry {
    id: string;
    habitId: string;
    entryDate: string;
    status: EntryStatus;
    percentComplete: number | null;
    reason: string | null;
    notes: string | null;
}

export interface SignupInput {
    fullName: string;
    email: string;
    password: string;
    occupation: Occupation;
    dateOfBirth?: string;
    age?: number;
    timezone?: string;
}

export interface HeatmapDataPoint {
    date: string;
    status: EntryStatus;
    value?: number;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data: T;
}
