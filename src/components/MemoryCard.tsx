import React, { memo, useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { CardModel } from '../types/game';
import { palette } from '../theme/colors';

interface MemoryCardProps {
  card: CardModel;
  size: number;
  disabled: boolean;
  cardBackColor: string;
  accent: string;
  textScale: number;
  onPress: (cardId: number) => void;
}

function MemoryCardComponent({ card, size, disabled, cardBackColor, accent, textScale, onPress }: MemoryCardProps) {
  const flipProgress = useSharedValue(card.isFlipped ? 1 : 0);
  const shakeOffset = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    flipProgress.value = withTiming(card.isFlipped ? 1 : 0, {
      duration: 320,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [card.isFlipped, flipProgress]);

  useEffect(() => {
    if (card.isShaking) {
      shakeOffset.value = 0;
      shakeOffset.value = withSequence(
        withTiming(-12, { duration: 60 }),
        withTiming(12, { duration: 60 }),
        withTiming(-9, { duration: 60 }),
        withTiming(9, { duration: 60 }),
        withTiming(0, { duration: 60 })
      );
    }
  }, [card.isShaking, shakeOffset]);

  useEffect(() => {
    if (card.isMatched) {
      glow.value = withDelay(160, withRepeat(withTiming(1, { duration: 480 }), -1, true));
    } else {
      glow.value = withTiming(0, { duration: 120 });
    }
  }, [card.isMatched, glow]);

  const containerStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180]);
    return { transform: [{ perspective: 900 }, { rotateY: `${rotateY}deg` }] };
  });

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 1 + glow.value * 0.09 }],
  }));

  const backStyle = useAnimatedStyle(() => ({
    opacity: interpolate(flipProgress.value, [0, 0.49, 0.51, 1], [1, 1, 0, 0]),
  }));

  const frontStyle = useAnimatedStyle(() => ({
    opacity: interpolate(flipProgress.value, [0, 0.49, 0.51, 1], [0, 0, 1, 1]),
  }));

  const borderRadius = Math.max(12, size * 0.16);

  const accessibilityLabel = card.isMatched
    ? `Matched pair of ${card.emoji}`
    : card.isFlipped
      ? `Card showing ${card.emoji}`
      : 'Hidden card';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => onPress(card.id)}
      disabled={disabled || card.isMatched}
      style={{ width: size, height: size }}
    >
      <Animated.View style={[styles.wrapper, shakeStyle, { borderRadius }]}>
        <Animated.View style={[styles.card, { width: size, height: size, borderRadius }, containerStyle]}>
          <Animated.View style={[styles.face, backStyle, { backgroundColor: cardBackColor, borderRadius }]}>
            <Text style={[styles.backEmoji, { fontSize: size * 0.34 }]}>❓</Text>
          </Animated.View>
          <Animated.View style={[styles.face, styles.frontFace, frontStyle, { borderRadius }]}>
            <Text style={[styles.emoji, { fontSize: size * 0.46 * textScale }]}>{card.emoji}</Text>
          </Animated.View>
          {card.isMatched ? (
            <Animated.View
              pointerEvents="none"
              style={[styles.glowRing, glowStyle, { borderRadius, borderColor: accent }]}
            />
          ) : null}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    shadowColor: palette.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  card: {
    backgroundColor: palette.white,
  },
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frontFace: {
    backgroundColor: palette.white,
    transform: [{ rotateY: '180deg' }],
  },
  emoji: {
    textAlign: 'center',
  },
  backEmoji: {
    color: palette.white,
    textAlign: 'center',
  },
  glowRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderWidth: 3,
  },
});

export const MemoryCard = memo(MemoryCardComponent);
