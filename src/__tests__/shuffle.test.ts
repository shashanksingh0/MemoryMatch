import { describe, expect, it } from 'vitest';
import { buildDeck, hashSeed, mulberry32, shuffle } from '../utils/shuffle';
import { THEMES } from '../config/gameConfig';

describe('shuffle', () => {
  it('builds a deck with exactly two of each pair', () => {
    const deck = buildDeck('animals', 4);
    expect(deck).toHaveLength(8);
    const counts = new Map<number, number>();
    for (const card of deck) {
      counts.set(card.pairId, (counts.get(card.pairId) ?? 0) + 1);
    }
    for (const count of counts.values()) {
      expect(count).toBe(2);
    }
    const emojis = new Set(deck.map((card) => card.emoji));
    expect(emojis.size).toBe(4);
    for (const emoji of emojis) {
      expect(THEMES.animals.emojis).toContain(emoji);
    }
  });

  it('supports expert decks of 12 pairs', () => {
    const deck = buildDeck('ocean', 12);
    expect(deck).toHaveLength(24);
    const pairs = new Set(deck.map((card) => card.pairId));
    expect(pairs.size).toBe(12);
  });

  it('is deterministic for a given seed', () => {
    const first = buildDeck('space', 8, 42);
    const second = buildDeck('space', 8, 42);
    expect(first.map((card) => card.emoji)).toEqual(second.map((card) => card.emoji));
  });

  it('differs for different seeds', () => {
    const first = buildDeck('fruits', 6, 1);
    const second = buildDeck('fruits', 6, 2);
    expect(first.map((card) => card.emoji)).not.toEqual(second.map((card) => card.emoji));
  });

  it('preserves all elements when shuffling', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const rand = mulberry32(7);
    const output = shuffle(input, rand);
    expect([...output].sort((a, b) => a - b)).toEqual([...input].sort((a, b) => a - b));
  });

  it('hashes strings deterministically', () => {
    expect(hashSeed('abc')).toBe(hashSeed('abc'));
    expect(hashSeed('abc')).not.toBe(hashSeed('abd'));
  });
});
