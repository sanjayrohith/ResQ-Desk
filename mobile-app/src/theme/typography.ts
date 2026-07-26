import { Platform } from 'react-native';

/**
 * Web app uses Inter (body) + JetBrains Mono (data/numeric) via Google Fonts.
 * Drop the matching .ttf files into src/assets/fonts and link them
 * (see mobile-app/README.md) to get pixel-exact typography; until then this
 * falls back to the platform system font / monospace so the app still runs.
 */
export const fontFamily = {
  sans: Platform.select({ ios: 'Inter', android: 'Inter', default: 'System' }),
  sansMedium: Platform.select({ ios: 'Inter-Medium', android: 'Inter-Medium', default: 'System' }),
  sansSemibold: Platform.select({ ios: 'Inter-SemiBold', android: 'Inter-SemiBold', default: 'System' }),
  sansBold: Platform.select({ ios: 'Inter-Bold', android: 'Inter-Bold', default: 'System' }),
  mono: Platform.select({ ios: 'JetBrainsMono-Regular', android: 'JetBrainsMono-Regular', default: 'monospace' }),
  monoMedium: Platform.select({ ios: 'JetBrainsMono-Medium', android: 'JetBrainsMono-Medium', default: 'monospace' }),
  monoBold: Platform.select({ ios: 'JetBrainsMono-Bold', android: 'JetBrainsMono-Bold', default: 'monospace' }),
};

export const fontSize = {
  9: 9,
  10: 10,
  11: 11,
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '5xl': 48,
  '6xl': 60,
};

export const tracking = {
  wide: 0.4,
  wider: 0.8,
  widest: 2.4, // 0.15em @ 16px base
};
