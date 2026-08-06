import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, fontSizes, radius } from '../theme/colors';
import { useSound } from '../context/SoundContext';

interface HeaderProps {
  title: string;
  emoji?: string;
  onBack: () => void;
  textScale: number;
}

export const Header = memo(function Header({ title, emoji, onBack, textScale }: HeaderProps) {
  const { play } = useSound();

  const handleBack = () => {
    play('click');
    onBack();
  };

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={handleBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Text style={[styles.backIcon, { fontSize: 22 * textScale }]}>‹</Text>
      </Pressable>
      <View style={styles.titleWrap}>
        {emoji ? <Text style={[styles.emoji, { fontSize: 24 * textScale }]}>{emoji}</Text> : null}
        <Text style={[styles.title, { fontSize: fontSizes.heading * textScale }]}>{title}</Text>
      </View>
      <View style={styles.spacer} />
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pressed: {
    opacity: 0.7,
  },
  backIcon: {
    color: palette.ink,
    fontWeight: '800',
    marginTop: -2,
  },
  titleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emoji: {
    textAlign: 'center',
  },
  title: {
    color: palette.ink,
    fontWeight: '800',
  },
  spacer: {
    width: 46,
  },
});
