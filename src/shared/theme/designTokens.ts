/**
 * TEMPORARY compatibility shim — re-exports legacy designTokens names backed by
 * the unified tokens.ts (Volt system). Every consumer migrates in Phase B, then
 * this file is deleted. Do not add new usages.
 */
import { colors, fontFamilies, radius, shadows, spacing, typography } from './tokens';

export const Colors = {
  background: colors.base,
  surface0: colors.base,
  surface1: colors.surface,
  surface3: colors.surface,
  surface5: colors.surfaceRaised,
  surface6: colors.border,
  primary: colors.primary,
  primaryHover: colors.primaryPressed,
  primaryPressed: colors.primaryPressed,
  secondary: colors.primary, // Performance Blue retired; single-accent system
  textPrimary: colors.text,
  textSecondary: colors.textSecondary,
  textTertiary: colors.textSecondary,
  success: colors.success,
  error: colors.error,
  warning: colors.warning,
  border: colors.border,
} as const;

export const Typography = {
  display: { fontFamily: fontFamilies.displayBold, fontSize: typography.display.fontSize, lineHeight: typography.display.lineHeight },
  title1: { fontFamily: fontFamilies.displayBold, fontSize: typography.title.fontSize, lineHeight: typography.title.lineHeight },
  title2: { fontFamily: fontFamilies.heading, fontSize: typography.title.fontSize, lineHeight: typography.title.lineHeight },
  title3: { fontFamily: fontFamilies.heading, fontSize: typography.title.fontSize, lineHeight: typography.title.lineHeight },
  body: { fontFamily: fontFamilies.body, fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight },
  callout: { fontFamily: fontFamilies.body, fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight },
  subhead: { fontFamily: fontFamilies.body, fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight },
  footnote: { fontFamily: fontFamilies.bodyMedium, fontSize: typography.caption.fontSize, lineHeight: typography.caption.lineHeight },
  caption: { fontFamily: fontFamilies.bodyMedium, fontSize: typography.caption.fontSize, lineHeight: typography.caption.lineHeight },
  overline: { ...typography.label, fontFamily: fontFamilies.bodySemiBold },
  mono: { fontFamily: fontFamilies.body, fontSize: 14, lineHeight: 18 }, // JetBrains Mono not loaded
} as const;

export const Spacing = spacing;
export const Radius = radius;
export const Shadows = shadows;
export const Layout = {
  pagePadding: spacing.lg,
  cardPadding: spacing.md,
  cardGap: spacing.md,
  touchTarget: 48,
  headerHeight: 56,
  tabBarHeight: 84,
} as const;

export const DesignTokens = { Colors, Typography, Spacing, Radius, Shadows, Layout };
