import React, { memo, useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

const COLORS = ['#FF5C8A', '#FFC53D', '#3DDC84', '#5B4BEC', '#34C6E0', '#FF8C42', '#FF5252'];
const COUNT = 70;
const BASE_DURATION = 3200;

function pseudoRandom(seed: number): number {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

interface PieceProps {
  index: number;
  width: number;
  height: number;
}

function Piece({ index, width, height }: PieceProps) {
  const startX = width * (0.03 + pseudoRandom(index) * 0.94);
  const drift = (pseudoRandom(index + 7) - 0.5) * 180;
  const duration = BASE_DURATION * (0.65 + pseudoRandom(index + 3) * 0.5);
  const delay = pseudoRandom(index + 11) * 900;
  const size = 9 + pseudoRandom(index + 5) * 8;
  const color = COLORS[Math.floor(pseudoRandom(index + 13) * COLORS.length)];
  const rotation = (pseudoRandom(index + 17) - 0.5) * 1080;

  const x = useSharedValue(startX);
  const y = useSharedValue(-30);
  const rotate = useSharedValue(0);

  useEffect(() => {
    x.value = withDelay(delay, withTiming(startX + drift, { duration }));
    y.value = withDelay(delay, withTiming(height + 40, { duration, easing: Easing.in(Easing.quad) }));
    rotate.value = withDelay(delay, withTiming(rotation, { duration }));
  }, [delay, duration, height, rotation, startX, x, y, rotate, drift]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { rotateZ: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        { width: size, height: size * 1.5, backgroundColor: color, borderRadius: Math.min(4, size * 0.4) },
        animatedStyle,
      ]}
    />
  );
}

interface ConfettiProps {
  active: boolean;
  onDone?: () => void;
}

export const Confetti = memo(function Confetti({ active, onDone }: ConfettiProps) {
  const { width, height } = useWindowDimensions();
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    if (active) {
      setBurst((current) => current + 1);
    }
  }, [active]);

  useEffect(() => {
    if (!active || onDone == null) {
      return;
    }
    const timer = setTimeout(onDone, BASE_DURATION + 1400);
    return () => clearTimeout(timer);
  }, [active, onDone, burst]);

  if (!active) {
    return null;
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: COUNT }).map((_, index) => (
        <Piece key={`${burst}-${index}`} index={index + burst * COUNT} width={width} height={height} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
