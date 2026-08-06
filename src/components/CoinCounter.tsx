import React, { memo, useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { palette } from '../theme/colors';

interface CoinCounterProps {
  coins: number;
  textScale: number;
}

export const CoinCounter = memo(function CoinCounter({ coins, textScale }: CoinCounterProps) {
  const scale = useSharedValue(1);
  const previous = useRef(coins);

  useEffect(() => {
    if (coins !== previous.current) {
      previous.current = coins;
      scale.value = withSequence(withTiming(1.3, { duration: 130 }), withSpring(1));
    }
  }, [coins, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.pill} accessibilityLabel={`${coins} coins`}>
      <Text style={{ fontSize: 18 * textScale }}>🪙</Text>
      <Animated.Text style={[styles.value, { fontSize: 20 * textScale }, animatedStyle]}>{coins}</Animated.Text>
    </View>
  );
});

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    borderColor: palette.gold,
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6,
    shadowColor: palette.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  value: {
    color: palette.ink,
    fontWeight: '800',
  },
});
