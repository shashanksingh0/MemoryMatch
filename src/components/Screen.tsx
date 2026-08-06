import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Edge } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

interface ScreenProps {
  colors: readonly [string, string, string];
  children: React.ReactNode;
  edges?: Edge[];
}

export function Screen({ colors, children, edges = ['top', 'left', 'right'] }: ScreenProps) {
  return (
    <LinearGradient colors={colors} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={edges}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
});
