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
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  // Frontend URL for cookie domain (optional, defaults to CORS_ORIGIN)
  FRONTEND_URL: z.string().optional(),
  // Allow insecure cookies for local development (set to 'true' to support localhost clients)
  ALLOW_INSECURE_COOKIES: z.string().transform(val => val === 'true').default('false'),
  // Brevo Transactional Email API configuration (optional in development)
  BREVO_API_KEY: z.string().optional(),
  BREVO_SENDER_EMAIL: z.string().email().optional(),
  BREVO_SENDER_NAME: z.string().optional(),
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
      // Always use secure:true in production (required for sameSite:'none')
      // In development, allow insecure cookies for localhost
      secure: env.NODE_ENV === 'production' || !env.ALLOW_INSECURE_COOKIES,
      // Use 'none' for cross-domain in production, 'lax' for same-domain in development
      sameSite: env.NODE_ENV === 'production' ? ('none' as const) : ('lax' as const),
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
    enabled: !!(env.BREVO_API_KEY && env.BREVO_SENDER_EMAIL),
    apiKey: env.BREVO_API_KEY || '',
    from: env.BREVO_SENDER_EMAIL || 'noreply@habitecho.com',
    senderName: env.BREVO_SENDER_NAME || 'HabitEcho',
    replyTo: env.BREVO_SENDER_EMAIL || 'noreply@habitecho.com',
  },

  cors: {
    origin: env.CORS_ORIGIN,
  },

  frontend: {
    url: env.FRONTEND_URL || env.CORS_ORIGIN,
  },
} as const;

export type Config = typeof config;
