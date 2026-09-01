import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, layout, typography } from '../../theme/tokens';

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: React.ReactNode;
  loading?: boolean;
};

export function ScreenHeader({ title, subtitle, onBack, action, loading = false }: Props) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <View style={styles.backContainer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
            hitSlop={12}
            disabled={loading}
            style={({ pressed }) => [
              styles.backPressable,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.back}>‹</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.titles}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ?? null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: layout.headerHeight,
    gap: 8,
  },
  titles: { flex: 1 },
  back: { color: colors.primary, fontSize: 32, lineHeight: 36 },
  backContainer: { minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' },
  backPressable: {},
  pressed: { opacity: 0.8 },
  title: { ...typography.h3, color: colors.text },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
