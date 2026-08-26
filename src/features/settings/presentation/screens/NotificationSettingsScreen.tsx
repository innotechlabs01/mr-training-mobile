import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, typography, fontFamilies } from '../../../../shared/theme/tokens';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type NotificationType = {
  key: string;
  icon: string;
  label: string;
};

const NOTIFICATION_TYPES: NotificationType[] = [
  { key: 'workoutReminders', icon: '\uD83D\uDCAA', label: 'Workout Reminders' },
  { key: 'weeklyChallenges', icon: '\uD83C\uDFC6', label: 'Weekly Challenges' },
  { key: 'newArticles', icon: '\uD83D\uDCC4', label: 'New Articles' },
  { key: 'communityUpdates', icon: '\uD83D\uDC65', label: 'Community Updates' },
  { key: 'progressReports', icon: '\uD83D\uDCCA', label: 'Progress Reports' },
];

export function NotificationSettingsScreen() {
  const navigation = useNavigation<Nav>();

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    workoutReminders: true,
    weeklyChallenges: true,
    newArticles: false,
    communityUpdates: true,
    progressReports: false,
  });

  const handleToggle = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Toggle rows */}
      <View style={styles.bodyWrap}>
        {NOTIFICATION_TYPES.map((item) => (
          <View key={item.key} style={styles.row}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Switch
              value={toggles[item.key]}
              onValueChange={() => handleToggle(item.key)}
              trackColor={{ true: colors.primary, false: colors.surfaceRaised }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={colors.surfaceRaised}
            />
          </View>
        ))}
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
  bodyWrap: { padding: spacing.md, gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
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
});
