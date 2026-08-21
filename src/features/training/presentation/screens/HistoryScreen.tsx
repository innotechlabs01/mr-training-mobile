import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../infrastructure/api/client';
import { darkTheme } from '../../../../shared/theme';

type Workout = {
  id: string;
  contentName: string;
  contentType: string;
  modality: string;
  startDate: string;
  status: string;
  progress: number;
};

type Filter = 'all' | 'completed' | 'pending';

export function HistoryScreen() {
  const [filter, setFilter] = useState<Filter>('all');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['athlete-workouts'],
    queryFn: async () => {
      const { data } = await apiClient.get('/athlete/workouts');
      return data.workouts as Workout[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === 'all') return data;
    if (filter === 'completed') return data.filter((w) => w.status === 'completed');
    return data.filter((w) => w.status !== 'completed');
  }, [data, filter]);

  const isEmpty = !filtered || filtered.length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={darkTheme.colors.primary} />}
      >
        <Text style={styles.eyebrow}>TRAINING HISTORY</Text>
        <Text style={styles.title}>History</Text>

        {/* Segmented pills */}
        <View style={styles.segmentRow}>
          {(['all', 'completed', 'pending'] as Filter[]).map((f) => {
            const active = filter === f;
            const label = f === 'all' ? 'All' : f === 'completed' ? 'Completed' : 'Pending';
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.pill, active ? styles.pillActive : styles.pillInactive]}
              >
                <Text style={[styles.pillText, active ? styles.pillTextActive : styles.pillTextInactive]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {isLoading ? (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading workouts...</Text>
          </View>
        ) : !data || data.length === 0 || isEmpty ? (
          <View style={styles.emptyCenter}>
            <View style={styles.emptyCircle}>
              <Text style={styles.emptyDash}>—</Text>
            </View>
            <Text style={styles.emptyTitle}>{filter === 'all' ? 'No workouts yet' : `No ${filter} workouts`}</Text>
            <Text style={styles.emptyText}>Your coach will assign workouts that will appear here.</Text>
          </View>
        ) : (
          filtered.map((w) => {
            const completed = w.status === 'completed';
            const dotColor = completed ? darkTheme.colors.success : darkTheme.colors.warning;
            const statusColor = completed ? darkTheme.colors.success : darkTheme.colors.warning;
            return (
              <View key={w.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardLeft}>
                    <View style={styles.nameRow}>
                      <View style={[styles.dot, { backgroundColor: dotColor }]} />
                      <Text style={styles.workoutName} numberOfLines={1}>
                        {w.contentName}
                      </Text>
                    </View>
                    <Text style={styles.workoutDate}>{w.startDate}</Text>
                  </View>
                  <Text style={[styles.statusText, { color: statusColor }]}>{w.status}</Text>
                </View>

                {/* Bottom progress or check */}
                {completed ? (
                  <View style={styles.completedRow}>
                    <View style={styles.progressTrackBg}>
                      <View style={[styles.progressFill, { width: '100%', opacity: 0 }]} />
                    </View>
                    <View style={styles.checkCircle}>
                      <View style={styles.checkInner} />
                    </View>
                  </View>
                ) : (
                  <View style={styles.progressTrackBg}>
                    <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, w.progress))}%` }]} />
                  </View>
                )}
              </View>
            );
          })
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
    marginBottom: 6,
  },
  title: { fontSize: 28, color: darkTheme.colors.text, fontWeight: '700', lineHeight: 34, marginBottom: 20 },

  segmentRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  pill: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: `${darkTheme.colors.primary}1A`,
    borderColor: `${darkTheme.colors.primary}33`,
  },
  pillInactive: {
    backgroundColor: 'transparent',
    borderColor: darkTheme.colors.border,
  },
  pillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  pillTextActive: { color: darkTheme.colors.primary },
  pillTextInactive: { color: darkTheme.colors.textSecondary },

  card: {
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 },
  cardLeft: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  workoutName: { flex: 1, fontSize: 16, color: darkTheme.colors.text, fontWeight: '600', lineHeight: 20 },
  workoutDate: { fontSize: 12, color: darkTheme.colors.textSecondary, fontWeight: '400', marginLeft: 16 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize', marginTop: 2 },

  progressTrackBg: {
    height: 2,
    borderRadius: 1,
    backgroundColor: darkTheme.colors.border,
    overflow: 'hidden',
  },
  progressFill: { height: 2, borderRadius: 1, backgroundColor: darkTheme.colors.primary },
  completedRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: darkTheme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF', opacity: 0.9 },

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
  emptyText: {
    fontSize: 14,
    fontWeight: '400',
    color: darkTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
});
