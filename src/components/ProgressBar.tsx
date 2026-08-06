import React, { memo, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { palette } from '../theme/colors';

interface ProgressBarProps {
  matched: number;
  total: number;
  accent: string;
  textScale: number;
}

export const ProgressBar = memo(function ProgressBar({ matched, total, accent, textScale }: ProgressBarProps) {
  const fill = useSharedValue(0);

  useEffect(() => {
    const percent = total > 0 ? (matched / total) * 100 : 0;
    fill.value = withTiming(percent, { duration: 350 });
  }, [matched, total, fill]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${fill.value}%`,
  }));

  return (
    <View style={styles.wrap} accessibilityLabel={`${matched} of ${total} pairs matched`}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { fontSize: 12 * textScale }]}>Pairs</Text>
        <Text style={[styles.count, { fontSize: 12 * textScale }]}>
          {matched}/{total}
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: accent }, animatedStyle]} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: palette.mutedInk,
    fontWeight: '700',
  },
  count: {
    color: palette.ink,
    fontWeight: '800',
  },
  track: {
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.9)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
