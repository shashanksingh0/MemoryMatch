import React from 'react';
import Svg, { Circle, Polygon } from 'react-native-svg';

const STAR_POINTS =
  '50,22 57.35,39.89 76.63,41.35 61.89,53.86 66.46,72.65 50,62.5 33.54,72.65 38.11,53.86 23.37,41.35 42.65,39.89';

interface CoinIconProps {
  size: number;
}

export function CoinIcon({ size }: CoinIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx={50} cy={50} r={47} fill="#FBBF24" stroke="#D97706" strokeWidth={5} />
      <Circle cx={50} cy={50} r={36} fill="none" stroke="#F59E0B" strokeWidth={3.5} />
      <Polygon points={STAR_POINTS} fill="#FFF4D6" />
    </Svg>
  );
}
