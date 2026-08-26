import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, typography, fontFamilies } from '../../../../shared/theme/tokens';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type StatCard = {
  label: string;
  value: string;
  emoji: string;
};

const STATS: StatCard[] = [
  { label: 'Calories Burned', value: '2,450', emoji: '\uD83D\uDD25' },
  { label: 'Workouts Done', value: '12', emoji: '\uD83C\uDFCB' },
  { label: 'Streak Days', value: '7', emoji: '\u2B50' },
];

type ActivityItem = {
  id: string;
  day: string;
  date: string;
  steps: string;
  duration: string;
};

const ACTIVITIES: ActivityItem[] = [
  { id: '1', day: 'Thu', date: '14', steps: '3,679', duration: '1hr 40m' },
  { id: '2', day: 'Wen', date: '20', steps: '5,789', duration: '1hr 20m' },
  { id: '3', day: 'Sat', date: '22', steps: '1,859', duration: '1hr 10m' },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProgressScreen() {
  const navigation = useNavigation<Nav>();

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
        <Text style={styles.headerTitle}>Progress Tracking</Text>
        <View style={styles.headerRight}>
          <Pressable accessibilityLabel="Search" onPress={() => undefined} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>{'\uD83D\uDD0D'}</Text>
          </Pressable>
          <Pressable accessibilityLabel="Notifications" onPress={() => undefined} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>{'\uD83D\uDD14'}</Text>
          </Pressable>
          <Pressable accessibilityLabel="Profile" onPress={() => undefined} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>{'\uD83D\uDC64'}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats row */}
        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Chart placeholder */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Activity</Text>
          <View style={styles.chartPlaceholder}>
            {/* Simulated bar chart */}
            {[65, 80, 45, 90, 70, 55, 85].map((h, i) => (
              <View key={i} style={styles.barColumn}>
                <View style={[styles.bar, { height: `${h}%` }]} />
                <Text style={styles.barLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {ACTIVITIES.map((a) => (
            <View key={a.id} style={styles.activityCard}>
              <View style={styles.activityLeft}>
                <Text style={styles.activityDay}>{a.day}</Text>
                <Text style={styles.activityDate}>{a.date}</Text>
              </View>
              <View style={styles.activityDivider} />
              <View style={styles.activityCenter}>
                <Text style={styles.activityStepsLabel}>Steps</Text>
                <Text style={styles.activitySteps}>{a.steps}</Text>
              </View>
              <View style={styles.activityDivider} />
              <View style={styles.activityRight}>
                <Text style={styles.activityDurLabel}>Duration</Text>
                <Text style={styles.activityDur}>{a.duration}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: { fontSize: 14 },
  content: { padding: spacing.md, paddingBottom: 32, gap: spacing.md },

  // Stats
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 22,
    lineHeight: 26,
    color: colors.primary,
  },
  statLabel: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 10,
    lineHeight: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Chart
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
  },
  chartTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 16,
    lineHeight: 20,
    color: colors.text,
    marginBottom: spacing.md,
  },
  chartPlaceholder: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    paddingBottom: spacing.sm,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  bar: {
    width: 20,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
  },
  barLabel: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 10,
    color: colors.textSecondary,
  },

  // Section
  section: { gap: spacing.md },
  sectionTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 16,
    lineHeight: 20,
    color: colors.primary,
  },

  // Activity cards
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  activityLeft: { alignItems: 'center', minWidth: 40 },
  activityDay: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.text,
  },
  activityDate: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 22,
    lineHeight: 26,
    color: colors.primary,
  },
  activityDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  activityCenter: { flex: 1, alignItems: 'center' },
  activityStepsLabel: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 10,
    color: colors.textSecondary,
  },
  activitySteps: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 18,
    lineHeight: 22,
    color: colors.text,
  },
  activityRight: { flex: 1, alignItems: 'center' },
  activityDurLabel: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 10,
    color: colors.textSecondary,
  },
  activityDur: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 14,
    lineHeight: 18,
    color: colors.primary,
  },
});
