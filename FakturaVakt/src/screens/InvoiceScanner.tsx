import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
import { InvoiceParser, ParsedInvoice } from '../services/invoiceParser';

interface Props {
  onScanComplete: (data: ParsedInvoice) => void;
  onCancel: () => void;
}

const InvoiceScanner: React.FC<Props> = ({ onScanComplete, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedInvoice | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);

  const handleImagePicker = useCallback((response: ImagePickerResponse) => {
    if (response.didCancel || response.errorMessage) {
      return;
    }

    if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      setImageUri(asset.uri || null);
      
      // For now, show manual input for text
      // In production, this would call an OCR service
      setShowManualInput(true);
      Alert.alert(
        'Ange fakturatext',
        'Klistra in eller skriv in texten från fakturan nedan.',
        [{ text: 'OK' }]
      );
    }
  }, []);

  const openCamera = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchCamera(options, handleImagePicker);
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, handleImagePicker);
  };

  const processText = () => {
    if (!extractedText.trim()) {
      Alert.alert('Fel', 'Vänligen ange fakturatext');
      return;
    }

    setIsProcessing(true);
    
    // Parse the invoice text
    const parsed = InvoiceParser.smartExtract(extractedText);
    setParsedData(parsed);
    
    setTimeout(() => {
      setIsProcessing(false);
      
      if (parsed.confidence > 30) {
        Alert.alert(
          'Extrahering klar',
          `Förtroendenivå: ${parsed.confidence}%\n\nKontrollera de extraherade uppgifterna nedan.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Låg förtroendenivå',
          'Kunde inte extrahera all information. Vänligen kontrollera och redigera uppgifterna.',
          [{ text: 'OK' }]
        );
      }
    }, 1000);
  };

  const handleConfirm = () => {
    if (parsedData) {
      // Map to bill format
      const billData: any = {
        title: parsedData.companyName || 'Okänd faktura',
        amount: parsedData.amount || 0,
        dueDate: parsedData.dueDate || new Date().toISOString().split('T')[0],
        category: 'other',
        currency: parsedData.currency || 'SEK',
      };
      
      onScanComplete(billData);
    }
  };

  const updateParsedField = (field: keyof ParsedInvoice, value: string) => {
    setParsedData(prev => ({
      ...prev,
      [field]: field === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  if (!imageUri && !showManualInput) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Skanna faktura</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <Icon name="scan-outline" size={100} color="#0F7BFF" />
          <Text style={styles.instructionText}>
            Välj hur du vill skanna din faktura
          </Text>

          <TouchableOpacity style={styles.primaryButton} onPress={openCamera}>
            <Icon name="camera-outline" size={24} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Ta foto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={openGallery}>
            <Icon name="images-outline" size={24} color="#0F7BFF" />
            <Text style={styles.secondaryButtonText}>Välj från galleri</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => setShowManualInput(true)}
          >
            <Icon name="text-outline" size={24} color="#0F7BFF" />
            <Text style={styles.secondaryButtonText}>Ange text manuellt</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (showManualInput && !parsedData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowManualInput(false)}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fakturatext</Text>
          <TouchableOpacity onPress={processText} disabled={isProcessing}>
            <Text style={styles.headerAction}>
              {isProcessing ? 'Bearbetar...' : 'Analysera'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          )}
          
          <Text style={styles.label}>
            Klistra in eller skriv fakturatext här:
          </Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={15}
            value={extractedText}
            onChangeText={setExtractedText}
            placeholder="T.ex. 
Företag AB
Fakturanummer: 12345
Belopp: 1 234,56 kr
Förfallodag: 2024-02-15
Bankgiro: 123-4567
OCR: 1234567890"
            placeholderTextColor="#999"
          />

          {isProcessing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#0F7BFF" />
              <Text style={styles.processingText}>Analyserar text...</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  if (parsedData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setParsedData(null)}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Extraherade uppgifter</Text>
          <TouchableOpacity onPress={handleConfirm}>
            <Text style={styles.headerAction}>Använd</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.resultContainer}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Företag</Text>
              <TextInput
                style={styles.fieldInput}
                value={parsedData.companyName || ''}
                onChangeText={(text) => updateParsedField('companyName', text)}
                placeholder="Företagsnamn"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Fakturanummer</Text>
              <TextInput
                style={styles.fieldInput}
                value={parsedData.invoiceNumber || ''}
                onChangeText={(text) => updateParsedField('invoiceNumber', text)}
                placeholder="Fakturanummer"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Belopp</Text>
              <TextInput
                style={styles.fieldInput}
                value={parsedData.amount?.toString() || ''}
                onChangeText={(text) => updateParsedField('amount', text)}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Förfallodag</Text>
              <TextInput
                style={styles.fieldInput}
                value={parsedData.dueDate || ''}
                onChangeText={(text) => updateParsedField('dueDate', text)}
                placeholder="ÅÅÅÅ-MM-DD"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>OCR-nummer</Text>
              <TextInput
                style={styles.fieldInput}
                value={parsedData.ocr || ''}
                onChangeText={(text) => updateParsedField('ocr', text)}
                placeholder="OCR-referens"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Bankgiro</Text>
              <TextInput
                style={styles.fieldInput}
                value={parsedData.bankgiro || ''}
                onChangeText={(text) => updateParsedField('bankgiro', text)}
                placeholder="XXX-XXXX"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleConfirm}
          >
            <Icon name="checkmark-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Använd dessa uppgifter</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerAction: {
    fontSize: 16,
    color: '#0F7BFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instructionText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginVertical: 30,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F7BFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#0F7BFF',
  },
  secondaryButtonText: {
    color: '#0F7BFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: 'contain',
    backgroundColor: '#FFF',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    color: '#333',
    minHeight: 300,
    textAlignVertical: 'top',
  },
  processingContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  processingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  resultContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  fieldInput: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
});

export default InvoiceScanner;