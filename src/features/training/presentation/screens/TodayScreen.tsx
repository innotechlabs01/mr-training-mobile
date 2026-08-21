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

export function TodayScreen() {
  const { user } = useUser();
  const firstName = user?.firstName || 'Athlete';

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['athlete-today'],
    queryFn: async () => {
      const { data } = await apiClient.get('/athlete/today');
      return data as TodayData;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const readiness = data?.readiness;
  const hasData = !!data;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={darkTheme.colors.primary} />}
      >
        <Text style={styles.greeting}>{getGreeting()}, {firstName}</Text>
        <Text style={styles.date}>Today — {getFormattedDate()}</Text>

        {isLoading ? (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading your data...</Text>
          </View>
        ) : !hasData ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptyText}>Your coach will assign workouts and track your progress here.</Text>
          </View>
        ) : (
          <>
            <View style={styles.readinessBar}>
              <View style={styles.readinessItem}>
                <Text style={styles.readinessValue}>{readiness?.score ?? '—'}</Text>
                <Text style={styles.readinessLabel}>Readiness</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.readinessItem}>
                <Text style={styles.readinessValue}>{readiness?.sleep ?? '—'}h</Text>
                <Text style={styles.readinessLabel}>Sleep</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.readinessItem}>
                <Text style={styles.readinessValue}>{readiness?.hrv ?? '—'}</Text>
                <Text style={styles.readinessLabel}>HRV</Text>
              </View>
            </View>

            {data.activeWorkouts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Workouts</Text>
                {data.activeWorkouts.map((w) => (
                  <View key={w.id} style={styles.workoutCard}>
                    <View style={styles.workoutHeader}>
                      <Text style={styles.workoutName}>{w.contentName}</Text>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{w.modality}</Text>
                      </View>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${w.progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{w.progress}% complete</Text>
                  </View>
                ))}
              </View>
            )}

            {data.todaySessions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Today&apos;s Sessions</Text>
                {data.todaySessions.map((s) => (
                  <View key={s.id} style={styles.sessionCard}>
                    <Text style={styles.sessionName}>{s.name}</Text>
                    <Text style={styles.sessionTime}>{s.time} — {s.endTime}</Text>
                    <Text style={styles.sessionLocation}>{s.location}</Text>
                  </View>
                ))}
              </View>
            )}

            {data.activeWorkouts.length === 0 && data.todaySessions.length === 0 && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyEmoji}>🏋️</Text>
                <Text style={styles.emptyTitle}>Rest day</Text>
                <Text style={styles.emptyText}>No workouts or sessions scheduled for today.</Text>
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
  greeting: { fontSize: 28, lineHeight: 34, color: darkTheme.colors.text, fontWeight: '700' },
  date: { fontSize: 13, color: darkTheme.colors.textSecondary, marginTop: 8, marginBottom: 24 },
  readinessBar: { flexDirection: 'row', backgroundColor: darkTheme.colors.surface, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: darkTheme.colors.border },
  readinessItem: { flex: 1, alignItems: 'center' },
  readinessValue: { fontSize: 20, color: darkTheme.colors.primary, fontWeight: '700' },
  readinessLabel: { fontSize: 12, color: darkTheme.colors.textSecondary, marginTop: 2 },
  divider: { width: 1, backgroundColor: darkTheme.colors.border },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 22, color: darkTheme.colors.text, fontWeight: '700', marginBottom: 16 },
  workoutCard: { backgroundColor: darkTheme.colors.surface, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: darkTheme.colors.border, marginBottom: 8 },
  workoutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  workoutName: { fontSize: 18, color: darkTheme.colors.text, fontWeight: '600' },
  badge: { backgroundColor: `${darkTheme.colors.primary}20`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, color: darkTheme.colors.primary, fontWeight: '600' },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: darkTheme.colors.border, marginBottom: 8 },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: darkTheme.colors.primary },
  progressText: { fontSize: 13, color: darkTheme.colors.textSecondary },
  sessionCard: { backgroundColor: darkTheme.colors.surface, borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: darkTheme.colors.border },
  sessionName: { fontSize: 16, color: darkTheme.colors.text, fontWeight: '600', marginBottom: 4 },
  sessionTime: { fontSize: 14, color: darkTheme.colors.primary, marginBottom: 2 },
  sessionLocation: { fontSize: 13, color: darkTheme.colors.textSecondary },
  loadingCard: { backgroundColor: darkTheme.colors.surface, borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: darkTheme.colors.border },
  loadingText: { fontSize: 15, color: darkTheme.colors.textSecondary },
  emptyCard: { backgroundColor: darkTheme.colors.surface, borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: darkTheme.colors.border },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, color: darkTheme.colors.text, fontWeight: '700', marginBottom: 8 },
  emptyText: { fontSize: 14, color: darkTheme.colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
