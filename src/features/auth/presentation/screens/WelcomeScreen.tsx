import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { darkTheme } from '../../../../shared/theme';

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
  container: { flex: 1, backgroundColor: darkTheme.colors.background },
  content: { flex: 1, justifyContent: 'space-between', padding: 24 },
  header: { alignItems: 'center', marginTop: 40 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: `${darkTheme.colors.primary}15`, borderWidth: 2, borderColor: `${darkTheme.colors.primary}30`,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  iconText: { fontSize: 32 },
  title: { fontSize: 32, fontWeight: '800', color: darkTheme.colors.text, textAlign: 'center', lineHeight: 40, marginBottom: 12 },
  subtitle: { fontSize: 16, color: darkTheme.colors.textSecondary, textAlign: 'center', lineHeight: 24, paddingHorizontal: 16 },
  cards: { gap: 12, marginTop: 24 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: darkTheme.colors.surface, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: darkTheme.colors.border, gap: 16,
  },
  cardPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  cardIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: `${darkTheme.colors.primary}15`, justifyContent: 'center', alignItems: 'center',
  },
  cardEmoji: { fontSize: 22 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: darkTheme.colors.text, marginBottom: 2 },
  cardDesc: { fontSize: 13, color: darkTheme.colors.textSecondary, lineHeight: 18 },
  cardArrow: { fontSize: 20, color: darkTheme.colors.primaryLight, fontWeight: '600' },
  hint: { fontSize: 13, color: darkTheme.colors.textSecondary, textAlign: 'center', marginTop: 16 },
  footer: { fontSize: 12, color: darkTheme.colors.textSecondary, textAlign: 'center' },
});
