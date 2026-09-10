import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../../navigation/Navigation';
import { colors, fontFamilies, radius, spacing, typography } from '../../../../shared/theme/tokens';
import { ArrowLeftIcon, BarbellIcon, BellIcon, ChatIcon, ChartBarIcon, FireIcon } from '../../../../shared/components/icons';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type NotificationType = {
  key: string;
  icon: React.ReactNode;
  label: string;
  description: string;
};

const NOTIFICATION_TYPES: NotificationType[] = [
  { key: 'workoutReminders', icon: <BarbellIcon size={18} color={colors.text} />, label: 'Recordatorios de entrenamiento', description: 'Recibe notificaciones cuando se asigna un entrenamiento' },
  { key: 'weeklyChallenges', icon: <FireIcon size={18} color={colors.text} />, label: 'Desafíos semanales', description: 'Notificaciones de desafíos de entrenamiento semanales' },
  { key: 'newArticles', icon: <ChartBarIcon size={18} color={colors.text} />, label: 'Nuevos artículos', description: 'Nuevos artículos de blog y marketing' },
  { key: 'communityUpdates', icon: <ChatIcon size={18} color={colors.text} />, label: 'Actualizaciones de la comunidad', description: 'Actualizaciones del foro y discusiones de la comunidad' },
  { key: 'progressReports', icon: <BellIcon size={18} color={colors.text} />, label: 'Informes de progreso', description: 'Resúmenes de progreso y notificaciones de logros' },
];

export function NotificationSettingsScreen() {
  const navigation = useNavigation<Nav>();

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    workoutReminders: true,
    weeklyChallenges: true,
    newArticles: false,
    communityUpdates: true,
    progressReports: false,
  });

  const handleToggle = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
        <Text style={styles.headerTitle}>Configuración de notificaciones</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.contentWrap}>
        {NOTIFICATION_TYPES.map((item) => (
          <View key={item.key} style={styles.row}>
            <View style={styles.iconCircle}>{item.icon}</View>
            <View style={styles.rowBody}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowDescription}>{item.description}</Text>
            </View>
            <Switch
              value={toggles[item.key]}
              onValueChange={() => handleToggle(item.key)}
              trackColor={{ true: colors.primary, false: colors.surfaceRaised }}
              thumbColor={colors.text}
              ios_backgroundColor={colors.surfaceRaised}
            />
          </View>
        ))}
      </View>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  backButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamilies.displayBold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.primary,
  },
  headerSpacer: { width: 32 },
  contentWrap: { padding: spacing.md, gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowBody: { flex: 1, gap: 2 },
  rowLabel: { ...typography.bodyStrong, color: colors.text, fontSize: 15 },
  rowDescription: { ...typography.caption, color: colors.textSecondary, lineHeight: 16 },
});
