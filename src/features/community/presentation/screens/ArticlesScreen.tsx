import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { listBlogPosts } from '@features/blog/blogService';
import { colors, spacing, radius, fontFamilies } from '../../../../shared/theme/tokens';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type Filter = 'All' | 'Workout' | 'Nutrition' | 'Health';

type Article = {
  id: string;
  title: string;
  description: string;
  date: string;
  emoji: string;
};

const FILTERS: Filter[] = ['All', 'Workout', 'Nutrition', 'Health'];

export function ArticlesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [filter, setFilter] = useState<Filter>('All');

  const { data: articles, isLoading } = useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      return await listBlogPosts();
    },
    staleTime: 300_000,
  });

  const mapped: Article[] = (articles ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    description: a.content?.slice(0, 120) ?? '',
    date: a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
    emoji: '📄',
  }));

  const filtered = mapped.filter((a) => {
    if (filter === 'All') return true;
    return true; // No category field from API yet — show all
  });

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
        <Text style={styles.headerTitle}>Articles & Tips</Text>
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

      {/* Article cards */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No articles yet</Text>
            <Text style={styles.emptySub}>Check back later for tips and insights.</Text>
          </View>
        ) : (
          filtered.map((article) => (
            <Pressable
              key={article.id}
              onPress={() => console.log('Article pressed', article.title)}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {article.title}
                </Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {article.description}
                </Text>
                <Text style={styles.cardDate}>{article.date}</Text>
              </View>
              <View style={styles.cardImagePlaceholder}>
                <Text style={styles.cardImageEmoji}>{article.emoji}</Text>
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
  loadingWrap: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyWrap: { alignItems: 'center', paddingVertical: spacing.xl, gap: 4 },
  emptyText: { fontFamily: fontFamilies.bodySemiBold, fontSize: 14, color: colors.text },
  emptySub: { fontFamily: fontFamilies.body, fontSize: 12, color: colors.textSecondary },

  // Article card — row layout with image right
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
  cardLeft: { flex: 1, padding: spacing.md, gap: 4 },
  cardTitle: { fontFamily: fontFamilies.bodySemiBold, fontSize: 14, lineHeight: 18, color: colors.text },
  cardDescription: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  cardDate: { fontFamily: fontFamilies.bodyMedium, fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  cardImagePlaceholder: {
    width: 90,
    height: 90,
    margin: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImageEmoji: { fontSize: 28 },
});
