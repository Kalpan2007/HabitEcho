import { prisma } from '../config/database.js';
import { parseAndNormalizeDate } from '../utils/date.js';
import { NotFoundError, ConflictError, ForbiddenError } from '../utils/errors.js';
// import { verifyHabitOwnership } from './habit.service.js'; // REMOVED
import type {
  CreateHabitEntryInput,
  UpdateHabitEntryInput,
  HabitEntryPublic,
  EntryStatus,
} from '../types/index.js';

/**
 * Format habit entry for public response
 */
function formatHabitEntryPublic(entry: {
  id: string;
  habitId: string;
  entryDate: Date;
  status: string;
  percentComplete: number | null;
  reason: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): HabitEntryPublic {
  return {
    id: entry.id,
    habitId: entry.habitId,
    entryDate: entry.entryDate,
    status: entry.status as EntryStatus,
    percentComplete: entry.percentComplete,
    reason: entry.reason,
    notes: entry.notes,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

/**
 * Create or update a habit entry
 */
export async function createHabitEntry(
  userId: string,
  habitId: string,
  input: CreateHabitEntryInput
): Promise<HabitEntryPublic> {
  // Verify habit ownership and get schedule details
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    select: {
      userId: true,
      deletedAt: true,
      frequency: true,
      scheduleDays: true,
    },
  });

  if (!habit || habit.deletedAt !== null) {
    throw new NotFoundError('Habit not found');
  }

  if (habit.userId !== userId) {
    throw new ForbiddenError('Access denied');
  }

  const entryDate = parseAndNormalizeDate(input.entryDate);

  // Validate that the date is allowed by the schedule
  const { isDateScheduled } = await import('../utils/date.js');
  const isScheduled = isDateScheduled(
    entryDate,
    habit.frequency,
    habit.scheduleDays as number[] | null
  );

  if (!isScheduled) {
    const { ValidationError } = await import('../utils/errors.js');
    throw new ValidationError('Cannot log entry for a non-scheduled day');
  }

  // Check if entry already exists
  const existingEntry = await prisma.habitEntry.findUnique({
    where: {
      habitId_entryDate: {
        habitId,
        entryDate,
      },
    },
  });

  if (existingEntry) {
    throw new ConflictError('Entry already exists for this date. Use update instead.');
  }

  // Determine percentComplete based on status if not provided
  let percentComplete = input.percentComplete;
  if (percentComplete === undefined) {
    if (input.status === 'DONE') percentComplete = 100;
    else if (input.status === 'NOT_DONE') percentComplete = 0;
  }

  const entry = await prisma.habitEntry.create({
    data: {
      habitId,
      entryDate,
      status: input.status,
      percentComplete,
      reason: input.reason,
      notes: input.notes,
    },
  });

  return formatHabitEntryPublic(entry);
}

/**
 * Update a habit entry
 */
export async function updateHabitEntry(
  userId: string,
  habitId: string,
  entryDate: string,
  input: UpdateHabitEntryInput
): Promise<HabitEntryPublic> {
  // Verify habit ownership
  await verifyHabitOwnership(userId, habitId);

  const normalizedDate = parseAndNormalizeDate(entryDate);

  const existingEntry = await prisma.habitEntry.findUnique({
    where: {
      habitId_entryDate: {
        habitId,
        entryDate: normalizedDate,
      },
    },
  });

  if (!existingEntry) {
    throw new NotFoundError('Entry not found for this date');
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
  }
  if (input.percentComplete !== undefined) updateData.percentComplete = input.percentComplete;
  if (input.reason !== undefined) updateData.reason = input.reason;
  if (input.notes !== undefined) updateData.notes = input.notes;

  const entry = await prisma.habitEntry.update({
    where: {
      habitId_entryDate: {
        habitId,
        entryDate: normalizedDate,
      },
    },
    data: updateData,
  });

  return formatHabitEntryPublic(entry);
}

/**
 * Get habit entry history
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
): Promise<{ entries: HabitEntryPublic[]; total: number }> {
  // Verify habit ownership
  await verifyHabitOwnership(userId, habitId);

  const where: Record<string, unknown> = { habitId };

  if (options.startDate) {
    where.entryDate = {
      ...(where.entryDate as Record<string, unknown> || {}),
      gte: parseAndNormalizeDate(options.startDate),
    };
  }

  if (options.endDate) {
    where.entryDate = {
      ...(where.entryDate as Record<string, unknown> || {}),
      lte: parseAndNormalizeDate(options.endDate),
    };
  }

  const [entries, total] = await Promise.all([
    prisma.habitEntry.findMany({
      where,
      orderBy: { entryDate: 'desc' },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    }),
    prisma.habitEntry.count({ where }),
  ]);

  return {
    entries: entries.map(formatHabitEntryPublic),
    total,
  };
}

/**
 * Get entries for multiple habits on a specific date
 */
export async function getEntriesForDate(
  userId: string,
  date: Date,
  habitIds?: string[]
): Promise<HabitEntryPublic[]> {
  // Get user's habits first
  const userHabits = await prisma.habit.findMany({
    where: {
      userId,
      ...(habitIds ? { id: { in: habitIds } } : {}),
    },
    select: { id: true },
  });

  const userHabitIds = userHabits.map(h => h.id);

  const entries = await prisma.habitEntry.findMany({
    where: {
      habitId: { in: userHabitIds },
      entryDate: date,
    },
  });

  return entries.map(formatHabitEntryPublic);
}

/**
 * Get all entries for a habit within a date range
 */
export async function getEntriesInRange(
  habitId: string,
  startDate: Date,
  endDate: Date
): Promise<HabitEntryPublic[]> {
  const entries = await prisma.habitEntry.findMany({
    where: {
      habitId,
      entryDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { entryDate: 'asc' },
  });

  return entries.map(formatHabitEntryPublic);
}

/**
 * Delete a habit entry
 */
export async function deleteHabitEntry(
  userId: string,
  habitId: string,
  entryDate: string
): Promise<void> {
  // Verify habit ownership
  await verifyHabitOwnership(userId, habitId);

  const normalizedDate = parseAndNormalizeDate(entryDate);

  const entry = await prisma.habitEntry.findUnique({
    where: {
      habitId_entryDate: {
        habitId,
        entryDate: normalizedDate,
      },
    },
  });

  if (!entry) {
    throw new NotFoundError('Entry not found');
  }

  await prisma.habitEntry.delete({
    where: {
      habitId_entryDate: {
        habitId,
        entryDate: normalizedDate,
      },
    },
  });
}
