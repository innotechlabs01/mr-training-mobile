import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type Tone = 'neutral' | 'success' | 'warning' | 'error' | 'primary';

const TONE_STYLES: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.surfaceRaised, fg: colors.textSecondary },
  success: { bg: `${colors.success}22`, fg: colors.success },
  warning: { bg: `${colors.warning}22`, fg: colors.warning },
  error: { bg: `${colors.error}22`, fg: colors.error },
  primary: { bg: `${colors.primary}22`, fg: colors.primary },
};

type Props = {
  text: string;
  tone?: Tone;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  loading?: boolean;
  error?: boolean;
  empty?: boolean;
};

export function Badge({ text, tone = 'neutral', onPress, disabled = false, selected = false, loading = false, error = false, empty = false }: Props) {
  const { bg, fg } = TONE_STYLES[tone];
  const Component = onPress ? Pressable : View;

  return (
    <Component
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ disabled, selected, busy: loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.badge,
        { backgroundColor: bg },
        onPress && !disabled && !loading && pressed && styles.pressed,
        disabled && styles.disabled,
        selected && styles.selected,
        loading && styles.loading,
        error && styles.error,
        empty && styles.empty,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        <Text style={[styles.text, { color: fg }, disabled && styles.textDisabled, selected && styles.textSelected]}>{text}</Text>
      )}
    </Component>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + spacing.xs,
    paddingVertical: spacing.xs,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { ...typography.label },
  textDisabled: { opacity: 0.5 },
  textSelected: { color: colors.primary },
  pressed: { opacity: 0.8 },
  loading: { opacity: 0.6 },
  error: { backgroundColor: colors.error, opacity: 0.9 },
  empty: { backgroundColor: colors.surfaceRaised, opacity: 0.5 },
  disabled: { opacity: 0.6 },
  selected: { backgroundColor: `${colors.primary}22` },
});
