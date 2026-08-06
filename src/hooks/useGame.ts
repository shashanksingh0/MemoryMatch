import { useCallback, useEffect, useReducer } from 'react';
import type { CardModel, GameConfig } from '../types/game';
import { DIFFICULTIES, SCORING } from '../config/gameConfig';
import { buildDeck, shuffle } from '../utils/shuffle';
import { clampScore, pointsForMatch } from '../utils/scoring';

export type GamePhase = 'preview' | 'playing' | 'checking' | 'hinting' | 'won' | 'gameover';

export interface GameState {
  cards: CardModel[];
  phase: GamePhase;
  timerStarted: boolean;
  selectedIds: number[];
  score: number;
  streak: number;
  bestCombo: number;
  mistakes: number;
  matchedPairs: number;
  totalPairs: number;
  hintsLeft: number;
  shufflesLeft: number;
}

type GameAction =
  | { type: 'START' }
  | { type: 'FLIP'; cardId: number }
  | { type: 'RESET_PAIR' }
  | { type: 'HINT' }
  | { type: 'HINT_DONE' }
  | { type: 'SHUFFLE' }
  | { type: 'TIMEOUT' };

function withCard(cards: CardModel[], id: number, patch: Partial<CardModel>): CardModel[] {
  return cards.map((card) => (card.id === id ? { ...card, ...patch } : card));
}

export function buildInitial(config: GameConfig): GameState {  const deck = buildDeck(config.theme, DIFFICULTIES[config.difficulty].pairs, config.seed);
  return {
    cards: deck.map((card) => ({ ...card, isFlipped: true })),
    phase: 'preview',
    timerStarted: false,
    selectedIds: [],
    score: 0,
    streak: 0,
    bestCombo: 0,
    mistakes: 0,
    matchedPairs: 0,
    totalPairs: deck.length / 2,
    hintsLeft: SCORING.HINTS_PER_GAME,
    shufflesLeft: SCORING.SHUFFLES_PER_GAME,
  };
}

export function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START': {
      if (state.phase !== 'preview') {
        return state;
      }
      return {
        ...state,
        phase: 'playing',
        timerStarted: true,
        cards: state.cards.map((card) => ({ ...card, isFlipped: false })),
      };
    }
    case 'FLIP': {
      if (state.phase !== 'playing' || state.selectedIds.length >= 2) {
        return state;
      }
      const card = state.cards.find((item) => item.id === action.cardId);
      if (card == null || card.isFlipped || card.isMatched) {
        return state;
      }
      const next: GameState = {
        ...state,
        selectedIds: [...state.selectedIds, action.cardId],
        cards: withCard(state.cards, action.cardId, { isFlipped: true }),
      };
      if (next.selectedIds.length === 1) {
        return next;
      }
      const [firstId, secondId] = next.selectedIds;
      const first = next.cards.find((item) => item.id === firstId) as CardModel;
      const second = next.cards.find((item) => item.id === secondId) as CardModel;
      if (first.pairId === second.pairId) {
        const streak = state.streak + 1;
        const matchedPairs = state.matchedPairs + 1;
        const gained = pointsForMatch(streak);
        const won = matchedPairs === state.totalPairs;
        return {
          ...next,
          selectedIds: [],
          streak,
          bestCombo: Math.max(state.bestCombo, streak),
          matchedPairs,
          score: state.score + gained + (won ? SCORING.LEVEL_COMPLETE_BONUS : 0),
          phase: won ? 'won' : 'playing',
          cards: withCard(withCard(next.cards, firstId, { isMatched: true }), secondId, { isMatched: true }),
        };
      }
      return {
        ...next,
        phase: 'checking',
        streak: 0,
        mistakes: state.mistakes + 1,
        score: clampScore(state.score - SCORING.WRONG_PENALTY),
        cards: withCard(withCard(next.cards, firstId, { isShaking: true }), secondId, { isShaking: true }),
      };
    }
    case 'RESET_PAIR': {
      if (state.phase !== 'checking') {
        return state;
      }
      let cards = state.cards;
      for (const id of state.selectedIds) {
        cards = withCard(cards, id, { isFlipped: false, isShaking: false });
      }
      return { ...state, cards, selectedIds: [], phase: 'playing' };
    }
    case 'HINT': {
      if (state.phase !== 'playing' || state.hintsLeft <= 0) {
        return state;
      }
      return {
        ...state,
        phase: 'hinting',
        hintsLeft: state.hintsLeft - 1,
        selectedIds: [],
        cards: state.cards.map((card) => (card.isMatched ? card : { ...card, isFlipped: true })),
      };
    }
    case 'HINT_DONE': {
      if (state.phase !== 'hinting') {
        return state;
      }
      return {
        ...state,
        phase: 'playing',
        cards: state.cards.map((card) => (card.isMatched ? card : { ...card, isFlipped: false })),
      };
    }
    case 'SHUFFLE': {
      if (state.phase !== 'playing' || state.shufflesLeft <= 0) {
        return state;
      }
      const positions: number[] = [];
      state.cards.forEach((card, index) => {
        if (!card.isMatched) {
          positions.push(index);
        }
      });
      const shuffledCards = shuffle(positions.map((position) => state.cards[position]));
      const cards = state.cards.slice();
      positions.forEach((position, offset) => {
        cards[position] = shuffledCards[offset];
      });
      return {
        ...state,
        cards,
        selectedIds: [],
        streak: 0,
        shufflesLeft: state.shufflesLeft - 1,
      };
    }
    case 'TIMEOUT': {
      if (state.phase !== 'playing' && state.phase !== 'checking' && state.phase !== 'hinting') {
        return state;
      }
      let cards = state.cards;
      for (const id of state.selectedIds) {
        cards = withCard(cards, id, { isFlipped: false, isShaking: false });
      }
      return { ...state, cards, selectedIds: [], phase: 'gameover' };
    }
    default:
      return state;
  }
}

export interface UseGameApi {
  state: GameState;
  flipCard: (cardId: number) => void;
  useHint: () => void;
  shuffleBoard: () => void;
  triggerTimeout: () => void;
}

export function useGame(config: GameConfig): UseGameApi {
  const [state, dispatch] = useReducer(reducer, config, buildInitial);

  useEffect(() => {
    if (state.phase === 'preview') {
      const timer = setTimeout(() => dispatch({ type: 'START' }), SCORING.PREVIEW_MS);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  useEffect(() => {
    if (state.phase === 'checking') {
      const timer = setTimeout(() => dispatch({ type: 'RESET_PAIR' }), SCORING.MISMATCH_WAIT_MS);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  useEffect(() => {
    if (state.phase === 'hinting') {
      const timer = setTimeout(() => dispatch({ type: 'HINT_DONE' }), SCORING.HINT_REVEAL_MS);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  const flipCard = useCallback((cardId: number) => dispatch({ type: 'FLIP', cardId }), []);
  const useHint = useCallback(() => dispatch({ type: 'HINT' }), []);
  const shuffleBoard = useCallback(() => dispatch({ type: 'SHUFFLE' }), []);
  const triggerTimeout = useCallback(() => dispatch({ type: 'TIMEOUT' }), []);

  return { state, flipCard, useHint, shuffleBoard, triggerTimeout };
}
