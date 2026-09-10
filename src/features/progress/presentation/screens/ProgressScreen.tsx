import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../../infrastructure/api/client';
import type { RootStackParamList } from '../../../../navigation/Navigation';
import { colors, fontFamilies, radius, spacing } from '../../../../shared/theme/tokens';
import { ArrowLeftIcon, BellIcon, ChartBarIcon, SearchIcon, UserIcon } from '../../../../shared/components/icons';
import { SegmentedFilter } from '../../../../shared/components/ui/SegmentedFilter';
import { SectionHeader } from '../../../../shared/components/ui/SectionHeader';
import { ProgressSummary } from '../components/ProgressSummary';

type TodayData = {
  readiness: { sleep: number; hrv: number; recovery: number; score: number };
  todaySessions: Array<{ id: string; name: string; time: string; endTime: string; location: string; status: string }>;
  activeWorkouts: Array<{ id: string; contentName: string; modality: string; status: string; progress: number }>;
};

type Nav = NativeStackNavigationProp<RootStackParamList, 'Progress'>;

const PERIODS = [
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
  { key: 'year', label: 'Año' },
];

export function ProgressScreen() {
  const navigation = useNavigation<Nav>();
  const [period, setPeriod] = React.useState('week');

  const { data: today, isLoading } = useQuery({
    queryKey: ['athlete-today'],
    queryFn: async () => {
      const { data } = await apiClient.get('/athlete/today');
      return data as TodayData;
    },
    staleTime: 60_000,
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Volver"
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.backButton}
        >
          <ArrowLeftIcon size={24} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Progreso</Text>
        <View style={styles.headerRight}>
          <Pressable accessibilityLabel="Buscar" onPress={() => navigation.navigate('Search')} style={styles.iconButton}>
            <SearchIcon size={18} color={colors.textSecondary} />
          </Pressable>
          <Pressable accessibilityLabel="Notificaciones" onPress={() => navigation.navigate('Notifications')} style={styles.iconButton}>
            <BellIcon size={18} color={colors.textSecondary} />
          </Pressable>
          <Pressable accessibilityLabel="Perfil" onPress={() => undefined} style={styles.iconButton}>
            <UserIcon size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SegmentedFilter options={PERIODS} value={period} onChange={setPeriod} />
        <SectionHeader title="Resumen" icon={<ChartBarIcon size={18} color={colors.textSecondary} />} />
        <ProgressSummary data={today} loading={isLoading} />
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
  content: { padding: spacing.md, paddingBottom: 48, gap: spacing.md },
});
