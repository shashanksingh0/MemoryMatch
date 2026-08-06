import { describe, expect, it } from 'vitest';
import { buildInitial, reducer } from '../hooks/useGame';
import type { GameState } from '../hooks/useGame';
import type { GameConfig } from '../types/game';
import { SCORING } from '../config/gameConfig';

const CONFIG: GameConfig = { mode: 'classic', difficulty: 'easy', theme: 'animals' };

function start(state: GameState): GameState {
  return reducer(state, { type: 'START' });
}

function flip(state: GameState, cardId: number): GameState {
  return reducer(state, { type: 'FLIP', cardId });
}

function pairIds(state: GameState, pairIndex: number): [number, number] {
  const cards = state.cards.filter((card) => card.pairId === pairIndex);
  return [cards[0].id, cards[1].id];
}

describe('game reducer', () => {
  it('starts in preview with all cards revealed', () => {
    const state = buildInitial(CONFIG);
    expect(state.phase).toBe('preview');
    expect(state.totalPairs).toBe(4);
    expect(state.cards).toHaveLength(8);
    expect(state.cards.every((card) => card.isFlipped)).toBe(true);
    expect(state.hintsLeft).toBe(SCORING.HINTS_PER_GAME);
    expect(state.shufflesLeft).toBe(SCORING.SHUFFLES_PER_GAME);
  });

  it('hides all cards and starts playing after the reveal', () => {
    const state = start(buildInitial(CONFIG));
    expect(state.phase).toBe('playing');
    expect(state.timerStarted).toBe(true);
    expect(state.cards.every((card) => !card.isFlipped)).toBe(true);
  });

  it('scores a match and keeps both cards face up', () => {
    let state = start(buildInitial(CONFIG));
    const [first, second] = pairIds(state, 0);
    state = flip(state, first);
    expect(state.selectedIds).toEqual([first]);
    state = flip(state, second);
    expect(state.phase).toBe('playing');
    expect(state.matchedPairs).toBe(1);
    expect(state.score).toBe(20);
    expect(state.streak).toBe(1);
    const firstCard = state.cards.find((card) => card.id === first);
    const secondCard = state.cards.find((card) => card.id === second);
    expect(firstCard?.isMatched).toBe(true);
    expect(secondCard?.isMatched).toBe(true);
  });

  it('adds the combo bonus for consecutive matches', () => {
    let state = start(buildInitial(CONFIG));
    for (const pair of [0, 1]) {
      const [first, second] = pairIds(state, pair);
      state = flip(state, first);
      state = flip(state, second);
    }
    expect(state.matchedPairs).toBe(2);
    expect(state.score).toBe(50);
    expect(state.streak).toBe(2);
    expect(state.bestCombo).toBe(2);
  });

  it('flips a wrong pair back after the mismatch delay', () => {
    let state = start(buildInitial(CONFIG));
    const [matchA, matchB] = pairIds(state, 0);
    state = flip(state, matchA);
    state = flip(state, matchB);
    const [firstA] = pairIds(state, 1);
    const [secondA] = pairIds(state, 2);
    state = flip(state, firstA);
    state = flip(state, secondA);
    expect(state.phase).toBe('checking');
    expect(state.mistakes).toBe(1);
    expect(state.score).toBe(18);
    expect(state.streak).toBe(0);

    const shakingCards = state.cards.filter((card) => card.isShaking);
    expect(shakingCards).toHaveLength(2);

    state = reducer(state, { type: 'RESET_PAIR' });
    expect(state.phase).toBe('playing');
    expect(state.selectedIds).toEqual([]);
    expect(state.cards.find((card) => card.id === firstA)?.isFlipped).toBe(false);
    expect(state.cards.find((card) => card.id === secondA)?.isFlipped).toBe(false);
    expect(state.cards.some((card) => card.isShaking)).toBe(false);
  });

  it('never lets the score drop below zero', () => {
    let state = start(buildInitial(CONFIG));
    state = flip(state, pairIds(state, 0)[0]);
    state = flip(state, pairIds(state, 1)[0]);
    state = reducer(state, { type: 'RESET_PAIR' });
    state = flip(state, pairIds(state, 0)[0]);
    state = flip(state, pairIds(state, 1)[0]);
    state = reducer(state, { type: 'RESET_PAIR' });
    expect(state.score).toBe(0);
  });

  it('completes a full game with the level bonus', () => {
    let state = start(buildInitial(CONFIG));
    state = flip(state, pairIds(state, 0)[0]);
    state = flip(state, pairIds(state, 0)[1]);
    state = flip(state, pairIds(state, 1)[0]);
    state = flip(state, pairIds(state, 1)[1]);

    state = flip(state, pairIds(state, 2)[0]);
    state = flip(state, pairIds(state, 3)[0]);
    state = reducer(state, { type: 'RESET_PAIR' });

    state = flip(state, pairIds(state, 2)[0]);
    state = flip(state, pairIds(state, 2)[1]);
    state = flip(state, pairIds(state, 3)[0]);
    state = flip(state, pairIds(state, 3)[1]);

    expect(state.phase).toBe('won');
    expect(state.matchedPairs).toBe(4);
    expect(state.mistakes).toBe(1);
    expect(state.score).toBe(198);
  });

  it('ignores flips of already matched cards', () => {
    let state = start(buildInitial(CONFIG));
    const [first, second] = pairIds(state, 0);
    state = flip(state, first);
    state = flip(state, second);
    const before = state;
    const after = flip(state, first);
    expect(after).toBe(before);
  });

  it('uses a hint to reveal unmatched cards for a short while', () => {
    let state = start(buildInitial(CONFIG));
    state = reducer(state, { type: 'HINT' });
    expect(state.phase).toBe('hinting');
    expect(state.hintsLeft).toBe(SCORING.HINTS_PER_GAME - 1);
    expect(state.cards.every((card) => card.isFlipped)).toBe(true);

    state = reducer(state, { type: 'HINT_DONE' });
    expect(state.phase).toBe('playing');
    expect(state.cards.every((card) => !card.isFlipped)).toBe(true);
  });

  it('lets the player shuffle unmatched cards only once', () => {
    let state = start(buildInitial(CONFIG));
    const beforeOrder = state.cards.map((card) => card.id);
    state = flip(state, pairIds(state, 0)[0]);
    state = reducer(state, { type: 'SHUFFLE' });
    expect(state.shufflesLeft).toBe(0);
    expect(state.selectedIds).toEqual([]);

    const shuffledOrder = state.cards.map((card) => card.id);
    expect([...shuffledOrder].sort((a, b) => a - b)).toEqual([...beforeOrder].sort((a, b) => a - b));
    const pairs = state.cards.map((card) => card.pairId);
    expect(new Set(pairs).size).toBe(4);

    const after = reducer(state, { type: 'SHUFFLE' });
    expect(after).toBe(state);
  });

  it('ends the game on timeout and resets the pending pair', () => {
    let state = start(buildInitial(CONFIG));
    state = flip(state, pairIds(state, 0)[0]);
    state = reducer(state, { type: 'TIMEOUT' });
    expect(state.phase).toBe('gameover');
    expect(state.selectedIds).toEqual([]);
    expect(state.cards.every((card) => !card.isFlipped)).toBe(true);
  });

  it('ignores actions when the game is over', () => {
    let state = start(buildInitial(CONFIG));
    state = reducer(state, { type: 'TIMEOUT' });
    const after = flip(state, pairIds(state, 0)[0]);
    expect(after).toBe(state);
  });
});
