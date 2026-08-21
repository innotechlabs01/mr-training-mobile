import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type Props = TextInputProps & { error?: string };

export function Input({ error, style, ...rest }: Props) {
  return (
    <View>
      <TextInput
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.text,
    minHeight: spacing.lg * 2,
    paddingHorizontal: spacing.md,
    ...typography.body,
  },
  inputError: { borderColor: colors.error },
  error: { ...typography.caption, color: colors.error, marginTop: spacing.xs },
});
