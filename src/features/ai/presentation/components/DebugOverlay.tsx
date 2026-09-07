import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../../shared/theme/tokens';
import type { DebugInfo } from '../hooks/useAiWorkout';

interface Props {
  info: DebugInfo;
  visible: boolean;
}

function row(label: string, raw: number): string {
  return `${label}: ${Number.isFinite(raw) ? raw.toFixed(raw < 10 ? 1 : 0) : '—'}`;
}

export function DebugOverlay({ info, visible }: Props): React.JSX.Element | null {
  if (!visible) return null;
  return (
    <View pointerEvents="none" accessibilityRole="summary" accessibilityLabel="Debug overlay" style={styles.root}>
      <Text style={styles.text}>{row('FPS', info.fps)} · {row('AI', info.aiFps)}</Text>
      <Text style={styles.text}>model: {info.model}</Text>
      <Text style={styles.text}>phase: {info.phase}</Text>
      <Text style={styles.text}>{row('ROM', info.rom)}° · {row('vel', info.velocity)}°/s</Text>
      <Text style={styles.text}>{row('form', info.form)} · {row('failure', info.failure)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.md,
    padding: spacing.sm,
    backgroundColor: 'rgba(11, 15, 14, 0.8)',
    borderRadius: 6,
  },
  text: {
    color: colors.onSurfaceVariant,
    ...typography.bodySmall,
    fontVariant: ['tabular-nums'],
  },
});