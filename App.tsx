import React, { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { SoundProvider } from './src/context/SoundContext';
import type { GameConfig, GameResult } from './src/types/game';
import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { AchievementScreen } from './src/screens/AchievementScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

type NavState =
  | { screen: 'home' }
  | { screen: 'game'; config: GameConfig }
  | { screen: 'result'; config: GameConfig; result: GameResult }
  | { screen: 'achievements' }
  | { screen: 'settings' };

function AppNavigator() {
  const { ready, recordResult } = useSettings();
  const [nav, setNav] = useState<NavState>({ screen: 'home' });

  const goHome = useCallback(() => setNav({ screen: 'home' }), []);

  const handlePlay = useCallback((config: GameConfig) => {
    setNav({ screen: 'game', config });
  }, []);

  const handleComplete = useCallback(
    (config: GameConfig) => (result: GameResult) => {
      const enriched = recordResult(result);
      setNav({ screen: 'result', config, result: enriched });
    },
    [recordResult]
  );

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#5B4BEC" />
      </View>
    );
  }

  switch (nav.screen) {
    case 'game':
      return (
        <GameScreen
          config={nav.config}
          onComplete={handleComplete(nav.config)}
          onQuit={goHome}
        />
      );
    case 'result':
      return (
        <ResultScreen
          result={nav.result}
          onPlayAgain={() => setNav({ screen: 'game', config: nav.config })}
          onHome={goHome}
          onAchievements={() => setNav({ screen: 'achievements' })}
        />
      );
    case 'achievements':
      return <AchievementScreen onBack={goHome} />;
    case 'settings':
      return <SettingsScreen onBack={goHome} />;
    case 'home':
    default:
      return (
        <HomeScreen
          onPlay={handlePlay}
          onDaily={handlePlay}
          onAchievements={() => setNav({ screen: 'achievements' })}
          onSettings={() => setNav({ screen: 'settings' })}
        />
      );
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <SoundProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </SoundProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1EEFF',
  },
});
