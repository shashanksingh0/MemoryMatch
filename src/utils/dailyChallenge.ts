import type { ThemeKey } from '../types/game';
import { hashSeed } from './shuffle';
import { THEME_ORDER } from '../config/gameConfig';

export function dateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dailySeed(key: string): number {
  return hashSeed(`memory-daily-${key}`);
}

export function pickDailyTheme(seed: number): ThemeKey {
  return THEME_ORDER[seed % THEME_ORDER.length];
}
