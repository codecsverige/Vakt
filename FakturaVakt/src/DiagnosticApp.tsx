import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  NativeModules,
} from 'react-native';

// Test imports one by one
const testImports = async () => {
  const results: {[key: string]: string} = {};
  
  // Test basic RN components
  try {
    const { AppRegistry } = require('react-native');
    results['React Native Core'] = '✅ OK';
  } catch (e: any) {
    results['React Native Core'] = `❌ ${e.message}`;
  }

  // Test Vector Icons
  try {
    const Icon = require('react-native-vector-icons/Ionicons').default;
    results['Vector Icons'] = '✅ OK';
  } catch (e: any) {
    results['Vector Icons'] = `❌ ${e.message}`;
  }

  // Test Encrypted Storage
  try {
    const EncryptedStorage = require('react-native-encrypted-storage').default;
    results['Encrypted Storage'] = '✅ OK';
  } catch (e: any) {
    results['Encrypted Storage'] = `❌ ${e.message}`;
  }

  // Test other libraries individually
  try {
    require('@react-native-clipboard/clipboard');
    results['Clipboard'] = '✅ OK';
  } catch (e: any) {
    results['Clipboard'] = `❌ ${e.message}`;
  }

  try {
    require('@react-native-community/datetimepicker');
    results['DateTimePicker'] = '✅ OK';
  } catch (e: any) {
    results['DateTimePicker'] = `❌ ${e.message}`;
  }

  try {
    require('react-native-fs');
    results['File System'] = '✅ OK';
  } catch (e: any) {
    results['File System'] = `❌ ${e.message}`;
  }

  try {
    require('react-native-image-picker');
    results['Image Picker'] = '✅ OK';
  } catch (e: any) {
    results['Image Picker'] = `❌ ${e.message}`;
  }

  try {
    require('react-native-localize');
    results['Localize'] = '✅ OK';
  } catch (e: any) {
    results['Localize'] = `❌ ${e.message}`;
  }

  try {
    require('react-native-permissions');
    results['Permissions'] = '✅ OK';
  } catch (e: any) {
    results['Permissions'] = `❌ ${e.message}`;
  }

  try {
    require('react-native-svg');
    results['SVG'] = '✅ OK';
  } catch (e: any) {
    results['SVG'] = `❌ ${e.message}`;
  }

  try {
    require('@notifee/react-native');
    results['Notifee'] = '✅ OK';
  } catch (e: any) {
    results['Notifee'] = `❌ ${e.message}`;
  }

  return results;
};

const DiagnosticApp: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<{[key: string]: any}>({});
  const [testResults, setTestResults] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const diag: {[key: string]: any} = {};
    
    // System Info
    diag['Platform'] = Platform.OS;
    diag['Platform Version'] = Platform.Version;
    diag['React Native Version'] = Platform.constants?.reactNativeVersion || 'Unknown';
    
    // Device Info
    diag['Brand'] = Platform.constants?.Brand || 'Unknown';
    diag['Model'] = Platform.constants?.Model || 'Unknown';
    
    // Available Native Modules
    const moduleNames = Object.keys(NativeModules);
    diag['Native Modules Count'] = moduleNames.length;
    diag['Has Encrypted Storage'] = moduleNames.includes('RNEncryptedStorage') ? '✅' : '❌';
    diag['Has Vector Icons'] = moduleNames.includes('RNVectorIconsModule') ? '✅' : '❌';
    
    // Memory
    try {
      // @ts-ignore
      if (global.performance && global.performance.memory) {
        // @ts-ignore
        diag['Memory Used'] = `${Math.round(global.performance.memory.usedJSHeapSize / 1048576)}MB`;
      }
    } catch (e) {
      diag['Memory'] = 'Not available';
    }

    setDiagnostics(diag);
    
    // Test imports
    const results = await testImports();
    setTestResults(results);
    
    setIsLoading(false);
  };

  const testFeature = (featureName: string, testFn: () => Promise<void>) => {
    Alert.alert(
      `Test ${featureName}`,
      'This will test the feature and report any errors',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Test',
          onPress: async () => {
            try {
              await testFn();
              Alert.alert('Success', `${featureName} is working correctly!`);
            } catch (error: any) {
              Alert.alert('Error', `${featureName} failed: ${error.message}`);
            }
          },
        },
      ],
    );
  };

  const testEncryptedStorage = async () => {
    const EncryptedStorage = require('react-native-encrypted-storage').default;
    await EncryptedStorage.setItem('test_key', 'test_value');
    const value = await EncryptedStorage.getItem('test_key');
    if (value !== 'test_value') throw new Error('Value mismatch');
    await EncryptedStorage.removeItem('test_key');
  };

  const testVectorIcons = async () => {
    const Icon = require('react-native-vector-icons/Ionicons').default;
    // Just check if we can create an icon component
    const TestIcon = () => <Icon name="home" size={24} color="#000" />;
    if (!TestIcon) throw new Error('Could not create icon component');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>FakturaVakt Diagnostics</Text>
          <Text style={styles.subtitle}>System Analysis & Testing</Text>
        </View>

        {/* System Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 System Information</Text>
          {Object.entries(diagnostics).map(([key, value]) => (
            <View key={key} style={styles.row}>
              <Text style={styles.label}>{key}:</Text>
              <Text style={styles.value}>{JSON.stringify(value)}</Text>
            </View>
          ))}
        </View>

        {/* Library Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Library Import Status</Text>
          {Object.entries(testResults).map(([lib, status]) => (
            <View key={lib} style={styles.row}>
              <Text style={styles.label}>{lib}:</Text>
              <Text style={[styles.value, status.includes('✅') ? styles.success : styles.error]}>
                {status}
              </Text>
            </View>
          ))}
        </View>

        {/* Feature Tests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧪 Feature Tests</Text>
          
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => testFeature('Encrypted Storage', testEncryptedStorage)}
          >
            <Text style={styles.buttonText}>Test Encrypted Storage</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => testFeature('Vector Icons', testVectorIcons)}
          >
            <Text style={styles.buttonText}>Test Vector Icons</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, styles.successButton]}
            onPress={() => Alert.alert('Build Info', `
Build Date: ${new Date().toISOString()}
App Version: 0.0.6
Build Type: Release
Min SDK: 24
Target SDK: 34
Compile SDK: 35
            `.trim())}
          >
            <Text style={styles.buttonText}>Show Build Info</Text>
          </TouchableOpacity>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Recommendations</Text>
          <Text style={styles.recommendation}>
            1. ✅ Basic React Native is working{'\n'}
            2. ⚠️ Test each library individually{'\n'}
            3. 🔍 Check native module linking{'\n'}
            4. 📱 Verify permissions in AndroidManifest{'\n'}
            5. 🛡️ Use try-catch for all library imports
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#0F7BFF',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#E5F2FF',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
    textAlign: 'right',
  },
  success: {
    color: '#2DB784',
  },
  error: {
    color: '#F35D4F',
  },
  testButton: {
    backgroundColor: '#0F7BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  successButton: {
    backgroundColor: '#2DB784',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  recommendation: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 24,
  },
});

export default DiagnosticApp;