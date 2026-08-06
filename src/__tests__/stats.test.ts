import { describe, expect, it } from 'vitest';
import { bestTimeOverall, daysBetween, todayISO, updateStats } from '../utils/stats';
import { DEFAULT_STATS } from '../utils/storage';
import type { GameResult, Stats } from '../types/game';

const TODAY = '2026-08-06';
const YESTERDAY = '2026-08-05';

function makeResult(overrides: Partial<GameResult> = {}): GameResult {
  return {
    mode: 'classic',
    difficulty: 'easy',
    theme: 'animals',
    won: true,
    score: 120,
    coins: 70,
    stars: 3,
    mistakes: 0,
    totalPairs: 4,
    matchedPairs: 4,
    timeMs: 15_000,
    timeLimitMs: null,
    bestCombo: 2,
    hintCount: 0,
    isNewHighScore: false,
    unlockedAchievements: [],
    ...overrides,
  };
}

describe('updateStats', () => {
  it('records a first win', () => {
    const { stats, isNewHighScore } = updateStats(DEFAULT_STATS, makeResult(), TODAY);
    expect(stats.gamesPlayed).toBe(1);
    expect(stats.gamesWon).toBe(1);
    expect(stats.totalCoins).toBe(70);
    expect(stats.correctPairs).toBe(4);
    expect(stats.totalAttempts).toBe(4);
    expect(stats.highestScore).toBe(120);
    expect(stats.best.easy.bestTimeMs).toBe(15_000);
    expect(stats.best.easy.highestScore).toBe(120);
    expect(stats.currentStreak).toBe(1);
    expect(stats.longestStreak).toBe(1);
    expect(stats.lastPlayedDate).toBe(TODAY);
    expect(stats.lastWonDate).toBe(TODAY);
    expect(isNewHighScore).toBe(true);
  });

  it('keeps the best time when a win is slower', () => {
    const first = updateStats(DEFAULT_STATS, makeResult(), TODAY).stats;
    const second = updateStats(first, makeResult({ timeMs: 25_000 }), TODAY).stats;
    expect(second.best.easy.bestTimeMs).toBe(15_000);
  });

  it('updates the best time when a win is faster', () => {
    const first = updateStats(DEFAULT_STATS, makeResult({ timeMs: 25_000 }), TODAY).stats;
    const second = updateStats(first, makeResult({ timeMs: 10_000 }), TODAY).stats;
    expect(second.best.easy.bestTimeMs).toBe(10_000);
  });

  it('does not flag a new high score when score ties the previous one', () => {
    const first = updateStats(DEFAULT_STATS, makeResult(), TODAY).stats;
    const { isNewHighScore } = updateStats(first, makeResult({ score: 100 }), TODAY);
    expect(isNewHighScore).toBe(false);
  });

  it('extends the streak on consecutive days', () => {
    const seed: Stats = {
      ...DEFAULT_STATS,
      currentStreak: 3,
      longestStreak: 5,
      lastWonDate: YESTERDAY,
    };
    const { stats } = updateStats(seed, makeResult(), TODAY);
    expect(stats.currentStreak).toBe(4);
    expect(stats.longestStreak).toBe(5);
  });

  it('keeps the streak when winning again on the same day', () => {
    const seed: Stats = {
      ...DEFAULT_STATS,
      currentStreak: 3,
      longestStreak: 3,
      lastWonDate: TODAY,
    };
    const { stats } = updateStats(seed, makeResult(), TODAY);
    expect(stats.currentStreak).toBe(3);
  });

  it('resets the streak after a gap', () => {
    const seed: Stats = {
      ...DEFAULT_STATS,
      currentStreak: 4,
      longestStreak: 4,
      lastWonDate: '2026-08-02',
    };
    const { stats } = updateStats(seed, makeResult(), TODAY);
    expect(stats.currentStreak).toBe(1);
    expect(stats.longestStreak).toBe(4);
  });

  it('records losses without counting wins or coins', () => {
    const { stats } = updateStats(
      DEFAULT_STATS,
      makeResult({ won: false, score: 40, coins: 0, matchedPairs: 2, mistakes: 2, stars: 1 }),
      TODAY
    );
    expect(stats.gamesPlayed).toBe(1);
    expect(stats.gamesWon).toBe(0);
    expect(stats.totalCoins).toBe(0);
    expect(stats.highestScore).toBe(0);
    expect(stats.currentStreak).toBe(0);
    expect(stats.lastWonDate).toBeNull();
    expect(stats.lastPlayedDate).toBe(TODAY);
    expect(stats.correctPairs).toBe(2);
    expect(stats.totalAttempts).toBe(4);
  });
});

describe('date helpers', () => {
  it('formats dates as YYYY-MM-DD', () => {
    const date = new Date(2026, 7, 6, 23, 30);
    expect(todayISO(date)).toBe('2026-08-06');
  });

  it('computes day differences', () => {
    expect(daysBetween(YESTERDAY, TODAY)).toBe(1);
    expect(daysBetween(TODAY, TODAY)).toBe(0);
    expect(daysBetween('2026-08-01', TODAY)).toBe(5);
  });
});

describe('bestTimeOverall', () => {
  it('returns the minimum best time across difficulties', () => {
    const stats: Stats = {
      ...DEFAULT_STATS,
      best: {
        easy: { bestTimeMs: 20_000, highestScore: 90 },
        medium: { bestTimeMs: 15_000, highestScore: 130 },
        hard: { bestTimeMs: null, highestScore: 0 },
        expert: { bestTimeMs: 18_000, highestScore: 200 },
      },
    };
    expect(bestTimeOverall(stats)).toBe(15_000);
  });

  it('returns null when no times exist', () => {
    expect(bestTimeOverall(DEFAULT_STATS)).toBeNull();
  });
});
