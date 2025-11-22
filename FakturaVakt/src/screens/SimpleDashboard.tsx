import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Bill } from '../MainApp';

interface Props {
  bills: Bill[];
  onNavigate: (screen: string) => void;
}

const SimpleDashboard: React.FC<Props> = ({ bills, onNavigate }) => {
  // Calculate stats
  const unpaidBills = bills.filter(bill => !bill.isPaid);
  const totalUnpaid = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);
  const upcomingCount = unpaidBills.length;
  const paidCount = bills.filter(bill => bill.isPaid).length;

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} SEK`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#FFE5E5' }]}>
          <Icon name="alert-circle-outline" size={32} color="#F35D4F" />
          <Text style={styles.statValue}>{upcomingCount}</Text>
          <Text style={styles.statLabel}>Unpaid Bills</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: '#E5F2FF' }]}>
          <Icon name="cash-outline" size={32} color="#0F7BFF" />
          <Text style={styles.statValue}>{formatCurrency(totalUnpaid)}</Text>
          <Text style={styles.statLabel}>Total Amount</Text>
        </View>
      </View>

      <View style={[styles.statCard, { backgroundColor: '#E5FFE5', marginHorizontal: 20 }]}>
        <Icon name="checkmark-circle-outline" size={32} color="#2DB784" />
        <Text style={styles.statValue}>{paidCount}</Text>
        <Text style={styles.statLabel}>Paid This Month</Text>
      </View>

      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => onNavigate('upcoming')}
      >
        <Icon name="list-outline" size={24} color="#FFFFFF" />
        <Text style={styles.actionButtonText}>View All Bills</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionButton, styles.secondaryButton]}
        onPress={() => onNavigate('billForm')}
      >
        <Icon name="add-circle-outline" size={24} color="#0F7BFF" />
        <Text style={[styles.actionButtonText, { color: '#0F7BFF' }]}>Add New Bill</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: 15,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F7BFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0F7BFF',
  },
});

export default SimpleDashboard;