import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../../theme/tokens';

type Props = {
  /** 0..1 */
  progress: number;
};

export function ProgressBar({ progress }: Props) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={styles.track}
    >
      <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.full,
    height: 8,
    overflow: 'hidden',
  },
  fill: { backgroundColor: colors.primary, borderRadius: radius.full, height: '100%' },
});
