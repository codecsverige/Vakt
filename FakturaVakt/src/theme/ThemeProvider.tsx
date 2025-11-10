import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { darkTheme, lightTheme } from './themes';
import type { AppTheme } from './types';

interface ThemeContextValue {
  theme: AppTheme;
  isDarkMode: boolean;
  setScheme: (scheme: ColorSchemeName | 'system') => void;
  preferredScheme: ColorSchemeName | 'system';
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  isDarkMode: false,
  setScheme: () => undefined,
  preferredScheme: 'system',
});

type ThemeProviderProps = {
  children: React.ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [preferredScheme, setPreferredScheme] = useState<ColorSchemeName | 'system'>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(() => Appearance.getColorScheme() ?? 'light');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) {
        setSystemScheme(colorScheme);
      }
    });

    return () => subscription.remove();
  }, []);

  const effectiveScheme = useMemo<ColorSchemeName>(() => {
    if (preferredScheme === 'system') {
      return systemScheme;
    }

    return preferredScheme;
  }, [preferredScheme, systemScheme]);

  const value = useMemo<ThemeContextValue>(() => {
    const isDarkMode = effectiveScheme === 'dark';

    return {
      theme: isDarkMode ? darkTheme : lightTheme,
      isDarkMode,
      setScheme: setPreferredScheme,
      preferredScheme,
    };
  }, [effectiveScheme, preferredScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
