import { z } from 'zod';

// ===== Auth Schemas =====

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  email: z.string().email('Please enter a valid email').trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email').trim().toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ===== Profile Schemas =====

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).trim().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  preferences: z.object({
    preferredLanguage: z.enum(['english', 'nepali-unicode', 'nepali-preeti', 'nepali-kantipur']).optional(),
    preferredKeyboard: z.enum(['qwerty', 'nepali-unicode', 'preeti', 'kantipur']).optional(),
    dailyGoal: z.number().min(5).max(120).optional(),
    soundEnabled: z.boolean().optional(),
    keyboardVisible: z.boolean().optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    showFingerGuide: z.boolean().optional(),
    fontSize: z.enum(['small', 'medium', 'large']).optional(),
  }).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ===== Session Schemas =====

export const createSessionSchema = z.object({
  language: z.enum(['english', 'nepali-unicode', 'nepali-preeti', 'nepali-kantipur']),
  keyboardLayout: z.enum(['qwerty', 'nepali-unicode', 'preeti', 'kantipur']),
  mode: z.enum(['free', 'speed', 'accuracy', 'weakness', 'lesson', 'daily', 'sprint', 'endurance']),
  difficulty: z.enum(['beginner', 'easy', 'medium', 'hard', 'expert']).optional(),
  duration: z.number().min(1),
  grossWpm: z.number().min(0),
  netWpm: z.number().min(0),
  accuracy: z.number().min(0).max(100),
  correctCharacters: z.number().min(0),
  incorrectCharacters: z.number().min(0),
  errors: z.number().min(0),
  backspaces: z.number().min(0),
  totalKeystrokes: z.number().min(0),
  textContent: z.string().min(1),
  textId: z.string().optional(),
  lessonId: z.string().optional(),
  keystrokeData: z.array(z.object({
    character: z.string(),
    expected: z.string(),
    timestamp: z.number(),
    isCorrect: z.boolean(),
    latency: z.number(),
  })),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
});

// ===== Lesson Schemas =====

export const createLessonSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().min(1).max(1000).trim(),
  language: z.enum(['english', 'nepali-unicode', 'nepali-preeti', 'nepali-kantipur']),
  keyboardLayout: z.enum(['qwerty', 'nepali-unicode', 'preeti', 'kantipur']),
  difficulty: z.enum(['beginner', 'easy', 'medium', 'hard', 'expert']),
  category: z.enum([
    'home-row', 'top-row', 'bottom-row', 'capitals', 'numbers',
    'punctuation', 'common-words', 'sentences', 'speed-drill',
    'accuracy-drill', 'finger-training', 'combinations',
  ]),
  content: z.array(z.string()).min(1),
  targetKeys: z.array(z.string()),
  targetCombinations: z.array(z.string()),
  minimumAccuracy: z.number().min(0).max(100),
  minimumWpm: z.number().min(0),
  order: z.number().min(0),
  estimatedMinutes: z.number().min(1),
});

// ===== Type Exports =====

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
