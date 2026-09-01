import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography, fontFamilies } from '../../theme/tokens';
import { EmptyIcon } from '../icons/EmptyIcon';
import { ErrorIcon } from '../icons/ErrorIcon';

type Variant = 'loading' | 'error' | 'empty';

type Props = {
  variant: Variant;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  onRetry?: () => void;
};

const DEFAULT_CONTENT: Record<Variant, { title: string; message: string }> = {
  loading: { title: 'Loading…', message: '' },
  empty: { title: 'Nothing here yet', message: 'Pull to refresh or tap the action below to get started.' },
  error: { title: 'Something went wrong', message: 'Please check your connection and try again.' },
};

export function EmptyState({ variant, title, message, actionLabel, onAction, onRetry }: Props) {
  const buttonLabel = actionLabel ?? (onRetry ? 'Retry' : undefined);

  const content = DEFAULT_CONTENT[variant];
  const displayTitle = title ?? content.title;
  const displayMessage = message ?? content.message;

  return (
    <View style={styles.container} testID={`empty-state-${variant}`}>
      {variant === 'loading' ? (
          <View accessibilityLabel={displayTitle} style={{ alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator
              color={colors.primary}
              size="large"
            />
          </View>
      ) : (
        <View style={styles.illustration}>
          {variant === 'empty' && <EmptyIcon size={64} />}
          {variant === 'error' && <ErrorIcon size={64} />}
        </View>
      )}
      <Text style={styles.title}>{displayTitle}</Text>
      {displayMessage ? <Text style={styles.message}>{displayMessage}</Text> : null}
{buttonLabel && (onAction || onRetry) ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAction ?? onRetry}
            style={({ pressed }) => [
              styles.action,
              { backgroundColor: colors.primary },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.actionLabel}>{buttonLabel}</Text>
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
  illustration: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationText: { fontSize: 28 },
  title: { ...typography.h3, color: colors.text, textAlign: 'center' },
  message: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xs },
  action: {
    borderRadius: radius.md,
    minHeight: spacing.lg * 2,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  actionLabel: { ...typography.label, color: colors.base, textTransform: 'uppercase' },
  pressed: { opacity: 0.8 },
});
