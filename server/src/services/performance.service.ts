import { prisma } from '../config/database.js';
import { dayjs, getDateRange, generateDateRange, isDateScheduled, formatDate } from '../utils/date.js';
import { getUserTimezone } from './auth.service.js';
import type {
  PerformanceSummary,
  HabitPerformance,
  HeatmapEntry,
  StreakInfo,
  EntryStatus,
} from '../types/index.js';

/**
 * Threshold for PARTIAL entries to count toward streaks.
 * A PARTIAL entry contributes to streak only if percentComplete >= this value.
 */
const STREAK_THRESHOLD = 50;

/**
 * Calculate completion rate from entries
 */
function calculateCompletionRate(
  entries: Array<{ status: string; percentComplete: number | null }>,
  totalScheduledDays: number
): number {
  if (totalScheduledDays === 0) return 0;

  const completedCount = entries.reduce((sum, entry) => {
    if (entry.status === 'DONE') return sum + 1;
    if (entry.status === 'PARTIAL' && entry.percentComplete) {
      return sum + entry.percentComplete / 100;
    }
    return sum;
  }, 0);

  return Math.round((completedCount / totalScheduledDays) * 100);
}

/**
 * Check if an entry counts toward streak based on status and percentComplete
 */
function countsTowardStreak(status: string, percentComplete: number | null): boolean {
  if (status === 'DONE') return true;
  if (status === 'PARTIAL' && percentComplete !== null && percentComplete >= STREAK_THRESHOLD) {
    return true;
  }
  return false;
}

/**
 * Calculate streaks from sorted entries (oldest to newest)
 * A PARTIAL entry only counts if percentComplete >= STREAK_THRESHOLD (50%)
 */
function calculateStreaks(
  entries: Array<{ entryDate: Date; status: string; percentComplete: number | null }>,
  scheduledDates: string[]
): StreakInfo {
  if (scheduledDates.length === 0) {
    return { current: 0, longest: 0, lastCompletedDate: null };
  }

  const entryMap = new Map(
    entries.map(e => [formatDate(e.entryDate), e])
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastCompletedDate: string | null = null;

  // Process from newest to oldest for current streak
  const reversedDates = [...scheduledDates].reverse();
  let streakBroken = false;

  for (const date of reversedDates) {
    const entry = entryMap.get(date);
    if (entry && countsTowardStreak(entry.status, entry.percentComplete)) {
      if (!streakBroken) {
        currentStreak++;
      }
      if (!lastCompletedDate) {
        lastCompletedDate = date;
      }
    } else {
      streakBroken = true;
    }
  }

  // Process from oldest to newest for longest streak
  for (const date of scheduledDates) {
    const entry = entryMap.get(date);
    if (entry && countsTowardStreak(entry.status, entry.percentComplete)) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { current: currentStreak, longest: longestStreak, lastCompletedDate };
}

/**
 * Calculate rolling average for a specific number of days
 */
async function calculateRollingAverage(
  habitId: string,
  days: number,
  timezone: string
): Promise<number> {
  const { start, end } = getDateRange(days, timezone);

  const entries = await prisma.habitEntry.findMany({
    where: {
      habitId,
      entryDate: { gte: start, lte: end },
    },
  });

  if (entries.length === 0) return 0;

  const total = entries.reduce((sum, entry) => {
    if (entry.status === 'DONE') return sum + 100;
    if (entry.status === 'PARTIAL') return sum + (entry.percentComplete || 50);
    return sum;
  }, 0);

  return Math.round(total / days);
}

/**
 * Get overall performance summary for a user
 */
export async function getPerformanceSummary(userId: string): Promise<PerformanceSummary> {
  const timezone = await getUserTimezone(userId);
  const today = dayjs().tz(timezone).startOf('day');

  // Get user's habits (excluding soft-deleted)
  const habits = await prisma.habit.findMany({
    where: { userId, deletedAt: null },
    include: {
      entries: {
        where: {
          entryDate: { gte: today.subtract(30, 'day').toDate() },
        },
      },
    },
  });

  const activeHabits = habits.filter(h => h.isActive);

  // Calculate today's completion
  // Use strict YYYY-MM-DD string to query DB to avoid time mismatches
  const todayStr = formatDate(today);
  // We need to parse this back to a generic Date (UTC midnight) for Prisma if the field is @db.Date
  // But strictly speaking, our parseAndNormalizeDate handles this best.
  // Actually, let's filter in memory or ensure we query for the exact date.

  // Alternative: Query by range or use raw string if Prisma supports it, but @db.Date maps to Date object.
  // Let's rely on finding entries where `entryDate` matches our calculated "Today" string

  // Fetch entries for the user
  // We can filter effectively in memory for "today" since we already fetched habits with recent entries? 
  // No, the `include` above only fetched last 30 days.

  // Let's re-fetch today's entries explicitly using the date string logic
  const todayDateForQuery = new Date(todayStr); // This creates UTC midnight for that string usually (YYYY-MM-DD)
  // Wait, new Date('2026-01-03') might be local.
  // Safer to use our date utils
  const { parseAndNormalizeDate } = await import('../utils/date.js');
  const normalizedToday = parseAndNormalizeDate(todayStr);

  const todayEntries = await prisma.habitEntry.findMany({
    where: {
      habit: { userId, deletedAt: null },
      entryDate: normalizedToday,
    },
  });

  const todayScheduledHabits = activeHabits.filter(habit =>
    isDateScheduled(normalizedToday, habit.frequency, habit.scheduleDays as number[] | null)
  );

  const todayCompleted = todayEntries.filter(e => e.status === 'DONE').length;

  // Calculate overall completion rate (last 30 days)
  const allEntries = habits.flatMap(h => h.entries);
  const overallCompletionRate = calculateCompletionRate(
    allEntries.map(e => ({ status: e.status, percentComplete: e.percentComplete })),
    allEntries.length || 1
  );

  // Calculate rolling averages
  const [last7Days, last14Days, last30Days] = await Promise.all([
    calculateUserRollingAverage(userId, 7, timezone),
    calculateUserRollingAverage(userId, 14, timezone),
    calculateUserRollingAverage(userId, 30, timezone),
  ]);

  // Calculate streaks across all habits
  const { currentStreak, longestStreak } = await calculateUserStreaks(userId, timezone);

  // Calculate momentum (compare last 7 days vs previous 7 days)
  const momentum = await calculateMomentum(userId, timezone);

  return {
    totalHabits: habits.length,
    activeHabits: activeHabits.length,
    overallCompletionRate,
    currentStreak,
    longestStreak,
    todayCompletion: {
      completed: todayCompleted,
      total: todayScheduledHabits.length,
      percentage: todayScheduledHabits.length > 0
        ? Math.round((todayCompleted / todayScheduledHabits.length) * 100)
        : 0,
    },
    rollingAverages: {
      last7Days,
      last14Days,
      last30Days,
    },
    momentum,
  };
}

/**
 * Calculate rolling average for all user's habits
 */
async function calculateUserRollingAverage(
  userId: string,
  days: number,
  timezone: string
): Promise<number> {
  const { start, end } = getDateRange(days, timezone);

  const entries = await prisma.habitEntry.findMany({
    where: {
      habit: { userId, deletedAt: null },
      entryDate: { gte: start, lte: end },
    },
  });

  if (entries.length === 0) return 0;

  const total = entries.reduce((sum, entry) => {
    if (entry.status === 'DONE') return sum + 100;
    if (entry.status === 'PARTIAL') return sum + (entry.percentComplete || 50);
    return sum;
  }, 0);

  return Math.round(total / entries.length);
}

/**
 * Calculate user-level streaks
 */
async function calculateUserStreaks(
  userId: string,
  timezone: string
): Promise<{ currentStreak: number; longestStreak: number }> {
  const { start } = getDateRange(365, timezone); // Look back 1 year
  const end = dayjs().tz(timezone).startOf('day').toDate();

  const habits = await prisma.habit.findMany({
    where: { userId, isActive: true, deletedAt: null },
    include: {
      entries: {
        where: { entryDate: { gte: start, lte: end } },
        orderBy: { entryDate: 'asc' },
      },
    },
  });

  if (habits.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Build a map of dates to completion status
  const dateMap = new Map<string, { completed: number; scheduled: number }>();
  const allDates = generateDateRange(start, end);

  for (const date of allDates) {
    const d = new Date(date);
    let scheduled = 0;
    let completed = 0;

    for (const habit of habits) {
      if (isDateScheduled(d, habit.frequency, habit.scheduleDays as number[] | null)) {
        scheduled++;
        const entry = habit.entries.find(e => formatDate(e.entryDate) === date);
        if (entry && (entry.status === 'DONE' || entry.status === 'PARTIAL')) {
          completed++;
        }
      }
    }

    if (scheduled > 0) {
      dateMap.set(date, { completed, scheduled });
    }
  }

  // Calculate streaks based on days where all scheduled habits were completed
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const sortedDates = Array.from(dateMap.keys()).sort();
  const reversedDates = [...sortedDates].reverse();

  // Current streak (from today backwards)
  for (const date of reversedDates) {
    const data = dateMap.get(date);
    if (data && data.completed >= data.scheduled * 0.5) { // At least 50% completion
      currentStreak++;
    } else {
      break;
    }
  }

  // Longest streak
  for (const date of sortedDates) {
    const data = dateMap.get(date);
    if (data && data.completed >= data.scheduled * 0.5) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak, longestStreak };
}

/**
 * Calculate momentum (trend comparison)
 */
async function calculateMomentum(
  userId: string,
  timezone: string
): Promise<{
  current: number;
  previous: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  percentageChange: number;
}> {
  const today = dayjs().tz(timezone).startOf('day');

  // Current period: last 7 days
  const currentStart = today.subtract(6, 'day').toDate();
  const currentEnd = today.toDate();

  // Previous period: 7 days before that
  const previousStart = today.subtract(13, 'day').toDate();
  const previousEnd = today.subtract(7, 'day').toDate();

  const [currentEntries, previousEntries] = await Promise.all([
    prisma.habitEntry.findMany({
      where: {
        habit: { userId, deletedAt: null },
        entryDate: { gte: currentStart, lte: currentEnd },
      },
    }),
    prisma.habitEntry.findMany({
      where: {
        habit: { userId, deletedAt: null },
        entryDate: { gte: previousStart, lte: previousEnd },
      },
    }),
  ]);

  const calculateAvg = (entries: typeof currentEntries): number => {
    if (entries.length === 0) return 0;
    const total = entries.reduce((sum, e) => {
      if (e.status === 'DONE') return sum + 100;
      if (e.status === 'PARTIAL') return sum + (e.percentComplete || 50);
      return sum;
    }, 0);
    return Math.round(total / entries.length);
  };

  const current = calculateAvg(currentEntries);
  const previous = calculateAvg(previousEntries);

  let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
  let percentageChange = 0;

  if (previous > 0) {
    percentageChange = Math.round(((current - previous) / previous) * 100);
    if (percentageChange > 5) trend = 'UP';
    else if (percentageChange < -5) trend = 'DOWN';
  } else if (current > 0) {
    trend = 'UP';
    percentageChange = 100;
  }

  return { current, previous, trend, percentageChange };
}

/**
 * Get detailed performance for a specific habit
 */
export async function getHabitPerformance(
  userId: string,
  habitId: string
): Promise<HabitPerformance> {
  const timezone = await getUserTimezone(userId);

  // Verify habit belongs to user and is not soft-deleted
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId, deletedAt: null },
  });

  if (!habit) {
    throw new Error('Habit not found');
  }

  // Get all entries for this habit
  const entries = await prisma.habitEntry.findMany({
    where: { habitId },
    orderBy: { entryDate: 'asc' },
  });

  // Generate scheduled dates from habit start to today
  const today = dayjs().tz(timezone).startOf('day');
  const startDate = dayjs(habit.startDate);
  const endDate = habit.endDate ? dayjs(habit.endDate) : today;
  const effectiveEnd = endDate.isBefore(today) ? endDate : today;

  const allDates = generateDateRange(startDate.toDate(), effectiveEnd.toDate());
  const scheduledDates = allDates.filter(date =>
    isDateScheduled(new Date(date), habit.frequency, habit.scheduleDays as number[] | null)
  );

  // Calculate stats
  const completedEntries = entries.filter(e => e.status === 'DONE').length;
  const partialEntries = entries.filter(e => e.status === 'PARTIAL').length;
  const missedEntries = Math.max(0, scheduledDates.length - entries.length);

  const completionRate = calculateCompletionRate(
    entries.map(e => ({ status: e.status, percentComplete: e.percentComplete })),
    scheduledDates.length
  );

  // Calculate streaks
  const streaks = calculateStreaks(entries, scheduledDates);

  // Identify missing dates (Scheduled but no entry)
  const entryDateStrings = new Set(entries.map(e => dayjs(e.entryDate).tz(timezone).format('YYYY-MM-DD')));
  const missingDates = scheduledDates
    .map(d => dayjs(d).tz(timezone).format('YYYY-MM-DD'))
    .filter(dateStr => !entryDateStrings.has(dateStr));

  // Calculate rolling averages
  const [last7Days, last14Days, last30Days] = await Promise.all([
    calculateRollingAverage(habitId, 7, timezone),
    calculateRollingAverage(habitId, 14, timezone),
    calculateRollingAverage(habitId, 30, timezone),
  ]);

  // Generate heatmap data (last 365 days)
  const heatmapStart = today.subtract(364, 'day');
  const heatmapDates = generateDateRange(heatmapStart.toDate(), today.toDate());

  const entryMap = new Map(
    entries.map(e => [formatDate(e.entryDate), e])
  );

  const heatmapData: HeatmapEntry[] = heatmapDates.map(date => {
    const entry = entryMap.get(date);
    const isScheduled = isDateScheduled(
      new Date(date),
      habit.frequency,
      habit.scheduleDays as number[] | null
    );

    if (!isScheduled) {
      return { date, value: -1, status: null }; // Not scheduled
    }

    if (!entry) {
      return { date, value: 0, status: null }; // Missed
    }

    return {
      date,
      value: entry.status === 'DONE' ? 100 : (entry.percentComplete || 0),
      status: entry.status as EntryStatus,
    };
  });

  // Calculate habit-specific momentum
  const momentum = await calculateHabitMomentum(habitId, timezone);

  return {
    habitId,
    habitName: habit.name,
    completionRate,
    currentStreak: streaks.current,
    longestStreak: streaks.longest,
    totalEntries: entries.length,
    completedEntries,
    partialEntries,
    missedEntries,
    rollingAverages: {
      last7Days,
      last14Days,
      last30Days,
    },
    heatmapData,
    missingDates, // Add calculated missing dates
    momentum,
  };
}

/**
 * Calculate momentum for a specific habit
 */
async function calculateHabitMomentum(
  habitId: string,
  timezone: string
): Promise<{
  current: number;
  previous: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  percentageChange: number;
}> {
  const today = dayjs().tz(timezone).startOf('day');

  const currentStart = today.subtract(6, 'day').toDate();
  const currentEnd = today.toDate();
  const previousStart = today.subtract(13, 'day').toDate();
  const previousEnd = today.subtract(7, 'day').toDate();

  const [currentEntries, previousEntries] = await Promise.all([
    prisma.habitEntry.findMany({
      where: {
        habitId,
        entryDate: { gte: currentStart, lte: currentEnd },
      },
    }),
    prisma.habitEntry.findMany({
      where: {
        habitId,
        entryDate: { gte: previousStart, lte: previousEnd },
      },
    }),
  ]);

  const calculateAvg = (entries: typeof currentEntries): number => {
    if (entries.length === 0) return 0;
    const total = entries.reduce((sum, e) => {
      if (e.status === 'DONE') return sum + 100;
      if (e.status === 'PARTIAL') return sum + (e.percentComplete || 50);
      return sum;
    }, 0);
    return Math.round(total / entries.length);
  };

  const current = calculateAvg(currentEntries);
  const previous = calculateAvg(previousEntries);

  let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
  let percentageChange = 0;

  if (previous > 0) {
    percentageChange = Math.round(((current - previous) / previous) * 100);
    if (percentageChange > 5) trend = 'UP';
    else if (percentageChange < -5) trend = 'DOWN';
  } else if (current > 0) {
    trend = 'UP';
    percentageChange = 100;
  }

  return { current, previous, trend, percentageChange };
}
