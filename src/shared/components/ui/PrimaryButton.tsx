import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

/** The single Volt CTA per screen (spec §3.1 rule). Dark text on Volt passes WCAG AA. */
export function PrimaryButton({ label, onPress, disabled = false }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        !disabled && pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    minHeight: spacing.lg * 2,
    paddingHorizontal: spacing.lg,
  },
  pressed: { backgroundColor: colors.primaryPressed },
  disabled: { backgroundColor: colors.surfaceRaised },
  label: { ...typography.bodyStrong, color: colors.base, textTransform: 'uppercase' },
  labelDisabled: { color: colors.textSecondary },
});
