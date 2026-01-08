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

  const completedCount = entries.reduce((sum: number, entry: any) => {
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
 */
function calculateStreaks(
  entries: Array<{ date: Date; status: string; percentComplete: number | null }>,
  scheduledDates: string[]
): StreakInfo {
  if (scheduledDates.length === 0) {
    return { current: 0, longest: 0, lastCompletedDate: null };
  }

  const entryMap = new Map(
    entries.map((e: any) => [formatDate(e.date), e])
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

  return { current: 0, longest: longestStreak, lastCompletedDate };
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

  const entries = await (prisma as any).habitLog.findMany({
    where: {
      habitId,
      date: { gte: start, lte: end },
    },
  });

  if (entries.length === 0) return 0;

  const total = entries.reduce((sum: number, entry: any) => {
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
  const habits = await (prisma as any).habit.findMany({
    where: { userId, deletedAt: null },
    select: {
      id: true,
      name: true,
      isActive: true,
      frequency: true,
      scheduleDays: true,
      logs: {
        where: {
          date: { gte: today.subtract(30, 'day').toDate() },
        },
        select: {
          status: true,
          percentComplete: true,
          date: true,
        },
      },
    },
  });

  const activeHabits = habits.filter((h: any) => h.isActive);
  const todayStr = formatDate(today);

  const { parseAndNormalizeDate } = await import('../utils/date.js');
  const normalizedToday = parseAndNormalizeDate(todayStr);

  const todayEntries = await (prisma as any).habitLog.findMany({
    where: {
      habit: { userId, deletedAt: null },
      date: normalizedToday,
    },
    select: {
      status: true,
      habitId: true,
    },
  });

  const todayScheduledHabits = activeHabits.filter((habit: any) =>
    isDateScheduled(normalizedToday, habit.frequency, habit.scheduleDays as number[] | null)
  );

  const todayCompleted = todayEntries.filter((e: any) => e.status === 'DONE').length;

  const allEntries = habits.flatMap((h: any) => h.logs);
  const overallCompletionRate = calculateCompletionRate(
    allEntries.map((e: any) => ({ status: e.status, percentComplete: e.percentComplete })),
    allEntries.length || 1
  );

  const [last7Days, last14Days, last30Days] = await Promise.all([
    calculateUserRollingAverage(userId, 7, timezone),
    calculateUserRollingAverage(userId, 14, timezone),
    calculateUserRollingAverage(userId, 30, timezone),
  ]);

  const { currentStreak, longestStreak } = await calculateUserStreaks(userId, timezone);
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

  const entries = await (prisma as any).habitLog.findMany({
    where: {
      habit: { userId, deletedAt: null },
      date: { gte: start, lte: end },
    },
    select: {
      status: true,
      percentComplete: true,
    },
  });

  if (entries.length === 0) return 0;

  const total = entries.reduce((sum: number, entry: any) => {
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
  const { start } = getDateRange(365, timezone);
  const end = dayjs().tz(timezone).startOf('day').toDate();

  const habits = await (prisma as any).habit.findMany({
    where: { userId, isActive: true, deletedAt: null },
    select: {
      id: true,
      frequency: true,
      scheduleDays: true,
      logs: {
        where: { date: { gte: start, lte: end } },
        select: {
          date: true,
          status: true,
          percentComplete: true,
        },
        orderBy: { date: 'asc' },
      },
    },
  });

  if (habits.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const dateMap = new Map<string, { completed: number; scheduled: number }>();
  const allDates = generateDateRange(start, end);

  for (const date of allDates) {
    const d = new Date(date);
    let scheduled = 0;
    let completed = 0;

    for (const habit of habits) {
      if (isDateScheduled(d, habit.frequency, habit.scheduleDays as number[] | null)) {
        scheduled++;
        const entry = (habit as any).logs.find((e: any) => formatDate(e.date) === date);
        if (entry && (entry.status === 'DONE' || entry.status === 'PARTIAL')) {
          completed++;
        }
      }
    }

    if (scheduled > 0) {
      dateMap.set(date, { completed, scheduled });
    }
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const sortedDates = Array.from(dateMap.keys()).sort();
  const reversedDates = [...sortedDates].reverse();

  for (const date of reversedDates) {
    const data = dateMap.get(date);
    if (data && data.completed >= data.scheduled * 0.5) {
      currentStreak++;
    } else {
      break;
    }
  }

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

  const currentStart = today.subtract(6, 'day').toDate();
  const currentEnd = today.toDate();

  const previousStart = today.subtract(13, 'day').toDate();
  const previousEnd = today.subtract(7, 'day').toDate();

  const [currentEntries, previousEntries] = await Promise.all([
    (prisma as any).habitLog.findMany({
      where: {
        habit: { userId, deletedAt: null },
        date: { gte: currentStart, lte: currentEnd },
      },
    }),
    (prisma as any).habitLog.findMany({
      where: {
        habit: { userId, deletedAt: null },
        date: { gte: previousStart, lte: previousEnd },
      },
    }),
  ]);

  const calculateAvg = (entries: any[]): number => {
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

  const habit = await (prisma as any).habit.findFirst({
    where: { id: habitId, userId, deletedAt: null },
  });

  if (!habit) {
    throw new Error('Habit not found');
  }

  const entries = await (prisma as any).habitLog.findMany({
    where: { habitId },
    orderBy: { date: 'asc' },
  });

  const today = dayjs().tz(timezone).startOf('day');
  const startDate = dayjs(habit.startDate);
  const endDate = habit.endDate ? dayjs(habit.endDate) : today;
  const effectiveEnd = endDate.isBefore(today) ? endDate : today;

  const allDates = generateDateRange(startDate.toDate(), effectiveEnd.toDate());
  const scheduledDates = allDates.filter(date =>
    isDateScheduled(new Date(date), habit.frequency, (habit as any).scheduleDays as number[] | null)
  );

  const completedEntries = entries.filter((e: any) => e.status === 'DONE').length;
  const partialEntries = entries.filter((e: any) => e.status === 'PARTIAL').length;
  const missedEntries = Math.max(0, scheduledDates.length - entries.length);

  const completionRate = calculateCompletionRate(
    entries.map((e: any) => ({ status: e.status, percentComplete: e.percentComplete })),
    scheduledDates.length
  );

  const streaks = calculateStreaks(entries, scheduledDates);

  const entryDateStrings = new Set(entries.map((e: any) => dayjs(e.date).tz(timezone).format('YYYY-MM-DD')));
  const missingDates = scheduledDates
    .map(d => dayjs(d).tz(timezone).format('YYYY-MM-DD'))
    .filter(dateStr => !entryDateStrings.has(dateStr));

  const [last7Days, last14Days, last30Days] = await Promise.all([
    calculateRollingAverage(habitId, 7, timezone),
    calculateRollingAverage(habitId, 14, timezone),
    calculateRollingAverage(habitId, 30, timezone),
  ]);

  const heatmapStart = today.subtract(364, 'day');
  const heatmapDates = generateDateRange(heatmapStart.toDate(), today.toDate());

  const entryMap = new Map(
    entries.map((e: any) => [formatDate(e.date), e])
  );

  const heatmapData: HeatmapEntry[] = heatmapDates.map(date => {
    const entry = entryMap.get(date) as any;
    const isScheduled = isDateScheduled(
      new Date(date),
      habit.frequency,
      (habit as any).scheduleDays as number[] | null
    );

    if (!isScheduled) {
      return { date, value: -1, status: null };
    }

    if (!entry) {
      return { date, value: 0, status: null };
    }

    return {
      date,
      value: entry.status === 'DONE' ? 100 : (entry.percentComplete || 0),
      status: entry.status as EntryStatus,
    };
  });

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
    missingDates,
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
    (prisma as any).habitLog.findMany({
      where: {
        habitId,
        date: { gte: currentStart, lte: currentEnd },
      },
    }),
    (prisma as any).habitLog.findMany({
      where: {
        habitId,
        date: { gte: previousStart, lte: previousEnd },
      },
    }),
  ]);

  const calculateAvg = (entries: any[]): number => {
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
