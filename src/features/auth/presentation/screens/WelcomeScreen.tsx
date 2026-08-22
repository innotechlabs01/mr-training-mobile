import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, radius } from '../../../../shared/theme/tokens';

type Props = {
  onNewUser: () => void;
  onExistingUser: () => void;
};

export function WelcomeScreen({ onNewUser, onExistingUser }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🏋️</Text>
          </View>
          <Text style={styles.title}>Welcome to{'\n'}MR Training</Text>
          <Text style={styles.subtitle}>
            Your personal coach in your pocket. Train smarter, recover better, reach your goals.
          </Text>
        </View>

        <View style={styles.cards}>
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={onNewUser}
            accessibilityLabel="I'm new here — Get a personalized plan"
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardEmoji}>🚀</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>I&apos;m new here</Text>
              <Text style={styles.cardDesc}>Get a personalized plan based on your sport and goals</Text>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={onExistingUser}
            accessibilityLabel="I already train — Sign in to continue"
          >
            <View style={styles.cardIcon}>
              <Text style={styles.cardEmoji}>💪</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>I already train</Text>
              <Text style={styles.cardDesc}>Sign in and continue where you left off</Text>
            </View>
            <Text style={styles.cardArrow}>→</Text>
          </Pressable>
        </View>

        <Text style={styles.hint}>
          Have a coach code? Enter it during sign up
        </Text>

        <Text style={styles.footer}>
          By continuing you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  content: { flex: 1, justifyContent: 'space-between', padding: spacing.xl },
  header: { alignItems: 'center', marginTop: spacing.xl },
  iconCircle: {
    width: 72, height: 72, borderRadius: radius.full,
    backgroundColor: `${colors.primary}15`, borderWidth: 2, borderColor: `${colors.primary}30`,
    justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg,
  },
  iconText: { fontSize: 32 },
  title: { ...typography.display, fontSize: 32, lineHeight: 40, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { ...typography.body, fontSize: 16, lineHeight: 24, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.md },
  cards: { gap: spacing.sm, marginTop: spacing.lg },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: colors.border, gap: spacing.md,
  },
  cardPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  cardIcon: {
    width: 48, height: 48, borderRadius: radius.full,
    backgroundColor: `${colors.primary}15`, justifyContent: 'center', alignItems: 'center',
  },
  cardEmoji: { fontSize: 22 },
  cardContent: { flex: 1 },
  cardTitle: { ...typography.title, fontSize: 17, color: colors.text, marginBottom: spacing.xs },
  cardDesc: { ...typography.caption, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  cardArrow: { ...typography.bodyStrong, fontSize: 20, color: colors.primary },
  hint: { ...typography.caption, fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md },
  footer: { ...typography.caption, fontSize: 12, color: colors.textSecondary, textAlign: 'center' },
});
