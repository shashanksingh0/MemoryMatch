import type { Difficulty, GameResult, Stats } from '../types/game';

export function todayISO(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function daysBetween(fromDateKey: string, toDateKey: string): number {
  const from = new Date(`${fromDateKey}T00:00:00`).getTime();
  const to = new Date(`${toDateKey}T00:00:00`).getTime();
  return Math.round((to - from) / 86_400_000);
}

export interface StatsUpdate {
  stats: Stats;
  isNewHighScore: boolean;
}

export function updateStats(prev: Stats, result: GameResult, today: string): StatsUpdate {
  const stats: Stats = {
    ...prev,
    best: { ...prev.best },
  };
  const difficulty: Difficulty = result.difficulty;
  stats.best[difficulty] = { ...prev.best[difficulty] };

  stats.gamesPlayed += 1;
  stats.totalAttempts += result.matchedPairs + result.mistakes;
  stats.correctPairs += result.matchedPairs;
  stats.lastPlayedDate = today;
  stats.totalCoins += result.coins;

  const isNewHighScore = result.won && result.score > prev.highestScore;

  if (result.won) {
    stats.gamesWon += 1;
    if (result.score > stats.highestScore) {
      stats.highestScore = result.score;
    }
    const difficultyBest = stats.best[difficulty];
    if (difficultyBest.bestTimeMs == null || result.timeMs < difficultyBest.bestTimeMs) {
      difficultyBest.bestTimeMs = result.timeMs;
    }
    if (result.score > difficultyBest.highestScore) {
      difficultyBest.highestScore = result.score;
    }
    if (prev.lastWonDate == null) {
      stats.currentStreak = 1;
    } else {
      const gap = daysBetween(prev.lastWonDate, today);
      if (gap === 1) {
        stats.currentStreak = prev.currentStreak + 1;
      } else if (gap > 1) {
        stats.currentStreak = 1;
      }
    }
    stats.lastWonDate = today;
    stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
  }

  return { stats, isNewHighScore };
}

export function bestTimeOverall(stats: Stats): number | null {
  const times = Object.values(stats.best).map((entry) => entry.bestTimeMs).filter((value): value is number => value != null);
  return times.length > 0 ? Math.min(...times) : null;
}
