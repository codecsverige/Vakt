import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import type { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'QRScanner'>;

const QRScannerScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('qr_scanner_unavailable')}
        </Text>
        <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
          QR Scanner feature is temporarily disabled.
          Please enter bill details manually.
        </Text>
        <Button
          title={t('go_back')}
          onPress={() => navigation.goBack()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default QRScannerScreen;
