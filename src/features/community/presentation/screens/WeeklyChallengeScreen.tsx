import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, typography, fontFamilies } from '../../../../shared/theme/tokens';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type LeaderboardRow = {
  rank: number;
  name: string;
  points: string;
};

const LEADERBOARD: LeaderboardRow[] = [
  { rank: 1, name: 'Samantha W.', points: '4,250' },
  { rank: 2, name: 'Michael B.', points: '3,980' },
  { rank: 3, name: 'Jessica L.', points: '3,710' },
  { rank: 4, name: 'David R.', points: '3,420' },
  { rank: 5, name: 'Emily T.', points: '3,150' },
];

export function WeeklyChallengeScreen() {
  const navigation = useNavigation<Nav>();

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
          <Text style={styles.backChevron}>{'\u2039'}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Weekly Challenge</Text>
        <View style={styles.headerRight}>
          <Pressable accessibilityLabel="Search" onPress={() => undefined} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>{'\uD83D\uDD0D'}</Text>
          </Pressable>
          <Pressable accessibilityLabel="Notifications" onPress={() => undefined} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>{'\uD83D\uDD14'}</Text>
          </Pressable>
          <Pressable accessibilityLabel="Profile" onPress={() => undefined} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>{'\uD83D\uDC64'}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Featured Challenge Card */}
        <View style={styles.featuredCard}>
          <View style={styles.featuredImage}>
            <View style={styles.featuredOverlay} />
            <Text style={styles.featuredImageEmoji}>{'\uD83C\uDFCB\uFE0F'}</Text>
          </View>
          <View style={styles.featuredBody}>
            <Text style={styles.featuredTitle}>Plank With Hip Twist</Text>
            <View style={styles.featuredMetaRow}>
              <Text style={styles.featuredMeta}>{'\u23F1\uFE0F'} 15 Minutes</Text>
              <Text style={styles.featuredMeta}>{'\uD83D\uDD25'} 100 Kcal</Text>
            </View>
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leaderboard</Text>
          {LEADERBOARD.map((row) => (
            <View key={row.rank} style={styles.leaderRow}>
              <Text style={styles.rankNumber}>{row.rank}</Text>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>
                  {row.name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')}
                </Text>
              </View>
              <Text style={styles.leaderName}>{row.name}</Text>
              <Text style={styles.leaderPoints}>{row.points} pts</Text>
            </View>
          ))}
        </View>

        {/* Your Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Challenge completed</Text>
              <Text style={styles.progressDays}>3/5 days</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaWrap}>
        <Pressable style={styles.ctaButton} onPress={() => undefined}>
          <Text style={styles.ctaText}>Join Challenge</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },

  // Header — same pattern as CommunityScreen
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

  content: { padding: spacing.md, paddingBottom: 100, gap: spacing.lg },

  // Featured card
  featuredCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  featuredImage: {
    height: 180,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  featuredImageEmoji: { fontSize: 48, zIndex: 1 },
  featuredBody: { padding: spacing.md, gap: 6 },
  featuredTitle: { ...typography.bodyStrong, color: colors.text, fontSize: 18 },
  featuredMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  featuredMeta: { fontFamily: fontFamilies.bodyMedium, fontSize: 13, color: colors.textSecondary },

  // Leaderboard
  section: { gap: spacing.sm },
  sectionTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 16,
    lineHeight: 20,
    color: colors.primary,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  rankNumber: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 16,
    color: colors.primary,
    width: 24,
    textAlign: 'center',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 13,
    color: colors.base,
  },
  leaderName: {
    flex: 1,
    ...typography.bodyStrong,
    color: colors.text,
    fontSize: 14,
  },
  leaderPoints: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 14,
    color: colors.primary,
  },

  // Progress
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: { ...typography.bodyStrong, color: colors.text, fontSize: 14 },
  progressDays: { fontFamily: fontFamilies.bodyMedium, fontSize: 13, color: colors.textSecondary },
  progressTrack: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  progressFill: {
    width: '70%',
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },

  // CTA
  ctaWrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.lg,
  },
  ctaButton: {
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    ...typography.body,
    color: colors.base,
    fontWeight: '700',
  },
});
