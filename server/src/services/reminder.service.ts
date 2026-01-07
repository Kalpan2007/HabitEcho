import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { prisma } from '../config/database.js';
import { sendReminderEmail } from './email.service.js';
import { logger } from '../utils/logger.js';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Process all habit reminders
 * Runs every minute via cron
 */
export async function processReminders(): Promise<void> {
    try {
        const now = dayjs.utc();

        // 1. Fetch all active habits for verified users who have reminders enabled
        const habits = await (prisma as any).habit.findMany({
            where: {
                isActive: true,
                reminderTime: { not: null },
                deletedAt: null,
                user: {
                    emailVerified: true,
                    emailRemindersEnabled: true,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                        timezone: true,
                    },
                },
            },
        });

        if (habits.length === 0) return;

        logger.debug(`Processing reminders for ${habits.length} potential habits`);

        for (const habit of habits) {
            try {
                const habitTz = habit.timezone || habit.user.timezone || 'UTC';
                const nowInTz = now.tz(habitTz);

                // Normalize time to HH:mm for precise minute-matching
                const currentTime = nowInTz.format('HH:mm');

                // Check if current time matches reminder time
                if (currentTime !== habit.reminderTime) {
                    continue;
                }

                const todayDate = nowInTz.startOf('day').toDate();

                // 2. HABITLOG CREATION GUARANTEE
                // We ensure a log exists for today before we attempt to "claim" the reminder.
                let log = await (prisma as any).habitLog.findUnique({
                    where: {
                        habitId_date: {
                            habitId: habit.id,
                            date: todayDate,
                        },
                    },
                });

                if (!log) {
                    try {
                        log = await (prisma as any).habitLog.create({
                            data: {
                                habitId: habit.id,
                                date: todayDate,
                                completed: false,
                                status: 'NOT_DONE',
                                reminderSent: false,
                            },
                        });
                    } catch (createError) {
                        // Probably a race condition where another instance created it
                        log = await (prisma as any).habitLog.findUnique({
                            where: {
                                habitId_date: {
                                    habitId: habit.id,
                                    date: todayDate,
                                },
                            },
                        });
                    }
                }

                // 3. Skip if already completed or reminder already sent
                if (!log || log.completed || log.reminderSent) {
                    continue;
                }

                // 4. CRON CONCURRENCY SAFETY (Atomic Claim)
                // Use an atomic update to "claim" the reminder. This prevents multiple
                // instances from sending the same email even if they run simultaneously.
                const claim = await (prisma as any).habitLog.updateMany({
                    where: {
                        id: log.id,
                        reminderSent: false,
                        completed: false,
                    },
                    data: {
                        reminderSent: true,
                    },
                });

                // 5. EMAIL FAILURE HANDLING
                // Only attempt to send the email if we successfully claimed the reminder (count === 1).
                if (claim.count === 1) {
                    try {
                        const emailSent = await sendReminderEmail(
                            habit.user.email,
                            habit.user.fullName,
                            habit.name,
                            habit.id
                        );

                        if (emailSent) {
                            logger.info({ habitId: habit.id, userId: habit.user.id }, 'Habit reminder email sent');
                        } else {
                            throw new Error('Email service reported failure');
                        }
                    } catch (emailError) {
                        logger.error({ emailError, habitId: habit.id }, 'SMTP failed. Reverting reminder claim.');

                        // Revert reminderSent back to false so it can be picked up later if the window permits,
                        // or at least so the state accurately reflects that no email was sent.
                        await (prisma as any).habitLog.update({
                            where: { id: log.id },
                            data: {
                                reminderSent: false,
                            },
                        });
                    }
                }
            } catch (habitError) {
                logger.error({ habitError, habitId: habit.id }, 'Error processing specific habit reminder');
            }
        }
    } catch (error) {
        logger.error({ error }, 'CRITICAL: Failed to process reminder batch');
    }
}
