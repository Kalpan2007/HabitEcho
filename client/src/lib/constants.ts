// ============================================
// API CONFIGURATION
// ============================================

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Log API URL in development for debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('[Config] API_BASE_URL:', API_BASE_URL);
}

// ============================================
// ROUTE PATHS
// ============================================

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',


  // Protected routes
  DASHBOARD: '/dashboard',
  HABITS: '/dashboard/habits',
  PROFILE: '/dashboard/profile',
  NEW_HABIT: '/dashboard/habits/new',
  HABIT_DETAIL: (id: string) => `/dashboard/habits/${id}`,
  PERFORMANCE: '/dashboard/performance',
} as const;

// ============================================
// FREQUENCY OPTIONS
// ============================================

export const FREQUENCY_OPTIONS = [
  { value: 'DAILY', label: 'Daily', description: 'Every day' },
  { value: 'WEEKLY', label: 'Weekly', description: 'Specific days of the week' },
  { value: 'MONTHLY', label: 'Monthly', description: 'Specific days of the month' },
  { value: 'CUSTOM', label: 'Custom', description: 'Custom weekly schedule' },
] as const;

export const WEEKDAYS = [
  { value: 0, label: 'Sun', fullLabel: 'Sunday' },
  { value: 1, label: 'Mon', fullLabel: 'Monday' },
  { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { value: 4, label: 'Thu', fullLabel: 'Thursday' },
  { value: 5, label: 'Fri', fullLabel: 'Friday' },
  { value: 6, label: 'Sat', fullLabel: 'Saturday' },
] as const;

// ============================================
// OCCUPATION OPTIONS
// ============================================

export const OCCUPATION_OPTIONS = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'ENGINEER', label: 'Engineer' },
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'OTHER', label: 'Other' },
] as const;

// ============================================
// ENTRY STATUS OPTIONS
// ============================================

export const ENTRY_STATUS_OPTIONS = [
  { value: 'DONE', label: 'Done', color: 'text-green-600', bgColor: 'bg-green-100' },
  { value: 'PARTIAL', label: 'Partial', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { value: 'NOT_DONE', label: 'Not Done', color: 'text-red-600', bgColor: 'bg-red-100' },
] as const;

// ============================================
// PAGINATION DEFAULTS
// ============================================

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

// ============================================
// UI CONSTANTS
// ============================================

export const STREAK_THRESHOLD = 50; // PARTIAL entries count toward streak if percentComplete >= 50

export const MOMENTUM_THRESHOLD = 5; // Trend is UP/DOWN if change exceeds ±5%
