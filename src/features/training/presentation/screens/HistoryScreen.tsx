import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../infrastructure/api/client';
import { colors, spacing, typography, radius } from '../../../../shared/theme/tokens';
import { EmptyState } from '../../../../shared/components/ui/EmptyState';
import { ProgressBar } from '../../../../shared/components/ui/ProgressBar';
import { Card } from '../../../../shared/components/ui/Card';
import { Badge } from '../../../../shared/components/ui/Badge';
import type { AthleteTabParamList } from '../../../../navigation/AthleteTabs';
import type { RootStackParamList } from '../../../../navigation/Navigation';

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

type HistoryNav = CompositeNavigationProp<
  BottomTabNavigationProp<AthleteTabParamList, 'Plan'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type BadgeTone = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

function toneForStatus(status: string): BadgeTone {
  const s = status.toLowerCase();
  if (s === 'completed' || s === 'confirmed' || s === 'active') return 'success';
  if (s === 'pending' || s === 'scheduled') return 'warning';
  return 'neutral';
}

export function HistoryScreen() {
  const navigation = useNavigation<HistoryNav>();
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
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
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
          <EmptyState variant="loading" message="Loading workouts..." />
        ) : !data || data.length === 0 || isEmpty ? (
          <EmptyState variant="empty" />
        ) : (
          filtered.map((w) => {
            const completed = w.status === 'completed';
            const dotColor = completed ? colors.success : colors.warning;
            return (
              <Pressable
                key={w.id}
                onPress={() =>
                  navigation
                    .getParent<NativeStackNavigationProp<RootStackParamList>>()
                    ?.navigate('WorkoutDetail', { workoutId: w.id })
                }
                style={({ pressed }) => (pressed ? styles.pressed : undefined)}
              >
                <Card style={styles.card}>
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
                    <Badge text={w.status} tone={toneForStatus(w.status)} />
                  </View>

                  <ProgressBar progress={completed ? 1 : w.progress / 100} />
                </Card>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  content: { padding: spacing.lg, paddingBottom: 100 },
  eyebrow: { ...typography.label, color: colors.primary, marginBottom: spacing.sm },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.lg },

  segmentRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  pill: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: `${colors.primary}1A`,
    borderColor: `${colors.primary}33`,
  },
  pillInactive: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  pillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  pillTextActive: { color: colors.primary },
  pillTextInactive: { color: colors.textSecondary },

  card: { marginBottom: spacing.sm },
  pressed: { opacity: 0.8 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md },
  cardLeft: { flex: 1, gap: spacing.xs },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: radius.full },
  workoutName: { flex: 1, fontSize: 16, color: colors.text, fontWeight: '600', lineHeight: 20 },
  workoutDate: { fontSize: 12, color: colors.textSecondary, fontWeight: '400', marginLeft: spacing.md },
});
