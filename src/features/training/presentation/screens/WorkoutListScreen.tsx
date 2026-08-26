import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, typography, fontFamilies } from '../../../../shared/theme/tokens';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type Level = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';

type WorkoutItem = {
  id: string;
  title: string;
  level: Exclude<Level, 'All'>;
  duration: string;
  calories: string;
  exercises: string;
  emoji: string;
};

const LEVELS: Level[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const WORKOUTS: WorkoutItem[] = [
  { id: '1', title: 'Squat Exercise', level: 'Beginner', duration: '12 Minutes', calories: '120 Kcal', exercises: '5 Exercises', emoji: '🏋️' },
  { id: '2', title: 'Full Body Stretching', level: 'Beginner', duration: '45 Minutes', calories: '1450 Kcal', exercises: '5 Exercises', emoji: '🧘' },
  { id: '3', title: 'Circuit Training', level: 'Intermediate', duration: '50 Minutes', calories: '800 Kcal', exercises: '8 Exercises', emoji: '💪' },
  { id: '4', title: 'Upper Body', level: 'Intermediate', duration: '60 Minutes', calories: '1320 Kcal', exercises: '5 Exercises', emoji: '🏋️' },
  { id: '5', title: 'Lower Body Blast', level: 'Advanced', duration: '45 Minutes', calories: '950 Kcal', exercises: '6 Exercises', emoji: '🦵' },
  { id: '6', title: 'Split Strength Training', level: 'Advanced', duration: '55 Minutes', calories: '1100 Kcal', exercises: '7 Exercises', emoji: '🔥' },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function WorkoutListScreen() {
  const navigation = useNavigation<Nav>();
  const [level, setLevel] = useState<Level>('All');

  const filtered = useMemo(() => {
    if (level === 'All') return WORKOUTS;
    return WORKOUTS.filter((w) => w.level === level);
  }, [level]);

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
        <Text style={styles.headerTitle}>Workout</Text>
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

      {/* Filter pills */}
      <View style={styles.filterRow}>
        {LEVELS.map((l) => {
          const selected = level === l;
          return (
            <Pressable
              key={l}
              onPress={() => setLevel(l)}
              style={[styles.pill, selected ? styles.pillSelected : styles.pillUnselected]}
            >
              <Text style={[styles.pillText, selected ? styles.pillTextSelected : styles.pillTextUnselected]}>
                {l}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Workout list */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No workouts found</Text>
            <Text style={styles.emptySub}>Try a different level filter.</Text>
          </View>
        ) : (
          filtered.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{'\u25F7'} {item.duration}</Text>
                  <Text style={styles.metaDot}>{'\u00B7'}</Text>
                  <Text style={styles.metaText}>{'\uD83D\uDD25'} {item.calories}</Text>
                  <Text style={styles.metaDot}>{'\u00B7'}</Text>
                  <Text style={styles.metaText}>{'\u2733'} {item.exercises}</Text>
                </View>
              </View>
              <View style={styles.imageWrap}>
                <Text style={styles.imageEmoji}>{item.emoji}</Text>
                <View style={styles.starBadge}>
                  <Text style={styles.star}>{'\u2605'}</Text>
                </View>
              </View>
            </View>
          ))
        )}
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
    minHeight: 84,
  },
  cardLeft: { flex: 1, padding: spacing.md, gap: 6 },
  cardTitle: { ...typography.bodyStrong, color: colors.text, fontSize: 14, lineHeight: 18 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  metaText: { fontFamily: fontFamilies.bodyMedium, fontSize: 11, color: colors.textSecondary },
  metaDot: { fontSize: 11, color: colors.textSecondary },
  imageWrap: {
    width: 90,
    height: 90,
    margin: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  imageEmoji: { fontSize: 28 },
  starBadge: {
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
  star: { color: colors.primary, fontSize: 10, lineHeight: 12 },
  emptyWrap: { alignItems: 'center', paddingVertical: spacing.xl, gap: 4 },
  emptyText: { fontFamily: fontFamilies.bodySemiBold, fontSize: 14, color: colors.text },
  emptySub: { ...typography.caption, color: colors.textSecondary },
});
