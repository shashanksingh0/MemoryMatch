import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { palette, radius } from '../theme/colors';
import { useSound } from '../context/SoundContext';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  emoji?: string;
  color?: string;
  textColor?: string;
  disabled?: boolean;
  textScale: number;
  subtitle?: string;
}

export const PrimaryButton = memo(function PrimaryButton({
  title,
  onPress,
  emoji,
  color = palette.primary,
  textColor = palette.white,
  disabled = false,
  textScale,
  subtitle,
}: PrimaryButtonProps) {
  const { play } = useSound();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.94);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (disabled) {
      return;
    }
    play('click');
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled }}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: color, opacity: disabled ? 0.55 : pressed ? 0.85 : 1 },
        ]}
      >
        {emoji ? <Text style={[styles.emoji, { fontSize: 28 * textScale }]}>{emoji}</Text> : null}
        <View style={styles.textWrap}>
          <Text style={[styles.title, { fontSize: 20 * textScale, color: textColor }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { fontSize: 13 * textScale, color: textColor }]}>{subtitle}</Text> : null}
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: radius.large,
    gap: 12,
    minHeight: 68,
    shadowColor: palette.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  emoji: {
    textAlign: 'center',
  },
  textWrap: {
    alignItems: 'center',
  },
  title: {
    fontWeight: '800',
  },
  subtitle: {
    fontWeight: '600',
    opacity: 0.9,
  },
});
