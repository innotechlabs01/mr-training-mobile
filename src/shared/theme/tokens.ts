/**
 * Single source of truth for the MR Training redesign (spec 2026-08-21 §3).
 * Dark-first. One accent: Volt. Surfaces layer by tonal difference, not borders.
 */

export const colors = {
  base: '#111214', // app background, deepest layer
  surface: '#191B1E', // cards, main surfaces
  surfaceRaised: '#202329', // elevated elements, inputs, chips
  border: '#26292E', // hairlines, separators
  primary: '#C8FF00', // Volt — single accent, one primary CTA per screen
  primaryPressed: '#A8D900', // Volt pressed state
  text: '#F5F5F7', // primary text (WCAG AA on base/surface/surfaceRaised)
  textSecondary: '#9CA3AF', // secondary text, captions
  success: '#34D399',
  warning: '#FBBF24',
  error: '#FF5A5F',
} as const;

export const fontFamilies = {
  displayBlack: 'Archivo_900Black',
  display: 'Archivo_800ExtraBold',
  displayBold: 'Archivo_700Bold',
  heading: 'Archivo_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  bodyExtraBold: 'Inter_800ExtraBold',
} as const;

export const typography = {
  displayXL: { fontFamily: fontFamilies.display, fontSize: 48, lineHeight: 52 }, // hero numerals
  display: { fontFamily: fontFamilies.displayBold, fontSize: 40, lineHeight: 44 },
  title: { fontFamily: fontFamilies.heading, fontSize: 20, lineHeight: 26 },
  body: { fontFamily: fontFamilies.body, fontSize: 15, lineHeight: 20 },
  bodyStrong: { fontFamily: fontFamilies.bodySemiBold, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fontFamilies.bodyMedium, fontSize: 13, lineHeight: 17 },
  label: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radius = {
  sm: 8, // intentional redesign value; supersedes legacy 6
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const shadows = {
  sm: { shadowColor: '#000000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  md: { shadowColor: '#000000', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
} as const;

export const layout = {
  pagePadding: spacing.lg,
  cardPadding: spacing.md,
  touchTarget: 48,
  headerHeight: 56,
} as const;

export const tokens = { colors, typography, spacing, radius, shadows, layout, fontFamilies };
export default tokens;
