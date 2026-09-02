import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '@clerk/clerk-expo';
import { colors, spacing, radius, typography, fontFamilies } from '../../../../shared/theme/tokens';
import type { RootStackParamList } from '../../../../navigation/Navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function PasswordSettingsScreen() {
  const navigation = useNavigation<Nav>();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await user?.updatePassword({ currentPassword, newPassword });
      Alert.alert('Success', 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update password';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset is not yet implemented.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={styles.backButton}
          >
            <Text style={styles.backChevron}>{'\u2039'}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Password Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Inputs */}
        <View style={styles.bodyWrap}>
          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>{'\uD83D\uDD12'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              placeholderTextColor={colors.textSecondary}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrent}
              autoCapitalize="none"
              autoCorrect={false}
              onPress={() => setShowCurrent((prev) => !prev)}
            />
            <Pressable
              style={{ padding: 4 }}
              onPress={() => setShowCurrent((prev) => !prev)}
            >
              <Text style={{ color: colors.textSecondary }}>{showCurrent ? '\uD83D\uDD25' : '\uD83D\uDD12'}</Text>
            </Pressable>
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>{'\uD83D\uDD12'}</Text>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor={colors.textSecondary}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNew}
              autoCapitalize="none"
              autoCorrect={false}
              onPress={() => setShowNew((prev) => !prev)}
            />
            <Pressable
              style={{ padding: 4 }}
              onPress={() => setShowNew((prev) => !prev)}
            >
              <Text style={{ color: colors.textSecondary }}>•••</Text>
            </Pressable>
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputIcon}>{'\uD83D\uDD12'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              autoCapitalize="none"
              autoCorrect={false}
              onPress={() => setShowConfirm((prev) => !prev)}
            />
            <Pressable
              style={{ padding: 4 }}
              onPress={() => setShowConfirm((prev) => !prev)}
            >
              <Text style={{ color: colors.text }}>•••</Text>
            </Pressable>
          </View>

          {/* CTA */}
          <Pressable
            style={({ pressed }) => [styles.ctaButton, (pressed || loading) && styles.ctaPressed]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            <Text style={styles.ctaText}>{loading ? 'Updating...' : 'Change Password'}</Text>
          </Pressable>

          {/* Forgot password link */}
          <Pressable onPress={handleForgotPassword} style={styles.forgotLink}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.base },
  flex: { flex: 1 },
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
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: { color: colors.primary, fontSize: 32, lineHeight: 32, fontWeight: '400' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fontFamilies.displayBold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.primary,
  },
  headerSpacer: { width: 32 },
  bodyWrap: {
    padding: spacing.md,
    gap: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  inputIcon: { fontSize: 16 },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    height: '100%',
  },
  ctaButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  ctaPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  ctaText: {
    ...typography.bodyStrong,
    fontWeight: '700',
    color: colors.base,
  },
  forgotLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  forgotText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});