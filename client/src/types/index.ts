// ============================================
// ENUMS - Matching backend Prisma schema
// ============================================

export type Occupation = 'STUDENT' | 'ENGINEER' | 'DOCTOR' | 'OTHER';

export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

export type EntryStatus = 'DONE' | 'NOT_DONE' | 'PARTIAL';

export type MomentumTrend = 'UP' | 'DOWN' | 'STABLE';



// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string;
  fullName: string;
  email: string;
  occupation: Occupation;
  dateOfBirth: string | null;
  age: number | null;
  timezone: string;
  createdAt: string;
}

// ============================================
// HABIT TYPES
// ============================================

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
  timezone: string;
  createdAt: string;
  updatedAt: string;
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

// ============================================
// HABIT ENTRY TYPES
// ============================================

export interface HabitEntry {
  id: string;
  habitId: string;
  entryDate: string;
  status: EntryStatus;
  percentComplete: number | null;
  reason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntryInput {
  entryDate: string;
  status: EntryStatus;
  percentComplete?: number;
  reason?: string;
  notes?: string;
}

export interface UpdateEntryInput {
  status?: EntryStatus;
  percentComplete?: number;
  reason?: string;
  notes?: string;
}

// ============================================
// PERFORMANCE TYPES
// ============================================

export interface RollingAverages {
  last7Days: number;
  last14Days: number;
  last30Days: number;
}

export interface Momentum {
  current: number;
  previous: number;
  trend: MomentumTrend;
  percentageChange: number;
}

export interface TodayCompletion {
  completed: number;
  total: number;
  percentage: number;
}

export interface PerformanceSummary {
  totalHabits: number;
  activeHabits: number;
  overallCompletionRate: number;
  currentStreak: number;
  longestStreak: number;
  todayCompletion: TodayCompletion;
  rollingAverages: RollingAverages;
  momentum: Momentum;
}

export interface HeatmapDataPoint {
  date: string;
  value: number;
  status: EntryStatus | null;
}

export interface HabitPerformance {
  habitId: string;
  habitName: string;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
  completedEntries: number;
  partialEntries: number;
  missedEntries: number;
  rollingAverages: RollingAverages;
  heatmapData: HeatmapDataPoint[];
  missingDates: string[]; // Added: List of historical scheduled dates with no entry
  momentum: Momentum;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error: {
    code: string;
    details?: Record<string, unknown>;
  };
}

// ============================================
// AUTH TYPES
// ============================================

export interface SignupInput {
  fullName: string;
  email: string;
  password: string;
  occupation: Occupation;
  dateOfBirth?: string;
  age?: number;
  timezone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// End of auth types

// ============================================
// FORM STATE TYPES
// ============================================

export interface FormState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  data?: any;
}
