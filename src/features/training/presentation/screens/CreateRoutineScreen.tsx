import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, typography, fontFamilies } from '../../../../shared/theme/tokens';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type MuscleGroup = 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Core';

type Exercise = {
  id: string;
  name: string;
  sets: string;
  reps: string;
};

const MUSCLE_GROUPS: MuscleGroup[] = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];

const INITIAL_EXERCISES: Exercise[] = [
  { id: '1', name: 'Bench Press', sets: '4', reps: '12' },
  { id: '2', name: 'Incline Dumbbell Press', sets: '3', reps: '10' },
  { id: '3', name: 'Cable Fly', sets: '3', reps: '15' },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CreateRoutineScreen() {
  const navigation = useNavigation<Nav>();
  const [routineName, setRoutineName] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<MuscleGroup[]>(['Chest']);
  const [exercises, setExercises] = useState<Exercise[]>(INITIAL_EXERCISES);

  const toggleGroup = (group: MuscleGroup) => {
    setSelectedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group],
    );
  };

  const updateExercise = (id: string, field: 'sets' | 'reps', value: string) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex)),
    );
  };

  const addExercise = () => {
    const newId = String(exercises.length + 1);
    setExercises((prev) => [...prev, { id: newId, name: 'New Exercise', sets: '3', reps: '10' }]);
  };

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
        <Text style={styles.headerTitle}>Create Your Routine</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Routine Name Input */}
        <Text style={styles.label}>Routine Name</Text>
        <TextInput
          value={routineName}
          onChangeText={setRoutineName}
          placeholder="Enter routine name"
          placeholderTextColor={colors.textSecondary}
          style={styles.nameInput}
        />

        {/* Muscle Group Chips */}
        <Text style={styles.label}>Muscle Groups</Text>
        <View style={styles.chipRow}>
          {MUSCLE_GROUPS.map((group) => {
            const selected = selectedGroups.includes(group);
            return (
              <Pressable
                key={group}
                onPress={() => toggleGroup(group)}
                style={[styles.chip, selected ? styles.chipSelected : styles.chipUnselected]}
              >
                <Text style={[styles.chipText, selected ? styles.chipTextSelected : styles.chipTextUnselected]}>
                  {group}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Exercise List */}
        <Text style={styles.label}>Exercises</Text>
        {exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseRow}>
            <Text style={styles.exerciseName} numberOfLines={1}>
              {exercise.name}
            </Text>
            <View style={styles.exerciseInputs}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Sets</Text>
                <TextInput
                  value={exercise.sets}
                  onChangeText={(v) => updateExercise(exercise.id, 'sets', v)}
                  keyboardType="numeric"
                  style={styles.smallInput}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  value={exercise.reps}
                  onChangeText={(v) => updateExercise(exercise.id, 'reps', v)}
                  keyboardType="numeric"
                  style={styles.smallInput}
                />
              </View>
            </View>
          </View>
        ))}

        {/* Add Exercise */}
        <Pressable onPress={addExercise} style={styles.addExerciseButton}>
          <Text style={styles.addExerciseText}>+ Add Exercise</Text>
        </Pressable>

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.saveButtonText}>Save Routine</Text>
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
    gap: spacing.md,
  },
  label: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    letterSpacing: 0.05,
    textTransform: 'uppercase',
  },
  nameInput: {
    height: 48,
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    fontFamily: fontFamilies.body,
    fontSize: 16,
    color: colors.text,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    height: 36,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipUnselected: { backgroundColor: colors.surface, borderColor: colors.border },
  chipText: { fontFamily: fontFamilies.bodySemiBold, fontSize: 13, lineHeight: 16 },
  chipTextSelected: { color: colors.base, fontWeight: '700' },
  chipTextUnselected: { color: colors.textSecondary },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  exerciseName: {
    flex: 1,
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 14,
    color: colors.text,
  },
  exerciseInputs: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inputGroup: {
    alignItems: 'center',
    gap: 2,
  },
  inputLabel: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  smallInput: {
    width: 48,
    height: 36,
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    textAlign: 'center',
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 14,
    color: colors.text,
  },
  addExerciseButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  addExerciseText: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 14,
    color: colors.primary,
  },
  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 48,
    marginTop: spacing.sm,
  },
  saveButtonPressed: { backgroundColor: colors.primaryPressed },
  saveButtonText: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 16,
    color: colors.base,
    fontWeight: '700',
  },
});
