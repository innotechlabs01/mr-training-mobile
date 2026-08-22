import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { apiClient } from '../../../../infrastructure/api/client';
import { colors, spacing, typography } from '../../../../shared/theme/tokens';
import { Card } from '../../../../shared/components/ui/Card';
import { EmptyState } from '../../../../shared/components/ui/EmptyState';
import { Input } from '../../../../shared/components/ui/Input';
import { PrimaryButton } from '../../../../shared/components/ui/PrimaryButton';
import { ProgressBar } from '../../../../shared/components/ui/ProgressBar';
import { ScreenHeader } from '../../../../shared/components/ui/ScreenHeader';
import type { RootStackParamList } from '../../../../navigation/Navigation';
import {
  clearSessionResume,
  getSessionResume,
  saveSessionResume,
  type SessionResume,
} from './executionResume';

type Exercise = {
  id: string;
  workoutId: string;
  name: string;
  sets: number;
  reps: number;
  weightKg: number | null;
  restSeconds: number | null;
  sortOrder: number;
  notes: string | null;
};

type Workout = {
  id: string;
  contentName: string;
  status: string;
  progress: number;
};

type WorkoutDetailData = {
  workout: Workout;
  exercises: Exercise[];
};

type Advance = 'next-set' | 'next-exercise' | 'done';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutExecution'>;

type SetPayload = { weightKg?: number; reps?: number };

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function toNumberOrUndefined(raw: string): number | undefined {
  const n = parseFloat(raw);
  return Number.isNaN(n) ? undefined : n;
}

export function WorkoutExecutionScreen({ route, navigation }: Props) {
  const { sessionId, workoutId } = route.params;

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [finalDuration, setFinalDuration] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [resume, setResume] = useState<SessionResume | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['workout-detail', workoutId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/athlete/workouts/${workoutId}`);
      return data as WorkoutDetailData;
    },
    staleTime: 5 * 60 * 1000,
  });

  const exercises = data?.exercises ?? [];
  const currentExercise = exercises[currentExerciseIndex] as Exercise | undefined;

  // Elapsed-time counter while mounted.
  useEffect(() => {
    const id = setInterval(() => setDurationSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Load any persisted resume buffer for this session.
  useEffect(() => {
    let active = true;
    getSessionResume().then((r) => {
      if (active) setResume(r);
    });
    return () => {
      active = false;
    };
  }, []);

  const showsResume =
    !!resume &&
    resume.sessionId === sessionId &&
    (resume.currentExerciseIndex > 0 || resume.currentSetIndex > 0);

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const setsSinceStart = exercises
    .slice(0, currentExerciseIndex)
    .reduce((sum, ex) => sum + ex.sets, 0);
  const computedProgress = totalSets > 0 ? (setsSinceStart + currentSetIndex) / totalSets : 0;

  const isLastExercise = currentExerciseIndex >= exercises.length - 1;
  const buttonLabel = isLastExercise && currentSetIndex >= (currentExercise?.sets ?? 0) - 1
    ? 'Finalizar'
    : 'Loggear / Siguiente';

  const logSetMutation = useMutation({
    mutationFn: async (payload: SetPayload): Promise<{ advance: Advance; resume: SessionResume | null }> => {
      const exercise = exercises[currentExerciseIndex] as Exercise;
      await apiClient.post(`/athlete/sessions/${sessionId}/sets`, {
        exerciseId: exercise.id,
        setIndex: currentSetIndex,
        weightKg: payload.weightKg,
        reps: payload.reps,
      });

      if (currentSetIndex < exercise.sets - 1) {
        return {
          advance: 'next-set',
          resume: { sessionId, currentExerciseIndex, currentSetIndex: currentSetIndex + 1 },
        };
      }

      await apiClient.post(`/athlete/sessions/${sessionId}/progress`, {
        currentExerciseIndex: currentExerciseIndex + 1,
        durationSeconds,
      });

      if (isLastExercise) {
        await apiClient.post(`/athlete/sessions/${sessionId}/complete`, {});
        return { advance: 'done', resume: null };
      }

      return {
        advance: 'next-exercise',
        resume: { sessionId, currentExerciseIndex: currentExerciseIndex + 1, currentSetIndex: 0 },
      };
    },
    onSuccess: ({ advance, resume: nextResume }) => {
      if (advance === 'next-set') {
        setCurrentSetIndex((i) => i + 1);
      } else if (advance === 'next-exercise') {
        setCurrentExerciseIndex((i) => i + 1);
        setCurrentSetIndex(0);
      } else {
        setFinalDuration(durationSeconds);
        setCompleted(true);
      }

      if (nextResume) {
        saveSessionResume(nextResume.sessionId, nextResume.currentExerciseIndex, nextResume.currentSetIndex);
      } else {
        clearSessionResume();
      }

      setWeightInput('');
      setRepsInput('');
    },
    onError: (err) => {
      console.error('Failed to log set:', err);
      Alert.alert('Could not log set', 'Please try again.');
    },
  });

  const handleNext = () => {
    if (!currentExercise) return;
    const payload: SetPayload = {};
    const weight = toNumberOrUndefined(weightInput);
    const reps = toNumberOrUndefined(repsInput);
    if (weight !== undefined) payload.weightKg = weight;
    if (reps !== undefined) payload.reps = reps;
    logSetMutation.mutate(payload);
  };

  const handleResume = () => {
    if (!resume) return;
    const maxIndex = Math.max(0, exercises.length - 1);
    setCurrentExerciseIndex(Math.min(resume.currentExerciseIndex, maxIndex));
    setCurrentSetIndex(resume.currentSetIndex);
    setResume(null);
    clearSessionResume();
  };

  const title = completed
    ? (data?.workout.contentName ?? 'Workout')
    : (currentExercise?.name ?? 'Workout');

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={title} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {isLoading ? (
          <EmptyState variant="loading" message="Loading workout..." />
        ) : isError || !data ? (
          <EmptyState variant="error" message="Could not load workout" onRetry={refetch} />
        ) : !currentExercise ? (
          <EmptyState variant="empty" message="No exercises" />
        ) : completed ? (
          <View style={styles.summaryWrap}>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>WORKOUT COMPLETE</Text>
              <Text style={styles.summaryTitle}>{data.workout.contentName}</Text>
              <Text style={styles.summaryTime}>{formatDuration(finalDuration)}</Text>
              <Text style={styles.summaryMeta}>{exercises.length} exercises · {totalSets} sets</Text>
              <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.summaryButton}>
                <Text style={styles.summaryButtonLabel}>Done</Text>
              </Pressable>
            </Card>
          </View>
        ) : (
          <>
            {showsResume ? (
              <Pressable accessibilityRole="button" onPress={handleResume} style={styles.resumeBanner}>
                <Text style={styles.resumeLabel}>REANUDAR</Text>
                <Text style={styles.resumeHint}>Continue where you left off</Text>
              </Pressable>
            ) : null}

            <ProgressBar progress={computedProgress} />

            <View style={styles.exerciseBlock}>
              <Text style={styles.exerciseName}>{currentExercise.name}</Text>
              <Text style={styles.exerciseDetail}>
                {currentExercise.sets} × {currentExercise.reps}
                {currentExercise.weightKg ? ` · ${currentExercise.weightKg} kg` : ''}
                {currentExercise.restSeconds ? ` · ${currentExercise.restSeconds}s rest` : ''}
              </Text>
              <Text style={styles.setProgress}>
                Serie {currentSetIndex + 1} de {currentExercise.sets}
              </Text>
            </View>

            <View style={styles.inputsRow}>
              <View style={styles.inputCol}>
                <Input
                  value={weightInput}
                  onChangeText={setWeightInput}
                  placeholder="Peso kg"
                  keyboardType="numeric"
                  inputMode="numeric"
                />
              </View>
              <View style={styles.inputCol}>
                <Input
                  value={repsInput}
                  onChangeText={setRepsInput}
                  placeholder="Reps"
                  keyboardType="numeric"
                  inputMode="numeric"
                />
              </View>
            </View>

            <PrimaryButton
              label={buttonLabel}
              onPress={handleNext}
              disabled={logSetMutation.isPending}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  content: { padding: spacing.lg, paddingBottom: 120, gap: spacing.lg },

  resumeBanner: {
    backgroundColor: `${colors.primary}1A`,
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.xs,
  },
  resumeLabel: { ...typography.label, color: colors.primary },
  resumeHint: { ...typography.caption, color: colors.textSecondary },

  exerciseBlock: { gap: spacing.xs },
  exerciseName: { ...typography.display, color: colors.text },
  exerciseDetail: { ...typography.body, color: colors.textSecondary },
  setProgress: { ...typography.caption, color: colors.primary },

  inputsRow: { flexDirection: 'row', gap: spacing.md },
  inputCol: { flex: 1 },

  summaryWrap: { flex: 1, justifyContent: 'center' },
  summaryCard: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl },
  summaryLabel: { ...typography.label, color: colors.primary },
  summaryTitle: { ...typography.title, color: colors.text, textAlign: 'center' },
  summaryTime: { ...typography.display, color: colors.text },
  summaryMeta: { ...typography.caption, color: colors.textSecondary },
  summaryButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryButtonLabel: { ...typography.bodyStrong, color: colors.base, textTransform: 'uppercase' },
});
