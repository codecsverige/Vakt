import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { CameraScreen } from 'react-native-camera-kit';
import Icon from 'react-native-vector-icons/Ionicons';

interface ScanBillScreenProps {
  onScanSuccess: (data: any) => void;
  onClose: () => void;
}

const ScanBillScreen: React.FC<ScanBillScreenProps> = ({ onScanSuccess, onClose }) => {
  const [isScanning, setIsScanning] = useState(true);

  const parseQRData = (qrValue: string) => {
    // Basic intelligent parser for bill data
    // This tries to extract amount, date, and title from common QR formats
    
    let amount = '';
    let dueDate = '';
    let title = '';

    // 1. Try to detect Swiss QR or EPC QR (often starts with specialized headers)
    // Example logic - just a basic heuristic for now
    
    // Try to find amount (numbers with decimals)
    const amountRegex = /(\d+[.,]\d{2})/;
    const amountMatch = qrValue.match(amountRegex);
    if (amountMatch) {
      amount = amountMatch[0].replace(',', '.');
    }

    // Try to find date (YYYY-MM-DD)
    const dateRegex = /(\d{4}-\d{2}-\d{2})/;
    const dateMatch = qrValue.match(dateRegex);
    if (dateMatch) {
      dueDate = dateMatch[0];
    }

    // Use the raw value as title if it's short, otherwise generic
    if (qrValue.length < 50) {
      title = qrValue;
    } else {
      title = "Scanned Bill";
    }

    // If parsing failed to find specific fields but we have data, return raw
    return {
      title: title || "Unknown Bill",
      amount: amount ? parseFloat(amount) : 0,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      raw: qrValue
    };
  };

  const onReadCode = (event: any) => {
    if (!isScanning) return;
    
    const qrValue = event.nativeEvent.codeStringValue;
    if (qrValue) {
      setIsScanning(false);
      const parsedData = parseQRData(qrValue);
      Alert.alert(
        "Faktura Hittad!",
        `Information hittad:\nBelopp: ${parsedData.amount}\nDatum: ${parsedData.dueDate}`,
        [
          {
            text: "Försök igen",
            onPress: () => setIsScanning(true),
            style: "cancel"
          },
          {
            text: "Använd",
            onPress: () => onScanSuccess(parsedData)
          }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <CameraScreen
        scanBarcode={true}
        onReadCode={onReadCode}
        showFrame={true}
        laserColor="#0F7BFF"
        frameColor="white"
        colorForScannerFrame={'black'}
      />
      
      <View style={styles.overlay}>
        <Text style={styles.instructionText}>
          Rikta kameran mot fakturans QR-kod
        </Text>
      </View>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Icon name="close-circle" size={50} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
  closeButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  }
});

export default ScanBillScreen;
