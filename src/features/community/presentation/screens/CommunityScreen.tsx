import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, typography, fontFamilies } from '../../../../shared/theme/tokens';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type Tab = 'forum' | 'challenges';

type ForumTopic = {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
};

type Challenge = {
  id: string;
  title: string;
  duration: string;
  calories: string;
  emoji: string;
};

const FORUM_TOPICS: ForumTopic[] = [
  {
    id: 'f1',
    title: 'Training Tips for Beginners',
    description: 'Share your best training tips for those just starting out.',
    timeAgo: '2h ago',
  },
  {
    id: 'f2',
    title: 'Nutrition Myths Debunked',
    description: 'Discuss common nutrition misconceptions and the science.',
    timeAgo: '5h ago',
  },
  {
    id: 'f3',
    title: 'Recovery & Rest Days',
    description: 'How do you approach recovery? Share your strategies.',
    timeAgo: '1d ago',
  },
  {
    id: 'f4',
    title: 'Goal Setting & Motivation',
    description: 'What keeps you going when motivation fades?',
    timeAgo: '2d ago',
  },
];

const CHALLENGES: Challenge[] = [
  { id: 'c1', title: '30-Day Push-Up Challenge', duration: '30 Days', calories: '500 Kcal', emoji: '💪' },
  { id: 'c2', title: 'Morning Run Streak', duration: '14 Days', calories: '300 Kcal', emoji: '🏃' },
  { id: 'c3', title: 'Core Strength Builder', duration: '21 Days', calories: '400 Kcal', emoji: '🔥' },
];

export function CommunityScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tab, setTab] = useState<Tab>('forum');

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
          <Text style={styles.backChevron}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Community</Text>
        <View style={styles.headerRight}>
          <Pressable accessibilityLabel="Search" onPress={() => undefined} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>🔍</Text>
          </Pressable>
          <Pressable accessibilityLabel="Notifications" onPress={() => undefined} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>🔔</Text>
          </Pressable>
          <Pressable accessibilityLabel="Profile" onPress={() => undefined} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>👤</Text>
          </Pressable>
        </View>
      </View>

      {/* Tab pills */}
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setTab('forum')}
          style={[styles.pill, tab === 'forum' ? styles.pillSelected : styles.pillUnselected]}
        >
          <Text style={[styles.pillText, tab === 'forum' ? styles.pillTextSelected : styles.pillTextUnselected]}>
            Discussion Forum
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('challenges')}
          style={[styles.pill, tab === 'challenges' ? styles.pillSelected : styles.pillUnselected]}
        >
          <Text style={[styles.pillText, tab === 'challenges' ? styles.pillTextSelected : styles.pillTextUnselected]}>
            Challenges
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {tab === 'forum' ? (
          <>
            {/* Featured Challenge Card */}
            <Pressable
              onPress={() => navigation.navigate('WeeklyChallenge')}
              style={({ pressed }) => [styles.featuredCard, pressed && { opacity: 0.85 }]}
            >
              <View style={styles.featuredImagePlaceholder}>
                <Text style={styles.featuredImageEmoji}>🚴</Text>
              </View>
              <View style={styles.featuredContent}>
                <Text style={styles.featuredTitle}>Cycling Challenge</Text>
                <View style={styles.featuredMetaRow}>
                  <Text style={styles.featuredMeta}>◷ 15 Minutes</Text>
                  <Text style={styles.featuredMeta}>🔥 100 Kcal</Text>
                  <Text style={styles.featuredStar}>★</Text>
                </View>
              </View>
            </Pressable>

            {/* Forums Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Forums</Text>
              {FORUM_TOPICS.map((topic) => (
                <Pressable
                  key={topic.id}
                  onPress={() => navigation.navigate('DiscussionForum')}
                  style={({ pressed }) => [styles.topicCard, pressed && { opacity: 0.85 }]}
                >
                  <View style={styles.topicLeft}>
                    <Text style={styles.topicTitle} numberOfLines={1}>
                      {topic.title}
                    </Text>
                    <Text style={styles.topicDescription} numberOfLines={2}>
                      {topic.description}
                    </Text>
                  </View>
                  <View style={styles.topicRight}>
                    <Text style={styles.seeAll}>See All ›</Text>
                    <Text style={styles.topicTime}>{topic.timeAgo}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          /* Challenges Tab */
          <View style={styles.challengesSection}>
            {CHALLENGES.map((challenge) => (
              <View key={challenge.id} style={styles.challengeCard}>
                <View style={styles.challengeImagePlaceholder}>
                  <Text style={styles.challengeImageEmoji}>{challenge.emoji}</Text>
                </View>
                <View style={styles.challengeContent}>
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                  <View style={styles.challengeMetaRow}>
                    <Text style={styles.challengeMeta}>◷ {challenge.duration}</Text>
                    <Text style={styles.challengeMeta}>🔥 {challenge.calories}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => navigation.navigate('ChallengeDetail')}
                  style={styles.joinButton}
                >
                  <Text style={styles.joinButtonText}>Join</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },

  // Header — mirrors SearchScreen pattern
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

  // Filter pills — same as SearchScreen
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  pill: {
    height: 36,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pillSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillUnselected: { backgroundColor: colors.surface, borderColor: colors.border },
  pillText: { fontFamily: fontFamilies.bodySemiBold, fontSize: 13, lineHeight: 16 },
  pillTextSelected: { color: colors.base, fontWeight: '700' },
  pillTextUnselected: { color: colors.textSecondary },

  listContent: { padding: spacing.md, paddingBottom: 32, gap: spacing.md },

  // Featured challenge card — full width
  featuredCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  featuredImagePlaceholder: {
    height: 120,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredImageEmoji: { fontSize: 40 },
  featuredContent: { padding: spacing.md, gap: 4 },
  featuredTitle: { ...typography.bodyStrong, color: colors.text, fontSize: 16 },
  featuredMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  featuredMeta: { fontFamily: fontFamilies.bodyMedium, fontSize: 12, color: colors.textSecondary },
  featuredStar: { color: colors.primary, fontSize: 14 },

  // Forums section
  section: { gap: spacing.sm },
  sectionTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 16,
    lineHeight: 20,
    color: colors.primary,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  topicLeft: { flex: 1, gap: 4 },
  topicTitle: { ...typography.bodyStrong, color: colors.text, fontSize: 14 },
  topicDescription: { fontFamily: fontFamilies.body, fontSize: 12, lineHeight: 16, color: colors.textSecondary },
  topicRight: { alignItems: 'flex-end', gap: 4 },
  seeAll: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 12,
    color: colors.primary,
  },
  topicTime: { fontFamily: fontFamilies.bodyMedium, fontSize: 11, color: colors.textSecondary },

  // Challenges tab
  challengesSection: { gap: spacing.md },
  challengeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  challengeImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  challengeImageEmoji: { fontSize: 28 },
  challengeContent: { flex: 1, gap: 4 },
  challengeTitle: { ...typography.bodyStrong, color: colors.text, fontSize: 14 },
  challengeMetaRow: { flexDirection: 'row', gap: spacing.sm },
  challengeMeta: { fontFamily: fontFamilies.bodyMedium, fontSize: 12, color: colors.textSecondary },
  joinButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  joinButtonText: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 13,
    color: colors.base,
  },
});
