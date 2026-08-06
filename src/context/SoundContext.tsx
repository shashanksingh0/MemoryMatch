import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useSettings } from './SettingsContext';

const flipSound = require('../../assets/sounds/flip.wav');
const clickSound = require('../../assets/sounds/click.wav');
const matchSound = require('../../assets/sounds/match.wav');
const wrongSound = require('../../assets/sounds/wrong.wav');
const victorySound = require('../../assets/sounds/victory.wav');
const musicTrack = require('../../assets/sounds/music.wav');

export type SoundName = 'flip' | 'click' | 'match' | 'wrong' | 'victory';

interface SoundContextValue {
  play: (name: SoundName) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

export function useSound(): SoundContextValue {
  const value = useContext(SoundContext);
  if (value == null) {
    throw new Error('useSound must be used within SoundProvider');
  }
  return value;
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();

  const flipPlayer = useAudioPlayer(flipSound);
  const clickPlayer = useAudioPlayer(clickSound);
  const matchPlayer = useAudioPlayer(matchSound);
  const wrongPlayer = useAudioPlayer(wrongSound);
  const victoryPlayer = useAudioPlayer(victorySound);
  const musicPlayer = useAudioPlayer(musicTrack);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' }).catch(() => {
      // audio mode may fail on some platforms; ignore
    });
  }, []);

  useEffect(() => {
    musicPlayer.loop = true;
  }, [musicPlayer]);

  useEffect(() => {
    if (settings.musicOn) {
      musicPlayer.seekTo(0).catch(() => {
        // ignore
      });
      musicPlayer.play();
    } else {
      musicPlayer.pause();
    }
  }, [settings.musicOn, musicPlayer]);

  const players = useMemo(
    () => ({
      flip: flipPlayer,
      click: clickPlayer,
      match: matchPlayer,
      wrong: wrongPlayer,
      victory: victoryPlayer,
    }),
    [flipPlayer, clickPlayer, matchPlayer, wrongPlayer, victoryPlayer]
  );

  const play = useCallback(
    (name: SoundName) => {
      if (!settings.soundOn) {
        return;
      }
      const player = players[name];
      if (player == null) {
        return;
      }
      player.seekTo(0).catch(() => {
        // ignore
      });
      player.play();
    },
    [settings.soundOn, players]
  );

  const value = useMemo<SoundContextValue>(() => ({ play }), [play]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}
