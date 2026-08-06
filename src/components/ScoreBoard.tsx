import React, { memo, useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { palette } from '../theme/colors';

interface ScoreBoardProps {
  score: number;
  textScale: number;
}

export const ScoreBoard = memo(function ScoreBoard({ score, textScale }: ScoreBoardProps) {
  const scale = useSharedValue(1);
  const previous = useRef(score);

  useEffect(() => {
    if (score !== previous.current) {
      previous.current = score;
      scale.value = withSequence(withTiming(1.25, { duration: 130 }), withSpring(1));
    }
  }, [score, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.pill} accessibilityLabel={`Score ${score}`}>
      <Text style={[styles.label, { fontSize: 11 * textScale }]}>Score</Text>
      <Animated.Text style={[styles.value, { fontSize: 20 * textScale }, animatedStyle]}>{score}</Animated.Text>
    </View>
  );
});

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.primary,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
    shadowColor: palette.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  label: {
    color: '#C9C4FF',
    fontWeight: '700',
  },
  value: {
    color: palette.white,
    fontWeight: '800',
  },
});
