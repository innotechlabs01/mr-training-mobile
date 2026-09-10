import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '../../../../shared/theme/tokens';
import { ScreenHeader } from '../../../../shared/components/ui/ScreenHeader';
import { EmptyState } from '../../../../shared/components/ui/EmptyState';
import { PrimaryButton } from '../../../../shared/components/ui/PrimaryButton';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function WeeklyChallengeScreen() {
  const navigation = useNavigation<Nav>();

  // Challenge data is not wired to the backend yet. Show an honest "no data yet"
  // empty state — never an invented leaderboard or fake progress.
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Desafío semanal" onBack={() => navigation.goBack()} />

      <EmptyState
        variant="empty"
        title="Sin datos todavía"
        message="Cuando haya un desafío activo, vas a ver aquí tu progreso semanal."
      />

      <View style={styles.ctaWrap}>
        <PrimaryButton label="Unirse" onPress={() => navigation.navigate('ChallengeDetail')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  ctaWrap: { padding: spacing.md },
});
