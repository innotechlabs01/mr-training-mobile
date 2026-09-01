import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../infrastructure/api/client';
import { colors, spacing, radius, typography, fontFamilies } from '../../../../shared/theme/tokens';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type TodayData = {
  readiness: { sleep: number; hrv: number; recovery: number; score: number };
  todaySessions: Array<{ id: string; name: string; time: string; endTime: string; location: string; status: string }>;
  activeWorkouts: Array<{ id: string; contentName: string; modality: string; status: string; progress: number }>;
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProgressScreen() {
  const navigation = useNavigation<Nav>();

  const { data: today, isLoading: todayLoading } = useQuery({
    queryKey: ['athlete-today'],
    queryFn: async () => {
      const { data } = await apiClient.get('/athletes/today');
      return data as TodayData;
    },
    staleTime: 60_000,
  });

  const stats = [
    { label: 'Calories Burned', value: today ? String((today.activeWorkouts?.length ?? 0) * 300) : '-', emoji: '\uD83D\uDD25' },
    { label: 'Workouts Done', value: today ? String(today.activeWorkouts?.length ?? 0) : '-', emoji: '\uD83C\uDFCB\uFE0F' },
    { label: 'Readiness', value: today?.readiness?.score != null ? String(today.readiness.score) : '-', emoji: '\u2B50' },
  ];

  const activities = (today?.todaySessions ?? []).map((s, i) => ({
    id: s.id,
    day: s.time?.slice(0, 3) ?? '-',
    date: String(i + 1),
    steps: s.name,
    duration: s.status,
  }));

  const barData = today?.activeWorkouts
    ? today.activeWorkouts.slice(0, 7).map(() => 40 + Math.floor(Math.random() * 55))
    : [65, 80, 45, 90, 70, 55, 85];
  const barLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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
        {todayLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* Stats row */}
            <View style={styles.statsRow}>
              {stats.map((s) => (
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
                {barData.map((h, i) => (
                  <View key={i} style={styles.barColumn}>
                    <View style={[styles.bar, { height: `${h}%` }]} />
                    <Text style={styles.barLabel}>{barLabels[i % 7]}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Recent Activity */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {activities.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>No sessions yet</Text>
                  <Text style={styles.emptySub}>Your upcoming sessions will appear here.</Text>
                </View>
              ) : (
                activities.map((a) => (
                  <View key={a.id} style={styles.activityCard}>
                    <View style={styles.activityLeft}>
                      <Text style={styles.activityDay}>{a.day}</Text>
                      <Text style={styles.activityDate}>{a.date}</Text>
                    </View>
                    <View style={styles.activityDivider} />
                    <View style={styles.activityCenter}>
                      <Text style={styles.activityStepsLabel}>Session</Text>
                      <Text style={styles.activitySteps}>{a.steps}</Text>
                    </View>
                    <View style={styles.activityDivider} />
                    <View style={styles.activityRight}>
                      <Text style={styles.activityDurLabel}>Status</Text>
                      <Text style={styles.activityDur}>{a.duration}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
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
  loadingWrap: { alignItems: 'center', paddingVertical: spacing.xl * 2 },

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
  emptyWrap: { alignItems: 'center', paddingVertical: spacing.xl, gap: 4 },
  emptyText: { fontFamily: fontFamilies.bodySemiBold, fontSize: 14, color: colors.text },
  emptySub: { ...typography.caption, color: colors.textSecondary },
});
