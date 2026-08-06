import type { Difficulty, ThemeKey } from '../types/game';

export interface DifficultyConfig {
  label: string;
  emoji: string;
  pairs: number;
  cards: number;
  timeLimitMs: number | null;
  baseCoins: number;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { label: 'Easy', emoji: '🟢', pairs: 4, cards: 8, timeLimitMs: null, baseCoins: 20 },
  medium: { label: 'Medium', emoji: '🟡', pairs: 6, cards: 12, timeLimitMs: 90_000, baseCoins: 40 },
  hard: { label: 'Hard', emoji: '🟠', pairs: 8, cards: 16, timeLimitMs: 60_000, baseCoins: 70 },
  expert: { label: 'Expert', emoji: '🔴', pairs: 12, cards: 24, timeLimitMs: 45_000, baseCoins: 100 },
};

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

export interface ThemeConfig {
  label: string;
  emojis: string[];
  gradient: [string, string, string];
  cardBack: string;
  accent: string;
}

export const THEMES: Record<ThemeKey, ThemeConfig> = {
  animals: {
    label: 'Animals',
    emojis: ['🐶', '🐱', '🐵', '🦁', '🐼', '🐰', '🦊', '🐸', '🐮', '🐷', '🐴', '🐥'],
    gradient: ['#FFE3EC', '#C9F0FF', '#B8F5E3'],
    cardBack: '#FF8FB1',
    accent: '#FF5C8A',
  },
  fruits: {
    label: 'Fruits',
    emojis: ['🍎', '🍌', '🍇', '🍓', '🍉', '🍍', '🍒', '🥝', '🍑', '🍊', '🥭', '🍋'],
    gradient: ['#FFF1D6', '#FFD6E0', '#FFC9B8'],
    cardBack: '#FFB84D',
    accent: '#FF8C42',
  },
  space: {
    label: 'Space',
    emojis: ['🚀', '🌍', '⭐', '☀️', '🌙', '🪐', '👽', '☄️', '🛸', '🌌', '🌟', '💫'],
    gradient: ['#E6DFFF', '#C9D6FF', '#B3ECFF'],
    cardBack: '#7B6CF6',
    accent: '#5B4BEC',
  },
  ocean: {
    label: 'Ocean',
    emojis: ['🐳', '🐠', '🐙', '🦀', '🐬', '🦈', '🐢', '🪼', '🦞', '🦑', '🐚', '🪸'],
    gradient: ['#D6F5FF', '#BDEBFF', '#C9F5D9'],
    cardBack: '#34C6E0',
    accent: '#12A5C9',
  },
};

export const THEME_ORDER: ThemeKey[] = ['animals', 'fruits', 'space', 'ocean'];

export const SCORING = {
  MATCH_POINTS: 20,
  WRONG_PENALTY: 2,
  COMBO_BONUS: 10,
  LEVEL_COMPLETE_BONUS: 100,
  HINTS_PER_GAME: 3,
  SHUFFLES_PER_GAME: 1,
  PREVIEW_MS: 3000,
  MISMATCH_WAIT_MS: 700,
  HINT_REVEAL_MS: 2000,
} as const;

export const STAR_COINS: Record<1 | 2 | 3, number> = { 1: 10, 2: 25, 3: 50 };

export const DAILY_BONUS_COINS = 50;

export const STAR_GOOD_TIME_RATIO = 0.7;
export const STAR_OK_TIME_RATIO = 0.9;
