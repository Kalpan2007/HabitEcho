import type { Frequency } from '../types';

/**
 * Get day of week (0 = Sunday, 6 = Saturday)
 */
function getDayOfWeek(date: Date | string): number {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.getDay();
}

/**
 * Get day of month (1-31)
 */
function getDayOfMonth(date: Date | string): number {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.getDate();
}

/**
 * Check if a date is scheduled for a habit
 */
export function isDateScheduled(
    date: Date | string,
    frequency: Frequency,
    scheduleDays: number[] | null
): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;

    switch (frequency) {
        case 'DAILY':
            return true;
        case 'WEEKLY':
        case 'CUSTOM': {
            const day = getDayOfWeek(d);
            return !scheduleDays || scheduleDays.length === 0 || scheduleDays.includes(day);
        }
        case 'MONTHLY': {
            const day = getDayOfMonth(d);
            return !scheduleDays || scheduleDays.length === 0 || scheduleDays.includes(day);
        }
        default:
            return true;
    }
}

/**
 * Format schedule days for display
 */
export function formatScheduleDays(frequency: Frequency, scheduleDays: number[] | null): string {
    if (!scheduleDays || scheduleDays.length === 0) {
        return 'Every day';
    }

    if (frequency === 'WEEKLY' || frequency === 'CUSTOM') {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return scheduleDays.map(day => dayNames[day]).join(', ');
    }

    if (frequency === 'MONTHLY') {
        return scheduleDays.map(day => `${day}${getOrdinalSuffix(day)}`).join(', ');
    }

    return 'Every day';
}

/**
 * Get ordinal suffix for day of month (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}
