import React, { memo, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import { palette } from '../theme/colors';

const SIZE = 68;
const STROKE_WIDTH = 6;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TimerProps {
  timeLimitMs: number | null;
  remainingMs: number;
  progress: number;
  textScale: number;
}

function timerColor(progress: number): string {
  if (progress > 0.5) {
    return palette.success;
  }
  if (progress > 0.25) {
    return palette.warning;
  }
  return palette.danger;
}

export const Timer = memo(function Timer({ timeLimitMs, remainingMs, progress, textScale }: TimerProps) {
  const strokeDashoffset = useSharedValue(0);

  useEffect(() => {
    strokeDashoffset.value = withTiming(CIRCUMFERENCE * (1 - progress), { duration: 160 });
  }, [progress, strokeDashoffset]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));

  const hasTimer = timeLimitMs != null;
  const secondsLeft = hasTimer ? Math.ceil(remainingMs / 1000) : null;
  const color = hasTimer ? timerColor(progress) : '#B9B7D6';

  return (
    <View style={styles.wrap} accessibilityLabel={hasTimer ? `${secondsLeft} seconds left` : 'No timer'}>
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="#FFFFFF"
          strokeWidth={STROKE_WIDTH}
          fill="none"
          opacity={0.85}
        />
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.seconds, { fontSize: 20 * textScale, color }]}>
          {hasTimer ? secondsLeft : '∞'}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    shadowColor: palette.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seconds: {
    fontWeight: '800',
  },
});
