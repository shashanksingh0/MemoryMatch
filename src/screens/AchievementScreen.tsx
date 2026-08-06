import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { palette, radius } from '../theme/colors';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { useSettings } from '../context/SettingsContext';
import { ACHIEVEMENTS } from '../utils/achievements';
import { bestTimeOverall } from '../utils/stats';
import { accuracyPercentage, formatTime } from '../utils/scoring';
import { HOME_GRADIENT } from '../theme/colors';

interface AchievementScreenProps {
  onBack: () => void;
}

interface StatCellProps {
  label: string;
  value: string;
  emoji: string;
  textScale: number;
}

function StatCell({ label, value, emoji, textScale }: StatCellProps) {
  return (
    <View style={styles.statCell}>
      <Text style={{ fontSize: 24 * textScale }}>{emoji}</Text>
      <Text style={[styles.statValue, { fontSize: 20 * textScale }]}>{value}</Text>
      <Text style={[styles.statLabel, { fontSize: 12 * textScale }]}>{label}</Text>
    </View>
  );
}

export function AchievementScreen({ onBack }: AchievementScreenProps) {
  const { stats, achievements, textScale } = useSettings();

  const accuracy = accuracyPercentage(stats.correctPairs, stats.totalAttempts);
  const bestTime = bestTimeOverall(stats);
  const unlockedCount = Object.values(achievements.unlocked).filter(Boolean).length;

  return (
    <Screen colors={HOME_GRADIENT}>
      <Header title="My Progress" emoji="🏆" onBack={onBack} textScale={textScale} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { fontSize: 16 * textScale }]}>Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCell label="Games Played" value={String(stats.gamesPlayed)} emoji="🎮" textScale={textScale} />
            <StatCell label="Games Won" value={String(stats.gamesWon)} emoji="🏆" textScale={textScale} />
            <StatCell label="Best Time" value={bestTime != null ? formatTime(bestTime) : '—'} emoji="⏱️" textScale={textScale} />
            <StatCell label="Highest Score" value={String(stats.highestScore)} emoji="💎" textScale={textScale} />
            <StatCell label="Total Coins" value={String(stats.totalCoins)} emoji="🪙" textScale={textScale} />
            <StatCell label="Accuracy" value={`${accuracy}%`} emoji="🎯" textScale={textScale} />
            <StatCell label="Current Streak" value={String(stats.currentStreak)} emoji="🔥" textScale={textScale} />
            <StatCell label="Longest Streak" value={String(stats.longestStreak)} emoji="🚀" textScale={textScale} />
          </View>

          <Text style={[styles.sectionTitle, { fontSize: 16 * textScale, marginTop: 8 }]}>
            Achievements ({unlockedCount}/{ACHIEVEMENTS.length})
          </Text>
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = achievements.unlocked[achievement.id];
            return (
              <View
                key={achievement.id}
                style={[styles.achievementRow, !isUnlocked && styles.achievementLocked]}
                accessibilityLabel={`${achievement.title}, ${isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <View style={[styles.achievementEmojiWrap, isUnlocked && styles.achievementEmojiUnlocked]}>
                  <Text style={[styles.achievementEmoji, { fontSize: 28 * textScale }, !isUnlocked && styles.grayscale]}>
                    {achievement.emoji}
                  </Text>
                </View>
                <View style={styles.achievementTextWrap}>
                  <Text style={[styles.achievementTitle, { fontSize: 16 * textScale }]}>{achievement.title}</Text>
                  <Text style={[styles.achievementDesc, { fontSize: 13 * textScale }]}>{achievement.description}</Text>
                </View>
                <Text style={[styles.statusEmoji, { fontSize: 20 * textScale }]}>{isUnlocked ? '✅' : '🔒'}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 32,
  },
  content: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionTitle: {
    color: palette.white,
    fontWeight: '900',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.large,
    padding: 12,
    gap: 4,
  },
  statCell: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 2,
  },
  statValue: {
    color: palette.ink,
    fontWeight: '900',
  },
  statLabel: {
    color: palette.mutedInk,
    fontWeight: '700',
    textAlign: 'center',
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.medium,
    padding: 14,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  achievementLocked: {
    opacity: 0.75,
  },
  achievementEmojiWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEEAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementEmojiUnlocked: {
    backgroundColor: '#FFF1C9',
  },
  achievementEmoji: {
    textAlign: 'center',
  },
  grayscale: {
    opacity: 0.45,
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
  statusEmoji: {
    textAlign: 'center',
  },
});
