import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import type { CardModel } from '../types/game';
import type { GamePhase } from '../hooks/useGame';
import { MemoryCard } from './MemoryCard';

interface GameBoardProps {
  cards: CardModel[];
  phase: GamePhase;
  cardBackColor: string;
  accent: string;
  textScale: number;
  onPress: (cardId: number) => void;
}

const COLUMN_COUNTS: Record<number, number> = { 8: 4, 12: 4, 16: 4, 24: 6 };

const GAP = 10;
const MIN_CARD_SIZE = 44;

function columnsFor(cardCount: number): number {
  return COLUMN_COUNTS[cardCount] ?? 4;
}

export function GameBoard({ cards, phase, cardBackColor, accent, textScale, onPress }: GameBoardProps) {
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const columns = columnsFor(cards.length);
  const rows = Math.ceil(cards.length / columns);

  const cardSize = useMemo(() => {
    if (layout.width <= 0 || layout.height <= 0) {
      return MIN_CARD_SIZE;
    }
    const byWidth = (layout.width - GAP * (columns - 1)) / columns;
    const byHeight = (layout.height - GAP * (rows - 1)) / rows;
    return Math.max(MIN_CARD_SIZE, Math.min(byWidth, byHeight));
  }, [layout, columns, rows]);

  const disabled = phase !== 'playing';

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  }, []);

  return (
    <View style={styles.board} onLayout={handleLayout}>
      <View style={styles.grid}>
        {cards.map((card) => (
          <MemoryCard
            key={card.id}
            card={card}
            size={cardSize}
            disabled={disabled}
            cardBackColor={cardBackColor}
            accent={accent}
            textScale={textScale}
            onPress={onPress}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignContent: 'center',
    gap: GAP,
  },
});
