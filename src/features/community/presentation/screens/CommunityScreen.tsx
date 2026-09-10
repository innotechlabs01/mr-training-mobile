import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { getCommunity } from '../../communityService';
import { colors, spacing } from '../../../../shared/theme/tokens';
import { ScreenHeader } from '../../../../shared/components/ui/ScreenHeader';
import { SegmentedFilter } from '../../../../shared/components/ui/SegmentedFilter';
import { ListCard } from '../../../../shared/components/ui/ListCard';
import { Skeleton } from '../../../../shared/components/ui/Skeleton';
import { EmptyState } from '../../../../shared/components/ui/EmptyState';
import { PrimaryButton } from '../../../../shared/components/ui/PrimaryButton';
import { ChatIcon, FireIcon, ClockIcon } from '../../../../shared/components/icons';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type Tab = 'forum' | 'challenges';
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CommunityScreen() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<Tab>('forum');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['community'],
    queryFn: getCommunity,
    staleTime: 60_000,
  });

  const forums = data?.forums ?? [];
  const challenges = data?.challenges ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Comunidad" onBack={() => navigation.goBack()} />

      <View style={styles.filterWrap}>
        <SegmentedFilter
          options={[
            { key: 'forum', label: 'Foro' },
            { key: 'challenges', label: 'Desafíos' },
          ]}
          value={tab}
          onChange={(key) => setTab(key as Tab)}
        />
      </View>

      {isLoading ? (
        <View style={styles.skeletonWrap}>
          <Skeleton.List rows={5} />
        </View>
      ) : tab === 'forum' ? (
        forums.length === 0 ? (
          <EmptyState
            variant="empty"
            title="Sin foros disponibles"
            message="Todavía no hay foros disponibles."
            actionLabel="Reintentar"
            onAction={() => refetch()}
          />
        ) : (
          <View style={styles.listContent}>
            {forums.map((topic, i) => (
              <ListCard
                key={topic.id}
                title={topic.title}
                subtitle={topic.description}
                leadingIcon={<ChatIcon size={20} color={colors.textSecondary} />}
                onPress={() => navigation.navigate('DiscussionForum')}
                last={i === forums.length - 1}
              />
            ))}
          </View>
        )
      ) : challenges.length === 0 ? (
        <EmptyState
          variant="empty"
          title="Sin desafíos activos"
          message="No hay desafíos activos por ahora."
          actionLabel="Reintentar"
          onAction={() => refetch()}
        />
      ) : (
        <View style={styles.listContent}>
          {challenges.map((challenge, i) => (
            <ListCard
              key={challenge.id}
              title={challenge.title}
              subtitle={`${challenge.durationMinutes} min · ${challenge.calories} Kcal`}
              leadingIcon={<FireIcon size={20} color={colors.primary} />}
              trailing={<ClockIcon size={18} color={colors.textSecondary} />}
              onPress={() => navigation.navigate('ChallengeDetail')}
              last={i === challenges.length - 1}
            />
          ))}
          <PrimaryButton label="Unirse" onPress={() => navigation.navigate('ChallengeDetail')} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  filterWrap: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  skeletonWrap: { paddingHorizontal: spacing.md },
  listContent: { paddingHorizontal: spacing.md, gap: spacing.sm },
});
