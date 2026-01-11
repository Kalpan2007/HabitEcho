import { prisma } from '../config/database.js';
import { parseAndNormalizeDate } from '../utils/date.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import type {
  CreateHabitInput,
  UpdateHabitInput,
  HabitPublic,
  Frequency,
} from '../types/index.js';

/**
 * Format habit for public response
 */
function formatHabitPublic(habit: {
  id: string;
  name: string;
  description: string | null;
  frequency: string;
  scheduleDays: unknown;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  reminderTime: string | null;
  timezone: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): HabitPublic {
  return {
    id: habit.id,
    name: habit.name,
    description: habit.description,
    frequency: habit.frequency as Frequency,
    scheduleDays: habit.scheduleDays as number[] | null,
    startDate: habit.startDate,
    endDate: habit.endDate,
    isActive: habit.isActive,
    reminderTime: habit.reminderTime,
    timezone: habit.timezone,
    createdAt: habit.createdAt,
    updatedAt: habit.updatedAt,
  };
}

/**
 * Create a new habit
 */
export async function createHabit(
  userId: string,
  input: CreateHabitInput
): Promise<HabitPublic> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true }
  });

  const tz = input.timezone || user?.timezone || 'UTC';

  const habit = await prisma.habit.create({
    data: {
      userId,
      name: input.name,
      description: input.description,
      frequency: input.frequency,
      scheduleDays: input.scheduleDays ?? undefined,
      startDate: parseAndNormalizeDate(input.startDate, tz),
      endDate: input.endDate ? parseAndNormalizeDate(input.endDate, tz) : null,
      isActive: true,
      reminderTime: input.reminderTime ?? null,
      timezone: tz,
    },
  });

  return formatHabitPublic(habit);
}

/**
 * Get all habits for a user
 */
export async function getHabits(
  userId: string,
  options: {
    isActive?: boolean;
    search?: string;
    page: number;
    limit: number;
  }
): Promise<{ habits: HabitPublic[]; total: number }> {
  const where: any = {
    userId,
    deletedAt: null, // Exclude soft-deleted habits
    ...(options.isActive !== undefined ? { isActive: options.isActive } : {}),
  };

  if (options.search) {
    where.name = {
      contains: options.search,
      mode: 'insensitive', // Case-insensitive search
    };
  }

  const [habits, total] = await Promise.all([
    prisma.habit.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        frequency: true,
        scheduleDays: true,
        startDate: true,
        endDate: true,
        isActive: true,
        reminderTime: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
        // userId and deletedAt omitted
      },
      orderBy: { createdAt: 'desc' },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    }),
    prisma.habit.count({ where }),
  ]);

  return {
    habits: habits.map(formatHabitPublic as any),
    total,
  };
}

/**
 * Get a single habit by ID
 */
export async function getHabitById(
  userId: string,
  habitId: string
): Promise<HabitPublic> {
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
  });

  if (!habit || habit.deletedAt !== null) {
    throw new NotFoundError('Habit not found');
  }

  if (habit.userId !== userId) {
    throw new ForbiddenError('Access denied');
  }

  return formatHabitPublic(habit as any);
}

/**
 * Update a habit
 */
export async function updateHabit(
  userId: string,
  habitId: string,
  input: UpdateHabitInput
): Promise<HabitPublic> {
  // First verify ownership
  const existingHabit = await prisma.habit.findUnique({
    where: { id: habitId },
  });

  if (!existingHabit || existingHabit.deletedAt !== null) {
    throw new NotFoundError('Habit not found');
  }

  if (existingHabit.userId !== userId) {
    throw new ForbiddenError('Access denied');
  }

  // Prepare update data
  const updateData: Record<string, unknown> = {};
  const tz = input.timezone || (existingHabit as any).timezone || 'UTC';

  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.frequency !== undefined) updateData.frequency = input.frequency;
  if (input.scheduleDays !== undefined) updateData.scheduleDays = input.scheduleDays;
  if (input.startDate !== undefined) updateData.startDate = parseAndNormalizeDate(input.startDate, tz);
  if (input.endDate !== undefined) {
    updateData.endDate = input.endDate ? parseAndNormalizeDate(input.endDate, tz) : null;
  }
  if (input.isActive !== undefined) updateData.isActive = input.isActive;
  if (input.reminderTime !== undefined) updateData.reminderTime = input.reminderTime;
  if (input.timezone !== undefined) updateData.timezone = input.timezone;

  const habit = await prisma.habit.update({
    where: { id: habitId },
    data: updateData,
  });

  return formatHabitPublic(habit as any);
}

/**
 * Delete a habit (soft delete - sets deletedAt timestamp)
 * Entries are preserved for analytics integrity.
 */
export async function deleteHabit(userId: string, habitId: string): Promise<void> {
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
  });

  if (!habit || habit.deletedAt !== null) {
    throw new NotFoundError('Habit not found');
  }

  if (habit.userId !== userId) {
    throw new ForbiddenError('Access denied');
  }

  // Soft delete habit (entries are preserved)
  await prisma.habit.update({
    where: { id: habitId },
    data: { deletedAt: new Date() },
  });
}

/**
 * Get habits that are scheduled for a specific date
 */
export async function getHabitsForDate(
  userId: string,
  date: Date
): Promise<HabitPublic[]> {
  const habits = await prisma.habit.findMany({
    where: {
      userId,
      isActive: true,
      deletedAt: null,
      startDate: { lte: date },
      OR: [
        { endDate: null },
        { endDate: { gte: date } },
      ],
    },
    select: {
      id: true,
      name: true,
      description: true,
      frequency: true,
      scheduleDays: true,
      startDate: true,
      endDate: true,
      isActive: true,
      reminderTime: true,
      timezone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return habits.map(formatHabitPublic as any);
}

/**
 * Verify habit ownership
 */
export async function verifyHabitOwnership(
  userId: string,
  habitId: string
): Promise<boolean> {
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
    select: { userId: true, deletedAt: true },
  });

  if (!habit || habit.deletedAt !== null) {
    throw new NotFoundError('Habit not found');
  }

  if (habit.userId !== userId) {
    throw new ForbiddenError('Access denied');
  }

  return true;
}
