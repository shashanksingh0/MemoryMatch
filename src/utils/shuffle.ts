import type { CardModel, ThemeKey } from '../types/game';
import { THEMES } from '../config/gameConfig';

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], rand: () => number = Math.random): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

export function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function buildDeck(theme: ThemeKey, pairs: number, seed?: number): CardModel[] {
  const pool = THEMES[theme].emojis.slice(0, pairs);
  const rand = seed != null ? mulberry32(seed) : Math.random;
  const pairEmojis = shuffle(pool, rand);
  const cards: CardModel[] = [];
  let id = 0;
  pairEmojis.forEach((emoji, pairId) => {
    cards.push({ id: id++, pairId, emoji, isFlipped: false, isMatched: false, isShaking: false });
    cards.push({ id: id++, pairId, emoji, isFlipped: false, isMatched: false, isShaking: false });
  });
  return shuffle(cards, rand);
}
