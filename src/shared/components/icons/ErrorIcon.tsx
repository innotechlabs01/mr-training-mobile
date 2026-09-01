import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme/tokens';

type Props = { size?: number };

export const ErrorIcon: React.FC<Props> = ({ size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
    <Path d="M16 16 L48 48 M48 16 L16 48" stroke={colors.error} strokeWidth={4} strokeLinecap="round" />
  </Svg>
);
