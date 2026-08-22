import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../infrastructure/api/client';
import { colors, spacing, typography, radius } from '../../../../shared/theme/tokens';
import { Card } from '../../../../shared/components/ui/Card';
import { ProgressBar } from '../../../../shared/components/ui/ProgressBar';
import { Badge } from '../../../../shared/components/ui/Badge';
import { EmptyState } from '../../../../shared/components/ui/EmptyState';

type TodayData = {
  athlete: { id: string; name: string; sport: string };
  readiness: { sleep: number; hrv: number; recovery: number; score: number };
  todaySessions: Array<{ id: string; name: string; time: string; endTime: string; location: string; status: string }>;
  activeWorkouts: Array<{ id: string; contentName: string; modality: string; status: string; progress: number }>;
};

type BadgeTone = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

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
  if (score >= 80) return colors.success;
  if (score >= 60) return colors.warning;
  return colors.error;
}

function getScoreStatus(score: number): string {
  if (score >= 80) return 'Ready to Train';
  if (score >= 60) return 'Moderate';
  return 'Recovery Needed';
}

function toneForStatus(status: string): BadgeTone {
  const s = status.toLowerCase();
  if (s === 'completed' || s === 'confirmed' || s === 'active') return 'success';
  if (s === 'pending' || s === 'scheduled') return 'warning';
  return 'neutral';
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
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <Text style={styles.eyebrow}>ELITE PERFORMANCE</Text>
        <Text style={styles.greeting}>
          {getGreeting()}, {firstName}
        </Text>
        <Text style={styles.date}>{getFormattedDate()}</Text>

        {isLoading ? (
          <EmptyState variant="loading" />
        ) : !hasData ? (
          <EmptyState variant="empty" message="No data yet" />
        ) : (
          <>
            {/* Hero readiness card */}
            <Card style={styles.heroCard}>
              <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
                <Text style={[styles.scoreValue, { color: scoreColor }]}>{readiness?.score ?? '—'}</Text>
              </View>
              <View style={styles.heroMeta}>
                <Text style={styles.readinessLabel}>READINESS</Text>
                <Text style={[styles.readinessStatus, { color: scoreColor }]}>{getScoreStatus(score)}</Text>
                <Text style={styles.heroSubtext}>Based on sleep, HRV and recovery</Text>
              </View>
            </Card>

            {/* Metrics strip */}
            <Card style={styles.metricsStrip}>
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
            </Card>

            {/* Active workouts */}
            {data.activeWorkouts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionEyebrow}>ACTIVE WORKOUTS</Text>
                  <Badge text={String(data.activeWorkouts.length)} tone="neutral" />
                </View>
                {data.activeWorkouts.map((w) => (
                  <Card key={w.id} style={styles.sessionCard}>
                    <View style={styles.cardAccent} />
                    <View style={styles.sessionTop}>
                      <Text style={styles.sessionTitle} numberOfLines={1}>
                        {w.contentName}
                      </Text>
                      <Badge text={w.status} tone={toneForStatus(w.status)} />
                    </View>
                    <Text style={styles.sessionMeta}>{w.modality}</Text>
                    <ProgressBar progress={w.progress / 100} />
                    <Text style={styles.progressCaption}>{w.progress}% complete</Text>
                  </Card>
                ))}
              </View>
            )}

            {/* Today's sessions */}
            {data.todaySessions.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionEyebrow}>TODAY&apos;S SESSIONS</Text>
                  <Badge text={String(data.todaySessions.length)} tone="neutral" />
                </View>
                {data.todaySessions.map((s) => (
                  <Card key={s.id} style={styles.sessionCard}>
                    <View style={styles.cardAccent} />
                    <View style={styles.sessionTop}>
                      <Text style={styles.sessionTitle} numberOfLines={1}>
                        {s.name}
                      </Text>
                      <Badge text={s.status} tone={toneForStatus(s.status)} />
                    </View>
                    <Text style={styles.sessionMeta}>
                      {s.time} — {s.endTime}
                      {s.location ? ` · ${s.location}` : ''}
                    </Text>
                  </Card>
                ))}
              </View>
            )}

            {!hasSessions && <EmptyState variant="empty" message="No sessions today" />}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  content: { padding: spacing.lg, paddingBottom: 100 },
  eyebrow: { ...typography.label, color: colors.primary, marginBottom: spacing.sm },
  greeting: { ...typography.display, color: colors.text },
  date: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },

  heroCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  scoreValue: { fontSize: 32, fontWeight: '800', lineHeight: 32 },
  heroMeta: { flex: 1, gap: spacing.xs },
  readinessLabel: { ...typography.label, color: colors.textSecondary },
  readinessStatus: { fontSize: 15, fontWeight: '700', lineHeight: 20 },
  heroSubtext: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },

  metricsStrip: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  metricCol: { flex: 1, alignItems: 'center', gap: spacing.xs },
  metricValue: { fontSize: 17, fontWeight: '700', color: colors.primary },
  metricLabel: { fontSize: 11, fontWeight: '400', color: colors.textSecondary },
  verticalDivider: { width: 1, height: 28, backgroundColor: colors.border },

  section: { marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sectionEyebrow: { ...typography.label, color: colors.textSecondary },

  sessionCard: {
    position: 'relative',
    overflow: 'hidden',
    paddingLeft: spacing.lg,
    marginBottom: spacing.sm,
  },
  cardAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: colors.primary },
  sessionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  sessionTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text, lineHeight: 20 },
  sessionMeta: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },

  progressCaption: { fontSize: 11, fontWeight: '400', color: colors.textSecondary, marginTop: spacing.sm },
});
