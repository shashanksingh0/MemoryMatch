import type { AchievementDef, AchievementId, AchievementState, GameResult, Stats } from '../types/game';

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-win', emoji: '🏆', title: 'First Win', description: 'Win your very first game' },
  { id: 'perfect-game', emoji: '💯', title: 'Perfect Game', description: 'Win a game with zero mistakes' },
  { id: 'speed-champion', emoji: '⚡', title: 'Speed Champion', description: 'Win a timed level with 3 stars' },
  { id: 'memory-master', emoji: '🧠', title: 'Memory Master', description: 'Win 10 games' },
  { id: 'streak-7', emoji: '🔥', title: '7-Day Streak', description: 'Win a game 7 days in a row' },
  { id: 'daily-challenge', emoji: '📅', title: 'Daily Challenge', description: 'Complete today\'s daily challenge' },
];

export function checkAchievements(stats: Stats, result: GameResult, current: AchievementState): string[] {
  const freshlyUnlocked: string[] = [];
  const now = Date.now();

  const unlock = (id: AchievementId) => {
    if (!current.unlocked[id]) {
      current.unlocked[id] = true;
      current.unlockedAt[id] = now;
      freshlyUnlocked.push(id);
    }
  };

  if (result.won) {
    if (stats.gamesWon === 1) {
      unlock('first-win');
    }
    if (stats.gamesWon >= 10) {
      unlock('memory-master');
    }
    if (result.mistakes === 0) {
      unlock('perfect-game');
    }
    if (result.timeLimitMs != null && result.stars === 3) {
      unlock('speed-champion');
    }
    if (stats.currentStreak >= 7) {
      unlock('streak-7');
    }
    if (result.mode === 'daily') {
      unlock('daily-challenge');
    }
  }

  return freshlyUnlocked;
}

export function achievementById(id: AchievementId): AchievementDef | undefined {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id);
}
