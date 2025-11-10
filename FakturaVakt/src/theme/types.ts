import type { Theme } from '@react-navigation/native';

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ThemeRadius {
  sm: number;
  md: number;
  lg: number;
  pill: number;
}

export interface ThemeTypography {
  title: number;
  subtitle: number;
  body: number;
  small: number;
  micro: number;
}

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  divider: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  accent: string;
  backdrop: string;
}

export interface AppTheme {
  navigation: Theme;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  typography: ThemeTypography;
  shadows: {
    light: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}
