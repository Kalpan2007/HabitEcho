import pino from 'pino';
import { config } from '../config/index.js';

export const logger = pino({
  level: config.logging.level,
  transport: config.isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    env: config.env,
  },
  redact: {
    paths: ['password', 'token', 'authorization', 'cookie', 'req.headers.authorization'],
    remove: true,
  },
});

export type Logger = typeof logger;
