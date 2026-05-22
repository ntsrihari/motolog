import { useColorScheme } from 'react-native';
import { Colors, Glass, Neu, Spacing, Radius, Typography, Animation, ZIndex, Elevation } from '@/config/theme.config';
import { useUserStore } from '@/store/user';

export function useTheme() {
  const systemScheme = useColorScheme();
  const storeTheme = useUserStore((s) => s.theme);
  const isDark = storeTheme === 'dark' || (!storeTheme && systemScheme === 'dark');

  return {
    isDark,
    colors: isDark ? Colors.dark : Colors.light,
    glass: isDark ? Glass.dark : Glass.light,
    neu: isDark ? Neu.dark : Neu.light,
    spacing: Spacing,
    radius: Radius,
    typography: Typography,
    animation: Animation,
    zIndex: ZIndex,
    elevation: Elevation,
  };
}
