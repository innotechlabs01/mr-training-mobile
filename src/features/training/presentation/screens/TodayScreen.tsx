import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../infrastructure/api/client';
import { colors, spacing, typography, radius, fontFamilies } from '../../../../shared/theme/tokens';
import { Card } from '../../../../shared/components/ui/Card';
import { ProgressBar } from '../../../../shared/components/ui/ProgressBar';
import { Badge } from '../../../../shared/components/ui/Badge';
import { EmptyState } from '../../../../shared/components/ui/EmptyState';
import { AthleteTodaySummary } from './AthleteTodaySummary';
import { fetchAlerts, type Alert } from '../../../../infrastructure/notifications/push';
import type { AthleteTabParamList } from '../../../../navigation/AthleteTabs';
import type { RootStackParamList } from '../../../../navigation/Navigation';
import { BarbellIcon, HeartPulseIcon } from '../../../../shared/components/icons';

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

function toneForStatus(status: string): BadgeTone {
  const s = status.toLowerCase();
  if (s === 'completed' || s === 'confirmed' || s === 'active') return 'success';
  if (s === 'pending' || s === 'scheduled') return 'warning';
  return 'neutral';
}

// Inline small Users icon for Quick Access — group silhouette
function UsersIcon({ size = 20, color = colors.primary }: { size?: number; color?: string }) {
  return (
    <Text style={{ fontSize: size * 0.8, color, textAlign: 'center', lineHeight: size }}>👥</Text>
  );
}

function AppleIcon({ size = 20, color = colors.primary }: { size?: number; color?: string }) {
  return (
    <Text style={{ fontSize: size * 0.8, color, textAlign: 'center', lineHeight: size }}>🍎</Text>
  );
}

const MOCK_RECOMMENDATIONS = [
  { id: 'mock-1', contentName: 'Squat Exercise', modality: 'Strength', minutes: 12, kcal: 120 },
  { id: 'mock-2', contentName: 'Full Body Stretching', modality: 'Flexibility', minutes: 12, kcal: 120 },
];

const MOCK_ARTICLES = [
  { id: 'art-1', title: 'Supplement Guide...' },
  { id: 'art-2', title: '15 Quick & Effective Daily Routines...' },
];

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

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const hasData = !!data;
  const hasSessions = hasData && (data.todaySessions.length > 0 || data.activeWorkouts.length > 0);

  const [alerts, setAlerts] = useState<Alert[]>([]);
  useEffect(() => {
    fetchAlerts().then(setAlerts);
  }, []);

  const recommendations =
    data?.activeWorkouts && data.activeWorkouts.length > 0
      ? data.activeWorkouts.map((w) => ({
          id: w.id,
          contentName: w.contentName,
          modality: w.modality,
          minutes: 12,
          kcal: 120,
        }))
      : MOCK_RECOMMENDATIONS;

  const handleQuickAccess = (key: 'workout' | 'progress' | 'nutrition' | 'community') => {
    const parentNav = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
    switch (key) {
      case 'workout':
        parentNav?.navigate('Workouts');
        break;
      case 'progress':
        parentNav?.navigate('Progress');
        break;
      case 'nutrition':
        parentNav?.navigate('Nutrition');
        break;
      case 'community':
        (navigation as unknown as { navigate: (s: string) => void }).navigate('Events');
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: FitBody style — Hi, {name} */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerHi}>
              Hi, <Text style={styles.headerName}>{firstName}</Text>
            </Text>
            <Text style={styles.headerSubtitle}>It&apos;s time to challenge your limits.</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              accessibilityLabel="Search"
              onPress={() => navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('Search')}
              style={styles.iconButton}
            >
              <Text style={styles.iconButtonText}>🔍</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Notifications"
              onPress={() => navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('Notifications')}
              style={styles.iconButton}
            >
              <Text style={styles.iconButtonText}>🔔</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Profile"
              onPress={() => (navigation as unknown as { navigate: (s: string) => void }).navigate('Profile')}
              style={styles.iconButton}
            >
              <Text style={styles.iconButtonText}>👤</Text>
            </Pressable>
          </View>
        </View>

        {/* Quick Access Row — 4 cols with dividers */}
        <View style={styles.quickAccessRow}>
          <Pressable style={styles.quickItem} onPress={() => handleQuickAccess('workout')}>
            <View style={styles.quickIconCircle}>
              <BarbellIcon size={20} color={colors.primary} />
            </View>
            <Text style={styles.quickLabel}>Workout</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.quickItem} onPress={() => handleQuickAccess('progress')}>
            <View style={styles.quickIconCircle}>
              <HeartPulseIcon size={20} color={colors.primary} />
            </View>
            <Text style={styles.quickLabel}>Progress</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.quickItem} onPress={() => handleQuickAccess('nutrition')}>
            <View style={styles.quickIconCircle}>
              <AppleIcon size={18} color={colors.primary} />
            </View>
            <Text style={styles.quickLabel}>Nutrition</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.quickItem} onPress={() => handleQuickAccess('community')}>
            <View style={styles.quickIconCircle}>
              <UsersIcon size={18} color={colors.primary} />
            </View>
            <Text style={styles.quickLabel}>Community</Text>
          </Pressable>
        </View>

        {/* Athlete readiness — kept but after Quick Access, before Recommendations */}
        <AthleteTodaySummary athleteId={user?.id ?? ''} />

        {/* Alert banners */}
        {alerts.length > 0 && (
          <Card style={styles.alertCard}>
            {alerts.slice(0, 2).map((a, i) => (
              <View key={`${a.type}-${i}`} style={[styles.alertRow, i > 0 && styles.alertBorder]}>
                <Text
                  style={[
                    styles.alertIcon,
                    a.severity === 'high' ? styles.alertHigh : a.severity === 'medium' ? styles.alertMedium : styles.alertLow,
                  ]}
                >
                  {a.severity === 'high' ? '🔴' : a.severity === 'medium' ? '🟡' : '🔵'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertTitle}>{a.title}</Text>
                  <Text style={styles.alertMessage} numberOfLines={2}>
                    {a.message}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Recommendations Section — horizontal ScrollView */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            <Pressable onPress={() => (navigation as unknown as { navigate: (s: string) => void }).navigate('Plan')}>
              <Text style={styles.seeAll}>See All ›</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recoScrollContent}
          >
            {recommendations.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => {
                  if (item.id.startsWith('mock-')) {
                    console.log('Mock recommendation pressed', item.contentName);
                    return;
                  }
                  navigation
                    .getParent<NativeStackNavigationProp<RootStackParamList>>()
                    ?.navigate('WorkoutDetail', { workoutId: item.id });
                }}
                style={({ pressed }) => [styles.recoCard, pressed && { opacity: 0.85 }]}
              >
                <View style={styles.recoImagePlaceholder}>
                  <Text style={styles.recoImageText}>🏋️</Text>
                  {/* favorite star top-right */}
                  <View style={styles.recoStarBadge}>
                    <Text style={styles.recoStar}>★</Text>
                  </View>
                  {/* play overlay */}
                  <View style={styles.recoPlayBadge}>
                    <Text style={styles.recoPlay}>▶</Text>
                  </View>
                </View>
                <View style={styles.recoContent}>
                  <Text style={styles.recoTitle} numberOfLines={1}>
                    {item.contentName}
                  </Text>
                  <View style={styles.recoMetaRow}>
                    <Text style={styles.recoMeta}>◷ {item.minutes} Minutes</Text>
                    <Text style={styles.recoMeta}>🔥 {item.kcal} Kcal</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Weekly Challenge Card */}
        <Pressable
          onPress={() => console.log('Weekly Challenge pressed')}
          style={({ pressed }) => [styles.weeklyCard, pressed && { opacity: 0.9 }]}
        >
          <View style={styles.weeklyLeft}>
            <Text style={styles.weeklyEyebrow}>Weekly Challenge</Text>
            <Text style={styles.weeklyTitle}>Plank With Hip Twist</Text>
          </View>
          <View style={styles.weeklyImagePlaceholder}>
            <Text style={styles.weeklyImageEmoji}>🧘</Text>
          </View>
        </Pressable>

        {/* Articles & Tips Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Articles & Tips</Text>
          </View>
          <View style={styles.articlesGrid}>
            {MOCK_ARTICLES.map((art) => (
              <Pressable
                key={art.id}
                onPress={() => console.log('Article pressed', art.title)}
                style={({ pressed }) => [styles.articleCard, pressed && { opacity: 0.9 }]}
              >
                <View style={styles.articleImagePlaceholder}>
                  <Text style={styles.articleImageEmoji}>📰</Text>
                  <View style={styles.articleStarBadge}>
                    <Text style={styles.articleStar}>★</Text>
                  </View>
                </View>
                <Text style={styles.articleTitle} numberOfLines={2}>
                  {art.title}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Existing loading / empty / sessions — kept below new layout */}
        {isLoading ? (
          <EmptyState variant="loading" />
        ) : !hasData ? (
          <EmptyState variant="empty" message="No data yet" />
        ) : (
          <>
            {/* Active workouts detailed list was replaced by Recommendations horizontal; keep only if needed for progress */}
            {/* Keep today's sessions if any */}
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

            {/* Progress for active workouts (kept subtle) */}
            {data.activeWorkouts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionEyebrow}>ACTIVE PROGRESS</Text>
                  <Badge text={String(data.activeWorkouts.length)} tone="neutral" />
                </View>
                {data.activeWorkouts.map((w) => (
                  <Pressable
                    key={`prog-${w.id}`}
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

  // Header — FitBody style
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerLeft: { flex: 1, gap: 2 },
  headerHi: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.text,
  },
  headerName: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.primary,
  },
  headerSubtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2, fontSize: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 2 },
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
  iconButtonText: { fontSize: 14, color: colors.textSecondary },

  // Quick Access
  quickAccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  quickItem: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: spacing.xs },
  quickIconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: `${colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 10,
    lineHeight: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  divider: { width: StyleSheet.hairlineWidth, backgroundColor: colors.border, alignSelf: 'stretch', marginVertical: spacing.sm },

  // Section header
  section: { gap: spacing.md },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 16,
    lineHeight: 20,
    color: colors.primary,
  },
  seeAll: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Recommendations
  recoScrollContent: { gap: spacing.md, paddingRight: spacing.lg },
  recoCard: {
    width: 160,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  recoImagePlaceholder: {
    height: 80,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoImageText: { fontSize: 28 },
  recoStarBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoStar: { color: colors.primary, fontSize: 10, lineHeight: 12 },
  recoPlayBadge: {
    position: 'absolute',
    bottom: -10,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoPlay: { color: colors.text, fontSize: 10, marginLeft: 1 },
  recoContent: { padding: spacing.sm, paddingTop: spacing.md, gap: 4 },
  recoTitle: { fontFamily: fontFamilies.bodySemiBold, fontSize: 13, lineHeight: 16, color: colors.text },
  recoMetaRow: { flexDirection: 'row', gap: spacing.sm },
  recoMeta: { fontFamily: fontFamilies.bodyMedium, fontSize: 10, color: colors.textSecondary },

  // Weekly Challenge
  weeklyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  weeklyLeft: { flex: 1, gap: 4 },
  weeklyEyebrow: { fontFamily: fontFamilies.displayBold, fontSize: 16, lineHeight: 20, color: colors.primary },
  weeklyTitle: { fontFamily: fontFamilies.bodyMedium, fontSize: 12, lineHeight: 16, color: colors.textSecondary },
  weeklyImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyImageEmoji: { fontSize: 28 },

  // Articles & Tips
  articlesGrid: { flexDirection: 'row', gap: spacing.md },
  articleCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  articleImagePlaceholder: {
    height: 90,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleImageEmoji: { fontSize: 28 },
  articleStarBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleStar: { color: colors.warning, fontSize: 10, lineHeight: 12 },
  articleTitle: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.text,
    padding: spacing.sm,
  },

  // Legacy sections kept below
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
