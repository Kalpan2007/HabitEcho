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

const STREAK_THRESHOLD = 50;

function calculateCompletionRate(
  entries: Array<{ status: string; percentComplete: number | null }>,
  totalScheduledDays: number
): number {
  const weightedSum = entries.reduce((sum, entry) => {
    const weight = entry.percentComplete !== null ? entry.percentComplete / 100 : entry.status === 'DONE' ? 1 : 0;
    return sum + weight;
  }, 0);
  return Math.round((weightedSum / Math.max(totalScheduledDays, 1)) * 100);
}

function countsTowardStreak(status: string, percentComplete: number | null): boolean {
  return status === 'DONE' || (percentComplete !== null && percentComplete >= STREAK_THRESHOLD);
}

function calculateStreaks(
  entries: Array<{ date: Date; status: string; percentComplete: number | null }>,
  scheduledDates: string[],
  timezone: string
): StreakInfo {
  let currentStreak = 0;
  let longestStreak = 0;

  const dateSet = new Set(scheduledDates);

  for (const scheduled of scheduledDates) {
    const entry = entries.find((e) => formatDate(e.date, 'YYYY-MM-DD', timezone) === scheduled);
    if (entry && countsTowardStreak(entry.status, entry.percentComplete)) {
      currentStreak += 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return { currentStreak, longestStreak };
}

async function calculateRollingAverage(
  habitId: string,
  days: number,
  timezone: string
): Promise<number> {
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    select: { startDate: true, createdAt: true, frequency: true, scheduleDays: true },
  });

  if (!habit) return 0;

  const end = dayjs().tz(timezone).endOf('day');
  // Clamp start date to habit start date if habit is newer than the window
  const windowStart = end.subtract(days - 1, 'day').startOf('day');
  const habitStart = dayjs(habit.startDate).tz(timezone).startOf('day');

  // Initial start calculation
  let start = habitStart.isAfter(windowStart) ? habitStart : windowStart;

  // If the habit hasn't started yet (future start date), return 0
  if (start.isAfter(end)) return 0;

  const logs = await prisma.habitLog.findMany({
    where: {
      habitId,
      date: {
        gte: start.toDate(), // Fetch from the earliest potential start
        lte: end.toDate(),
      },
    },
    orderBy: { date: 'asc' },
    select: { status: true, percentComplete: true, date: true },
  });

  // Intelligent Clamping:
  // If the calculated start date is BEFORE the habit's creation date (e.g. due to timezone defaults),
  // AND the user has NOT logged any entries between 'start' and 'createdAt',
  // Then clamp the start to 'createdAt' to avoid penalizing for days before the habit existed.
  const createdStart = dayjs(habit.createdAt).tz(timezone).startOf('day');

  if (start.isBefore(createdStart)) {
    const hasPreCreationLogs = logs.some(l => dayjs(l.date).tz(timezone).isBefore(createdStart));
    if (!hasPreCreationLogs) {
      if (createdStart.isAfter(start)) {
        start = createdStart;
      }
    }
  }

  // Filter logs to the final start date (using timezone-aware comparison)
  const relevantLogs = logs.filter(l => dayjs(l.date).tz(timezone).isSameOrAfter(start, 'day'));

  // Generate all days in range, then filter for days where the habit is actually scheduled
  // Use utc(true) to keep the local time (e.g. 00:00) when converting to UTC-based Date for generation
  // This prevents shifting to the previous day due to timezone offsets.
  const rangeParams = generateDateRange(start.utc(true).toDate(), end.utc(true).toDate());
  const scheduledDates = rangeParams.filter(dateStr =>
    isDateScheduled(new Date(dateStr), habit.frequency, habit.scheduleDays as number[], timezone)
  );

  const entries = relevantLogs.map((l) => ({ status: l.status, percentComplete: l.percentComplete }));

  // Use the count of actually scheduled days as the denominator
  return calculateCompletionRate(entries, scheduledDates.length);
}

export async function getPerformanceSummary(userId: string): Promise<PerformanceSummary> {
  const timezone = await getUserTimezone(userId);
  const today = dayjs().tz(timezone).startOf('day');

  const habits = await prisma.habit.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      isActive: true,
      frequency: true,
      scheduleDays: true,
      timezone: true,
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
  // Format the user's "today" in their timezone and normalize to Date for exact match
  const todayStr = today.format('YYYY-MM-DD');
  const { parseAndNormalizeDate } = await import('../utils/date.js');
  const normalizedToday = parseAndNormalizeDate(todayStr, timezone);

  const todayEntries = await prisma.habitLog.findMany({
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
    isDateScheduled(
      normalizedToday,
      habit.frequency,
      habit.scheduleDays as number[] | null,
      habit.timezone || timezone
    )
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
      scheduled: todayScheduledHabits.length,
    },
    rollingAverage: {
      last7Days,
      last14Days,
      last30Days,
    },
    momentum,
  };
}

async function calculateUserRollingAverage(
  userId: string,
  days: number,
  timezone: string
): Promise<number> {
  const end = dayjs().tz(timezone).endOf('day');
  const start = end.subtract(days - 1, 'day').startOf('day');

  const logs = await prisma.habitLog.findMany({
    where: {
      habit: { userId },
      date: {
        gte: start.toDate(),
        lte: end.toDate(),
      },
    },
    orderBy: { date: 'asc' },
    select: { status: true, percentComplete: true, date: true },
  });

  const scheduledDates = generateDateRange(start.utc(true).toDate(), end.utc(true).toDate());
  const entries = logs.map((l) => ({ status: l.status, percentComplete: l.percentComplete }));

  return calculateCompletionRate(entries, scheduledDates.length);
}

async function calculateUserStreaks(
  userId: string,
  timezone: string
): Promise<{ currentStreak: number; longestStreak: number }> {
  const end = dayjs().tz(timezone).endOf('day');
  const start = end.subtract(180, 'day').startOf('day');

  const logs = await prisma.habitLog.findMany({
    where: {
      habit: { userId },
      date: {
        gte: start.toDate(),
        lte: end.toDate(),
      },
    },
    orderBy: { date: 'asc' },
    select: { status: true, percentComplete: true, date: true },
  });

  const scheduledDates = generateDateRange(start.utc(true).toDate(), end.utc(true).toDate());
  const streaks = calculateStreaks(logs, scheduledDates, timezone);
  return streaks;
}

async function calculateMomentum(
  userId: string,
  timezone: string
): Promise<{
  current: number;
  previous: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  percentageChange: number;
}> {
  const end = dayjs().tz(timezone).endOf('day');
  const start = end.subtract(30, 'day').startOf('day');

  const logs = await prisma.habitLog.findMany({
    where: {
      habit: { userId },
      date: {
        gte: start.toDate(),
        lte: end.toDate(),
      },
    },
    orderBy: { date: 'asc' },
    select: { status: true, percentComplete: true, date: true, habitId: true },
  });

  const last7End = dayjs().tz(timezone).endOf('day');
  const last7Start = last7End.subtract(6, 'day').startOf('day');
  const last7Dates = generateDateRange(last7Start.utc(true).toDate(), last7End.utc(true).toDate());

  const recentEntriesByHabit = new Map<string, Array<{ status: string; percentComplete: number | null }>>();
  for (const log of logs) {
    const key = log.habitId;
    const arr = recentEntriesByHabit.get(key) || [];
    arr.push({ status: log.status, percentComplete: log.percentComplete });
    recentEntriesByHabit.set(key, arr);
  }

  let current = 0;
  let previous = 0;

  for (const [habitId, entries] of recentEntriesByHabit.entries()) {
    const habitCurrent = calculateCompletionRate(entries.slice(-7), last7Dates.length);
    const habitPrevious = calculateCompletionRate(entries.slice(-14, -7), last7Dates.length);
    current += habitCurrent;
    previous += habitPrevious;
  }

  const trend: 'UP' | 'DOWN' | 'STABLE' = current > previous ? 'UP' : current < previous ? 'DOWN' : 'STABLE';
  const percentageChange = previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);

  return { current, previous, trend, percentageChange };
}

export async function getHabitPerformance(
  userId: string,
  habitId: string
): Promise<HabitPerformance> {
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    select: {
      id: true,
      userId: true,
      name: true,
      frequency: true,
      scheduleDays: true,
      timezone: true,
      deletedAt: true,
      logs: {
        orderBy: { date: 'asc' },
        select: { date: true, status: true, percentComplete: true },
      },
    },
  });

  if (!habit || habit.deletedAt !== null || habit.userId !== userId) {
    throw new Error('Habit not found or access denied');
  }

  const timezone = habit.timezone;
  const entries = habit.logs.map((l: any) => ({ date: l.date, status: l.status, percentComplete: l.percentComplete }));

  const start = dayjs(entries[0]?.date).tz(timezone).startOf('day');
  const end = dayjs(entries[entries.length - 1]?.date).tz(timezone).endOf('day');
  const scheduledDates = generateDateRange(start.utc(true).toDate(), end.utc(true).toDate());

  const rollingAverage = await calculateRollingAverage(habitId, 7, timezone);
  const momentum = await calculateHabitMomentum(habitId, timezone);

  return {
    habitId,
    name: habit.name,
    rollingAverage,
    momentum,
    streaks: calculateStreaks(entries, scheduledDates, timezone),
    heatmap: entries.map((e) => ({ date: formatDate(e.date, 'YYYY-MM-DD', timezone), status: e.status as EntryStatus })),
  };
}

async function calculateHabitMomentum(
  habitId: string,
  timezone: string
): Promise<{
  current: number;
  previous: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  percentageChange: number;
}> {
  const end = dayjs().tz(timezone).endOf('day');
  const start = end.subtract(14, 'day').startOf('day');

  const logs = await prisma.habitLog.findMany({
    where: {
      habitId,
      date: {
        gte: start.toDate(),
        lte: end.toDate(),
      },
    },
    orderBy: { date: 'asc' },
    select: { status: true, percentComplete: true, date: true },
  });

  const last7End = dayjs().tz(timezone).endOf('day');
  const last7Start = last7End.subtract(6, 'day').startOf('day');
  const last7Dates = generateDateRange(last7Start.utc(true).toDate(), last7End.utc(true).toDate());

  const entries = logs.map((l) => ({ status: l.status, percentComplete: l.percentComplete }));
  const current = calculateCompletionRate(entries.slice(-7), last7Dates.length);
  const previous = calculateCompletionRate(entries.slice(-14, -7), last7Dates.length);

  const trend: 'UP' | 'DOWN' | 'STABLE' = current > previous ? 'UP' : current < previous ? 'DOWN' : 'STABLE';
  const percentageChange = previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);

  return { current, previous, trend, percentageChange };
}
