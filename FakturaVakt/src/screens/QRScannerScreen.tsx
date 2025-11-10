import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RNCamera } from 'react-native-camera';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import type { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme';
import { parseSwedishInvoiceQr } from '../services/qrParser';

type Props = NativeStackScreenProps<RootStackParamList, 'QRScanner'>;

const QRScannerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { billId } = route.params ?? {};
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [hasProcessed, setHasProcessed] = useState(false);

  React.useEffect(() => {
    const requestPermission = async () => {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.ANDROID.CAMERA;

      const status = await check(permission);

      if (status === RESULTS.GRANTED) {
        setHasPermission(true);
        return;
      }

      if (status === RESULTS.DENIED || status === RESULTS.LIMITED) {
        const result = await request(permission);
        setHasPermission(result === RESULTS.GRANTED);
        return;
      }

      Alert.alert(t('screens.qr.permissionsTitle'), t('screens.qr.permissionsDescription'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      setHasPermission(false);
    };

    requestPermission();
  }, [navigation, t]);

  const onBarCodeRead = useCallback(
    (event: { data: string }) => {
      if (hasProcessed) {
        return;
      }
      setHasProcessed(true);

      const parsed = parseSwedishInvoiceQr(event.data);

      if (!parsed) {
        Alert.alert(t('screens.qr.parsingError'));
        navigation.goBack();
        return;
      }

      navigation.navigate('BillForm', {
        billId,
        prefill: parsed.data,
      });
    },
    [billId, hasProcessed, navigation, t],
  );

  if (hasPermission === null) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>{t('screens.qr.permissionsDescription')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNCamera
        style={styles.camera}
        type={RNCamera.Constants.Type.back}
        captureAudio={false}
        onBarCodeRead={onBarCodeRead}
      >
        <View style={styles.overlay}>
          <Text style={styles.instructions}>{t('screens.qr.instructions')}</Text>
          <View style={styles.frame} />
        </View>
      </RNCamera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  frame: {
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  instructions: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default QRScannerScreen;
