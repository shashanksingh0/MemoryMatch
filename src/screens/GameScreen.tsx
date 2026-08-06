import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameConfig, GameResult } from '../types/game';
import { DIFFICULTIES, SCORING, THEMES } from '../config/gameConfig';
import { useGame } from '../hooks/useGame';
import { useTimer } from '../hooks/useTimer';
import { useSound } from '../context/SoundContext';
import { useSettings } from '../context/SettingsContext';
import { Screen } from '../components/Screen';
import { GameBoard } from '../components/GameBoard';
import { ScoreBoard } from '../components/ScoreBoard';
import { CoinCounter } from '../components/CoinCounter';
import { Timer } from '../components/Timer';
import { ProgressBar } from '../components/ProgressBar';
import { calculateStars, coinsForResult } from '../utils/scoring';
import { palette } from '../theme/colors';

interface GameScreenProps {
  config: GameConfig;
  onComplete: (result: GameResult) => void;
  onQuit: () => void;
}

interface IconButtonProps {
  emoji: string;
  label: string;
  onPress: () => void;
  badge?: number;
  textScale: number;
}

function IconButton({ emoji, label, onPress, badge = 0, textScale }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
    >
      <Text style={[styles.iconButtonEmoji, { fontSize: 20 * textScale }]}>{emoji}</Text>
      {badge > 0 ? (
        <View style={styles.badge} accessibilityElementsHidden>
          <Text style={[styles.badgeText, { fontSize: 11 * textScale }]}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function GameScreen({ config, onComplete, onQuit }: GameScreenProps) {
  const { state, flipCard, useHint, shuffleBoard, triggerTimeout } = useGame(config);
  const { play } = useSound();
  const { stats, textScale } = useSettings();

  const theme = THEMES[config.theme];
  const difficulty = DIFFICULTIES[config.difficulty];
  const timeLimitMs = difficulty.timeLimitMs;

  const timerActive = state.timerStarted && state.phase !== 'won' && state.phase !== 'gameover';
  const { remainingMs, progress, timeUsedMs } = useTimer(timeLimitMs, timerActive, triggerTimeout);

  const timeUsedRef = useRef(0);
  useEffect(() => {
    timeUsedRef.current = timeUsedMs;
  }, [timeUsedMs]);

  const resultSentRef = useRef(false);
  useEffect(() => {
    if (state.phase !== 'won' && state.phase !== 'gameover') {
      return;
    }
    if (resultSentRef.current) {
      return;
    }
    resultSentRef.current = true;
    const won = state.phase === 'won';
    if (won) {
      play('victory');
    } else {
      play('wrong');
    }
    const stars = won
      ? calculateStars({ mistakes: state.mistakes, timeMs: timeUsedRef.current, timeLimitMs })
      : 1;
    const result: GameResult = {
      mode: config.mode,
      difficulty: config.difficulty,
      theme: config.theme,
      won,
      score: state.score,
      coins: won ? coinsForResult(config.difficulty, stars) : 0,
      stars,
      mistakes: state.mistakes,
      totalPairs: state.totalPairs,
      matchedPairs: state.matchedPairs,
      timeMs: timeUsedRef.current,
      timeLimitMs,
      bestCombo: state.bestCombo,
      hintCount: SCORING.HINTS_PER_GAME - state.hintsLeft,
      isNewHighScore: false,
      unlockedAchievements: [],
    };
    onComplete(result);
  }, [state]);

  const handleCardPress = useCallback(
    (cardId: number) => {
      if (state.phase !== 'playing' || state.selectedIds.length >= 2) {
        return;
      }
      const card = state.cards.find((item) => item.id === cardId);
      if (card == null || card.isFlipped || card.isMatched) {
        return;
      }
      play('flip');
      flipCard(cardId);
    },
    [state.phase, state.selectedIds.length, state.cards, play, flipCard]
  );

  const handleHint = useCallback(() => {
    if (state.phase !== 'playing' || state.hintsLeft <= 0) {
      return;
    }
    play('click');
    useHint();
  }, [state.phase, state.hintsLeft, play, useHint]);

  const handleShuffle = useCallback(() => {
    if (state.phase !== 'playing' || state.shufflesLeft <= 0) {
      return;
    }
    play('click');
    shuffleBoard();
  }, [state.phase, state.shufflesLeft, play, shuffleBoard]);

  const metaLabel = `${config.mode === 'daily' ? 'Daily Challenge • ' : ''}${difficulty.label} • ${theme.label}`;

  return (
    <Screen colors={theme.gradient} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.topBar}>
        <IconButton emoji="🏠" label="Back to home" onPress={onQuit} textScale={textScale} />
        <ScoreBoard score={state.score} textScale={textScale} />
        <CoinCounter coins={stats.totalCoins} textScale={textScale} />
      </View>

      <View style={styles.subBar}>
        <Timer timeLimitMs={timeLimitMs} remainingMs={remainingMs} progress={progress} textScale={textScale} />
        <View style={styles.subRight}>
          <ProgressBar
            matched={state.matchedPairs}
            total={state.totalPairs}
            accent={theme.accent}
            textScale={textScale}
          />
          <View style={styles.actionRow}>
            <IconButton
              emoji="💡"
              label={`Hint (${state.hintsLeft} left)`}
              onPress={handleHint}
              badge={state.hintsLeft}
              textScale={textScale}
            />
            <IconButton
              emoji="🔀"
              label={`Shuffle (${state.shufflesLeft} left)`}
              onPress={handleShuffle}
              badge={state.shufflesLeft}
              textScale={textScale}
            />
          </View>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={[styles.metaText, { fontSize: 14 * textScale }]}>{metaLabel}</Text>
      </View>

      <View style={styles.boardWrap}>
        <GameBoard
          cards={state.cards}
          phase={state.phase}
          cardBackColor={theme.cardBack}
          accent={theme.accent}
          textScale={textScale}
          onPress={handleCardPress}
        />
      </View>

      {state.phase === 'preview' ? (
        <View style={styles.banner} pointerEvents="none">
          <Text style={[styles.bannerText, { fontSize: 22 * textScale }]}>Memorize the cards!</Text>
        </View>
      ) : null}
      {state.phase === 'hinting' ? (
        <View style={styles.banner} pointerEvents="none">
          <Text style={[styles.bannerText, { fontSize: 22 * textScale }]}>Look carefully!</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 8,
    gap: 10,
  },
  subBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    gap: 14,
  },
  subRight: {
    flex: 1,
    gap: 8,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metaRow: {
    alignItems: 'center',
    paddingTop: 10,
  },
  metaText: {
    color: palette.mutedInk,
    fontWeight: '800',
  },
  boardWrap: {
    flex: 1,
    marginTop: 6,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  iconPressed: {
    opacity: 0.7,
  },
  iconButtonEmoji: {
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: palette.white,
    fontWeight: '800',
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    color: palette.white,
    fontWeight: '900',
    textAlign: 'center',
    backgroundColor: 'rgba(43,41,74,0.55)',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
    overflow: 'hidden',
  },
});
