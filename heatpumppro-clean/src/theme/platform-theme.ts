export const PlatformSpacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const PlatformRadius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
} as const;

export const PlatformTypography = {
  title: 28,
  heading: 20,
  subheading: 16,
  body: 14,
  caption: 12,
  button: 15,
} as const;

export const PlatformShadows = {
  card: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
} as const;

export const PlatformSurfaces = {
  appBackground: '#f3f7fb',
  cardBackground: '#ffffff',
  cardBorder: '#dbe7f6',
  headerBackground: '#0f4fb3',
  headerText: '#ffffff',
  headerMuted: '#dbeafe',
} as const;

export const PlatformStatusColors = {
  success: '#166534',
  warning: '#a16207',
  danger: '#b91c1c',
  info: '#0f4fb3',
  muted: '#64748b',
} as const;

export const PlatformActions = {
  primary: '#0f4fb3',
  secondary: '#475569',
  warning: '#b45309',
  destructive: '#b91c1c',
} as const;

export const PlatformTouch = {
  targetMinHeight: 52,
} as const;

export const PlatformLayout = {
  maxContentWidth: 1120,
} as const;
