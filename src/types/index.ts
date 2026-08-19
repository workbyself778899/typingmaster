// ===== Language & Keyboard Types =====

export type Language = 'english' | 'nepali-unicode' | 'nepali-preeti' | 'nepali-kantipur';

export type KeyboardLayout = 'qwerty' | 'nepali-unicode' | 'preeti' | 'kantipur';

export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

export type TestDuration = 15 | 30 | 60 | 120 | 'custom';

export type TextType = 'random-words' | 'sentences' | 'paragraph' | 'technical' | 'general' | 'quotes' | 'custom';

export type PracticeMode = 'free' | 'speed' | 'accuracy' | 'weakness' | 'lesson' | 'daily' | 'sprint' | 'endurance';

export type LessonCategory = 'home-row' | 'top-row' | 'bottom-row' | 'capitals' | 'numbers' | 'punctuation' | 'common-words' | 'sentences' | 'speed-drill' | 'accuracy-drill' | 'finger-training' | 'combinations';

export type Finger = 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index' | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky' | 'thumb';

export type Theme = 'light' | 'dark' | 'system';

// ===== Typing Engine Types =====

export interface KeystrokeData {
  character: string;
  expected: string;
  timestamp: number;
  isCorrect: boolean;
  latency: number; // ms since previous keystroke
}

export interface TypingState {
  text: string;
  graphemes: string[];
  currentIndex: number;
  typed: string[];
  keystrokes: KeystrokeData[];
  startTime: number | null;
  endTime: number | null;
  isStarted: boolean;
  isComplete: boolean;
  isPaused: boolean;
  errors: number;
  correctChars: number;
  incorrectChars: number;
  backspaces: number;
  totalKeystrokes: number;
}

export interface TypingResult {
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  totalCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
  errorRate: number;
  wordsTyped: number;
  duration: number; // seconds
  mistypedKeys: MistypedKey[];
  slowestKeys: SlowestKey[];
  slowestWords: SlowestWord[];
  keystrokes: KeystrokeData[];
}

export interface MistypedKey {
  expected: string;
  typed: string;
  count: number;
}

export interface SlowestKey {
  key: string;
  averageLatency: number;
  count: number;
}

export interface SlowestWord {
  word: string;
  duration: number;
  errors: number;
}

export interface CharacterScore {
  character: string;
  accuracy: number;
  averageLatency: number;
  errorCount: number;
  attempts: number;
  confidenceScore: number;
  isWeak: boolean;
}

export interface CombinationScore {
  combination: string;
  accuracy: number;
  averageLatency: number;
  errorCount: number;
  attempts: number;
  isWeak: boolean;
}

// ===== Keyboard Layout Types =====

export interface KeyMapping {
  key: string;
  shiftKey?: string;
  finger: Finger;
  row: number;
  col: number;
  width?: number; // relative width multiplier, default 1
  label?: string;
  shiftLabel?: string;
}

export interface KeyboardLayoutConfig {
  id: KeyboardLayout;
  name: string;
  language: Language;
  keys: KeyMapping[][];
}

// ===== User Types =====

export interface UserPreferences {
  preferredLanguage: Language;
  preferredKeyboard: KeyboardLayout;
  dailyGoal: number; // minutes
  soundEnabled: boolean;
  keyboardVisible: boolean;
  theme: Theme;
  showFingerGuide: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
  xp: number;
  level: number;
  streak: number;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ===== Session Types =====

export interface TypingSessionData {
  id?: string;
  userId: string;
  language: Language;
  keyboardLayout: KeyboardLayout;
  mode: PracticeMode;
  duration: number;
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  correctCharacters: number;
  incorrectCharacters: number;
  errors: number;
  backspaces: number;
  textContent: string;
  keystrokeData: KeystrokeData[];
  startedAt: string;
  completedAt: string;
}

// ===== Lesson Types =====

export interface LessonData {
  id: string;
  title: string;
  description: string;
  language: Language;
  keyboardLayout: KeyboardLayout;
  difficulty: Difficulty;
  category: LessonCategory;
  content: string[];
  targetKeys: string[];
  targetCombinations: string[];
  minimumAccuracy: number;
  minimumWpm: number;
  order: number;
  estimatedMinutes: number;
}

export interface UserProgressData {
  id: string;
  userId: string;
  lessonId: string;
  attempts: number;
  bestWpm: number;
  bestAccuracy: number;
  completion: number; // 0-100
  lastAttempt: string;
  isCompleted: boolean;
}

// ===== Achievement Types =====

export interface AchievementData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'speed' | 'accuracy' | 'streak' | 'practice' | 'milestone' | 'language';
  requirement: {
    type: string;
    value: number;
    language?: Language;
  };
}

export interface UserAchievementData {
  id: string;
  userId: string;
  achievementId: string;
  achievement: AchievementData;
  unlockedAt: string;
}

// ===== Dashboard Types =====

export interface DashboardStats {
  currentWpm: number;
  bestWpm: number;
  averageWpm: number;
  accuracy: number;
  totalTypingTime: number; // seconds
  totalTests: number;
  currentStreak: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export interface WeakKeyData {
  key: string;
  accuracy: number;
  averageLatency: number;
  suggestion: string;
}

export interface Recommendation {
  title: string;
  reason: string;
  targetKeys?: string[];
  targetCombinations?: string[];
  lessonId?: string;
  practiceType: PracticeMode;
  estimatedMinutes: number;
}

// ===== Chart Types =====

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface WpmChartData {
  date: string;
  grossWpm: number;
  netWpm: number;
}

export interface AccuracyChartData {
  date: string;
  accuracy: number;
}

// ===== API Types =====

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== Admin Types =====

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  averageWpm: number;
  averageAccuracy: number;
  mostUsedLanguage: Language;
  mostUsedKeyboard: KeyboardLayout;
  mostDifficultLessons: { lessonId: string; title: string; averageAccuracy: number }[];
  commonMistakes: { key: string; count: number }[];
}
