import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationLightTheme } from '@react-navigation/native';
import type { AppTheme } from './types';

const baseSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

const baseRadius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

const baseTypography = {
  title: 24,
  subtitle: 18,
  body: 16,
  small: 14,
  micro: 12,
} as const;

export const lightTheme: AppTheme = {
  navigation: {
    ...NavigationLightTheme,
    colors: {
      ...NavigationLightTheme.colors,
      primary: '#0F7BFF',
      background: '#F4F7FB',
      card: '#FFFFFF',
      text: '#0F1C2D',
      border: '#E0E7F1',
      notification: '#0F7BFF',
    },
  },
  colors: {
    primary: '#0F7BFF',
    background: '#F4F7FB',
    surface: '#FFFFFF',
    surfaceElevated: '#EDF2FA',
    text: '#0F1C2D',
    textSecondary: '#4B5B73',
    divider: '#E0E7F1',
    success: '#2DB784',
    warning: '#FFB547',
    danger: '#F35D4F',
    info: '#2FA7FF',
    accent: '#8C5AE3',
    backdrop: 'rgba(15, 28, 45, 0.45)',
  },
  spacing: baseSpacing,
  radius: baseRadius,
  typography: baseTypography,
  shadows: {
    light: {
      shadowColor: '#0F1C2D',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 12,
      elevation: 4,
    },
  },
};

export const darkTheme: AppTheme = {
  navigation: {
    ...NavigationDarkTheme,
    colors: {
      ...NavigationDarkTheme.colors,
      primary: '#4CA9FF',
      background: '#0C111F',
      card: '#151C2E',
      text: '#E9EEF6',
      border: '#1F2A3D',
      notification: '#4CA9FF',
    },
  },
  colors: {
    primary: '#4CA9FF',
    background: '#0C111F',
    surface: '#151C2E',
    surfaceElevated: '#1D2539',
    text: '#E9EEF6',
    textSecondary: '#9AA6C1',
    divider: '#1F2A3D',
    success: '#3DD9A0',
    warning: '#FFCF66',
    danger: '#FF7A6E',
    info: '#5CB6FF',
    accent: '#A58AFF',
    backdrop: 'rgba(3, 9, 20, 0.65)',
  },
  spacing: baseSpacing,
  radius: baseRadius,
  typography: baseTypography,
  shadows: {
    light: {
      shadowColor: '#000000',
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 6,
    },
  },
};
