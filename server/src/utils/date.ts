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
 * This ensures "2026-01-12" is stored as "2026-01-12 00:00:00 UTC" to prevent
 * timezone shifts when retrieving from @db.Date columns
 */
export function parseAndNormalizeDate(dateString: string, tz: string = 'UTC'): Date {
  // If the date string is in YYYY-MM-DD format, verify it's a valid date
  // and store as UTC midnight. We explicitly IGNORE the timezone for the
  // storage value because @db.Date strips time anyway.
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const result = dayjs.utc(dateString).startOf('day').toDate();
    console.log(`[DEBUG] parseAndNormalizeDate: "${dateString}" => ${result.toISOString()} (UTC Storage)`);
    return result;
  }

  // If input is not a simple date string, convert to timezone then extract YYYY-MM-DD
  const localDate = dayjs(dateString).tz(tz);
  const dateStr = localDate.format('YYYY-MM-DD');
  const result = dayjs.utc(dateStr).startOf('day').toDate();
  console.log(`[DEBUG] parseAndNormalizeDate: "${dateString}" in tz "${tz}" => ${dateStr} => ${result.toISOString()} (UTC Storage)`);
  return result;
}

/**
 * Format date for API response.
 * IMPORTANT: Pass the user's timezone to ensure dates display correctly in their local time.
 * Without a timezone, defaults to UTC which may shift dates for non-UTC users.
 */
export function formatDate(date: Date | Dayjs, format: string = 'YYYY-MM-DD', tz?: string): string {
  if (tz) {
    const result = dayjs(date).tz(tz).format(format);
    // console.log(`[DEBUG] formatDate: ${date instanceof Date ? date.toISOString() : date.format()} in tz "${tz}" => "${result}"`);
    return result;
  }
  // Default to UTC for backward compatibility with existing callers
  const result = dayjs(date).utc().format(format);
  // console.log(`[DEBUG] formatDate (UTC): ${date instanceof Date ? date.toISOString() : date.format()} => "${result}"`);
  return result;
}

/**
 * Get date range for analytics
 */
export function getDateRange(days: number, tz: string = 'UTC'): { start: Date; end: Date } {
  // Return Date objects matching the stored UTC Midnight format
  const endLocal = getTodayInTimezone(tz);
  const startLocal = endLocal.subtract(days - 1, 'day');

  const startStr = startLocal.format('YYYY-MM-DD');
  const endStr = endLocal.format('YYYY-MM-DD');

  return {
    start: dayjs.utc(startStr).startOf('day').toDate(),
    end: dayjs.utc(endStr).startOf('day').toDate(),
  };
}

/**
 * Generate array of dates between start and end (inclusive)
 * Returns YYYY-MM-DD strings in the specified timezone
 */
export function generateDateRange(start: Date, end: Date, timezone: string = 'UTC'): string[] {
  const dates: string[] = [];
  // Since start/end might be UTC Storage dates, we should just iterate them in UTC
  // because the date 'value' (YYYY-MM-DD) is what matters.
  // Converting storage date (UTC Midnight) to Timezone might shift it back one day (e.g. Asia/Kolkata).
  // But wait, if we changed storage to UTC Midnight, then reading it as UTC gives "2026-01-12".
  // Reading it as "Asia/Kolkata" gives "2026-01-12 05:30". Same day.
  // Reading it as "America/New_York" gives "2026-01-11 19:00". Previous Day!

  // Solution: Treat start/end as naive dates if they are Date objects coming from DB/Storage logic
  // Use UTC to extract keys.
  let current = dayjs.utc(start).startOf('day');
  const endDate = dayjs.utc(end).startOf('day');

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
  date: Date | Dayjs | string,
  frequency: string,
  scheduleDays: number[] | null,
  timezone: string = 'UTC'
): boolean {
  // Evaluate the date in the habit's timezone so weekday/month checks align with the user expectation
  let d: Dayjs;
  if (typeof date === 'string') {
      // If string, parse in target timezone directly
      d = dayjs.tz(date, timezone);
  } else {
      // If Date/Dayjs, convert to timezone
      d = dayjs(date).tz(timezone);
  }

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
