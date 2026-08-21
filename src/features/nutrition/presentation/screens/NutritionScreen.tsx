import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
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
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Nutrition</Text>
        <View style={styles.macroBar}>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{totalCal}</Text>
            <Text style={styles.macroLabel}>kcal</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{totalProtein}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{totalCarbs}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={styles.macroValue}>{totalFat}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>
        {MEALS.map((m) => (
          <View key={m.id} style={styles.card}>
            <Text style={styles.mealLabel}>{m.meal}</Text>
            <Text style={styles.mealFood}>{m.food}</Text>
            <View style={styles.mealMacros}>
              <Text style={styles.mealMacroText}>{m.calories} kcal</Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.mealMacroText}>{m.protein}g protein</Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.mealMacroText}>{m.carbs}g carbs</Text>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.mealMacroText}>{m.fat}g fat</Text>
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
  title: { fontSize: 28, color: darkTheme.colors.text, fontWeight: '700', marginBottom: 24 },
  macroBar: { flexDirection: 'row', backgroundColor: darkTheme.colors.surface, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: darkTheme.colors.border },
  macroItem: { flex: 1, alignItems: 'center' },
  macroValue: { fontSize: 20, color: darkTheme.colors.primary, fontWeight: '700' },
  macroLabel: { fontSize: 12, color: darkTheme.colors.textSecondary, marginTop: 2 },
  card: { backgroundColor: darkTheme.colors.surface, borderRadius: 16, padding: 24, marginBottom: 8, borderWidth: 1, borderColor: darkTheme.colors.border },
  mealLabel: { fontSize: 15, color: darkTheme.colors.primary, fontWeight: '600', marginBottom: 4 },
  mealFood: { fontSize: 16, color: darkTheme.colors.text, marginBottom: 8 },
  mealMacros: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  mealMacroText: { fontSize: 13, color: darkTheme.colors.textSecondary },
  dot: { color: darkTheme.colors.textSecondary, fontSize: 13 },
});
