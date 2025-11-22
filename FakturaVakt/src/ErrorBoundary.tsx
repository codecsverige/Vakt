import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  copyError = () => {
    const { error, errorInfo } = this.state;
    const errorText = `
Error: ${error?.toString()}

Component Stack:
${errorInfo?.componentStack}

Error Stack:
${error?.stack}
    `;
    
    Alert.alert('Error Details', errorText.trim());
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>خطأ في التطبيق / App Error</Text>
          
          <ScrollView style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Error Message:</Text>
            <Text style={styles.errorText}>{this.state.error?.toString()}</Text>
            
            <Text style={styles.errorTitle}>Stack Trace:</Text>
            <Text style={styles.stackTrace}>{this.state.error?.stack}</Text>
            
            {this.state.errorInfo && (
              <>
                <Text style={styles.errorTitle}>Component Stack:</Text>
                <Text style={styles.stackTrace}>
                  {this.state.errorInfo.componentStack}
                </Text>
              </>
            )}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={this.copyError}>
              <Text style={styles.buttonText}>Show Full Error</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.resetButton]} 
              onPress={this.resetError}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F35D4F',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 15,
    marginBottom: 5,
  },
  errorText: {
    fontSize: 14,
    color: '#F35D4F',
    fontFamily: 'monospace',
  },
  stackTrace: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    backgroundColor: '#0F7BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  resetButton: {
    backgroundColor: '#2DB784',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorBoundary;