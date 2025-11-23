import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Bill } from '../MainApp';

interface Props {
  bill?: Bill | null;
  scannedData?: any;
  onSave: (bill: Omit<Bill, 'id' | 'isPaid'>) => void;
  onCancel: () => void;
  onScan?: () => void;
}

const categories = [
  'Electricity',
  'Water',
  'Internet',
  'Phone',
  'Rent',
  'Insurance',
  'Subscription',
  'Other'
];

const BillForm: React.FC<Props> = ({ bill, scannedData, onSave, onCancel, onScan }) => {
  const [title, setTitle] = useState(bill?.title || '');
  const [amount, setAmount] = useState(bill?.amount?.toString() || '');
  const [category, setCategory] = useState(bill?.category || 'Other');
  const [dueDate, setDueDate] = useState(bill?.dueDate || new Date().toISOString().split('T')[0]);
  const [currency] = useState(bill?.currency || 'SEK');

  // Update form when scanned data is received
  useEffect(() => {
    if (scannedData) {
      setTitle(scannedData.title || scannedData.companyName || '');
      setAmount(scannedData.amount?.toString() || '');
      setDueDate(scannedData.dueDate || new Date().toISOString().split('T')[0]);
      // Try to guess category from company name
      if (scannedData.companyName) {
        const name = scannedData.companyName.toLowerCase();
        if (name.includes('telia') || name.includes('telenor') || name.includes('tre')) {
          setCategory('Phone');
        } else if (name.includes('vattenfall') || name.includes('eon')) {
          setCategory('Electricity');
        } else if (name.includes('bredband') || name.includes('comhem')) {
          setCategory('Internet');
        }
      }
    }
  }, [scannedData]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    onSave({
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      dueDate,
      currency,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{bill ? 'Edit Bill' : 'New Bill'}</Text>
      </View>

      {onScan && !bill && (
        <TouchableOpacity style={styles.scanButton} onPress={onScan}>
          <Icon name="scan-outline" size={24} color="#FFFFFF" />
          <Text style={styles.scanButtonText}>Skanna faktura</Text>
        </TouchableOpacity>
      )}

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Electricity Bill"
            placeholderTextColor="#999999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount ({currency})</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            placeholderTextColor="#999999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonActive
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  category === cat && styles.categoryButtonTextActive
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Due Date</Text>
          <TextInput
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999999"
          />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Icon name="checkmark" size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Save Bill</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginHorizontal: -5,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    margin: 5,
  },
  categoryButtonActive: {
    backgroundColor: '#0F7BFF',
    borderColor: '#0F7BFF',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#0F7BFF',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2DB784',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 14,
    borderRadius: 10,
  },
  scanButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default BillForm;