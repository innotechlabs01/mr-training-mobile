import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../infrastructure/api/client';
import { colors, spacing, radius, typography, fontFamilies } from '../../../../shared/theme/tokens';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type SearchFilter = 'All' | 'Workout' | 'Nutrition';

type SearchItem = {
  id: string;
  type: 'workout' | 'exercise';
  title: string;
  meta1: string;
  meta2: string;
  emoji: string;
};

const FILTERS: SearchFilter[] = ['All', 'Workout', 'Nutrition'];

export function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [filter, setFilter] = useState<SearchFilter>('All');
  const [query, setQuery] = useState('');

  const { data: workouts, isLoading: workoutsLoading } = useQuery({
    queryKey: ['athlete-workouts'],
    queryFn: async () => {
      const { data } = await apiClient.get('/athlete/workouts');
      return data as Array<{ id: string; contentName: string; modality: string; status: string }>;
    },
    staleTime: 60_000,
  });

  const { data: exercises, isLoading: exercisesLoading } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data } = await apiClient.get('/exercises');
      return data as Array<{ id: string; name: string; category?: string; muscleGroup?: string }>;
    },
    staleTime: 300_000,
  });

  const { data: favoritesData } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data } = await apiClient.get('/athlete/favorites');
      return data as Array<{ id: string; itemType: string; itemId: string; itemTitle: string; itemMeta: string }>;
    },
    staleTime: 30_000,
  });

  const isLoading = workoutsLoading || exercisesLoading;

  const allItems: SearchItem[] = useMemo(() => {
    const workoutItems: SearchItem[] = (workouts ?? []).map((w) => ({
      id: `w-${w.id}`,
      type: 'workout' as const,
      title: w.contentName,
      meta1: w.modality ?? '',
      meta2: w.status ?? '',
      emoji: '\uD83C\uDFCB\uFE0F',
    }));
    const exerciseItems: SearchItem[] = (exercises ?? []).map((e) => ({
      id: `e-${e.id}`,
      type: 'exercise' as const,
      title: e.name,
      meta1: e.category ?? '',
      meta2: e.muscleGroup ?? '',
      emoji: '\uD83C\uDCAA',
    }));
    const favoriteItems: SearchItem[] = (favoritesData ?? []).map((f) => ({
      id: `fav-${f.id}`,
      type: 'exercise' as const,
      title: f.itemTitle,
      meta1: f.itemMeta ?? '',
      meta2: 'Favorite',
      emoji: '\u2B50',
    }));
    return [...favoriteItems, ...workoutItems, ...exerciseItems];
  }, [workouts, exercises, favoritesData]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allItems.filter((item) => {
      const matchesFilter =
        filter === 'All' ||
        (filter === 'Workout' && item.type === 'workout') ||
        (filter === 'Nutrition' && item.type === 'exercise');
      const matchesQuery = q.length === 0 || item.title.toLowerCase().includes(q) || item.meta1.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [allItems, filter, query]);

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
        <Text style={styles.headerTitle}>Search</Text>
        <View style={styles.headerRight}>
          <Pressable accessibilityLabel="Notifications" onPress={() => undefined} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>🔔</Text>
          </Pressable>
          <Pressable accessibilityLabel="Profile" onPress={() => undefined} style={styles.iconButton}>
            <Text style={styles.iconButtonText}>👤</Text>
          </Pressable>
        </View>
      </View>

      {/* Search bar — white pill for contrast on dark, as in Figma 6.3.x */}
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search"
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {/* Filter pills */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const selected = filter === f;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.pill, selected ? styles.pillSelected : styles.pillUnselected]}
            >
              <Text style={[styles.pillText, selected ? styles.pillTextSelected : styles.pillTextUnselected]}>
                {f}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No results</Text>
            <Text style={styles.emptySub}>Try a different search or filter.</Text>
          </View>
        ) : (
          filtered.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{item.meta1}</Text>
                  {item.meta2 ? (
                    <>
                      <Text style={styles.metaDot}>{'\u00B7'}</Text>
                      <Text style={styles.metaText}>{item.meta2}</Text>
                    </>
                  ) : null}
                </View>
              </View>
              <View style={styles.imageWrap}>
                <Text style={styles.imageEmoji}>{item.emoji}</Text>
                <View style={styles.starBadge}>
                  <Text style={styles.star}>{'\u2605'}</Text>
                </View>
                {item.type === 'workout' ? (
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
  searchWrap: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  searchInput: {
    height: 40,
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
    color: '#111111',
    paddingHorizontal: 16,
    fontFamily: fontFamilies.body,
    fontSize: 14,
    lineHeight: 20,
  },
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
  loadingWrap: { alignItems: 'center', paddingVertical: spacing.xl },
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
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
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
  emptySub: { ...typography.caption, color: colors.textSecondary },
});
