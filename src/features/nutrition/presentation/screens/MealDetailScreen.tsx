import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { colors, spacing, radius, typography, fontFamilies } from '../../../../shared/theme/tokens';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MealDetail'>;
type MealDetailRoute = RouteProp<RootStackParamList, 'MealDetail'>;

type NutritionStat = {
  label: string;
  value: string;
};

type Ingredient = {
  name: string;
  checked: boolean;
};

type Step = {
  number: number;
  text: string;
};

const MOCK_STATS: NutritionStat[] = [
  { label: 'Calories', value: '320' },
  { label: 'Protein', value: '24g' },
  { label: 'Carbs', value: '18g' },
  { label: 'Fat', value: '14g' },
];

const MOCK_INGREDIENTS: Ingredient[] = [
  { name: 'Whole wheat bread', checked: true },
  { name: 'Avocado', checked: true },
  { name: 'Poached eggs', checked: true },
  { name: 'Cherry tomatoes', checked: true },
  { name: 'Olive oil', checked: true },
];

const MOCK_STEPS: Step[] = [
  { number: 1, text: 'Toast the bread until golden and crispy on both sides.' },
  { number: 2, text: 'Mash the avocado and spread evenly over the toast.' },
  { number: 3, text: 'Top with poached eggs, halved cherry tomatoes, and a drizzle of olive oil.' },
];

export function MealDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<MealDetailRoute>();
  const { name = 'Meal', calories, time } = route.params;

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
        <Text style={styles.headerTitle}>{name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={styles.heroImage}>
          <Text style={styles.heroEmoji}>{'\uD83C\uDF73'}</Text>
        </View>

        {/* Quick meta */}
        {(calories != null || time != null) && (
          <View style={styles.quickMeta}>
            {calories != null && <Text style={styles.quickMetaText}>{'\uD83D\uDD25'} {calories} Cal</Text>}
            {time != null && <Text style={styles.quickMetaText}>{'\u25F7'} {time}</Text>}
          </View>
        )}

        {/* Nutrition Stats — 2×2 grid */}
        <View style={styles.statsGrid}>
          {MOCK_STATS.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {MOCK_INGREDIENTS.map((ing) => (
            <View key={ing.name} style={styles.ingredientRow}>
              <View style={[styles.checkbox, ing.checked && styles.checkboxChecked]}>
                {ing.checked && <Text style={styles.checkmark}>{'\u2713'}</Text>}
              </View>
              <Text style={styles.ingredientText}>{ing.name}</Text>
            </View>
          ))}
        </View>

        {/* Preparation Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preparation</Text>
          {MOCK_STEPS.map((step) => (
            <View key={step.number} style={styles.stepRow}>
              <View style={styles.stepNumberCircle}>
                <Text style={styles.stepNumber}>{step.number}</Text>
              </View>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },

  // Header
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
  headerSpacer: { width: 32 },

  content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.lg },

  // Hero
  heroImage: {
    height: 200,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: { fontSize: 56 },

  // Quick meta
  quickMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quickMetaText: { fontFamily: fontFamilies.bodyMedium, fontSize: 13, color: colors.textSecondary },

  // Stats grid — 2×2
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    minWidth: 140,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 28,
    lineHeight: 32,
    color: colors.primary,
  },
  statLabel: { ...typography.caption, color: colors.textSecondary },

  // Section
  section: { gap: spacing.sm },
  sectionTitle: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 16,
    lineHeight: 20,
    color: colors.primary,
  },

  // Ingredients
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    fontSize: 12,
    color: colors.base,
    fontWeight: '700',
  },
  ingredientText: { ...typography.body, color: colors.text, fontSize: 15 },

  // Steps
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  stepNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepNumber: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 13,
    color: colors.base,
  },
  stepText: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
});
