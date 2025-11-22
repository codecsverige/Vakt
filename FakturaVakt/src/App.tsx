import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';
import AppNavigator from './navigation/AppNavigator';
import i18n from './i18n';
import { ThemeProvider, useTheme } from './theme';
import { ensureStorage } from './services/storage';

const Bootstrap: React.FC = () => {
  const { theme } = useTheme();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await ensureStorage();
        setReady(true);
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setReady(true); // Continue anyway
      }
    };

    initialize();
  }, []);

  if (!ready) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Initialization failed: {error}</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: 10 }}>
          The app will continue without storage.
        </Text>
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

const App: React.FC = () => {
  return (
    <AppProviders>
      <Bootstrap />
    </AppProviders>
  );
};

export default App;

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  full: {
    flex: 1,
  },
});
