import { Request, Response, NextFunction } from 'express';

// ============================================
// COMMON TYPES
// ============================================

export interface JwtPayload {
  userId: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// USER TYPES
// ============================================

export type Occupation = 'STUDENT' | 'ENGINEER' | 'DOCTOR' | 'OTHER';

export interface UserPublic {
  id: string;
  fullName: string;
  email: string;
  occupation: Occupation;
  dateOfBirth: Date | null;
  age: number | null;
  timezone: string;
  createdAt: Date;
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

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserPublic;
  accessToken: string;
  refreshToken: string;
}

export interface VerifyOtpInput {
  email: string;
  code: string;
}

// ============================================
// HABIT TYPES
// ============================================

export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
export type EntryStatus = 'DONE' | 'NOT_DONE' | 'PARTIAL';

export interface CreateHabitInput {
  name: string;
  description?: string;
  frequency: Frequency;
  scheduleDays?: number[];
  startDate: string;
  endDate?: string;
}

export interface UpdateHabitInput {
  name?: string;
  description?: string;
  frequency?: Frequency;
  scheduleDays?: number[];
  startDate?: string;
  endDate?: string | null;
  isActive?: boolean;
}

export interface HabitPublic {
  id: string;
  name: string;
  description: string | null;
  frequency: Frequency;
  scheduleDays: number[] | null;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// HABIT ENTRY TYPES
// ============================================

export interface CreateHabitEntryInput {
  entryDate: string;
  status: EntryStatus;
  percentComplete?: number;
  reason?: string;
  notes?: string;
}

export interface UpdateHabitEntryInput {
  status?: EntryStatus;
  percentComplete?: number;
  reason?: string;
  notes?: string;
}

export interface HabitEntryPublic {
  id: string;
  habitId: string;
  entryDate: Date;
  status: EntryStatus;
  percentComplete: number | null;
  reason: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// PERFORMANCE & ANALYTICS TYPES
// ============================================

export interface PerformanceSummary {
  totalHabits: number;
  activeHabits: number;
  overallCompletionRate: number;
  currentStreak: number;
  longestStreak: number;
  todayCompletion: {
    completed: number;
    total: number;
    percentage: number;
  };
  rollingAverages: {
    last7Days: number;
    last14Days: number;
    last30Days: number;
  };
  momentum: {
    current: number;
    previous: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
    percentageChange: number;
  };
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
  rollingAverages: {
    last7Days: number;
    last14Days: number;
    last30Days: number;
  };
  heatmapData: HeatmapEntry[];
  missingDates: string[]; // List of historical scheduled dates with no entry
  momentum: {
    current: number;
    previous: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
    percentageChange: number;
  };
}

export interface HeatmapEntry {
  date: string;
  value: number; // 0-100 or completion status
  status: EntryStatus | null;
}

export interface StreakInfo {
  current: number;
  longest: number;
  lastCompletedDate: string | null;
}
