import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AchievementState, AppSettings, DailyState, Stats } from '../types/game';

const KEYS = {
  settings: 'memorymatch.settings',
  stats: 'memorymatch.stats',
  achievements: 'memorymatch.achievements',
  daily: 'memorymatch.daily',
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  soundOn: true,
  musicOn: true,
  defaultDifficulty: 'easy',
  themePreference: 'random',
  textSize: 'medium',
};

export const DEFAULT_STATS: Stats = {
  gamesPlayed: 0,
  gamesWon: 0,
  totalCoins: 0,
  highestScore: 0,
  correctPairs: 0,
  totalAttempts: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedDate: null,
  lastWonDate: null,
  best: {
    easy: { bestTimeMs: null, highestScore: 0 },
    medium: { bestTimeMs: null, highestScore: 0 },
    hard: { bestTimeMs: null, highestScore: 0 },
    expert: { bestTimeMs: null, highestScore: 0 },
  },
};

export const DEFAULT_ACHIEVEMENTS: AchievementState = {
  unlocked: {
    'first-win': false,
    'memory-master': false,
    'speed-champion': false,
    'perfect-game': false,
    'streak-7': false,
    'daily-challenge': false,
  },
  unlockedAt: {
    'first-win': null,
    'memory-master': null,
    'speed-champion': null,
    'perfect-game': null,
    'streak-7': null,
    'daily-challenge': null,
  },
};

export const DEFAULT_DAILY: DailyState = {
  lastCompletedDate: null,
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function merge<T extends object>(base: T, stored: unknown): T {
  if (!isPlainObject(stored)) {
    return base;
  }
  const baseRecord = base as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...baseRecord };
  const storedRecord = stored as Record<string, unknown>;
  for (const key of Object.keys(storedRecord)) {
    const storedValue = storedRecord[key];
    const baseValue = baseRecord[key];
    if (isPlainObject(baseValue) && isPlainObject(storedValue)) {
      merged[key] = merge(baseValue, storedValue);
    } else if (storedValue !== undefined) {
      merged[key] = storedValue;
    }
  }
  return merged as T;
}

async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage write failed; keep going without persistence
  }
}

export async function loadSettings(): Promise<AppSettings> {
  const stored = await readJson<Partial<AppSettings>>(KEYS.settings);
  return merge(DEFAULT_SETTINGS, stored);
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await writeJson(KEYS.settings, settings);
}

export async function loadStats(): Promise<Stats> {
  const stored = await readJson<Partial<Stats>>(KEYS.stats);
  return merge(DEFAULT_STATS, stored);
}

export async function saveStats(stats: Stats): Promise<void> {
  await writeJson(KEYS.stats, stats);
}

export async function loadAchievements(): Promise<AchievementState> {
  const stored = await readJson<Partial<AchievementState>>(KEYS.achievements);
  return merge(DEFAULT_ACHIEVEMENTS, stored);
}

export async function saveAchievements(achievements: AchievementState): Promise<void> {
  await writeJson(KEYS.achievements, achievements);
}

export async function loadDaily(): Promise<DailyState> {
  const stored = await readJson<Partial<DailyState>>(KEYS.daily);
  return merge(DEFAULT_DAILY, stored);
}

export async function saveDaily(daily: DailyState): Promise<void> {
  await writeJson(KEYS.daily, daily);
}

export async function resetAllProgress(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([KEYS.stats, KEYS.achievements, KEYS.daily]);
  } catch {
    // ignore
  }
}
