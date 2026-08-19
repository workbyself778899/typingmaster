import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { dbConnect } from '@/lib/db';
import User, { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const COOKIE_NAME = 'auth_token';

// ===== Password Hashing =====

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ===== JWT Token =====

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// ===== Cookie Management =====

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value || null;
}

// ===== User Authentication =====

export async function getCurrentUser(): Promise<IUser | null> {
  try {
    const token = await getAuthToken();
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    await dbConnect();
    const user = await User.findById(payload.userId).select('-passwordHash -resetToken -resetTokenExpiry');
    return user;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<IUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requireAdmin(): Promise<IUser> {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return user;
}

// ===== Streak Management =====

export async function updateStreak(userId: string): Promise<void> {
  await dbConnect();
  const user = await User.findById(userId);
  if (!user) return;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (user.lastActiveDate) {
    const lastActive = new Date(user.lastActiveDate);
    const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
    const diffDays = Math.floor((today.getTime() - lastActiveDay.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day
      user.streak += 1;
    } else if (diffDays > 1) {
      // Streak broken
      user.streak = 1;
    }
    // diffDays === 0: same day, don't change streak
  } else {
    user.streak = 1;
  }

  user.lastActiveDate = now;
  await user.save();
}

// ===== XP & Level =====

export function calculateLevel(xp: number): number {
  // Each level requires progressively more XP
  // Level 1: 0, Level 2: 100, Level 3: 250, Level 4: 450, ...
  // Formula: xp_needed = 50 * level * (level + 1)
  let level = 1;
  let totalXp = 0;
  while (totalXp + xpForLevel(level + 1) <= xp) {
    totalXp += xpForLevel(level + 1);
    level++;
  }
  return level;
}

export function xpForLevel(level: number): number {
  return 50 * level;
}

export function xpToNextLevel(currentXp: number, currentLevel: number): number {
  let totalXpForCurrentLevel = 0;
  for (let i = 1; i <= currentLevel; i++) {
    totalXpForCurrentLevel += xpForLevel(i);
  }
  const xpNeededForNext = xpForLevel(currentLevel + 1);
  const xpIntoCurrentLevel = currentXp - totalXpForCurrentLevel;
  return xpNeededForNext - xpIntoCurrentLevel;
}

export async function addXp(userId: string, amount: number): Promise<void> {
  await dbConnect();
  const user = await User.findById(userId);
  if (!user) return;

  user.xp += amount;
  user.level = calculateLevel(user.xp);
  await user.save();
}
