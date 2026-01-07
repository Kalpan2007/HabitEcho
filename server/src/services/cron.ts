import cron from 'node-cron';
import { processReminders } from './reminder.service.js';
import { logger } from '../utils/logger.js';

/**
 * Initialize all cron jobs
 */
export function initCronJobs(): void {
    // Run every minute
    // cron.schedule(expression, callback)
    cron.schedule('* * * * *', async () => {
        try {
            await processReminders();
        } catch (error) {
            logger.error({ error }, 'Cron job execution failed');
        }
    });

    logger.info('Background cron jobs initialized');
}
