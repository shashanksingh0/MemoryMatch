export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type ThemeKey = 'animals' | 'fruits' | 'space' | 'ocean';
export type GameMode = 'classic' | 'daily';
export type ScreenName = 'home' | 'game' | 'result' | 'achievements' | 'settings';
export type TextSize = 'small' | 'medium' | 'large';

export interface CardModel {
  id: number;
  pairId: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
  isShaking: boolean;
}

export interface GameConfig {
  mode: GameMode;
  difficulty: Difficulty;
  theme: ThemeKey;
  seed?: number;
}

export interface GameResult {
  mode: GameMode;
  difficulty: Difficulty;
  theme: ThemeKey;
  won: boolean;
  score: number;
  coins: number;
  stars: number;
  mistakes: number;
  totalPairs: number;
  matchedPairs: number;
  timeMs: number;
  timeLimitMs: number | null;
  bestCombo: number;
  hintCount: number;
  isNewHighScore: boolean;
  unlockedAchievements: string[];
}

export interface DifficultyStats {
  bestTimeMs: number | null;
  highestScore: number;
}

export interface Stats {
  gamesPlayed: number;
  gamesWon: number;
  totalCoins: number;
  highestScore: number;
  correctPairs: number;
  totalAttempts: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  lastWonDate: string | null;
  best: Record<Difficulty, DifficultyStats>;
}

export type AchievementId =
  | 'first-win'
  | 'memory-master'
  | 'speed-champion'
  | 'perfect-game'
  | 'streak-7'
  | 'daily-challenge';

export interface AchievementDef {
  id: AchievementId;
  emoji: string;
  title: string;
  description: string;
}

export interface AchievementState {
  unlocked: Record<AchievementId, boolean>;
  unlockedAt: Record<AchievementId, number | null>;
}

export interface AppSettings {
  soundOn: boolean;
  musicOn: boolean;
  defaultDifficulty: Difficulty;
  themePreference: ThemeKey | 'random';
  textSize: TextSize;
}

export interface DailyState {
  lastCompletedDate: string | null;
}
