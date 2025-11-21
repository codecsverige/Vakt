import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';
import AppNavigator from './navigation/AppNavigator';
import i18n from './i18n';
import { ThemeProvider, useTheme } from './theme';
import { ensureStorage } from './services/storage';
import { notificationService } from './services/notificationService';
import { useSettingsStore } from './store';
import ErrorBoundary from './components/ErrorBoundary';

const Bootstrap: React.FC = () => {
  const { theme } = useTheme();
  const language = useSettingsStore((state) => state.language);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await ensureStorage();
        await notificationService.initialize();
      } catch (error) {
        // Log error for debugging - this helps identify crash causes
        console.error('Initialization error:', error);
        // Still set ready to true to allow app to continue
        // User can retry later or app will handle gracefully
      } finally {
        setReady(true);
      }
    };

    initialize();
  }, []);

  if (!ready) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return <AppNavigator />;
};

const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <GestureHandlerRootView style={styles.full}>
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

const App: React.FC = () => (
  <ErrorBoundary>
    <AppProviders>
      <Bootstrap />
    </AppProviders>
  </ErrorBoundary>
);

export default App;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  full: {
    flex: 1,
  },
});
