import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/crypto.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} from '../utils/errors.js';
import type {
  SignupInput,
  LoginInput,
  UserPublic,
  AuthResponse,
  Occupation
} from '../types/index.js';
import { sendVerificationEmail } from './email.service.js';

/**
 * Format user for public response
 */
function formatUserPublic(user: any): UserPublic {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    occupation: user.occupation as Occupation,
    dateOfBirth: user.dateOfBirth,
    age: user.age,
    timezone: user.timezone,
    emailVerified: user.emailVerified,
    emailRemindersEnabled: user.emailRemindersEnabled,
    createdAt: user.createdAt,
  };
}

/**
 * Helper to generate tokens and store refresh token
 */
async function generateAuthResponse(userId: string, user: any): Promise<AuthResponse> {
  const accessToken = generateAccessToken(userId);
  const refreshTokenString = generateRefreshToken(userId);

  // Store refresh token in DB
  await (prisma as any).refreshToken.create({
    data: {
      token: refreshTokenString,
      userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  return {
    user: formatUserPublic(user),
    accessToken,
    refreshToken: refreshTokenString,
  };
}

/**
 * Register a new user (Stage 1: Send OTP)
 */
export async function signup(input: SignupInput): Promise<{ message: string; email: string }> {
  const { fullName, email, password, occupation, dateOfBirth, age, timezone } = input;

  const existingUser = await (prisma as any).user.findUnique({
    where: { email },
  });

  if (existingUser) {
    if (existingUser.emailVerified) {
      throw new ConflictError('Email already registered');
    }
    // If user exists but not verified, we can allow re-signing or just resending OTP.
    // Let's delete the unverified user to allow fresh signup with potentially updated password/details.
    await (prisma as any).user.delete({ where: { id: existingUser.id } });
  }

  const hashedPassword = await hashPassword(password);

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await (prisma as any).user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      occupation,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      age,
      timezone: timezone || 'UTC',
      emailVerified: false,
      emailVerificationToken: hashedOtp,
      emailVerificationExpiry: otpExpiry,
    },
  });

  // Send OTP email
  await sendVerificationEmail(email, otp, fullName);

  return {
    message: 'Verification code sent to your email',
    email
  };
}

/**
 * Verify OTP and complete registration (Stage 2)
 */
export async function verifyOtp(email: string, otp: string): Promise<AuthResponse> {
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await (prisma as any).user.findFirst({
    where: {
      email,
      emailVerificationToken: hashedOtp,
      emailVerificationExpiry: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new BadRequestError('Invalid or expired verification code');
  }

  const updatedUser = await (prisma as any).user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    },
  });

  return generateAuthResponse(updatedUser.id, updatedUser);
}

/**
 * Resend OTP code
 */
export async function resendOtp(email: string): Promise<{ message: string }> {
  const user = await (prisma as any).user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (user.emailVerified) {
    throw new BadRequestError('Email is already verified');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await (prisma as any).user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: hashedOtp,
      emailVerificationExpiry: otpExpiry,
    },
  });

  await sendVerificationEmail(email, otp, user.fullName);

  return { message: 'New verification code sent' };
}


/**
 * Login user
 */
export async function login(input: LoginInput): Promise<AuthResponse> {
  const { email, password } = input;

  const user = await (prisma as any).user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (!user.emailVerified) {
    throw new UnauthorizedError('Please verify your email before logging in');
  }

  return generateAuthResponse(user.id, user);
}

/**
 * Refresh authentication token
 */
export async function refreshAuthToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const storedToken = await (prisma as any).refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // Revoke old token
  await (prisma as any).refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  // Generate new tokens
  const newAccessToken = generateAccessToken(storedToken.userId);
  const newRefreshToken = generateRefreshToken(storedToken.userId);

  // Store new refresh token
  await (prisma as any).refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: storedToken.userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

/**
 * Logout (revoke refresh token)
 */
export async function logout(refreshToken: string): Promise<void> {
  await (prisma as any).refreshToken.updateMany({
    where: { token: refreshToken },
    data: { revoked: true },
  });
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<UserPublic> {
  const user = await (prisma as any).user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return formatUserPublic(user as any); // Cast as any to bypass temporary lint while prisma regenerates
}

/**
 * Get user's timezone
 */
export async function getUserTimezone(userId: string): Promise<string> {
  const user = await (prisma as any).user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  });

  return user?.timezone || 'UTC';
}

/**
 * Update user preferences
 */
export async function updatePreferences(userId: string, input: any): Promise<UserPublic> {
  const user = await (prisma as any).user.update({
    where: { id: userId },
    data: input,
  });

  return formatUserPublic(user);
}
