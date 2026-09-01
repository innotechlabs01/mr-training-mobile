import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../theme/tokens';

type Props = { size?: number };

export const EmptyIcon: React.FC<Props> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Circle cx={32} cy={32} r={30} stroke={colors.textSecondary} strokeWidth={2} />
  </Svg>
);
