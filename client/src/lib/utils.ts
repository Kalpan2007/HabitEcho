import { Frequency, EntryStatus, MomentumTrend } from '@/types';
import { WEEKDAYS } from './constants';

// ============================================
// DATE UTILITIES
// ============================================

/**
 * Format a date string to YYYY-MM-DD format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Use local time to ensure we get the user's actual date, not UTC yesterday
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date for display (e.g., "Jan 1, 2026")
 */
export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date for display (e.g., "January 1, 2026")
 */
export function formatLongDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getToday(): string {
  return formatDate(new Date());
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string): boolean {
  return formatDate(date) === getToday();
}

/**
 * Get the day of week (0-6, where 0 is Sunday)
 */
export function getDayOfWeek(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getDay();
}

/**
 * Get the day of month (1-31)
 */
export function getDayOfMonth(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getDate();
}

/**
 * Get relative time string (e.g., "2 days ago")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// ============================================
// SCHEDULE UTILITIES
// ============================================

/**
 * Format schedule days for display
 */
export function formatScheduleDays(frequency: Frequency, scheduleDays: number[] | null): string {
  if (frequency === 'DAILY') {
    return 'Every day';
  }

  if (!scheduleDays || scheduleDays.length === 0) {
    return 'Not scheduled';
  }

  if (frequency === 'WEEKLY' || frequency === 'CUSTOM') {
    const sortedDays = [...scheduleDays].sort((a, b) => a - b);
    return sortedDays
      .map(day => WEEKDAYS.find(w => w.value === day)?.label || day)
      .join(', ');
  }

  if (frequency === 'MONTHLY') {
    const sortedDays = [...scheduleDays].sort((a, b) => a - b);
    return sortedDays.map(day => `${day}${getOrdinalSuffix(day)}`).join(', ');
  }

  return 'Custom schedule';
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
export function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

/**
 * Check if a date is scheduled for a habit
 */
export function isScheduledDay(
  date: Date | string,
  frequency: Frequency,
  scheduleDays: number[] | null,
  startDate: string,
  endDate: string | null
): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dateStr = formatDate(d);

  // Check date range
  if (dateStr < startDate) return false;
  if (endDate && dateStr > endDate) return false;

  // Check frequency
  if (frequency === 'DAILY') return true;

  if (!scheduleDays || scheduleDays.length === 0) return false;

  if (frequency === 'WEEKLY' || frequency === 'CUSTOM') {
    return scheduleDays.includes(getDayOfWeek(d));
  }

  if (frequency === 'MONTHLY') {
    return scheduleDays.includes(getDayOfMonth(d));
  }

  return false;
}

// ============================================
// STATUS UTILITIES
// ============================================

/**
 * Get status display properties
 */
export function getStatusDisplay(status: EntryStatus | null): {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
} {
  switch (status) {
    case 'DONE':
      return {
        label: 'Done',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300',
      };
    case 'PARTIAL':
      return {
        label: 'Partial',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300',
      };
    case 'NOT_DONE':
      return {
        label: 'Not Done',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300',
      };
    default:
      return {
        label: 'No Entry',
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
      };
  }
}

/**
 * Get momentum trend display properties
 */
export function getMomentumDisplay(trend: MomentumTrend): {
  label: string;
  color: string;
  icon: string;
} {
  switch (trend) {
    case 'UP':
      return { label: 'Improving', color: 'text-green-600', icon: '↑' };
    case 'DOWN':
      return { label: 'Declining', color: 'text-red-600', icon: '↓' };
    case 'STABLE':
      return { label: 'Stable', color: 'text-gray-600', icon: '→' };
  }
}

// ============================================
// NUMBER UTILITIES
// ============================================

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

// ============================================
// STRING UTILITIES
// ============================================

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// ============================================
// CLASS NAME UTILITIES
// ============================================

/**
 * Combine class names conditionally
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
