import { describe, expect, it } from 'vitest';
import {
  accuracyPercentage,
  calculateStars,
  clampScore,
  coinsForResult,
  formatTime,
  pointsForMatch,
} from '../utils/scoring';

describe('pointsForMatch', () => {
  it('gives 20 points for a first match', () => {
    expect(pointsForMatch(1)).toBe(20);
  });

  it('adds the combo bonus from the second consecutive match on', () => {
    expect(pointsForMatch(2)).toBe(30);
    expect(pointsForMatch(3)).toBe(30);
  });
});

describe('clampScore', () => {
  it('floors score at zero', () => {
    expect(clampScore(-2)).toBe(0);
    expect(clampScore(15)).toBe(15);
  });
});

describe('calculateStars', () => {
  it('awards three stars with no mistakes on untimed levels', () => {
    expect(calculateStars({ mistakes: 0, timeMs: 40_000, timeLimitMs: null })).toBe(3);
  });

  it('awards two stars for one mistake', () => {
    expect(calculateStars({ mistakes: 1, timeMs: 40_000, timeLimitMs: null })).toBe(2);
  });

  it('awards one star for two or more mistakes', () => {
    expect(calculateStars({ mistakes: 2, timeMs: 40_000, timeLimitMs: null })).toBe(1);
  });

  it('caps stars when time is slow', () => {
    expect(calculateStars({ mistakes: 0, timeMs: 80_000, timeLimitMs: 100_000 })).toBe(2);
    expect(calculateStars({ mistakes: 0, timeMs: 95_000, timeLimitMs: 100_000 })).toBe(1);
  });

  it('keeps three stars when fast and mistake-free', () => {
    expect(calculateStars({ mistakes: 0, timeMs: 30_000, timeLimitMs: 100_000 })).toBe(3);
  });
});

describe('coinsForResult', () => {
  it('combines base coins with the star bonus', () => {
    expect(coinsForResult('easy', 3)).toBe(70);
    expect(coinsForResult('easy', 1)).toBe(30);
    expect(coinsForResult('expert', 3)).toBe(150);
  });
});

describe('accuracyPercentage', () => {
  it('computes rounded accuracy', () => {
    expect(accuracyPercentage(3, 4)).toBe(75);
    expect(accuracyPercentage(0, 0)).toBe(100);
  });
});

describe('formatTime', () => {
  it('formats milliseconds as mm:ss', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(65_000)).toBe('01:05');
    expect(formatTime(119_500)).toBe('02:00');
  });
});
