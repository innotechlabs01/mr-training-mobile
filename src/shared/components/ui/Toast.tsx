import React from 'react';
import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import Toast, { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';
import type { ToastConfig } from 'react-native-toast-message';
import { colors, radius, spacing, typography } from '../../theme/tokens';

// ---------------------------------------------------------------------------
// Theme-matched toast config — Apex dark theme
// ---------------------------------------------------------------------------

const toastStyle: ViewStyle = {
  backgroundColor: colors.surface,
  borderLeftWidth: 4,
  borderRadius: radius.md,
  borderLeftColor: colors.primary,
  borderTopWidth: StyleSheet.hairlineWidth,
  borderRightWidth: StyleSheet.hairlineWidth,
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderTopColor: colors.border,
  borderRightColor: colors.border,
  borderBottomColor: colors.border,
  minHeight: 64,
  paddingVertical: spacing.sm,
};

const text1Style: TextStyle = {
  ...typography.bodyStrong,
  fontSize: 14,
  color: colors.text,
};

const text2Style: TextStyle = {
  ...typography.body,
  fontSize: 13,
  color: colors.textSecondary,
};

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={[toastStyle, { borderLeftColor: colors.success }]}
      contentContainerStyle={{ paddingHorizontal: spacing.md }}
      text1Style={text1Style}
      text2Style={text2Style}
      text1NumberOfLines={2}
      text2NumberOfLines={3}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={[toastStyle, { borderLeftColor: colors.error }]}
      contentContainerStyle={{ paddingHorizontal: spacing.md }}
      text1Style={text1Style}
      text2Style={text2Style}
      text1NumberOfLines={2}
      text2NumberOfLines={3}
    />
  ),
  info: (props) => (
    <InfoToast
      {...props}
      style={[toastStyle, { borderLeftColor: colors.secondary }]}
      contentContainerStyle={{ paddingHorizontal: spacing.md }}
      text1Style={text1Style}
      text2Style={text2Style}
      text1NumberOfLines={2}
      text2NumberOfLines={3}
    />
  ),
};

// ---------------------------------------------------------------------------
// Imperative helper — unified API for the app
// ---------------------------------------------------------------------------

export type ToastType = 'success' | 'error' | 'info';

export function showToast(type: ToastType, title: string, message?: string) {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 56,
  });
}

// Re-export imperative Toast for provider rendering and direct use if needed.
export { Toast };
export default Toast;
