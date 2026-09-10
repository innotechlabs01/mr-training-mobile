import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { spacing } from '../../theme/tokens';

type Props = {
  columns?: number;
  gap?: number;
  children: React.ReactNode;
  style?: ViewStyle;
};

/**
 * Flexible bento grid layout for dashboard tiles.
 * Children are wrapped in equal-width cells that wrap per row.
 */
export function BentoGrid({
  columns = 2,
  gap = spacing.md,
  children,
  style,
}: Props) {
  return (
    <View style={[styles.container, { gap }, style]}>
      {React.Children.map(children, (child) => (
        <View style={[styles.tile, { flex: 1 / columns }]}>{child}</View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tile: {
    minWidth: 0,
  },
});
