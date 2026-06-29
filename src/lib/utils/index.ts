import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Locale, PredictionStatus } from '@/types';

// Merge Tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================
// DATE & TIME UTILITIES
// ============================================================

const MAKKAH_TZ = 'Asia/Riyadh';
const LOCK_BEFORE_KICKOFF_MS = 5 * 60 * 1000; // 5 minutes

export function isMatchLocked(kickoffAt: string): boolean {
  const kickoff = new Date(kickoffAt).getTime();
  const now = Date.now();
  return now >= kickoff - LOCK_BEFORE_KICKOFF_MS;
}

export function timeUntilLock(kickoffAt: string): number {
  const kickoff = new Date(kickoffAt).getTime();
  const lockAt = kickoff - LOCK_BEFORE_KICKOFF_MS;
  return Math.max(0, lockAt - Date.now());
}

export function formatCountdown(ms: number): { h: string; m: string; s: string } {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    h: String(h).padStart(2, '0'),
    m: String(m).padStart(2, '0'),
    s: String(s).padStart(2, '0'),
  };
}

export function formatMatchDate(isoString: string, locale: Locale): string {
  return new Date(isoString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    timeZone: MAKKAH_TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatMatchTime(isoString: string, locale: Locale): string {
  return new Date(isoString).toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    timeZone: MAKKAH_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// ============================================================
// SCORING UTILITIES
// ============================================================

export function calculatePoints(
  predA: number,
  predB: number,
  actualA: number,
  actualB: number
): number {
  if (predA === actualA && predB === actualB) return 2;
  const predWinner = predA > predB ? 'A' : predA < predB ? 'B' : 'D';
  const actualWinner = actualA > actualB ? 'A' : actualA < actualB ? 'B' : 'D';
  if (predWinner === actualWinner) return 1;
  return 0;
}

export function getPredictionStatus(
  predA: number,
  predB: number,
  actualA: number | null,
  actualB: number | null,
  isLocked: boolean
): PredictionStatus {
  if (actualA === null || actualB === null) {
    return isLocked ? 'locked' : 'saved';
  }
  const points = calculatePoints(predA, predB, actualA, actualB);
  if (points === 2) return 'correct_exact';
  if (points === 1) return 'correct_winner';
  return 'wrong';
}

// ============================================================
// FLAG UTILITIES
// ============================================================

export function getFlagUrl(teamCode: string, size: 'w20' | 'w40' | 'w80' | 'w160' = 'w80'): string {
  return `https://flagcdn.com/${size}/${teamCode.toLowerCase()}.png`;
}

// ============================================================
// PERCENTAGE / STATS
// ============================================================

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function getRankOrdinal(rank: number, locale: Locale): string {
  if (locale === 'ar') return `${rank}`;
  const s = ['th', 'st', 'nd', 'rd'];
  const v = rank % 100;
  return `${rank}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

// ============================================================
// COLOR CLASSES BY PREDICTION STATUS
// ============================================================

export function getPredictionColor(status: PredictionStatus): string {
  switch (status) {
    case 'correct_exact':
      return 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700';
    case 'correct_winner':
      return 'bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700';
    case 'wrong':
      return 'bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-700';
    case 'saved':
      return 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800';
    case 'locked':
      return 'bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-700';
    default:
      return 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700';
  }
}

export function getPredictionPointsBadgeColor(points: number): string {
  if (points === 2) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
  if (points === 1) return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
}

// ============================================================
// ROUND LABELS
// ============================================================

export const ROUND_ORDER = [
  'Group Stage',
  'Round of 32',
  'Round of 16',
  'Quarter Final',
  'Semi Final',
  'Third Place',
  'Final',
] as const;

export function getRoundLabel(round: string, locale: Locale): string {
  const map: Record<string, { ar: string; en: string }> = {
    'Group Stage': { ar: 'دور المجموعات', en: 'Group Stage' },
    'Round of 32': { ar: 'دور الـ 32', en: 'Round of 32' },
    'Round of 16': { ar: 'دور الـ 16', en: 'Round of 16' },
    'Quarter Final': { ar: 'ربع النهائي', en: 'Quarter Final' },
    'Semi Final': { ar: 'نصف النهائي', en: 'Semi Final' },
    'Third Place': { ar: 'المركز الثالث', en: 'Third Place' },
    Final: { ar: 'النهائي', en: 'Final' },
  };
  return map[round]?.[locale] ?? round;
}
