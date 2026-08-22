import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../../navigation/Navigation';
import { colors, spacing, typography, radius } from '../../../../shared/theme/tokens';
import { apiClient } from '../../../../infrastructure/api/client';

type AuthNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;
type AuthRouteProp = RouteProp<RootStackParamList, 'Auth'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute<AuthRouteProp>();
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [coachCode, setCoachCode] = useState(route.params?.code ?? '');
  const [mode, setMode] = useState<'signin' | 'signup'>(route.params?.mode ?? 'signin');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    if (!coachCode.trim()) {
      Alert.alert('Error', 'El código de coach es obligatorio');
      return;
    }

    const normalizedCode = coachCode.trim().toUpperCase();

    if (mode === 'signin') {
      if (!signInLoaded) {
        Alert.alert('Please wait', 'Authentication is loading...');
        return;
      }
      setLoading(true);
      try {
        const result = await signIn.create({
          identifier: email.trim(),
          password,
        });
        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId });
          // Coach code association via direct API - primary path for sign-in (user already exists, webhook user.created won't fire)
          // Server updates Clerk public_metadata atomically, webhook user.updated is fallback
          try {
            await apiClient.post('/athlete/accept-invite', { code: normalizedCode });
          } catch (err) {
            console.error('[Auth] accept-invite failed on sign-in:', err);
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Sign in failed';
        Alert.alert('Sign in failed', message);
      } finally {
        setLoading(false);
      }
    } else {
      if (!signUpLoaded) {
        Alert.alert('Please wait', 'Authentication is loading...');
        return;
      }
      setLoading(true);
      try {
        const result = await signUp.create({
          emailAddress: email.trim(),
          password,
          unsafeMetadata: { coachCode: normalizedCode },
        });
        if (result.status === 'complete') {
          await setActiveSignUp({ session: result.createdSessionId });
          // Onboard athlete: create profile + 7-day trial — after setActive so isSignedIn flips
          const onboarding = route.params?.onboardingData;
          try {
            await apiClient.post('/athlete/onboard', {
              sports: onboarding?.sports ?? [],
              modality: onboarding?.modality ?? '',
              experienceLevel: onboarding?.experienceLevel ?? '',
              goal: onboarding?.goal ?? '',
              sessionsPerWeek: onboarding?.sessionsPerWeek ?? 0,
              sessionDuration: onboarding?.sessionDuration ?? 0,
              equipment: onboarding?.equipment ?? '',
              athleteRoutineAccepted: onboarding?.athleteRoutineAccepted ?? true,
            });
          } catch (err) {
            console.error('[Auth] onboard failed on sign-up:', err);
          }
          try {
            // Direct DB association as backup — webhook user.created with unsafeMetadata is primary
            await apiClient.post('/athlete/accept-invite', { code: normalizedCode });
          } catch (err) {
            console.error('[Auth] accept-invite failed on sign-up:', err);
          }
        } else {
          Alert.alert('Check your email', 'We sent you a verification link');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Sign up failed';
        Alert.alert('Sign up failed', message);
      } finally {
        setLoading(false);
      }
    }
  };

  const isLoaded = mode === 'signin' ? signInLoaded : signUpLoaded;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.header}>
            <Text style={styles.brand}>MR TRAINING</Text>
            <Text style={styles.title}>
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'signin' ? 'Your training journey continues' : 'Start your fitness journey today'}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              accessibilityLabel="Email address"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="At least 8 characters"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              accessibilityLabel="Password"
            />

            {/* Coach Code — mandatory */}
            <Text style={styles.label}>Coach Code *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. MR-YH9R"
              placeholderTextColor={colors.textSecondary}
              value={coachCode}
              onChangeText={setCoachCode}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={8}
              accessibilityLabel="Coach invite code"
            />
            <Text style={styles.codeHint}>
              Required — enter your coach&apos;s code to connect with your coach
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                (loading || !isLoaded) && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading || !isLoaded}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.switchButton}
              onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            >
              <Text style={styles.switchText}>
                {mode === 'signin'
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Sign In'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  brand: { ...typography.label, fontSize: 12, color: colors.primary, marginBottom: spacing.md },
  title: { ...typography.title, fontSize: 28, lineHeight: 34, color: colors.text, textAlign: 'center' },
  subtitle: { ...typography.body, fontSize: 17, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  label: { ...typography.caption, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    height: 48,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: { backgroundColor: colors.primary, height: 52, borderRadius: radius.md, justifyContent: 'center', alignItems: 'center', marginTop: spacing.sm },
  buttonPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { ...typography.bodyStrong, color: colors.base },
  switchButton: { marginTop: spacing.md, alignItems: 'center' },
  switchText: { ...typography.bodyStrong, fontSize: 14, color: colors.primary },
  codeHint: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm, marginTop: -spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
});
