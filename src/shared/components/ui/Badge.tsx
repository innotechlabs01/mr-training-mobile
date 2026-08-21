import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type Tone = 'neutral' | 'success' | 'warning' | 'error' | 'primary';

const TONE_STYLES: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.surfaceRaised, fg: colors.textSecondary },
  success: { bg: `${colors.success}22`, fg: colors.success },
  warning: { bg: `${colors.warning}22`, fg: colors.warning },
  error: { bg: `${colors.error}22`, fg: colors.error },
  primary: { bg: `${colors.primary}22`, fg: colors.primary },
};

type Props = { text: string; tone?: Tone };

export function Badge({ text, tone = 'neutral' }: Props) {
  const { bg, fg } = TONE_STYLES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.xs,
  },
  text: { ...typography.label, color: colors.textSecondary },
});
