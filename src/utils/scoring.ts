import type { Difficulty, GameMode } from '../types/game';
import { DAILY_BONUS_COINS, DIFFICULTIES, SCORING, STAR_COINS, STAR_GOOD_TIME_RATIO, STAR_OK_TIME_RATIO } from '../config/gameConfig';

export function pointsForMatch(streak: number): number {
  return SCORING.MATCH_POINTS + (streak > 1 ? SCORING.COMBO_BONUS : 0);
}

export function clampScore(score: number): number {
  return Math.max(0, score);
}

export interface StarInput {
  mistakes: number;
  timeMs: number;
  timeLimitMs: number | null;
}

export function calculateStars(input: StarInput): 1 | 2 | 3 {
  let stars: 1 | 2 | 3 = input.mistakes === 0 ? 3 : input.mistakes === 1 ? 2 : 1;
  if (input.timeLimitMs != null) {
    const ratio = input.timeMs / input.timeLimitMs;
    if (ratio > STAR_OK_TIME_RATIO) {
      stars = Math.min(stars, 1) as 1 | 2 | 3;
    } else if (ratio > STAR_GOOD_TIME_RATIO) {
      stars = Math.min(stars, 2) as 1 | 2 | 3;
    }
  }
  return stars;
}

export function coinsForResult(difficulty: Difficulty, stars: 1 | 2 | 3): number {
  return DIFFICULTIES[difficulty].baseCoins + STAR_COINS[stars];
}

export function dailyBonusCoins(): number {
  return DAILY_BONUS_COINS;
}

export function accuracyPercentage(correctPairs: number, totalAttempts: number): number {
  if (totalAttempts === 0) {
    return 100;
  }
  return Math.round((correctPairs / totalAttempts) * 100);
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatModeLabel(mode: GameMode): string {
  return mode === 'daily' ? 'Daily Challenge' : 'Classic';
}
