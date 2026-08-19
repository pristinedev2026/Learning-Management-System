import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, spacing, radius, typography, shadow, tapTarget } from './tokens';

type Theme = {
  colors: typeof lightColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadow: typeof shadow;
  tapTarget: typeof tapTarget;
  isDark: boolean;
};

const ThemeContext = createContext<Theme | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = useMemo(() => {
    const currentColors = isDark ? darkColors : lightColors;

    // Dynamically update typography colors
    const themedTypography = {
      display: { ...typography.display, color: currentColors.ink },
      title: { ...typography.title, color: currentColors.ink },
      subtitle: { ...typography.subtitle, color: currentColors.ink },
      body: { ...typography.body, color: currentColors.ink },
      caption: { ...typography.caption, color: currentColors.inkMuted },
      label: { ...typography.label, color: currentColors.inkMuted },
    };

    const themedShadow = {
      card: { ...shadow.card, shadowColor: currentColors.ink },
    };

    return {
      colors: currentColors,
      spacing,
      radius,
      typography: themedTypography,
      shadow: themedShadow,
      tapTarget,
      isDark,
    };
  }, [isDark]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
