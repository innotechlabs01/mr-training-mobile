import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, fontFamilies } from '../../../../shared/theme/tokens';
import { ScreenHeader } from '../../../../shared/components/ui/ScreenHeader';
import { MetricCard } from '../../../../shared/components/ui/MetricCard';
import { StatGrid } from '../../../../shared/components/ui/StatGrid';
import { SectionHeader } from '../../../../shared/components/ui/SectionHeader';
import { PrimaryButton } from '../../../../shared/components/ui/PrimaryButton';
import { FireIcon } from '../../../../shared/components/icons';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const RULES = [
  'Completa todos los ejercicios cada día durante la duración del desafío.',
  'Registra tu sesión en la aplicación.',
  'Los primeros 3 participantes ganan el premio.',
];

export function ChallengeDetailScreen() {
  const navigation = useNavigation<Nav>();

  // Challenge detail not wired to a data source yet — show honest "no value"
  // placeholders (em-dash) instead of invented counts/timers.
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Desafío y competencias" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader title="Detalle del desafío" icon={<FireIcon size={18} color={colors.primary} />} />

        <StatGrid
          metrics={[
            { label: 'Duración', value: null, unit: 'días' },
            { label: 'Energía', value: null, unit: 'Kcal' },
            { label: 'Participantes', value: null },
          ]}
        />

        <View style={styles.section}>
          <SectionHeader title="Reglas" />
          <View style={styles.rulesCard}>
            {RULES.map((rule, i) => (
              <Text key={i} style={styles.ruleItem}>
                {rule}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.ctaWrap}>
        <PrimaryButton label="Unirme ahora" onPress={() => navigation.goBack()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  content: { padding: spacing.md, paddingBottom: spacing.lg, gap: spacing.lg },
  section: { gap: spacing.sm },
  rulesCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  ruleItem: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  ctaWrap: { padding: spacing.md, paddingTop: 0 },
});
