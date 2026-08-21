import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type Variant = 'loading' | 'error' | 'empty';

type Props = {
  variant: Variant;
  message?: string;
  onRetry?: () => void;
};

const DEFAULT_MESSAGES: Record<Variant, string> = {
  loading: 'Loading…',
  empty: 'Nothing here yet',
  error: 'Something went wrong',
};

export function EmptyState({ variant, message, onRetry }: Props) {
  const text = message ?? DEFAULT_MESSAGES[variant];
  return (
    <View style={styles.container}>
      {variant === 'loading' ? (
        <ActivityIndicator
          testID="empty-state-loading"
          color={colors.primary}
          size="large"
          accessibilityLabel={text}
        />
      ) : null}
      <Text style={styles.message}>{text}</Text>
      {variant === 'error' && onRetry ? (
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}>
          <Text style={styles.retryLabel}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  message: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  retry: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    minHeight: spacing.lg * 2,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryLabel: { ...typography.bodyStrong, color: colors.primary, textTransform: 'uppercase' },
});
