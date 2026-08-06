import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { GameConfig, ThemeKey } from '../types/game';
import { DIFFICULTIES, THEMES, THEME_ORDER } from '../config/gameConfig';
import { HOME_GRADIENT, palette } from '../theme/colors';
import { Screen } from '../components/Screen';
import { PrimaryButton } from '../components/PrimaryButton';
import { CoinCounter } from '../components/CoinCounter';
import { useSettings } from '../context/SettingsContext';
import { dailySeed, dateKey, pickDailyTheme } from '../utils/dailyChallenge';

interface HomeScreenProps {
  onPlay: (config: GameConfig) => void;
  onDaily: (config: GameConfig) => void;
  onAchievements: () => void;
  onSettings: () => void;
}

function randomTheme(): ThemeKey {
  return THEME_ORDER[Math.floor(Math.random() * THEME_ORDER.length)];
}

export function HomeScreen({ onPlay, onDaily, onAchievements, onSettings }: HomeScreenProps) {
  const { settings, stats, textScale, dailyCompletedToday } = useSettings();

  const difficulty = DIFFICULTIES[settings.defaultDifficulty];
  const themeLabel = settings.themePreference === 'random' ? 'Random theme' : THEMES[settings.themePreference].label;

  const handlePlay = useCallback(() => {
    onPlay({
      mode: 'classic',
      difficulty: settings.defaultDifficulty,
      theme: settings.themePreference === 'random' ? randomTheme() : settings.themePreference,
    });
  }, [onPlay, settings.defaultDifficulty, settings.themePreference]);

  const handleDaily = useCallback(() => {
    const seed = dailySeed(dateKey());
    onDaily({
      mode: 'daily',
      difficulty: 'expert',
      theme: pickDailyTheme(seed),
      seed,
    });
  }, [onDaily]);

  return (
    <Screen colors={HOME_GRADIENT}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text style={[styles.title, { fontSize: 44 * textScale }]}>Memory Match</Text>
          <Text style={[styles.subtitle, { fontSize: 17 * textScale }]}>Find the matching pairs!</Text>

          <View style={styles.statsRow}>
            <CoinCounter coins={stats.totalCoins} textScale={textScale} />
            <View style={styles.streakPill} accessibilityLabel={`${stats.currentStreak} day win streak`}>
              <Text style={{ fontSize: 18 * textScale }}>🔥</Text>
              <Text style={[styles.streakValue, { fontSize: 20 * textScale }]}>{stats.currentStreak}</Text>
            </View>
          </View>

          <View style={styles.menu}>
            <PrimaryButton
              title="Play"
              emoji="🎮"
              color={palette.white}
              textColor={palette.primary}
              textScale={textScale}
              subtitle={`${difficulty.label} • ${themeLabel}`}
              onPress={handlePlay}
            />
            <PrimaryButton
              title="Daily Challenge"
              emoji="📅"
              color="#FFC53D"
              textScale={textScale}
              subtitle={dailyCompletedToday ? 'Completed today!' : 'Expert • Bonus coins + badge'}
              disabled={dailyCompletedToday}
              onPress={handleDaily}
            />
            <View style={styles.smallRow}>
              <View style={styles.smallWrap}>
                <PrimaryButton
                  title="Achievements"
                  emoji="🏆"
                  color="rgba(255,255,255,0.92)"
                  textColor={palette.ink}
                  textScale={textScale}
                  onPress={onAchievements}
                />
              </View>
              <View style={styles.smallWrap}>
                <PrimaryButton
                  title="Settings"
                  emoji="⚙️"
                  color="rgba(255,255,255,0.92)"
                  textColor={palette.ink}
                  textScale={textScale}
                  onPress={onSettings}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  content: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 18,
  },
  title: {
    color: palette.white,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '700',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.gold,
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6,
  },
  streakValue: {
    color: palette.ink,
    fontWeight: '800',
  },
  menu: {
    width: '100%',
    gap: 16,
    marginTop: 12,
  },
  smallRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallWrap: {
    flex: 1,
  },
});
