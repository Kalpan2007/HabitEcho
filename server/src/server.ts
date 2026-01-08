import { app } from './app.js';
import { config } from './config/index.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';
import { initCronJobs } from './services/index.js';

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // Connect to database
    await connectDatabase();

    // Initialize cron jobs
    initCronJobs();

    // Start HTTP server
    const server = app.listen(config.port, () => {
      logger.info(
        {
          port: config.port,
          env: config.env,
          nodeVersion: process.version,
        },
        `🚀 HabitEcho server is running on port ${config.port}`
      );
    });

    // ============================================
    // GRACEFUL SHUTDOWN
    // ============================================

    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info({ signal }, 'Received shutdown signal, starting graceful shutdown...');

      // Stop accepting new connections
      server.close(async (err: Error | undefined) => {
        if (err) {
          logger.error({ error: err }, 'Error during server close');
          process.exit(1);
        }

        try {
          // Disconnect from database
          await disconnectDatabase();

          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error({ error }, 'Error during graceful shutdown');
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.fatal({ error: error.message, stack: error.stack }, 'Uncaught exception');
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: unknown) => {
      logger.fatal({ reason }, 'Unhandled promise rejection');
      process.exit(1);
    });

  } catch (error) {
    logger.fatal({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// Start the server
startServer();
