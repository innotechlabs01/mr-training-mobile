import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../infrastructure/api/client';
import { colors, spacing, radius, typography, fontFamilies } from '../../../../shared/theme/tokens';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type MealFilter = 'All' | 'Breakfast' | 'Lunch' | 'Dinner';

type MealItem = {
  id: string;
  title: string;
  type: Exclude<MealFilter, 'All'>;
  calories: string;
  time: string;
  emoji: string;
};

const FILTERS: MealFilter[] = ['All', 'Breakfast', 'Lunch', 'Dinner'];

// TODO: replace with real nutrition API when available
const MOCK_MEALS: MealItem[] = [
  { id: '1', title: 'Avocado Egg Toast', type: 'Breakfast', calories: '320 Cal', time: '15 min', emoji: '\uD83E\uDD51' },
  { id: '2', title: 'Greek Yogurt', type: 'Breakfast', calories: '200 Cal', time: '6 min', emoji: '\uD83C\uDF65' },
  { id: '3', title: 'Grilled Chicken Salad', type: 'Lunch', calories: '450 Cal', time: '20 min', emoji: '\uD83E\uDD57' },
  { id: '4', title: 'Salmon Bowl', type: 'Lunch', calories: '520 Cal', time: '25 min', emoji: '\uD83D\uDC1F' },
  { id: '5', title: 'Protein Shake', type: 'Dinner', calories: '280 Cal', time: '5 min', emoji: '\uD83E\uDDC3' },
  { id: '6', title: 'Turkey Wrap', type: 'Dinner', calories: '380 Cal', time: '10 min', emoji: '\uD83C\uDF2F' },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function NutritionScreen() {
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState<MealFilter>('All');

  // Graceful API attempt — fallback to mock if endpoint doesn't exist or returns no nutrition data
  const { data: apiMeals } = useQuery({
    queryKey: ['athlete-nutrition'],
    queryFn: async () => {
      try {
        const { data: today } = await apiClient.get('/athlete/today');
        // Extract nutrition data if available from today response
        if (today?.nutrition?.meals) {
          return today.nutrition.meals as MealItem[];
        }
        return null;
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
    retry: false,
  });

  const meals = apiMeals ?? MOCK_MEALS;

  const filtered = useMemo(() => {
    if (filter === 'All') return meals;
    return meals.filter((m) => m.type === filter);
  }, [filter, meals]);

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
        <Text style={styles.headerTitle}>Nutrition</Text>
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

      {/* Meal list */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No meals found</Text>
            <Text style={styles.emptySub}>Try a different filter.</Text>
          </View>
        ) : (
          filtered.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => navigation.navigate('MealDetail', { name: item.title, calories: parseInt(item.calories, 10), time: item.time })}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{'\uD83D\uDD25'} {item.calories}</Text>
                  <Text style={styles.metaDot}>{'\u00B7'}</Text>
                  <Text style={styles.metaText}>{'\u25F7'} {item.time}</Text>
                </View>
              </View>
              <View style={styles.imageWrap}>
                <Text style={styles.imageEmoji}>{item.emoji}</Text>
                <View style={styles.starBadge}>
                  <Text style={styles.star}>{'\u2605'}</Text>
                </View>
              </View>
            </Pressable>
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
