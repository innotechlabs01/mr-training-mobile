import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../../theme/tokens';

export type IconProps = { size?: number; color?: string };
const S = 24;

export function HomeIcon({ size = S, color = colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 11 12 3l9 8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 10v10h14V10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 20v-6h6v6" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}

export function BarbellIcon({ size = S, color = colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="1" y="9" width="22" height="6" rx="2" stroke={color} strokeWidth={2} />
      <Rect x="5" y="6" width="2.5" height="12" rx="1" fill={color} />
      <Rect x="16.5" y="6" width="2.5" height="12" rx="1" fill={color} />
      <Rect x="9.5" y="16.5" width="5" height="3" rx="1" fill={color} />
    </Svg>
  );
}

export function HeartPulseIcon({ size = S, color = colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20.4 4.6a5.5 5.5 0 0 0-7.8 0L12 5.2l-.6-.6a5.5 5.5 0 1 0-7.8 7.8l.6.6L12 20.8l7.8-7.8.6-.6a5.5 5.5 0 0 0 0-7.8Z"
        stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      />
      <Path d="M3.5 12h4l2-3.5 3 6 2-2.5h5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CalendarIcon({ size = S, color = colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth={2} />
      <Path d="M3 9h18" stroke={color} strokeWidth={2} />
      <Circle cx="8" cy="14" r="1.2" fill={color} />
      <Circle cx="12" cy="14" r="1.2" fill={color} />
      <Circle cx="16" cy="14" r="1.2" fill={color} />
      <Path d="M8 3v4M16 3v4" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function UserIcon({ size = S, color = colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={2} />
      <Path d="M4 20c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function StoreIcon({ size = S, color = colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 7h16l-1.5 13h-13L4 7z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Path d="M8 7a4 4 0 0 1 8 0" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function MembershipIcon({ size = S, color = colors.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="6" width="20" height="13" rx="2" stroke={color} strokeWidth={2} />
      <Path d="M2 10h20" stroke={color} strokeWidth={2} />
      <Path d="M6 15h6" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
