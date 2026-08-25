/**
 * Apex Performance Design System — mobile tokens.
 * Dark-first. Electric Orange primary, Velocity Blue secondary.
 * Montserrat for headlines, Inter for body.
 */

export const colors = {
  base: '#0A0A0B', // app background, deepest layer (midnight)
  surface: '#131315', // cards, main surfaces
  surfaceRaised: '#1E1E20', // elevated elements, inputs, chips
  border: '#2C2C2E', // hairlines, separators
  primary: '#FF5C00', // Electric Orange — high-priority CTA, progress, active states
  primaryPressed: '#CC4A00', // Orange pressed state
  primaryContainer: '#FF5C00', // filled containers
  secondary: '#007AFF', // Velocity Blue — data viz, secondary interactive, community
  secondaryPressed: '#0062CC', // Blue pressed state
  text: '#FFFFFF', // primary text (pure white, WCAG AA on dark)
  textSecondary: '#8E8E93', // muted gray — captions, secondary text
  success: '#34D399',
  warning: '#FBBF24',
  error: '#FFB4AB',
  errorContainer: '#93000A',
} as const;

export const fontFamilies = {
  displayBlack: 'Montserrat_900Black',
  display: 'Montserrat_800ExtraBold',
  displayBold: 'Montserrat_700Bold',
  heading: 'Montserrat_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  bodyExtraBold: 'Inter_800ExtraBold',
} as const;

export const typography = {
  displayXL: { fontFamily: fontFamilies.display, fontSize: 48, lineHeight: 52, letterSpacing: -0.02 },
  display: { fontFamily: fontFamilies.displayBold, fontSize: 40, lineHeight: 44 },
  headlineLG: { fontFamily: fontFamilies.displayBold, fontSize: 32, lineHeight: 38 },
  headlineMD: { fontFamily: fontFamilies.displayBold, fontSize: 24, lineHeight: 32 },
  title: { fontFamily: fontFamilies.heading, fontSize: 20, lineHeight: 26 },
  bodyLG: { fontFamily: fontFamilies.body, fontSize: 18, lineHeight: 28 },
  body: { fontFamily: fontFamilies.body, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fontFamilies.bodySemiBold, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fontFamilies.bodyMedium, fontSize: 13, lineHeight: 17 },
  label: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.05,
    textTransform: 'uppercase' as const,
  },
  statsNumber: { fontFamily: fontFamilies.displayBlack, fontSize: 48, lineHeight: 48 },
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
  sm: 2, // 0.125rem — sharp, technical
  md: 4, // 0.25rem — buttons, inputs
  lg: 8, // 0.5rem — cards, containers
  xl: 12, // 0.75rem — large cards
  full: 9999,
} as const;

export const shadows = {
  sm: { shadowColor: '#000000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  md: { shadowColor: '#000000', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
} as const;

export const layout = {
  pagePadding: spacing.md,
  cardPadding: spacing.md,
  touchTarget: 48,
  headerHeight: 56,
} as const;

export const tokens = { colors, typography, spacing, radius, shadows, layout, fontFamilies };
export default tokens;
