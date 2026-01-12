import { prisma } from '../config/database.js';
import { parseAndNormalizeDate } from '../utils/date.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/errors.js';
import { verifyHabitOwnership } from './habit.service.js';
import type {
    CreateHabitLogInput,
    UpdateHabitLogInput,
    HabitLogPublic,
    EntryStatus,
} from '../types/index.js';

/**
 * Format habit log for public response
 */
function formatHabitLogPublic(log: any, timezone?: string): HabitLogPublic {
    const { formatDate } = require('../utils/date.js');
    return {
        id: log.id,
        habitId: log.habitId,
        date: formatDate(log.date, 'YYYY-MM-DD', timezone || 'UTC'),
        status: log.status as EntryStatus,
        completed: log.completed,
        percentComplete: log.percentComplete,
        reason: log.reason,
        notes: log.notes,
        reminderSent: log.reminderSent,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt,
    };
}

/**
 * Create or update a habit log
 */
export async function createHabitLog(
    userId: string,
    habitId: string,
    input: CreateHabitLogInput
): Promise<HabitLogPublic> {
    // Verify habit ownership and get schedule details
    const habit = await (prisma as any).habit.findUnique({
        where: { id: habitId },
        select: {
            userId: true,
            deletedAt: true,
            frequency: true,
            scheduleDays: true,
            timezone: true,
            user: {
                select: { timezone: true }
            }
        },
    });

    if (!habit || habit.deletedAt !== null) {
        throw new NotFoundError('Habit not found');
    }

    if (habit.userId !== userId) {
        throw new ForbiddenError('Access denied');
    }

    // Use the habit's timezone, fallback to user's timezone, then UTC
    const timezone = habit.timezone || habit.user?.timezone || 'UTC';

    // Normalize date to UTC Midnight for consistent storage
    const date = parseAndNormalizeDate(input.date, timezone); // This now returns UTC Midnight
    // console.log(`[DEBUG] createHabitLog: ...`);

    // Validate that the date is allowed by the schedule
    // Pass the raw input string so isDateScheduled can check against the timezone correctly
    const { isDateScheduled } = await import('../utils/date.js');
    const isScheduled = isDateScheduled(
        input.date, // Pass string "YYYY-MM-DD"
        habit.frequency,
        habit.scheduleDays as number[] | null,
        timezone
    );

    if (!isScheduled) {
        const { ValidationError } = await import('../utils/errors.js');
        throw new ValidationError('Cannot log entry for a non-scheduled day');
    }

    // Check if log already exists
    const existingLog = await (prisma as any).habitLog.findUnique({
        where: {
            habitId_date: {
                habitId,
                date,
            },
        },
    });

    if (existingLog) {
        throw new ConflictError('Log already exists for this date. Use update instead.');
    }

    // Determine percentComplete based on status if not provided
    let percentComplete = input.percentComplete;
    if (percentComplete === undefined) {
        if (input.status === 'DONE') percentComplete = 100;
        else if (input.status === 'NOT_DONE') percentComplete = 0;
    }

    const completed = input.completed ?? (input.status === 'DONE');

    const log = await (prisma as any).habitLog.create({
        data: {
            habitId,
            date,
            status: input.status,
            completed,
            percentComplete,
            reason: input.reason,
            notes: input.notes,
        },
    });

    return formatHabitLogPublic(log, timezone);
}

/**
 * Update a habit log
 */
export async function updateHabitLog(
    userId: string,
    habitId: string,
    date: string,
    input: UpdateHabitLogInput
): Promise<HabitLogPublic> {
    // Verify habit ownership
    await verifyHabitOwnership(userId, habitId);

    // Fetch timezone to normalize date consistently with creation
    const habit = await (prisma as any).habit.findUnique({
        where: { id: habitId },
        select: { timezone: true },
    });

    const normalizedDate = parseAndNormalizeDate(date, (habit as any)?.timezone || 'UTC');

    const existingLog = await (prisma as any).habitLog.findUnique({
        where: {
            habitId_date: {
                habitId,
                date: normalizedDate,
            },
        },
    });

    if (!existingLog) {
        throw new NotFoundError('Log not found for this date');
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (input.status !== undefined) {
        updateData.status = input.status;
        // Auto-set percentComplete if status changed
        if (input.percentComplete === undefined) {
            if (input.status === 'DONE') updateData.percentComplete = 100;
            else if (input.status === 'NOT_DONE') updateData.percentComplete = 0;
        }
        // Auto-set completed
        if (input.completed === undefined) {
            updateData.completed = input.status === 'DONE';
        }
    }

    if (input.completed !== undefined) updateData.completed = input.completed;
    if (input.percentComplete !== undefined) updateData.percentComplete = input.percentComplete;
    if (input.reason !== undefined) updateData.reason = input.reason;
    if (input.notes !== undefined) updateData.notes = input.notes;

    const log = await (prisma as any).habitLog.update({
        where: {
            habitId_date: {
                habitId,
                date: normalizedDate,
            },
        },
        data: updateData,
    });

    return formatHabitLogPublic(log, habit?.timezone || 'UTC');
}

/**
 * Get habit log history
 */
export async function getHabitHistory(
    userId: string,
    habitId: string,
    options: {
        startDate?: string;
        endDate?: string;
        page: number;
        limit: number;
    }
): Promise<{ logs: HabitLogPublic[]; total: number }> {
    // Verify habit ownership
    await verifyHabitOwnership(userId, habitId);

    // Fetch timezone for range parsing
    const habit = await (prisma as any).habit.findUnique({
        where: { id: habitId },
        select: { timezone: true },
    });

    const where: Record<string, unknown> = { habitId };

    if (options.startDate) {
        where.date = {
            ...(where.date as Record<string, unknown> || {}),
            gte: parseAndNormalizeDate(options.startDate, (habit as any)?.timezone || 'UTC'),
        };
    }

    if (options.endDate) {
        where.date = {
            ...(where.date as Record<string, unknown> || {}),
            lte: parseAndNormalizeDate(options.endDate, (habit as any)?.timezone || 'UTC'),
        };
    }

    const [logs, total] = await Promise.all([
        (prisma as any).habitLog.findMany({
            where,
            orderBy: { date: 'desc' },
            skip: (options.page - 1) * options.limit,
            take: options.limit,
        }),
        (prisma as any).habitLog.count({ where }),
    ]);

    const timezone = habit?.timezone || 'UTC';
    return {
        logs: logs.map((log: any) => formatHabitLogPublic(log, timezone)),
        total,
    };
}

/**
 * Get logs for multiple habits on a specific date
 */
export async function getLogsForDate(
    userId: string,
    date: Date,
    habitIds?: string[]
): Promise<HabitLogPublic[]> {
    // Get user's habits first
    const userHabits = await (prisma as any).habit.findMany({
        where: {
            userId,
            ...(habitIds ? { id: { in: habitIds } } : {}),
        },
        select: { id: true, timezone: true },
    });

    const userHabitIds = userHabits.map((h: any) => h.id);
    const habitTimezoneMap = new Map(userHabits.map((h: any) => [h.id, h.timezone || 'UTC']));

    const logs = await (prisma as any).habitLog.findMany({
        where: {
            habitId: { in: userHabitIds },
            date: date,
        },
    });

    return logs.map((log: any) => formatHabitLogPublic(log, habitTimezoneMap.get(log.habitId) || 'UTC'));
}

/**
 * Get all logs for a habit within a date range
 */
export async function getLogsInRange(
    habitId: string,
    startDate: Date,
    endDate: Date
): Promise<HabitLogPublic[]> {
    const habit = await (prisma as any).habit.findUnique({
        where: { id: habitId },
        select: { timezone: true },
    });

    const logs = await (prisma as any).habitLog.findMany({
        where: {
            habitId,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: { date: 'asc' },
    });

    return logs.map((log: any) => formatHabitLogPublic(log, habit?.timezone || 'UTC'));
}

/**
 * Delete a habit log
 */
export async function deleteHabitLog(
    userId: string,
    habitId: string,
    date: string
): Promise<void> {
    // Verify habit ownership
    await verifyHabitOwnership(userId, habitId);

    // Fetch timezone to normalize date consistently with creation
    const habit = await (prisma as any).habit.findUnique({
        where: { id: habitId },
        select: { timezone: true },
    });

    const normalizedDate = parseAndNormalizeDate(date, (habit as any)?.timezone || 'UTC');

    const log = await (prisma as any).habitLog.findUnique({
        where: {
            habitId_date: {
                habitId,
                date: normalizedDate,
            },
        },
    });

    if (!log) {
        throw new NotFoundError('Log not found');
    }

    await (prisma as any).habitLog.delete({
        where: {
            habitId_date: {
                habitId,
                date: normalizedDate,
            },
        },
    });
}
