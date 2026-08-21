/**
 * Centralized design tokens. Never hardcode colors, spacing, or font sizes
 * directly in component styles — import from here instead.
 *
 * Palette rationale: a deep indigo/ink for focus and structure (reading and
 * study contexts benefit from a calm, low-glare base), with a clear amber
 * for progress/in-progress states and a grounded teal for completion —
 * distinct roles rather than one generic "brand accent" reused everywhere.
 */

export const lightColors = {
  ink: '#14162B',
  inkMuted: '#4B4E68',
  background: '#FAFAFC',
  surface: '#FFFFFF',
  border: '#E3E4EE',
  primary: '#3B3F8C',
  primaryMuted: '#ECEDF9',
  progress: '#C77D2E',
  success: '#1E7A6C',
  danger: '#B3412C',
  info: '#2E6BB3',
  warning: '#C77D2E', // Amber
  error: '#B3412C',   // Red
  white: '#FFFFFF',
  gray100: '#F3F3F7',
  gray300: '#D6D7E3',
  gray500: '#8B8DA3',
  gray700: '#5A5C74',
};

export const darkColors = {
  ink: '#FAFAFC',
  inkMuted: '#A0A2B8',
  background: '#14162B',
  surface: '#1E203D',
  border: '#2E3152',
  primary: '#5C62C7',
  primaryMuted: '#24274F',
  progress: '#E6A23C',
  success: '#34A853',
  danger: '#F56C6C',
  info: '#409EFF',
  warning: '#E6A23C',
  error: '#F56C6C',
  white: '#FFFFFF',
  gray100: '#1E203D',
  gray300: '#2E3152',
  gray500: '#8B8DA3',
  gray700: '#D6D7E3',
};

// Default export for backward compatibility where possible,
// though dynamic themes will need the useTheme hook.
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  display: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    color: colors.ink,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 26,
    color: colors.ink,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    color: colors.ink,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
    color: colors.ink,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
    color: colors.inkMuted,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    color: colors.inkMuted,
    letterSpacing: 0.4,
  },
} as const;

export const shadow = {
  card: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;

export const tapTarget = {
  minHeight: 44,
  minWidth: 44,
} as const;
