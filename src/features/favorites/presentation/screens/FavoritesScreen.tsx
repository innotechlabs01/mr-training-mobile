import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, typography, fontFamilies } from '../../../../shared/theme/tokens';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type FavoriteFilter = 'All' | 'Video' | 'Article';

type FavoriteItem = {
  id: string;
  type: 'workout' | 'video' | 'article';
  title: string;
  description?: string;
  duration?: string;
  calories?: string;
  exercises?: string;
};

const FILTERS: FavoriteFilter[] = ['All', 'Video', 'Article'];

const MOCK_FAVORITES: FavoriteItem[] = [
  {
    id: '1',
    type: 'workout',
    title: 'Upper Body Push',
    duration: '35 min',
    calories: '320 Kcal',
    exercises: '5 Exercises',
  },
  {
    id: '2',
    type: 'video',
    title: 'Proper Deadlift Form',
    description: 'Learn the fundamentals of deadlifting safely',
    duration: '12 min',
  },
  {
    id: '3',
    type: 'article',
    title: 'Nutrition for Recovery',
    description: 'What to eat before and after training for optimal results',
  },
  {
    id: '4',
    type: 'workout',
    title: 'Leg Day Power',
    duration: '45 min',
    calories: '480 Kcal',
    exercises: '6 Exercises',
  },
  {
    id: '5',
    type: 'video',
    title: 'Mobility Warm-Up Routine',
    description: 'A 10-minute routine to prep your joints before any session',
    duration: '10 min',
  },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function FavoritesScreen() {
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState<FavoriteFilter>('All');

  const filtered = useMemo(() => {
    if (filter === 'All') return MOCK_FAVORITES;
    return MOCK_FAVORITES.filter((item) => item.type === filter.toLowerCase());
  }, [filter]);

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
        <Text style={styles.headerTitle}>Favorites</Text>
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
        <Text style={styles.filterLabel}>Sort By</Text>
        {FILTERS.map((f) => {
          const selected = filter === f;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.pill, selected ? styles.pillSelected : styles.pillUnselected]}
            >
              <Text
                style={[styles.pillText, selected ? styles.pillTextSelected : styles.pillTextUnselected]}
              >
                {f}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Card list */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No favorites found</Text>
          </View>
        ) : (
          filtered.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                {item.description ? (
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                <View style={styles.metaRow}>
                  {item.duration ? <Text style={styles.metaText}>{'\u25F7'} {item.duration}</Text> : null}
                  {item.calories ? (
                    <>
                      <Text style={styles.metaDot}>{'\u00B7'}</Text>
                      <Text style={styles.metaText}>{'\uD83D\uDD25'} {item.calories}</Text>
                    </>
                  ) : null}
                  {item.exercises ? (
                    <>
                      <Text style={styles.metaDot}>{'\u00B7'}</Text>
                      <Text style={styles.metaText}>{'\u2733'} {item.exercises}</Text>
                    </>
                  ) : null}
                </View>
              </View>
              <View style={styles.imageWrap}>
                <Text style={styles.imageEmoji}>
                  {item.type === 'workout' ? '\uD83C\uDFCB' : item.type === 'video' ? '\uD83C\uDFA5' : '\uD83D\uDCF0'}
                </Text>
                <View style={styles.starBadge}>
                  <Text style={styles.star}>{'\u2605'}</Text>
                </View>
                {item.type === 'workout' || item.type === 'video' ? (
                  <View style={styles.playBadge}>
                    <Text style={styles.play}>{'\u25B6'}</Text>
                  </View>
                ) : null}
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
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  filterLabel: { ...typography.bodyStrong, color: colors.textSecondary, marginRight: spacing.xs },
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
  cardDescription: { ...typography.caption, color: colors.textSecondary, fontSize: 12 },
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
  playBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  play: { color: colors.text, fontSize: 10, marginLeft: 1 },
  emptyWrap: { alignItems: 'center', paddingVertical: spacing.xl, gap: 4 },
  emptyText: { fontFamily: fontFamilies.bodySemiBold, fontSize: 14, color: colors.text },
});
