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
import { syncIfPossible } from '../../../../infrastructure/health';

type ExerciseMode = 'reps' | 'time' | 'cardio';

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
  mode?: ExerciseMode;
  phase?: 'work' | 'warmup';
  supersetGroup?: string | null;
  perSide?: boolean;
  sec?: number | null;
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

type PrescriptionItem = {
  exerciseId: string;
  kind: 'first' | 'up' | 'hold' | 'deload' | 'off';
  weightKg: number | null;
  reps: number | null;
  sec: number | null;
  sets: number | null;
  why: [string, ...unknown[]] | null;
};

type PrescriptionData = {
  prescriptions: PrescriptionItem[];
};

type SessionExercise = {
  exerciseId: string;
  name: string;
  pr: { est: number; weightKg: number; reps: number; prevEst: number } | null;
  est1rm: number | null;
};

type SessionLiveData = {
  session: { id: string } | null;
  exercises: SessionExercise[];
};

type Advance = 'next-set' | 'next-exercise' | 'done';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutExecution'>;

type SetPayload = {
  weightKg?: number;
  reps?: number;
  sec?: number;
  rir?: number;
};

function formatWhy(why: PrescriptionItem['why'] | undefined): string | null {
  if (!why || why.length === 0) return null;
  const template = String(why[0]);
  return template.replace(/\{(\d+)\}/g, (_, i) => String(why[Number(i) + 1] ?? ''));
}

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
  const [secInput, setSecInput] = useState('');
  const [rirInput, setRirInput] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [finalDuration, setFinalDuration] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [completedPrs, setCompletedPrs] = useState<Array<{ name: string; est: number }>>([]);
  const [resume, setResume] = useState<SessionResume | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['workout-detail', workoutId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/workouts/${workoutId}/detail`);
      return data as WorkoutDetailData;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Next targets derived from the athlete's own history — every number carries its reason.
  const { data: prescription } = useQuery({
    queryKey: ['workout-prescription', workoutId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/workouts/${workoutId}/prescription`);
      return data as PrescriptionData;
    },
    staleTime: 5 * 60 * 1000,
  });

  const exercises = data?.exercises ?? [];
  const currentExercise = exercises[currentExerciseIndex] as Exercise | undefined;
  const prescriptionByExerciseId = new Map(
    (prescription?.prescriptions ?? []).map((p) => [p.exerciseId, p]),
  );
  const currentPrescription = currentExercise
    ? prescriptionByExerciseId.get(currentExercise.id)
    : undefined;

  const isTimeMode = currentExercise?.mode === 'time';
  const isCardioMode = currentExercise?.mode === 'cardio';
  // Effective target: prescription wins over plan. Explicit zero = bodyweight (no weight
  // column); null = not specified yet (keep the input so the athlete can still log it).
  const effectiveTargetKg = currentPrescription?.weightKg ?? currentExercise?.weightKg ?? null;
  const isBodyweight =
    !isTimeMode && !isCardioMode && effectiveTargetKg != null && effectiveTargetKg <= 0;

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
  const isLastSet = currentSetIndex >= (currentExercise?.sets ?? 0) - 1;
  const buttonLabel = isLastExercise && isLastSet ? 'Finalizar' : 'Loggear / Siguiente';

  /**
   * Collect PRs detected so far in this session before completing it. The server compares
   * the logged sets against prior history; after completion the session no longer returns.
   */
  const collectPrs = async (): Promise<Array<{ name: string; est: number }>> => {
    try {
      const { data } = await apiClient.get(`/workouts/sessions/${sessionId}`);
      const live = data as SessionLiveData;
      return (live.exercises ?? [])
        .filter((e) => e.pr)
        .map((e) => ({ name: e.name, est: e.pr!.est }));
    } catch {
      return [];
    }
  };

  const logSetMutation = useMutation({
    mutationFn: async (payload: SetPayload): Promise<{ advance: Advance; resume: SessionResume | null }> => {
      const exercise = exercises[currentExerciseIndex] as Exercise;
      // Go backend keys by workoutId, not sessionId
      await apiClient.post(`/workouts/${workoutId}/sets`, {
        exerciseId: exercise.id,
        setIndex: currentSetIndex,
        weightKg: payload.weightKg,
        reps: payload.reps,
        sec: payload.sec,
        rir: payload.rir,
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
        const prs = await collectPrs();
        await apiClient.post(`/workouts/sessions/${sessionId}/complete`, {});
        setCompletedPrs(prs);
        // Fire-and-forget: pull the session's real load from the watch into the backend
        // so the coach sees actual vs prescribed. Never blocks the completion UX.
        void syncIfPossible().catch(() => undefined);
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
      setSecInput('');
      setRirInput('');
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
    const sec = toNumberOrUndefined(secInput);
    const rir = toNumberOrUndefined(rirInput);
    if (weight !== undefined && !isBodyweight && !isTimeMode) payload.weightKg = weight;
    if (reps !== undefined && !isTimeMode) payload.reps = reps;
    if (isTimeMode && sec !== undefined) payload.sec = sec;
    if (!isTimeMode && sec !== undefined) payload.sec = sec; // allow timed extras on reps rows
    if (rir !== undefined) payload.rir = rir;
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

  const whyText = formatWhy(currentPrescription?.why);
  const targetLabel = isTimeMode
    ? `${currentPrescription?.sec ?? currentExercise?.sec ?? 0}s por serie`
    : [
        `${currentExercise?.sets ?? 0} × ${currentPrescription?.reps ?? currentExercise?.reps}`,
        isBodyweight ? '' : `@ ${currentPrescription?.weightKg ?? currentExercise?.weightKg ?? 0} kg`,
        currentExercise?.perSide ? '(por lado)' : '',
      ]
        .filter(Boolean)
        .join(' ');

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
              {completedPrs.length > 0 ? (
                <View style={styles.prWrap}>
                  <Text style={styles.prHeading}>🏆 NUEVOS RÉCORDS</Text>
                  {completedPrs.map((pr) => (
                    <Text key={`${pr.name}-${pr.est}`} style={styles.prLine}>
                      {pr.name} · e1RM {pr.est} kg
                    </Text>
                  ))}
                </View>
              ) : null}
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
                {targetLabel}
                {currentExercise.restSeconds ? ` · ${currentExercise.restSeconds}s rest` : ''}
              </Text>
              {whyText ? <Text style={styles.whyText}>💡 {whyText}</Text> : null}
              <Text style={styles.setProgress}>
                Serie {currentSetIndex + 1} de {currentExercise.sets}
              </Text>
            </View>

            <View style={styles.inputsRow}>
              {!isBodyweight && !isTimeMode ? (
                <View style={styles.inputCol}>
                  <Input
                    value={weightInput}
                    onChangeText={setWeightInput}
                    placeholder="Peso kg"
                    keyboardType="numeric"
                    inputMode="numeric"
                  />
                </View>
              ) : null}
              {isTimeMode ? (
                <View style={styles.inputCol}>
                  <Input
                    value={secInput}
                    onChangeText={setSecInput}
                    placeholder="Segundos"
                    keyboardType="numeric"
                    inputMode="numeric"
                  />
                </View>
              ) : (
                <View style={styles.inputCol}>
                  <Input
                    value={repsInput}
                    onChangeText={setRepsInput}
                    placeholder={currentExercise.perSide ? 'Reps totales (x lado)' : 'Reps'}
                    keyboardType="numeric"
                    inputMode="numeric"
                  />
                </View>
              )}
              <View style={styles.rirCol}>
                <Input
                  value={rirInput}
                  onChangeText={setRirInput}
                  placeholder="RIR"
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
  whyText: { ...typography.caption, color: colors.primary },
  setProgress: { ...typography.caption, color: colors.primary },

  inputsRow: { flexDirection: 'row', gap: spacing.md },
  inputCol: { flex: 1 },
  rirCol: { width: 84 },

  summaryWrap: { flex: 1, justifyContent: 'center' },
  summaryCard: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl },
  summaryLabel: { ...typography.label, color: colors.primary },
  summaryTitle: { ...typography.title, color: colors.text, textAlign: 'center' },
  summaryTime: { ...typography.display, color: colors.text },
  summaryMeta: { ...typography.caption, color: colors.textSecondary },
  prWrap: { alignItems: 'center', gap: spacing.xs },
  prHeading: { ...typography.label, color: colors.primary, marginTop: spacing.sm },
  prLine: { ...typography.caption, color: colors.text },
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
