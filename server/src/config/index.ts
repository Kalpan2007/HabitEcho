import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(32),
  OTP_EXPIRY_MINUTES: z.string().transform(Number).default('10'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  // Email configuration (optional in development)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
};

export const env = parseEnv();

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',
  isTest: env.NODE_ENV === 'test',

  database: {
    url: env.DATABASE_URL,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    expiresInMs: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  },

  cookie: {
    secret: env.COOKIE_SECRET,
    name: 'habitecho_token',
    options: {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? ('strict' as const) : ('lax' as const),
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    },
  },

  otp: {
    expiryMinutes: env.OTP_EXPIRY_MINUTES,
    length: 6,
  },

  rateLimit: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // 10 requests per window
    },
    general: {
      windowMs: 60 * 1000, // 1 minute
      max: 100, // 100 requests per minute
    },
  },

  logging: {
    level: env.LOG_LEVEL,
  },

  email: {
    enabled: !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS),
    host: env.SMTP_HOST || '',
    port: env.SMTP_PORT || 587,
    user: env.SMTP_USER || '',
    pass: env.SMTP_PASS || '',
    from: env.SMTP_FROM || 'HabitEcho <noreply@habitecho.com>',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
} as const;

export type Config = typeof config;
