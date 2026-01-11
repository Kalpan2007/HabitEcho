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
  emailVerified: boolean;
  emailRemindersEnabled: boolean;
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
  reminderTime?: string; // "HH:mm"
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

export interface HabitPublic {
  id: string;
  name: string;
  description: string | null;
  frequency: Frequency;
  scheduleDays: number[] | null;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  reminderTime: string | null;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// HABIT LOG TYPES
// ============================================

export interface CreateHabitLogInput {
  date: string;
  status: EntryStatus;
  completed?: boolean;
  percentComplete?: number;
  reason?: string;
  notes?: string;
}

export interface UpdateHabitLogInput {
  status?: EntryStatus;
  completed?: boolean;
  percentComplete?: number;
  reason?: string;
  notes?: string;
}

export interface HabitLogPublic {
  id: string;
  habitId: string;
  date: Date;
  status: EntryStatus;
  completed: boolean;
  percentComplete: number | null;
  reason: string | null;
  notes: string | null;
  reminderSent: boolean;
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
    scheduled: number;
  };
  rollingAverage: {
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
  name: string;
  rollingAverage: number;
  momentum: {
    current: number;
    previous: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
    percentageChange: number;
  };
  streaks: StreakInfo;
  heatmap: { date: string; status: EntryStatus }[];
}

export interface HeatmapEntry {
  date: string;
  value: number;
  status: EntryStatus | null;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
}

export type EntryStatus = 'DONE' | 'PARTIAL' | 'MISSED' | 'SKIPPED';

export interface HabitLogEntry {
  id: string;
  habitId: string;
  date: Date;
  status: EntryStatus;
  completed: boolean;
  percentComplete: number | null;
  reason: string | null;
  notes: string | null;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}
