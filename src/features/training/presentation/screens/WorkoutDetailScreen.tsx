import { Linking, Pressable, View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { apiClient } from '../../../../infrastructure/api/client';
import { colors, spacing, typography } from '../../../../shared/theme/tokens';
import { Card } from '../../../../shared/components/ui/Card';
import { EmptyState } from '../../../../shared/components/ui/EmptyState';
import { PrimaryButton } from '../../../../shared/components/ui/PrimaryButton';
import { ScreenHeader } from '../../../../shared/components/ui/ScreenHeader';
import { TrackedVideoPlayer } from '../components/TrackedVideoPlayer';
import type { RootStackParamList } from '../../../../navigation/Navigation';

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
  videoUrl?: string | null;
};

type Workout = {
  id: string;
  athleteId: string;
  contentName: string;
  status: string;
  progress: number;
};

type WorkoutDetailData = {
  workout: Workout;
  exercises: Exercise[];
};

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutDetail'>;

export function WorkoutDetailScreen({ route, navigation }: Props) {
  const { workoutId } = route.params;

  const { data, isLoading, isRefetching, refetch, isError } = useQuery({
    queryKey: ['workout-detail', workoutId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/athlete/workouts/${workoutId}`);
      return data as WorkoutDetailData;
    },
    staleTime: 5 * 60 * 1000,
  });

  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(`/athlete/workouts/${workoutId}/session`);
      return data.session as { id: string };
    },
    onSuccess: (session) => {
      navigation.navigate('WorkoutExecution', { sessionId: session.id, workoutId });
    },
    onError: (err) => {
      console.error('Failed to start session:', err);
      Alert.alert('Could not start workout', 'Please try again.');
    },
  });

  const isLoadingData = isLoading || isRefetching;
  const hasExercises = !!data && data.exercises.length > 0;
  const athleteId = data?.workout.athleteId ?? '';

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title={data?.workout.contentName ?? 'Workout'} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}>
        {isLoadingData ? (
          <EmptyState variant="loading" message="Loading workout..." />
        ) : isError || !data ? (
          <EmptyState variant="error" message="Could not load workout" onRetry={refetch} />
        ) : !hasExercises ? (
          <EmptyState variant="empty" message="No exercises" />
        ) : (
          <>
            {data.exercises.map((ex) => (
              <Card key={ex.id} style={styles.card}>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                <Text style={styles.exerciseSetReps}>
                  {ex.sets} × {ex.reps}
                </Text>
                <View style={styles.metaRow}>
                  {ex.weightKg ? <Text style={styles.meta}>{`${ex.weightKg} kg`}</Text> : null}
                  {ex.restSeconds ? <Text style={styles.meta}>{`${ex.restSeconds}s rest`}</Text> : null}
                </View>
                {ex.videoUrl ? (
                  <View style={{ marginTop: spacing.sm }}>
                    <TrackedVideoPlayer
                      videoUrl={ex.videoUrl}
                      exerciseId={ex.id}
                      athleteId={athleteId}
                    />
                  </View>
                ) : null}
              </Card>
            ))}
          </>
        )}
      </ScrollView>
      {hasExercises ? (
        <View style={styles.cta}>
          <PrimaryButton label="Comenzar" onPress={() => startSessionMutation.mutate()} disabled={startSessionMutation.isPending} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  content: { padding: spacing.lg, paddingBottom: 100 },
  card: { marginBottom: spacing.sm, gap: spacing.xs },
  exerciseName: { ...typography.bodyStrong, color: colors.text },
  exerciseSetReps: { ...typography.body, color: colors.textSecondary },
  metaRow: { flexDirection: 'row', gap: spacing.md },
  meta: { ...typography.caption, color: colors.textSecondary },
  videoLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.xs },
  videoLinkText: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  cta: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
  },
});
