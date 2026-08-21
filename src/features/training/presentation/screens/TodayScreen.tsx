import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../infrastructure/api/client';
import { darkTheme } from '../../../../shared/theme';

type TodayData = {
  athlete: { id: string; name: string; sport: string };
  readiness: { sleep: number; hrv: number; recovery: number; score: number };
  todaySessions: Array<{ id: string; name: string; time: string; endTime: string; location: string; status: string }>;
  activeWorkouts: Array<{ id: string; contentName: string; modality: string; status: string; progress: number }>;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  return now.toLocaleDateString('en-US', options);
}

function getScoreColor(score: number): string {
  if (score >= 80) return darkTheme.colors.success;
  if (score >= 60) return darkTheme.colors.warning;
  return darkTheme.colors.destructive;
}

function getScoreStatus(score: number): string {
  if (score >= 80) return 'Ready to Train';
  if (score >= 60) return 'Moderate';
  return 'Recovery Needed';
}

function getStatusDotColor(status: string): string {
  const s = status.toLowerCase();
  if (s === 'completed' || s === 'confirmed' || s === 'active') return darkTheme.colors.success;
  if (s === 'pending' || s === 'scheduled') return darkTheme.colors.warning;
  return darkTheme.colors.textSecondary;
}

export function TodayScreen() {
  const { user } = useUser();
  const firstName = user?.firstName || 'Athlete';

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['athlete-today'],
    queryFn: async () => {
      const { data } = await apiClient.get('/athlete/today');
      return data as TodayData;
    },
    staleTime: 2 * 60 * 1000,
  });

  const readiness = data?.readiness;
  const score = readiness?.score ?? 0;
  const scoreColor = getScoreColor(score);
  const hasData = !!data;
  const hasSessions = hasData && (data.todaySessions.length > 0 || data.activeWorkouts.length > 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={darkTheme.colors.primary} />}
      >
        <Text style={styles.eyebrow}>ELITE PERFORMANCE</Text>
        <Text style={styles.greeting}>
          {getGreeting()}, {firstName}
        </Text>
        <Text style={styles.date}>{getFormattedDate()}</Text>

        {isLoading ? (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading your data...</Text>
          </View>
        ) : !hasData ? (
          <View style={styles.emptyCenter}>
            <View style={styles.emptyCircle}>
              <Text style={styles.emptyDash}>—</Text>
            </View>
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptyText}>Your coach will assign workouts and track your progress here.</Text>
          </View>
        ) : (
          <>
            {/* Hero readiness card */}
            <View style={styles.heroCard}>
              <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
                <Text style={[styles.scoreValue, { color: scoreColor }]}>{readiness?.score ?? '—'}</Text>
              </View>
              <View style={styles.heroMeta}>
                <Text style={styles.readinessLabel}>READINESS</Text>
                <Text style={[styles.readinessStatus, { color: scoreColor }]}>{getScoreStatus(score)}</Text>
                <Text style={styles.heroSubtext}>Based on sleep, HRV and recovery</Text>
              </View>
            </View>

            {/* Metrics strip */}
            <View style={styles.metricsStrip}>
              <View style={styles.metricCol}>
                <Text style={styles.metricValue}>{readiness?.sleep != null ? `${readiness.sleep}h` : '—'}</Text>
                <Text style={styles.metricLabel}>Sleep</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.metricCol}>
                <Text style={styles.metricValue}>{readiness?.hrv != null ? `${readiness.hrv}` : '—'}</Text>
                <Text style={styles.metricLabel}>HRV</Text>
              </View>
              <View style={styles.verticalDivider} />
              <View style={styles.metricCol}>
                <Text style={styles.metricValue}>{readiness?.recovery != null ? `${readiness.recovery}%` : '—'}</Text>
                <Text style={styles.metricLabel}>Recovery</Text>
              </View>
            </View>

            {/* Active workouts */}
            {data.activeWorkouts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionEyebrow}>ACTIVE WORKOUTS</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{data.activeWorkouts.length}</Text>
                  </View>
                </View>
                {data.activeWorkouts.map((w) => (
                  <View key={w.id} style={styles.sessionCard}>
                    <View style={styles.cardAccent} />
                    <View style={styles.sessionTop}>
                      <Text style={styles.sessionTitle} numberOfLines={1}>
                        {w.contentName}
                      </Text>
                      <View style={styles.statusPill}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusDotColor(w.status) }]} />
                        <Text style={styles.statusText}>{w.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.sessionMeta}>{w.modality}</Text>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, w.progress))}%` }]} />
                    </View>
                    <Text style={styles.progressCaption}>{w.progress}% complete</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Today's sessions */}
            {data.todaySessions.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionEyebrow}>TODAY&apos;S SESSIONS</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{data.todaySessions.length}</Text>
                  </View>
                </View>
                {data.todaySessions.map((s) => (
                  <View key={s.id} style={styles.sessionCard}>
                    <View style={styles.cardAccent} />
                    <View style={styles.sessionTop}>
                      <Text style={styles.sessionTitle} numberOfLines={1}>
                        {s.name}
                      </Text>
                      <View style={styles.statusPill}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusDotColor(s.status) }]} />
                        <Text style={styles.statusText}>{s.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.sessionMeta}>
                      {s.time} — {s.endTime}
                      {s.location ? ` · ${s.location}` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {!hasSessions && (
              <View style={styles.emptyCenter}>
                <View style={styles.emptyCircle}>
                  <Text style={styles.emptyDash}>—</Text>
                </View>
                <Text style={styles.emptyTitle}>No sessions today</Text>
                <Text style={styles.emptyText}>Enjoy your recovery — check back tomorrow.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: darkTheme.colors.background },
  content: { padding: 24, paddingBottom: 100 },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    color: darkTheme.colors.primary,
    marginBottom: 8,
  },
  greeting: { fontSize: 28, lineHeight: 34, color: darkTheme.colors.text, fontWeight: '700' },
  date: { fontSize: 13, fontWeight: '400', color: darkTheme.colors.textSecondary, marginTop: 6, marginBottom: 24 },

  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    padding: 20,
    marginBottom: 16,
    gap: 16,
  },
  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${darkTheme.colors.surface}`,
  },
  scoreValue: { fontSize: 32, fontWeight: '800', lineHeight: 32 },
  heroMeta: { flex: 1, gap: 2 },
  readinessLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1.5, color: darkTheme.colors.textSecondary },
  readinessStatus: { fontSize: 15, fontWeight: '700', lineHeight: 20 },
  heroSubtext: { fontSize: 12, fontWeight: '400', color: darkTheme.colors.textSecondary, marginTop: 2 },

  metricsStrip: {
    flexDirection: 'row',
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  metricCol: { flex: 1, alignItems: 'center', gap: 2 },
  metricValue: { fontSize: 17, fontWeight: '700', color: darkTheme.colors.primary },
  metricLabel: { fontSize: 11, fontWeight: '400', color: darkTheme.colors.textSecondary },
  verticalDivider: { width: 1, height: 28, backgroundColor: darkTheme.colors.border },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionEyebrow: { fontSize: 11, fontWeight: '600', letterSpacing: 1.2, color: darkTheme.colors.textSecondary },
  countBadge: {
    backgroundColor: darkTheme.colors.surface,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  countBadgeText: { fontSize: 10, fontWeight: '600', color: darkTheme.colors.textSecondary },

  sessionCard: {
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    padding: 16,
    paddingLeft: 20,
    marginBottom: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: darkTheme.colors.primary,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  sessionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 6 },
  sessionTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: darkTheme.colors.text, lineHeight: 20 },
  sessionMeta: { fontSize: 13, fontWeight: '400', color: darkTheme.colors.textSecondary, marginBottom: 4 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${darkTheme.colors.border}33`,
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: `${darkTheme.colors.border}66`,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600', color: darkTheme.colors.textSecondary, textTransform: 'capitalize' },

  progressTrack: {
    height: 2,
    borderRadius: 1,
    backgroundColor: darkTheme.colors.border,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: { height: 2, borderRadius: 1, backgroundColor: darkTheme.colors.primary },
  progressCaption: { fontSize: 11, fontWeight: '400', color: darkTheme.colors.textSecondary, marginTop: 6 },

  loadingCard: {
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
  },
  loadingText: { fontSize: 15, fontWeight: '600', color: darkTheme.colors.textSecondary },

  emptyCenter: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  emptyCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: darkTheme.colors.surface,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDash: { fontSize: 24, fontWeight: '400', color: darkTheme.colors.textSecondary, lineHeight: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: darkTheme.colors.text, marginTop: 4 },
  emptyText: { fontSize: 14, fontWeight: '400', color: darkTheme.colors.textSecondary, textAlign: 'center', lineHeight: 20, paddingHorizontal: 24 },
});
