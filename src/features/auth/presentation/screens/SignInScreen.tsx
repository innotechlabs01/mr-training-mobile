import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignIn, useSignUp, useUser } from '@clerk/clerk-expo';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../../navigation/Navigation';
import { darkTheme } from '../../../../shared/theme';
import { apiClient } from '../../../../infrastructure/api/client';

type AuthNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;
type AuthRouteProp = RouteProp<RootStackParamList, 'Auth'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInScreen() {
  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute<AuthRouteProp>();
  const { signIn, setActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();
  const { user } = useUser();
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
          // Coach code association after setActive — non-blocking; RootNavigator will remount to AthleteTabs via isSignedIn
          const code = coachCode.trim().toUpperCase();
          try {
            await user?.update({ unsafeMetadata: { coachCode: code } });
          } catch {
            // Non-blocking
          }
          try {
            await apiClient.post('/athlete/accept-invite', { code });
          } catch {
            // Non-blocking — code association is best-effort on signin
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
        });
        if (result.status === 'complete') {
          await setActiveSignUp({ session: result.createdSessionId });
          // Onboard athlete: create profile + 7-day trial — after setActive so isSignedIn flips
          try {
            await apiClient.post('/athlete/onboard', {});
          } catch {
            // Non-blocking
          }
          const code = coachCode.trim().toUpperCase();
          try {
            // Store code in user metadata (writable from client)
            await user?.update({ unsafeMetadata: { coachCode: code } });
          } catch {
            // Non-blocking — metadata is best-effort
          }
          try {
            // Also create the association in the database
            await apiClient.post('/athlete/accept-invite', { code });
          } catch {
            // Non-blocking
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
              placeholderTextColor={darkTheme.colors.textSecondary}
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
              placeholderTextColor={darkTheme.colors.textSecondary}
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
              placeholderTextColor={darkTheme.colors.textSecondary}
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
  container: { flex: 1, backgroundColor: darkTheme.colors.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  brand: { fontSize: 12, color: darkTheme.colors.primary, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 },
  title: { fontSize: 28, lineHeight: 34, color: darkTheme.colors.text, textAlign: 'center', fontWeight: '700' },
  subtitle: { fontSize: 17, color: darkTheme.colors.textSecondary, textAlign: 'center', marginTop: 8 },
  card: { backgroundColor: darkTheme.colors.surface, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: darkTheme.colors.border },
  label: { fontSize: 13, fontWeight: '600', color: darkTheme.colors.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: darkTheme.colors.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
  },
  button: { backgroundColor: darkTheme.colors.primary, height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 16, color: '#FFFFFF', fontWeight: '700' },
  switchButton: { marginTop: 16, alignItems: 'center' },
  switchText: { fontSize: 14, color: darkTheme.colors.primaryLight },
  codeHint: { fontSize: 11, color: darkTheme.colors.textSecondary, marginBottom: 12, marginTop: -6 },
});
