import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWpm(wpm: number): string {
  return Math.round(wpm).toString();
}

export function formatAccuracy(accuracy: number): string {
  return `${Math.round(accuracy * 100) / 100}%`;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// ===== XP & Level Helpers =====

export function xpForLevel(level: number): number {
  return 50 * level;
}

export function calculateLevel(xp: number): number {
  let level = 1;
  let totalXp = 0;
  while (totalXp + xpForLevel(level + 1) <= xp) {
    totalXp += xpForLevel(level + 1);
    level++;
  }
  return level;
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
