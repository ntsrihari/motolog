export const Colors = {
  dark: {
    background: '#0D0D0D',
    surface1: 'rgba(255,255,255,0.06)',
    surface2: 'rgba(255,255,255,0.10)',
    surface3: 'rgba(255,255,255,0.14)',
    border: 'rgba(255,255,255,0.12)',
    borderBright: 'rgba(255,255,255,0.18)',
    accent: '#E8FF3A',
    accentLight: '#F0FF7A',
    accentDim: 'rgba(232,255,58,0.15)',
    blue: '#3A8DFF',
    blueLight: '#6BABFF',
    blueDim: 'rgba(58,141,255,0.15)',
    danger: '#FF4D4D',
    dangerDim: 'rgba(255,77,77,0.15)',
    success: '#2ECC71',
    successDim: 'rgba(46,204,113,0.15)',
    warning: '#F59E0B',
    warningDim: 'rgba(245,158,11,0.15)',
    textPrimary: '#F5F5F5',
    textSecondary: '#9A9A9A',
    textMuted: '#5A5A5A',
    overlay: 'rgba(0,0,0,0.6)',
  },
  light: {
    background: '#F0F2F5',
    surface1: 'rgba(255,255,255,0.75)',
    surface2: 'rgba(255,255,255,0.92)',
    surface3: 'rgba(255,255,255,0.98)',
    border: 'rgba(0,0,0,0.08)',
    borderBright: 'rgba(0,0,0,0.14)',
    accent: '#1A6F00',
    accentLight: '#2A9F00',
    accentDim: 'rgba(26,111,0,0.12)',
    blue: '#1E6FE0',
    blueLight: '#3A8DFF',
    blueDim: 'rgba(30,111,224,0.12)',
    danger: '#DC2626',
    dangerDim: 'rgba(220,38,38,0.10)',
    success: '#16A34A',
    successDim: 'rgba(22,163,74,0.10)',
    warning: '#D97706',
    warningDim: 'rgba(217,119,6,0.10)',
    textPrimary: '#111111',
    textSecondary: '#555555',
    textMuted: '#888888',
    overlay: 'rgba(0,0,0,0.4)',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
} as const;

export const Radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
  pill: 50,
} as const;

export const Typography = {
  display: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  headline: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  title: { fontSize: 17, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  micro: { fontSize: 11, fontWeight: '500' as const, lineHeight: 16 },
} as const;

export const Glass = {
  dark: {
    background: 'rgba(255,255,255,0.06)',
    backgroundModal: 'rgba(255,255,255,0.10)',
    blur: 20,
    saturation: 1.8,
    border: 'rgba(255,255,255,0.12)',
    borderBright: 'rgba(255,255,255,0.18)',
    innerGlow: 'rgba(255,255,255,0.08)',
    shadow: {
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
    },
  },
  light: {
    background: 'rgba(255,255,255,0.75)',
    backgroundModal: 'rgba(255,255,255,0.92)',
    blur: 20,
    saturation: 1.8,
    border: 'rgba(0,0,0,0.08)',
    borderBright: 'rgba(0,0,0,0.12)',
    innerGlow: 'rgba(255,255,255,0.9)',
    shadow: {
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
  },
} as const;

export const Neu = {
  dark: {
    shadowLight: { shadowColor: 'rgba(255,255,255,0.04)', shadowOffset: { width: -3, height: -3 }, shadowOpacity: 1, shadowRadius: 8 },
    shadowDark: { shadowColor: 'rgba(0,0,0,0.6)', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 8 },
  },
  light: {
    shadowLight: { shadowColor: 'rgba(255,255,255,0.8)', shadowOffset: { width: -4, height: -4 }, shadowOpacity: 1, shadowRadius: 10 },
    shadowDark: { shadowColor: 'rgba(0,0,0,0.12)', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 10 },
  },
} as const;

export const Animation = {
  fast: 150,
  base: 250,
  slow: 400,
  spring: { damping: 60, stiffness: 280 },
} as const;

export const ZIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modalBackdrop: 300,
  modal: 400,
  toast: 500,
  tooltip: 600,
} as const;

export const Elevation = {
  sm: { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3 },
  md: { elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6 },
  lg: { elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12 },
  xl: { elevation: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20 },
} as const;
