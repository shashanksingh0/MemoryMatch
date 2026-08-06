import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import type { GameResult } from '../types/game';
import { THEMES } from '../config/gameConfig';
import { palette, radius } from '../theme/colors';
import { Screen } from '../components/Screen';
import { PrimaryButton } from '../components/PrimaryButton';
import { Confetti } from '../components/Confetti';
import { useSettings } from '../context/SettingsContext';
import { formatTime } from '../utils/scoring';
import { accuracyPercentage } from '../utils/scoring';
import { achievementById } from '../utils/achievements';
import type { AchievementId } from '../types/game';

interface ResultScreenProps {
  result: GameResult;
  onPlayAgain: () => void;
  onHome: () => void;
  onAchievements: () => void;
}

function Star({ earned, delay, size, textScale }: { earned: boolean; delay: number; size: number; textScale: number }) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 8, stiffness: 120 }));
  }, [delay, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(scale.value, [0, 0.4], [0, 1]),
  }));

  return (
    <Animated.Text style={[{ fontSize: size * textScale }, animatedStyle]}>
      {earned ? '⭐' : '☆'}
    </Animated.Text>
  );
}

function CoinReward({ coins, textScale }: { coins: number; textScale: number }) {
  const [display, setDisplay] = useState(0);
  const scale = useSharedValue(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 9, stiffness: 120 });
    startRef.current = Date.now();
    const duration = 900;
    const interval = setInterval(() => {
      const elapsed = Date.now() - (startRef.current ?? Date.now());
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(coins * eased));
      if (t >= 1) {
        clearInterval(interval);
      }
    }, 32);
    return () => clearInterval(interval);
  }, [coins, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.coinReward, animatedStyle]} accessibilityLabel={`Earned ${coins} coins`}>
      <Text style={{ fontSize: 30 * textScale }}>🪙</Text>
      <Text style={[styles.coinRewardValue, { fontSize: 24 * textScale }]}>+{display}</Text>
    </Animated.View>
  );
}

export function ResultScreen({ result, onPlayAgain, onHome, onAchievements }: ResultScreenProps) {
  const { textScale, stats } = useSettings();
  const theme = THEMES[result.theme];
  const accuracy = accuracyPercentage(result.matchedPairs, result.matchedPairs + result.mistakes);
  const timeLabel = result.timeLimitMs != null || result.timeMs > 0 ? formatTime(result.timeMs) : '—';

  return (
    <Screen colors={theme.gradient}>
      {result.won ? <Confetti active={result.won} /> : null}
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text style={[styles.heading, { fontSize: 34 * textScale }]}>{result.won ? '🎉 You Win!' : '⏰ Time’s Up!'}</Text>

          <View style={styles.starsRow} accessibilityLabel={`${result.stars} out of 3 stars`}>
            {[1, 2, 3].map((starIndex) => (
              <Star key={starIndex} earned={starIndex <= result.stars} delay={200 + starIndex * 250} size={44} textScale={textScale} />
            ))}
          </View>

          {result.isNewHighScore ? (
            <View style={styles.highScoreBadge}>
              <Text style={[styles.highScoreText, { fontSize: 15 * textScale }]}>🏅 New High Score!</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={[styles.label, { fontSize: 13 * textScale }]}>Score</Text>
            <Text style={[styles.bigValue, { fontSize: 44 * textScale }]}>{result.score}</Text>
          </View>

          {result.coins > 0 ? <CoinReward coins={result.coins} textScale={textScale} /> : null}

          <View style={styles.card}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { fontSize: 12 * textScale }]}>Time</Text>
                <Text style={[styles.statValue, { fontSize: 16 * textScale }]}>{timeLabel}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { fontSize: 12 * textScale }]}>Mistakes</Text>
                <Text style={[styles.statValue, { fontSize: 16 * textScale }]}>{result.mistakes}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { fontSize: 12 * textScale }]}>Accuracy</Text>
                <Text style={[styles.statValue, { fontSize: 16 * textScale }]}>{accuracy}%</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { fontSize: 12 * textScale }]}>Best Combo</Text>
                <Text style={[styles.statValue, { fontSize: 16 * textScale }]}>{result.bestCombo}</Text>
              </View>
            </View>
          </View>

          {result.unlockedAchievements.length > 0 ? (
            <View style={styles.card}>
              <Text style={[styles.sectionTitle, { fontSize: 15 * textScale }]}>Achievements Unlocked</Text>
              {result.unlockedAchievements.map((id) => {
                const achievement = achievementById(id as AchievementId);
                if (achievement == null) {
                  return null;
                }
                return (
                  <View key={achievement.id} style={styles.achievementRow}>
                    <Text style={{ fontSize: 22 * textScale }}>{achievement.emoji}</Text>
                    <View style={styles.achievementTextWrap}>
                      <Text style={[styles.achievementTitle, { fontSize: 15 * textScale }]}>{achievement.title}</Text>
                      <Text style={[styles.achievementDesc, { fontSize: 12 * textScale }]}>{achievement.description}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}

          <View style={styles.actions}>
            <PrimaryButton title="Play Again" emoji="🔁" textScale={textScale} onPress={onPlayAgain} />
            <PrimaryButton
              title="Home"
              emoji="🏠"
              color={palette.white}
              textColor={palette.ink}
              textScale={textScale}
              onPress={onHome}
            />
            <PrimaryButton
              title="Achievements"
              emoji="🏆"
              color="rgba(255,255,255,0.92)"
              textColor={palette.ink}
              textScale={textScale}
              onPress={onAchievements}
            />
          </View>

          <Text style={[styles.balanceText, { fontSize: 13 * textScale }]}>Total coins: 🪙 {stats.totalCoins}</Text>
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
    gap: 14,
  },
  heading: {
    color: palette.white,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  highScoreBadge: {
    backgroundColor: palette.gold,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  highScoreText: {
    color: palette.ink,
    fontWeight: '900',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.large,
    padding: 18,
    alignItems: 'center',
    gap: 6,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  label: {
    color: palette.mutedInk,
    fontWeight: '700',
  },
  bigValue: {
    color: palette.primary,
    fontWeight: '900',
  },
  coinReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: palette.gold,
    borderWidth: 2,
    borderRadius: radius.pill,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  coinRewardValue: {
    color: palette.ink,
    fontWeight: '900',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statLabel: {
    color: palette.mutedInk,
    fontWeight: '700',
  },
  statValue: {
    color: palette.ink,
    fontWeight: '800',
  },
  sectionTitle: {
    color: palette.ink,
    fontWeight: '900',
    alignSelf: 'center',
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    backgroundColor: '#FFF6DF',
    borderRadius: radius.medium,
    padding: 12,
    marginTop: 8,
  },
  achievementTextWrap: {
    flex: 1,
  },
  achievementTitle: {
    color: palette.ink,
    fontWeight: '800',
  },
  achievementDesc: {
    color: palette.mutedInk,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginTop: 4,
  },
  balanceText: {
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '700',
  },
});
