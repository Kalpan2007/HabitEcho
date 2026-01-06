import { prisma } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/crypto.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors.js';
import type {
  SignupInput,
  LoginInput,
  UserPublic,
  AuthResponse
} from '../types/index.js';

/**
 * Format user for public response
 */
function formatUserPublic(user: {
  id: string;
  fullName: string;
  email: string;
  occupation: string;
  dateOfBirth: Date | null;
  age: number | null;
  timezone: string;
  createdAt: Date;
}): UserPublic {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    occupation: user.occupation as UserPublic['occupation'],
    dateOfBirth: user.dateOfBirth,
    age: user.age,
    timezone: user.timezone,
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
 * Register a new user
 */
export async function signup(input: SignupInput): Promise<AuthResponse> {
  const { fullName, email, password, occupation, dateOfBirth, age, timezone } = input;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      occupation,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      age,
      timezone: timezone || 'UTC',
    },
  });

  return generateAuthResponse(user.id, user);
}

/**
 * Login user
 */
export async function login(input: LoginInput): Promise<AuthResponse> {
  const { email, password } = input;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

  return generateAuthResponse(user.id, user);
}

/**
 * Refresh authentication token
 */
export async function refreshAuthToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // Revoke old token
  await prisma.refreshToken.update({
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
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: { revoked: true },
  });
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<UserPublic> {
  const user = await prisma.user.findUnique({
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
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  });

  return user?.timezone || 'UTC';
}
