import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, layout, radius, shadows } from '../../theme/tokens';

/** Surface container. Depth comes from tonal layering over Base, plus a hairline. */
export function Card({ style, children, ...rest }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: layout.cardPadding,
    ...shadows.sm,
  },
});
