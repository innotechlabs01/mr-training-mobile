import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
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

export function HistoryScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['athlete-workouts'],
    queryFn: async () => {
      const { data } = await apiClient.get('/athlete/workouts');
      return data.workouts as Workout[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={darkTheme.colors.primary} />}
      >
        <Text style={styles.title}>Training History</Text>

        {isLoading ? (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading workouts...</Text>
          </View>
        ) : !data || data.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>No workouts yet</Text>
            <Text style={styles.emptyText}>Your coach will assign workouts that will appear here.</Text>
          </View>
        ) : (
          data.map((w) => (
            <View key={w.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.workoutName}>{w.contentName}</Text>
                  <Text style={styles.workoutDate}>{w.startDate}</Text>
                </View>
                <View style={[styles.statusBadge, w.status === 'completed' && styles.statusCompleted]}>
                  <Text style={[styles.statusText, w.status === 'completed' && styles.statusTextCompleted]}>
                    {w.status === 'completed' ? '✓' : w.status}
                  </Text>
                </View>
              </View>
              <View style={styles.stats}>
                <View style={styles.focusBadge}>
                  <Text style={styles.focusText}>{w.modality}</Text>
                </View>
                {w.progress > 0 && (
                  <Text style={styles.statText}>{w.progress}% complete</Text>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: darkTheme.colors.background },
  content: { padding: 24, paddingBottom: 100 },
  title: { fontSize: 28, color: darkTheme.colors.text, fontWeight: '700', marginBottom: 24 },
  card: { backgroundColor: darkTheme.colors.surface, borderRadius: 16, padding: 24, marginBottom: 8, borderWidth: 1, borderColor: darkTheme.colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  workoutName: { fontSize: 16, color: darkTheme.colors.text, fontWeight: '600' },
  workoutDate: { fontSize: 12, color: darkTheme.colors.textSecondary, marginTop: 2 },
  statusBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: darkTheme.colors.border, justifyContent: 'center', alignItems: 'center' },
  statusCompleted: { backgroundColor: darkTheme.colors.success },
  statusText: { color: darkTheme.colors.textSecondary, fontSize: 10, fontWeight: '700' },
  statusTextCompleted: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statText: { fontSize: 13, color: darkTheme.colors.textSecondary },
  focusBadge: { backgroundColor: `${darkTheme.colors.primary}20`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  focusText: { fontSize: 12, color: darkTheme.colors.primary, fontWeight: '600' },
  loadingCard: { backgroundColor: darkTheme.colors.surface, borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: darkTheme.colors.border },
  loadingText: { fontSize: 15, color: darkTheme.colors.textSecondary },
  emptyCard: { backgroundColor: darkTheme.colors.surface, borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: darkTheme.colors.border },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, color: darkTheme.colors.text, fontWeight: '700', marginBottom: 8 },
  emptyText: { fontSize: 14, color: darkTheme.colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});
