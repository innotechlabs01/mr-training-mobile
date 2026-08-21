import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { darkTheme } from '../../../../shared/theme';

const MEALS = [
  { id: '1', meal: 'Breakfast', food: 'Oatmeal with banana + Whey Protein', calories: 450, protein: 35, carbs: 55, fat: 10 },
  { id: '2', meal: 'Lunch', food: 'Grilled chicken breast + brown rice + broccoli', calories: 620, protein: 48, carbs: 60, fat: 14 },
  { id: '3', meal: 'Snack', food: 'Greek yogurt + almonds + honey', calories: 280, protein: 20, carbs: 22, fat: 12 },
  { id: '4', meal: 'Dinner', food: 'Salmon fillet + sweet potato + asparagus', calories: 550, protein: 42, carbs: 45, fat: 18 },
];

export function NutritionScreen() {
  const totalCal = MEALS.reduce((s, m) => s + m.calories, 0);
  const totalProtein = MEALS.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = MEALS.reduce((s, m) => s + m.carbs, 0);
  const totalFat = MEALS.reduce((s, m) => s + m.fat, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} tintColor={darkTheme.colors.primary} />}
      >
        <Text style={styles.eyebrow}>FUEL</Text>
        <Text style={styles.title}>Nutrition</Text>

        <View style={styles.macroSummary}>
          <View style={styles.macroCol}>
            <Text style={styles.macroValue}>{totalCal}</Text>
            <Text style={styles.macroLabel}>kcal</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.macroCol}>
            <Text style={styles.macroValue}>{totalProtein}g</Text>
            <Text style={styles.macroLabel}>P</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.macroCol}>
            <Text style={styles.macroValue}>{totalCarbs}g</Text>
            <Text style={styles.macroLabel}>C</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.macroCol}>
            <Text style={styles.macroValue}>{totalFat}g</Text>
            <Text style={styles.macroLabel}>F</Text>
          </View>
        </View>

        {MEALS.map((m) => (
          <View key={m.id} style={styles.card}>
            <View style={styles.cardAccent} />
            <Text style={styles.mealLabel}>{m.meal.toUpperCase()}</Text>
            <Text style={styles.mealFood}>{m.food}</Text>
            <View style={styles.macroPillsRow}>
              <View style={styles.macroPill}>
                <Text style={styles.macroPillText}>{m.calories} kcal</Text>
              </View>
              <Text style={styles.dot}>·</Text>
              <View style={styles.macroPill}>
                <Text style={styles.macroPillText}>{m.protein}g P</Text>
              </View>
              <Text style={styles.dot}>·</Text>
              <View style={styles.macroPill}>
                <Text style={styles.macroPillText}>{m.carbs}g C</Text>
              </View>
              <Text style={styles.dot}>·</Text>
              <View style={styles.macroPill}>
                <Text style={styles.macroPillText}>{m.fat}g F</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: darkTheme.colors.background },
  content: { padding: 24, paddingBottom: 100 },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    color: darkTheme.colors.primary,
    marginBottom: 6,
  },
  title: { fontSize: 28, color: darkTheme.colors.text, fontWeight: '700', lineHeight: 34, marginBottom: 20 },

  macroSummary: {
    flexDirection: 'row',
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  macroCol: { flex: 1, alignItems: 'center', gap: 2 },
  macroValue: { fontSize: 20, fontWeight: '700', color: darkTheme.colors.primary, lineHeight: 24 },
  macroLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1, color: darkTheme.colors.textSecondary, textTransform: 'uppercase' },
  divider: { width: 1, height: 28, backgroundColor: darkTheme.colors.border },

  card: {
    backgroundColor: darkTheme.colors.surface,
    borderRadius: 16,
    padding: 16,
    paddingLeft: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: darkTheme.colors.primary,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  mealLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: darkTheme.colors.primary,
    marginBottom: 6,
  },
  mealFood: { fontSize: 15, fontWeight: '600', color: darkTheme.colors.text, lineHeight: 20, marginBottom: 12 },
  macroPillsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  macroPill: {
    backgroundColor: `${darkTheme.colors.border}33`,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: `${darkTheme.colors.border}44`,
  },
  macroPillText: { fontSize: 11, fontWeight: '600', color: darkTheme.colors.textSecondary },
  dot: { fontSize: 8, fontWeight: '700', color: darkTheme.colors.textSecondary, marginHorizontal: 1 },
});
