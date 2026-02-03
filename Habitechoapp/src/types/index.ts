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
    emailVerified?: boolean;
    emailRemindersEnabled?: boolean;
    createdAt?: string;
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
    timezone?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Habit Log (called Entry in mobile app but Log in API)
export interface HabitLog {
    id: string;
    habitId: string;
    date: string; // API uses "date" not "entryDate"
    status: EntryStatus;
    completed?: boolean;
    percentComplete: number | null;
    reason: string | null;
    notes: string | null;
    reminderSent?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Keep HabitEntry as alias for backward compatibility
export type HabitEntry = HabitLog;

export interface SignupInput {
    fullName: string;
    email: string;
    password: string;
    occupation: Occupation;
    dateOfBirth?: string;
    age?: number;
    timezone?: string;
}

export interface CreateHabitInput {
    name: string;
    description?: string;
    frequency: Frequency;
    scheduleDays?: number[];
    startDate: string;
    endDate?: string;
    reminderTime?: string;
    timezone?: string;
}

export interface UpdateHabitInput {
    name?: string;
    description?: string;
    frequency?: Frequency;
    scheduleDays?: number[];
    startDate?: string;
    endDate?: string | null;
    isActive?: boolean;
    reminderTime?: string | null;
    timezone?: string;
}

export interface CreateLogInput {
    date: string; // YYYY-MM-DD
    status: EntryStatus;
    completed?: boolean;
    percentComplete?: number;
    reason?: string;
    notes?: string;
}

export interface UpdateLogInput {
    status?: EntryStatus;
    completed?: boolean;
    percentComplete?: number;
    reason?: string;
    notes?: string;
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

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationInfo;
}

export interface PerformanceSummary {
    totalHabits: number;
    activeHabits: number;
    overallCompletionRate: number;
    currentStreak: number;
    longestStreak: number;
    todayCompletion: {
        completed: number;
        scheduled: number;
        total: number;
        percentage: number;
    };
}

export interface HabitPerformance {
    habitId: string;
    habitName: string;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
    totalDays: number;
    completedDays: number;
}
