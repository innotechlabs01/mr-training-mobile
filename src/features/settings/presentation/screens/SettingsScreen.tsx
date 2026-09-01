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
  description?: string;
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();

  const rows: SettingsRow[] = [
    {
      icon: '\uD83D\uDD14',
      label: 'Notification Setting',
      onPress: () => navigation.navigate('NotificationSettings'),
      description: 'Manage workout reminders and updates',
    },
    {
      icon: '\uD83D\uDD11',
      label: 'Password Setting',
      onPress: () => navigation.navigate('PasswordSettings'),
      description: 'Change your password or reset it',
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
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backChevron}>{'\u2039'}</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.content}>
        {rows.map((row) => (
          <Card style={styles.card} key={row.label}>
            <Pressable accessibilityRole="button" accessibilityLabel={row.label} onPress={row.onPress}>
              <View style={styles.row}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>{row.icon}</Text>
                </View>
                <Text style={styles.rowLabel}>{row.label}</Text>
              </View>
              {row.description && <Text style={styles.rowDescription}>{row.description}</Text>}
              <Text style={styles.chevron}>▶</Text>
            </Pressable>
          </Card>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: { color: colors.primary, fontSize: 32, lineHeight: 32, fontWeight: '400' },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamilies.displayBold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.primary,
  },
  content: { padding: spacing.md },
  card: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontSize: 14, color: colors.text, textAlign: 'center' },
  rowLabel: { flex: 1, ...typography.bodyStrong, color: colors.text },
  rowDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    marginTop: 2,
  },
  chevron: { fontSize: 20, color: colors.primary, fontWeight: '600' },
});