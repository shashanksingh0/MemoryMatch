import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { palette, radius } from '../theme/colors';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { useSettings } from '../context/SettingsContext';
import { DIFFICULTIES, DIFFICULTY_ORDER, THEMES, THEME_ORDER } from '../config/gameConfig';
import type { Difficulty, TextSize, ThemeKey } from '../types/game';
import { HOME_GRADIENT } from '../theme/colors';

interface SettingsScreenProps {
  onBack: () => void;
}

interface ToggleRowProps {
  emoji: string;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  textScale: number;
}

function ToggleRow({ emoji, label, value, onValueChange, textScale }: ToggleRowProps) {
  return (
    <View style={styles.toggleRow}>
      <Text style={{ fontSize: 24 * textScale }}>{emoji}</Text>
      <Text style={[styles.toggleLabel, { fontSize: 16 * textScale }]}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        trackColor={{ true: palette.success }}
        thumbColor={palette.white}
        value={value}
        onValueChange={onValueChange}
      />
    </View>
  );
}

interface ChipSelectorProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
  textScale: number;
}

function ChipSelector<T extends string>({ label, options, selected, onSelect, textScale }: ChipSelectorProps<T>) {
  return (
    <View style={styles.selectorWrap}>
      <Text style={[styles.selectorLabel, { fontSize: 15 * textScale }]}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((option) => {
          const isSelected = option.value === selected;
          return (
            <Text
              key={option.value}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(option.value)}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
                { fontSize: 14 * textScale },
              ]}
            >
              {option.label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { settings, updateSettings, resetProgress, textScale } = useSettings();

  const handleReset = () => {
    Alert.alert('Reset Progress?', 'This will clear your coins, statistics, and achievements.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          resetProgress();
        },
      },
    ]);
  };

  return (
    <Screen colors={HOME_GRADIENT}>
      <Header title="Settings" emoji="⚙️" onBack={onBack} textScale={textScale} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <View style={styles.card}>
            <ToggleRow
              emoji="🔊"
              label="Sound Effects"
              value={settings.soundOn}
              onValueChange={(value) => updateSettings({ soundOn: value })}
              textScale={textScale}
            />
            <ToggleRow
              emoji="🎵"
              label="Music"
              value={settings.musicOn}
              onValueChange={(value) => updateSettings({ musicOn: value })}
              textScale={textScale}
            />
          </View>

          <View style={styles.card}>
            <ChipSelector
              label="Difficulty"
              options={DIFFICULTY_ORDER.map((value) => ({ value, label: DIFFICULTIES[value].label }))}
              selected={settings.defaultDifficulty}
              onSelect={(value: Difficulty) => updateSettings({ defaultDifficulty: value })}
              textScale={textScale}
            />
            <ChipSelector
              label="Theme"
              options={[
                ...THEME_ORDER.map((value) => ({ value, label: THEMES[value].label })),
                { value: 'random' as ThemeKey | 'random', label: 'Random' },
              ]}
              selected={settings.themePreference}
              onSelect={(value) => updateSettings({ themePreference: value })}
              textScale={textScale}
            />
            <ChipSelector
              label="Text Size"
              options={[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' },
              ]}
              selected={settings.textSize}
              onSelect={(value: TextSize) => updateSettings({ textSize: value })}
              textScale={textScale}
            />
          </View>

          <View style={styles.card}>
            <Text style={[styles.dangerLabel, { fontSize: 15 * textScale }]}>Danger Zone</Text>
            <Text
              accessibilityRole="button"
              onPress={handleReset}
              style={[styles.dangerButton, { fontSize: 16 * textScale }]}
            >
              🗑️ Reset Progress
            </Text>
          </View>

          <Text style={[styles.footnote, { fontSize: 12 * textScale }]}>Memory Match • Made for curious minds</Text>
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
    gap: 14,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.large,
    padding: 16,
    gap: 14,
    shadowColor: palette.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleLabel: {
    flex: 1,
    color: palette.ink,
    fontWeight: '800',
  },
  selectorWrap: {
    gap: 8,
  },
  selectorLabel: {
    color: palette.mutedInk,
    fontWeight: '800',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: palette.mutedBackground,
    color: palette.ink,
    fontWeight: '800',
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  chipSelected: {
    backgroundColor: palette.primary,
    color: palette.white,
  },
  dangerLabel: {
    color: palette.danger,
    fontWeight: '900',
  },
  dangerButton: {
    backgroundColor: '#FFECEA',
    color: palette.danger,
    fontWeight: '900',
    textAlign: 'center',
    borderRadius: radius.medium,
    paddingVertical: 14,
    overflow: 'hidden',
  },
  footnote: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    textAlign: 'center',
  },
});
