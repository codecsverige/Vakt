import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

const ErrorFallback: React.FC<{ error?: Error; onReset: () => void }> = ({ error, onReset }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('error.title', 'حدث خطأ')}
        </Text>
        <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
          {t('error.message', 'حدث خطأ غير متوقع. يرجى إعادة المحاولة.')}
        </Text>
        {error && __DEV__ && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error.message}
          </Text>
        )}
        <Button
          title={t('error.retry', 'إعادة المحاولة')}
          onPress={onReset}
          color={theme.colors.primary}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
});

export default ErrorBoundary;
