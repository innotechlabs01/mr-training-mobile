import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, typography, fontFamilies } from '../../../../shared/theme/tokens';
import { Card } from '../../../../shared/components/ui/Card';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type SettingsRow = {
  icon: string;
  label: string;
  onPress: () => void;
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();

  const rows: SettingsRow[] = [
    {
      icon: '\uD83D\uDD14',
      label: 'Notification Setting',
      onPress: () => Alert.alert('Notifications', 'Coming soon'),
    },
    {
      icon: '\uD83D\uDD11',
      label: 'Password Setting',
      onPress: () => Alert.alert('Password', 'Coming soon'),
    },
    {
      icon: '\uD83D\uDC64',
      label: 'Delete Account',
      onPress: () =>
        Alert.alert('Delete Account', 'Are you sure? This cannot be undone.', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => Alert.alert('Account deleted', 'Account deletion is not yet implemented.'),
          },
        ]),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.backButton}
        >
          <Text style={styles.backChevron}>{'\u2039'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Rows card */}
      <View style={styles.bodyWrap}>
        <Card style={styles.card}>
          {rows.map((row, i) => (
            <React.Fragment key={row.label}>
              <Pressable
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                onPress={row.onPress}
                accessibilityRole="button"
                accessibilityLabel={row.label}
              >
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>{row.icon}</Text>
                </View>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.chevron}>{'\u25B8'}</Text>
              </Pressable>
              {i < rows.length - 1 && <View style={styles.separator} />}
            </React.Fragment>
          ))}
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: { color: colors.primary, fontSize: 32, lineHeight: 32, fontWeight: '400' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamilies.displayBold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.primary,
  },
  headerSpacer: { width: 32 },
  bodyWrap: { padding: spacing.md },
  card: { padding: 0, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontSize: 14, color: '#FFFFFF', textAlign: 'center' },
  rowLabel: { flex: 1, ...typography.bodyStrong, color: colors.text },
  chevron: { fontSize: 20, color: colors.primary, fontWeight: '600' },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: 48 + spacing.md },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});
