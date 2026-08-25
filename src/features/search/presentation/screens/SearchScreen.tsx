import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, typography, fontFamilies } from '../../../../shared/theme/tokens';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type SearchFilter = 'All' | 'Workout' | 'Nutrition';

type SearchItem = {
  id: string;
  type: 'workout' | 'nutrition';
  title: string;
  meta1: string;
  meta2: string;
  emoji: string;
};

const SEARCH_DATA: SearchItem[] = [
  { id: '1', type: 'workout', title: 'Squat Exercise', meta1: '12 Minutes', meta2: '120 Kcal', emoji: '🏋️' },
  { id: '2', type: 'workout', title: 'Full Body Stretching', meta1: '12 Minutes', meta2: '120 Kcal', emoji: '🧘' },
  { id: '3', type: 'workout', title: 'Circuit Training', meta1: '50 Minutes', meta2: '5 Exercises', emoji: '💪' },
  { id: '4', type: 'nutrition', title: 'Yogurt With Fruits', meta1: '150 Kcal', meta2: '12g Protein', emoji: '🍓' },
  { id: '5', type: 'workout', title: 'Split Squat Variation', meta1: '20 Minutes', meta2: '180 Kcal', emoji: '🦵' },
  { id: '6', type: 'nutrition', title: 'Chicken Wrap', meta1: '320 Kcal', meta2: 'High Protein', emoji: '🌯' },
];

const FILTERS: SearchFilter[] = ['All', 'Workout', 'Nutrition'];

export function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [filter, setFilter] = useState<SearchFilter>('All');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SEARCH_DATA.filter((item) => {
      const matchesFilter =
        filter === 'All' || item.type === filter.toLowerCase() as SearchItem['type'];
      const matchesQuery = q.length === 0 || item.title.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

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
        {filtered.length === 0 ? (
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
                  <Text style={styles.metaText}>◷ {item.meta1}</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.metaText}>🔥 {item.meta2}</Text>
                </View>
              </View>
              <View style={styles.imageWrap}>
                <Text style={styles.imageEmoji}>{item.emoji}</Text>
                <View style={styles.starBadge}>
                  <Text style={styles.star}>★</Text>
                </View>
                {item.type === 'workout' ? (
                  <View style={styles.playBadge}>
                    <Text style={styles.play}>▶</Text>
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
