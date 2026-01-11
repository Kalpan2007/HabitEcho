import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import isBetween from 'dayjs/plugin/isBetween.js';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

export { dayjs, Dayjs };

/**
 * Get current date in user's timezone, normalized to start of day
 */
export function getTodayInTimezone(tz: string = 'UTC'): Dayjs {
  return dayjs().tz(tz).startOf('day');
}

/**
 * Parse a date string and normalize to start of day in UTC
 */
export function parseAndNormalizeDate(dateString: string, tz: string = 'UTC'): Date {
  // If the date string is in YYYY-MM-DD format, interpret it in the provided timezone
  // Then normalize to UTC start-of-day to store consistently
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dayjs.tz(dateString, tz).startOf('day').utc().toDate();
  }

  return dayjs(dateString).tz(tz).startOf('day').utc().toDate();
}

/**
 * Format date for API response
 */
// Format date using UTC to avoid server timezone shifts
export function formatDate(date: Date | Dayjs, format: string = 'YYYY-MM-DD'): string {
  return dayjs(date).utc().format(format);
}

/**
 * Get date range for analytics
 */
export function getDateRange(days: number, tz: string = 'UTC'): { start: Date; end: Date } {
  const end = getTodayInTimezone(tz);
  const start = end.subtract(days - 1, 'day');

  return {
    start: start.utc().toDate(),
    end: end.utc().toDate(),
  };
}

/**
 * Generate array of dates between start and end (inclusive)
 */
export function generateDateRange(start: Date, end: Date): string[] {
  const dates: string[] = [];
  let current = dayjs(start).utc(); // Ensure UTC
  const endDate = dayjs(end).utc(); // Ensure UTC

  while (current.isSameOrBefore(endDate, 'day')) {
    dates.push(current.format('YYYY-MM-DD'));
    current = current.add(1, 'day');
  }

  return dates;
}

/**
 * Check if a date is within a habit's schedule
 */
export function isDateScheduled(
  date: Date | Dayjs,
  frequency: string,
  scheduleDays: number[] | null,
  timezone: string = 'UTC'
): boolean {
  // Evaluate the date in the habit's timezone so weekday/month checks align with the user expectation
  const d = dayjs(date).tz(timezone);

  switch (frequency) {
    case 'DAILY':
      return true;

    case 'WEEKLY':
      // scheduleDays contains days of week (0 = Sunday, 6 = Saturday)
      if (!scheduleDays || scheduleDays.length === 0) return true;
      return scheduleDays.includes(d.day());

    case 'MONTHLY':
      // scheduleDays contains days of month (1-31)
      if (!scheduleDays || scheduleDays.length === 0) return true;
      return scheduleDays.includes(d.date());

    case 'CUSTOM':
      // For custom, we rely on scheduleDays representing specific patterns
      if (!scheduleDays || scheduleDays.length === 0) return true;
      return scheduleDays.includes(d.day());

    default:
      return true;
  }
}

/**
 * Calculate days difference between two dates
 */
export function daysDifference(date1: Date, date2: Date): number {
  return Math.abs(dayjs(date1).diff(dayjs(date2), 'day'));
}

/**
 * Check if date is today
 */
export function isToday(date: Date, tz: string = 'UTC'): boolean {
  const today = getTodayInTimezone(tz);
  return dayjs(date).isSame(today, 'day');
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date, tz: string = 'UTC'): boolean {
  const today = getTodayInTimezone(tz);
  return dayjs(date).isBefore(today, 'day');
}
