import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const App: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>✅ FakturaVakt Works!</Text>
      <Text style={styles.subtitle}>Minimal Test Version</Text>
      <Text style={styles.info}>Testing Phase 1: Basic React Native</Text>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#555555',
    marginBottom: 20,
  },
  info: {
    fontSize: 14,
    color: '#999999',
  },
});
