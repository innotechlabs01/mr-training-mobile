import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../infrastructure/api/client';
import { colors, spacing, typography, radius } from '../../../../shared/theme/tokens';
import { Card } from '../../../../shared/components/ui/Card';
import { ProgressBar } from '../../../../shared/components/ui/ProgressBar';
import { Badge } from '../../../../shared/components/ui/Badge';
import { EmptyState } from '../../../../shared/components/ui/EmptyState';
import { AthleteTodaySummary } from './AthleteTodaySummary';
import { fetchAlerts, type Alert } from '../../../../infrastructure/notifications/push';
import type { AthleteTabParamList } from '../../../../navigation/AthleteTabs';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type TodayData = {
  athlete: { id: string; name: string; sport: string };
  readiness: { sleep: number; hrv: number; recovery: number; score: number };
  todaySessions: Array<{ id: string; name: string; time: string; endTime: string; location: string; status: string }>;
  activeWorkouts: Array<{ id: string; contentName: string; modality: string; status: string; progress: number }>;
};

type BadgeTone = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

type TodayNav = CompositeNavigationProp<
  BottomTabNavigationProp<AthleteTabParamList, 'Today'>,
  NativeStackNavigationProp<RootStackParamList>
>;

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

function toneForStatus(status: string): BadgeTone {
  const s = status.toLowerCase();
  if (s === 'completed' || s === 'confirmed' || s === 'active') return 'success';
  if (s === 'pending' || s === 'scheduled') return 'warning';
  return 'neutral';
}

export function TodayScreen() {
  const navigation = useNavigation<TodayNav>();
  const { user } = useUser();
  const firstName = user?.firstName || 'Athlete';

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['athlete-today'],
    queryFn: async () => {
      const { data } = await apiClient.get('/athlete/today');
      return data as TodayData;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Battery-friendly: refetch only when the tab regains focus (no background polling)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const hasData = !!data;
  const hasSessions = hasData && (data.todaySessions.length > 0 || data.activeWorkouts.length > 0);

  // Alerts (fetched once on mount)
  const [alerts, setAlerts] = useState<Alert[]>([]);
  useEffect(() => {
    fetchAlerts().then(setAlerts);
  }, []);

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

        {/* Single readiness source — AthleteTodaySummary already computes from health/metrics */}
        <AthleteTodaySummary athleteId={user?.id ?? ''} />

        {/* Alert banners */}
        {alerts.length > 0 && (
          <Card style={styles.alertCard}>
            {alerts.slice(0, 2).map((a, i) => (
              <View key={`${a.type}-${i}`} style={[styles.alertRow, i > 0 && styles.alertBorder]}>
                <Text style={[
                  styles.alertIcon,
                  a.severity === 'high' ? styles.alertHigh : a.severity === 'medium' ? styles.alertMedium : styles.alertLow,
                ]}>
                  {a.severity === 'high' ? '🔴' : a.severity === 'medium' ? '🟡' : '🔵'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertTitle}>{a.title}</Text>
                  <Text style={styles.alertMessage} numberOfLines={2}>{a.message}</Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {isLoading ? (
          <EmptyState variant="loading" />
        ) : !hasData ? (
          <EmptyState variant="empty" message="No data yet" />
        ) : (
          <>
            {/* Active workouts */}
            {data.activeWorkouts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionEyebrow}>ACTIVE WORKOUTS</Text>
                  <Badge text={String(data.activeWorkouts.length)} tone="neutral" />
                </View>
                {data.activeWorkouts.map((w) => (
                  <Pressable
                    key={w.id}
                    onPress={() =>
                      navigation
                        .getParent<NativeStackNavigationProp<RootStackParamList>>()
                        ?.navigate('WorkoutDetail', { workoutId: w.id })
                    }
                    style={({ pressed }) => (pressed ? styles.pressed : undefined)}
                  >
                    <Card style={styles.sessionCard}>
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
                  </Pressable>
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
  content: { padding: spacing.lg, paddingBottom: 120, gap: spacing.lg },
  eyebrow: { ...typography.label, color: colors.primary, marginBottom: spacing.sm },
  greeting: { ...typography.display, color: colors.text },
  date: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },

  section: { marginBottom: spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  sectionEyebrow: { ...typography.label, color: colors.textSecondary },

  sessionCard: {
    position: 'relative',
    overflow: 'hidden',
    paddingLeft: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
  },
  pressed: { opacity: 0.8 },
  cardAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: colors.primary },
  sessionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  sessionTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.text, lineHeight: 20 },
  sessionMeta: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xs },

  progressCaption: { fontSize: 11, fontWeight: '400', color: colors.textSecondary, marginTop: spacing.sm },

  alertCard: { padding: 0, overflow: 'hidden', borderRadius: radius.lg, marginBottom: spacing.md },
  alertRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md },
  alertBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  alertIcon: { fontSize: 18, marginTop: 2 },
  alertHigh: {},
  alertMedium: {},
  alertLow: {},
  alertTitle: { ...typography.bodyStrong, color: colors.text, fontSize: 13 },
  alertMessage: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
});
