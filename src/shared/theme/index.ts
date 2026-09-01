/**
 * TEMPORARY compatibility shim — keeps `darkTheme` imports compiling during
 * Phase A. All values derive from tokens.ts. Consumers migrate to tokens +
 * UI kit in Phase B, then this file is deleted. Do not add new usages.
 */
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { colors } from './tokens';

export { colors, typography, spacing, radius, shadows, layout, fontFamilies } from './tokens';
export { tokens } from './tokens';

export const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.base,
    card: colors.surface,
    surface: colors.surface,
    text: colors.text,
    textSecondary: colors.textSecondary,
    primary: colors.primary,
    primaryLight: colors.primaryPressed,
    destructive: colors.error,
    success: colors.success,
    warning: colors.warning,
    border: colors.border,
  },
};

export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
    surface: colors.base,
    text: colors.base,
    textSecondary: '#4B5563',
    primary: colors.primary,
    primaryLight: colors.primaryPressed,
    destructive: colors.error,
    success: colors.success,
    warning: colors.warning,
    border: '#E5E7EB',
  },
};