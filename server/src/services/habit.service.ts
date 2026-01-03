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
  const habit = await prisma.habit.create({
    data: {
      userId,
      name: input.name,
      description: input.description,
      frequency: input.frequency,
      scheduleDays: input.scheduleDays ?? undefined,
      startDate: parseAndNormalizeDate(input.startDate),
      endDate: input.endDate ? parseAndNormalizeDate(input.endDate) : null,
      isActive: true,
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
      orderBy: { createdAt: 'desc' },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    }),
    prisma.habit.count({ where }),
  ]);

  return {
    habits: habits.map(formatHabitPublic),
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

  return formatHabitPublic(habit);
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

  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.frequency !== undefined) updateData.frequency = input.frequency;
  if (input.scheduleDays !== undefined) updateData.scheduleDays = input.scheduleDays;
  if (input.startDate !== undefined) updateData.startDate = parseAndNormalizeDate(input.startDate);
  if (input.endDate !== undefined) {
    updateData.endDate = input.endDate ? parseAndNormalizeDate(input.endDate) : null;
  }
  if (input.isActive !== undefined) updateData.isActive = input.isActive;

  const habit = await prisma.habit.update({
    where: { id: habitId },
    data: updateData,
  });

  return formatHabitPublic(habit);
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
      deletedAt: null, // Exclude soft-deleted habits
      startDate: { lte: date },
      OR: [
        { endDate: null },
        { endDate: { gte: date } },
      ],
    },
  });

  return habits.map(formatHabitPublic);
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
