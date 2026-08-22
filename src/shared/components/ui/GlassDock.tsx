import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, fontFamilies, radius, spacing } from '../../theme/tokens';
import { BarbellIcon, CalendarIcon, HeartPulseIcon, HomeIcon, UserIcon } from '../icons';

const TAB_META: Record<string, { label: string; Icon: (p: { size: number; color: string }) => React.ReactElement }> = {
  Today: { label: 'Hoy', Icon: HomeIcon },
  Plan: { label: 'Plan', Icon: BarbellIcon },
  Events: { label: 'Eventos', Icon: CalendarIcon },
  Recovery: { label: 'Recovery', Icon: HeartPulseIcon },
  Profile: { label: 'Perfil', Icon: UserIcon },
};

/** Animated active-tab dot; exported so tests can assert exactly one is rendered. */
export function GlassDockIndicatorProto({ focused }: { focused: boolean }) {
  const opacity = useRef(new Animated.Value(focused ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: focused ? 1 : 0, duration: 200, useNativeDriver: true }).start();
  }, [focused, opacity]);
  return <Animated.View testID="glass-dock-active-dot" style={[styles.dot, { opacity }]} />;
}

export function GlassDock({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View testID="glass-dock" style={styles.dock}>
        {state.routes.map((route, idx) => {
          const meta = TAB_META[route.name] ?? { label: route.name, Icon: HomeIcon };
          const isFocused = idx === state.index;
          const label = descriptors[route.key]?.options?.tabBarLabel ?? meta.label;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name as never);
          };
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={String(label)}
            >
              <meta.Icon size={24} color={isFocused ? colors.primary : colors.textSecondary} />
              <Text style={[styles.label, isFocused && styles.labelFocused]}>{String(label)}</Text>
              <GlassDockIndicatorProto focused={isFocused} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, bottom: 22, zIndex: 10 },
  dock: {
    flexDirection: 'row',
    backgroundColor: 'rgba(17,18,20,0.92)',
    borderColor: `${colors.primary}40`,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.xl,
    height: 64,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 12,
  },
  tab: { flex: 1, height: 64, alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontFamily: fontFamilies.bodySemiBold, fontSize: 10, letterSpacing: 0.5, color: colors.textSecondary },
  labelFocused: { color: colors.primary },
  dot: { marginTop: 3, width: 5, height: 5, borderRadius: radius.full, backgroundColor: colors.primary },
});
