import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, typography, fontFamilies } from '../../../../shared/theme/tokens';
import type { RootStackParamList } from '../../../../navigation/Navigation';

const AVATARS = ['A', 'J', 'S', 'T', 'C'];

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ChallengeDetailScreen() {
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
        <Text style={styles.headerTitle}>Challenge & Competitions</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Featured Challenge Card */}
        <View style={styles.featuredCard}>
          <View style={styles.featuredImage}>
            <Text style={styles.featuredEmoji}>{'\uD83C\uDFCB\uFE0F'}</Text>
          </View>
          <View style={styles.featuredBody}>
            <Text style={styles.featuredTitle}>30-Day Strength Challenge</Text>
            <View style={styles.featuredMeta}>
              <Text style={styles.metaText}>{'\u25F7'} 30 Days</Text>
              <Text style={styles.metaDot}>{'\u00B7'}</Text>
              <Text style={styles.metaText}>{'\uD83D\uDD25'} 500 Kcal</Text>
              <Text style={styles.metaDot}>{'\u00B7'}</Text>
              <Text style={styles.metaText}>{'\u2733'} 8 Exercises</Text>
            </View>
          </View>
        </View>

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participants</Text>
          <View style={styles.participantsRow}>
            {AVATARS.map((initial, i) => (
              <View key={i} style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
            ))}
            <Text style={styles.moreText}>+12 more</Text>
          </View>
        </View>

        {/* Countdown Timer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Remaining</Text>
          <View style={styles.countdownRow}>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>14</Text>
              <Text style={styles.countdownLabel}>Days</Text>
            </View>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>08</Text>
              <Text style={styles.countdownLabel}>Hours</Text>
            </View>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>32</Text>
              <Text style={styles.countdownLabel}>Minutes</Text>
            </View>
          </View>
        </View>

        {/* Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rules</Text>
          <View style={styles.rulesCard}>
            <Text style={styles.ruleItem}>{'\u2022'} Complete all 8 exercises each day for 30 days.</Text>
            <Text style={styles.ruleItem}>{'\u2022'} Log your session with photo proof in the app.</Text>
            <Text style={styles.ruleItem}>{'\u2022'} Top 3 participants win exclusive merch.</Text>
          </View>
        </View>

        {/* Join CTA */}
        <Pressable
          style={({ pressed }) => [styles.joinButton, pressed && styles.joinButtonPressed]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.joinButtonText}>Join Now</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
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
  headerRight: { width: 32 },
  content: {
    padding: spacing.md,
    paddingBottom: 32,
    gap: spacing.lg,
  },

  // Featured card
  featuredCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  featuredImage: {
    height: 160,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredEmoji: { fontSize: 48 },
  featuredBody: { padding: spacing.md, gap: 6 },
  featuredTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
  },
  featuredMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontFamily: fontFamilies.bodyMedium, fontSize: 12, color: colors.textSecondary },
  metaDot: { fontSize: 12, color: colors.textSecondary },

  // Sections
  section: { gap: spacing.sm },
  sectionTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 16,
    lineHeight: 20,
    color: colors.primary,
  },

  // Participants
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: -4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.base,
    marginLeft: -4,
  },
  avatarText: {
    fontFamily: fontFamilies.bodyBold,
    fontSize: 14,
    color: colors.base,
  },
  moreText: {
    marginLeft: spacing.sm,
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Countdown
  countdownRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  countdownBox: {
    flex: 1,
    height: 72,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  countdownNumber: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 28,
    lineHeight: 32,
    color: colors.primary,
  },
  countdownLabel: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },

  // Rules
  rulesCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  ruleItem: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },

  // Join CTA
  joinButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 48,
    marginTop: spacing.sm,
  },
  joinButtonPressed: { backgroundColor: colors.primaryPressed },
  joinButtonText: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 16,
    color: colors.base,
    fontWeight: '700',
  },
});
