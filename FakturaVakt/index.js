/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import React from 'react';
import MainApp from './src/MainApp';
import ErrorBoundary from './src/ErrorBoundary';
import { name as appName } from './app.json';

// Ignore specific warnings that don't affect functionality
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
]);

// Global error handler
const errorHandler = (error, isFatal) => {
  console.log('Global error handler:', error, isFatal);
  if (isFatal) {
    console.error('Fatal error:', error);
  }
};

// Set global error handlers
global.ErrorUtils.setGlobalHandler(errorHandler);

// Wrap app with error boundary
const AppWithErrorBoundary = () => (
  <ErrorBoundary>
    <MainApp />
  </ErrorBoundary>
);

AppRegistry.registerComponent(appName, () => AppWithErrorBoundary);
