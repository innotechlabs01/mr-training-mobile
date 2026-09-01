import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
};

/** The single Volt CTA per screen (brand §4.2 rule). Dark text on Volt passes WCAG AA. */
export function PrimaryButton({ label, onPress, disabled = false, loading = false, error = false }: Props) {
  const isActive = disabled || loading || error;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isActive, busy: loading }}
      accessibilityLabel={label}
      disabled={isActive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        error && styles.error,
        !isActive && pressed && styles.pressed,
        isActive && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          testID="primary-button-spinner"
          color={colors.base}
          size="small"
        />
      ) : (
        <Text style={[styles.label, isActive && styles.labelDisabled, error && styles.labelError]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    minHeight: spacing.lg * 2,
    paddingHorizontal: spacing.lg,
  },
  pressed: { backgroundColor: colors.primaryPressed },
  disabled: { backgroundColor: colors.surfaceRaised },
  error: { backgroundColor: colors.error },
  label: { ...typography.label, color: colors.base, textTransform: 'uppercase' },
  labelDisabled: { color: colors.textSecondary },
  labelError: { color: colors.base },
});
