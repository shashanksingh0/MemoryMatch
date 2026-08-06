import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { AchievementState, AppSettings, GameResult, Stats } from '../types/game';
import {
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_DAILY,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  loadAchievements,
  loadDaily,
  loadSettings,
  loadStats,
  resetAllProgress,
  saveAchievements,
  saveDaily,
  saveSettings,
  saveStats,
} from '../utils/storage';
import { todayISO } from '../utils/stats';
import { updateStats } from '../utils/stats';
import { checkAchievements } from '../utils/achievements';
import { DAILY_BONUS_COINS } from '../config/gameConfig';

export type TextScaleValue = 0.85 | 1 | 1.18;

interface SettingsContextValue {
  ready: boolean;
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  stats: Stats;
  achievements: AchievementState;
  dailyCompletedToday: boolean;
  recordResult: (result: GameResult) => GameResult;
  resetProgress: () => Promise<void>;
  textScale: TextScaleValue;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext);
  if (value == null) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return value;
}

const TEXT_SCALE: Record<AppSettings['textSize'], TextScaleValue> = {
  small: 0.85,
  medium: 1,
  large: 1.18,
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [achievements, setAchievements] = useState<AchievementState>(DEFAULT_ACHIEVEMENTS);
  const [daily, setDaily] = useState(DEFAULT_DAILY);

  const statsRef = useRef(stats);
  const achievementsRef = useRef(achievements);
  const dailyRef = useRef(daily);
  const settingsRef = useRef(settings);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [loadedSettings, loadedStats, loadedAchievements, loadedDaily] = await Promise.all([
        loadSettings(),
        loadStats(),
        loadAchievements(),
        loadDaily(),
      ]);
      if (cancelled) {
        return;
      }
      settingsRef.current = loadedSettings;
      statsRef.current = loadedStats;
      achievementsRef.current = loadedAchievements;
      dailyRef.current = loadedDaily;
      setSettings(loadedSettings);
      setStats(loadedStats);
      setAchievements(loadedAchievements);
      setDaily(loadedDaily);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    const next = { ...settingsRef.current, ...partial };
    settingsRef.current = next;
    setSettings(next);
    saveSettings(next);
  }, []);

  const recordResult = useCallback((result: GameResult): GameResult => {
    const today = todayISO();
    let coins = result.coins;
    let nextDaily = dailyRef.current;

    if (result.mode === 'daily' && result.won && nextDaily.lastCompletedDate !== today) {
      coins += DAILY_BONUS_COINS;
      nextDaily = { lastCompletedDate: today };
    }

    const rawWithCoins = { ...result, coins };
    const { stats: nextStats, isNewHighScore } = updateStats(statsRef.current, rawWithCoins, today);
    const nextAchievements = { ...achievementsRef.current };
    const unlockedAchievements = checkAchievements(nextStats, result, nextAchievements);

    statsRef.current = nextStats;
    achievementsRef.current = nextAchievements;
    dailyRef.current = nextDaily;

    setStats(nextStats);
    setAchievements(nextAchievements);
    setDaily(nextDaily);

    saveStats(nextStats);
    saveAchievements(nextAchievements);
    saveDaily(nextDaily);

    return {
      ...rawWithCoins,
      isNewHighScore,
      unlockedAchievements,
    };
  }, []);

  const resetProgress = useCallback(async () => {
    statsRef.current = DEFAULT_STATS;
    achievementsRef.current = DEFAULT_ACHIEVEMENTS;
    dailyRef.current = DEFAULT_DAILY;
    setStats(DEFAULT_STATS);
    setAchievements(DEFAULT_ACHIEVEMENTS);
    setDaily(DEFAULT_DAILY);
    await resetAllProgress();
  }, []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      ready,
      settings,
      updateSettings,
      stats,
      achievements,
      dailyCompletedToday: daily.lastCompletedDate === todayISO(),
      recordResult,
      resetProgress,
      textScale: TEXT_SCALE[settings.textSize],
    }),
    [ready, settings, updateSettings, stats, achievements, daily, recordResult, resetProgress]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
