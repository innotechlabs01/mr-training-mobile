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
import { listAlerts, type Alert } from '../../../../features/alerts/alertService';
import { listMessages, type CommunityMessage } from '../../../../features/community/communityService';
import { listBlogPosts, type BlogPost } from '../../../../features/blog/blogService';
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
      const { data } = await apiClient.get('/athletes/today');
      return data as TodayData;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  // Most recent community chat message — real data, graceful empty on failure.
  const { data: chatMessages = [] } = useQuery({
    queryKey: ['community-messages-preview'],
    queryFn: () => listMessages().catch((): CommunityMessage[] => []),
    staleTime: 60 * 1000,
  });

  // Real blog articles — graceful empty on failure (endpoint returns snake_case created_at;
  // only title is safe to render, so createdAt is intentionally not shown).
  const { data: blogPosts = [] } = useQuery({
    queryKey: ['blog-preview'],
    queryFn: () => listBlogPosts().catch((): BlogPost[] => []),
    staleTime: 60 * 1000,
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
    listAlerts().then(setAlerts).catch(() => setAlerts([]));
  }, []);

  const latestChatMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1] : null;
  const displayedArticles = blogPosts.slice(0, 3);

  const goDiscussionForum = () =>
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('DiscussionForum');

  const goArticles = () =>
    navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('Articles');

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

        {/* Athlete readiness / recovery summary */}
        <AthleteTodaySummary athleteId={user?.id ?? ''} />

        {/* Loading / empty / sessions + active workouts */}
        {isLoading ? (
          <EmptyState variant="loading" />
        ) : !hasData ? (
          <EmptyState variant="empty" message="No data yet" />
        ) : (
          <>
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

            {/* Continue training — active workouts */}
            {data.activeWorkouts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionEyebrow}>CONTINUE TRAINING</Text>
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
                        <Badge text={w.modality} tone="primary" />
                      </View>
                      <Text style={styles.sessionMeta}>{w.status}</Text>
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

        {/* Community Chat — real preview of the community thread */}
        <Card onPress={goDiscussionForum} style={styles.chatCard}>
          <View style={styles.chatTopRow}>
            <View style={styles.chatAccentDot} />
            <Text style={styles.chatLabel}>Comunidad</Text>
            <Text style={styles.chatAffordance}>Ver chat</Text>
          </View>
          {latestChatMessage ? (
            <>
              <Text style={styles.chatSender} numberOfLines={1}>
                {latestChatMessage.userName}
              </Text>
              <Text style={styles.chatMessage} numberOfLines={1}>
                {latestChatMessage.message}
              </Text>
            </>
          ) : (
            <Text style={styles.chatEmpty}>No messages yet</Text>
          )}
        </Card>

        {/* Articles — real professional info */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Artículos</Text>
            {displayedArticles.length > 0 && (
              <Pressable onPress={goArticles}>
                <Text style={styles.seeAll}>Ver todos ›</Text>
              </Pressable>
            )}
          </View>
          {displayedArticles.length > 0 ? (
            <View style={styles.articlesList}>
              {displayedArticles.map((post) => (
                <Card key={post.id} onPress={goArticles} style={styles.articleRowCard}>
                  <View style={styles.cardAccent} />
                  <Text style={styles.articleRowTitle} numberOfLines={2}>
                    {post.title}
                  </Text>
                </Card>
              ))}
            </View>
          ) : (
            <EmptyState variant="empty" message="No articles yet" />
          )}
        </View>

        {/* Alert banners */}
        {alerts.length > 0 && (
          <Card style={styles.alertCard}>
            {alerts.slice(0, 2).map((a, i) => (
              <View key={`${a.id ?? a.type}-${i}`} style={[styles.alertRow, i > 0 && styles.alertBorder]}>
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

  // Legacy sections (sessions / active workouts)
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

  // Community chat preview
  chatCard: { position: 'relative', overflow: 'hidden', paddingLeft: spacing.lg },
  chatTopRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chatAccentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  chatLabel: { ...typography.overline, color: colors.primary, flex: 1 },
  chatAffordance: { fontFamily: fontFamilies.bodyMedium, fontSize: 12, color: colors.textSecondary },
  chatSender: { ...typography.bodyStrong, color: colors.text, fontSize: 14, marginTop: spacing.sm },
  chatMessage: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  chatEmpty: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.sm },

  // Articles list
  articlesList: { gap: spacing.md },
  articleRowCard: {
    position: 'relative',
    overflow: 'hidden',
    paddingLeft: spacing.lg,
  },
  articleRowTitle: { ...typography.bodyStrong, color: colors.text, fontSize: 14, lineHeight: 20, paddingVertical: spacing.xs },

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
