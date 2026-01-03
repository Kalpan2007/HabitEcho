import { prisma } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/crypto.js';
import { generateToken } from '../utils/jwt.js';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors.js';
import type { SignupInput, LoginInput, UserPublic } from '../types/index.js';

/**
 * Format user for public response (exclude sensitive data)
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
 * Register a new user
 */
export async function signup(input: SignupInput): Promise<{ user: UserPublic; token: string }> {
  const { fullName, email, password, occupation, dateOfBirth, age, timezone } = input;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
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

  // Generate JWT immediately
  const token = generateToken(user.id);

  return {
    user: formatUserPublic(user),
    token,
  };
}

/**
 * Login user
 */
export async function login(
  input: LoginInput
): Promise<{ user: UserPublic; token: string }> {
  const { email, password } = input;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

  // Generate JWT
  const token = generateToken(user.id);

  return {
    user: formatUserPublic(user),
    token,
  };
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

  return formatUserPublic(user);
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
