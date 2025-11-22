import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Bill } from '../MainApp';

interface Props {
  bills: Bill[];
  onTogglePaid: (billId: string) => void;
  onDeleteBill: (billId: string) => void;
  onEditBill: (bill: Bill) => void;
}

const UpcomingBills: React.FC<Props> = ({ bills, onTogglePaid, onDeleteBill, onEditBill }) => {
  const unpaidBills = bills.filter(bill => !bill.isPaid);
  const sortedBills = [...unpaidBills].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    }
    return date.toLocaleDateString();
  };

  const getStatusColor = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return '#F35D4F'; // Overdue - Red
    if (diffDays <= 3) return '#FFB547'; // Soon - Orange
    return '#2DB784'; // Safe - Green
  };

  const confirmDelete = (bill: Bill) => {
    Alert.alert(
      'Delete Bill',
      `Are you sure you want to delete "${bill.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDeleteBill(bill.id) 
        },
      ]
    );
  };

  const confirmMarkPaid = (bill: Bill) => {
    Alert.alert(
      'Mark as Paid',
      `Mark "${bill.title}" as paid?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Mark Paid', 
          onPress: () => onTogglePaid(bill.id) 
        },
      ]
    );
  };

  if (sortedBills.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="checkmark-circle-outline" size={64} color="#2DB784" />
        <Text style={styles.emptyTitle}>All caught up!</Text>
        <Text style={styles.emptySubtitle}>No upcoming bills</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upcoming Bills</Text>
        <Text style={styles.headerSubtitle}>{unpaidBills.length} unpaid</Text>
      </View>

      {sortedBills.map(bill => (
        <View key={bill.id} style={styles.billCard}>
          <View style={[styles.statusBar, { backgroundColor: getStatusColor(bill.dueDate) }]} />
          
          <View style={styles.billContent}>
            <View style={styles.billHeader}>
              <View>
                <Text style={styles.billTitle}>{bill.title}</Text>
                <Text style={styles.billCategory}>{bill.category}</Text>
              </View>
              <View style={styles.billAmountContainer}>
                <Text style={styles.billAmount}>{bill.amount.toFixed(2)}</Text>
                <Text style={styles.billCurrency}>{bill.currency}</Text>
              </View>
            </View>

            <View style={styles.billFooter}>
              <Text style={[styles.billDue, { color: getStatusColor(bill.dueDate) }]}>
                {formatDate(bill.dueDate)}
              </Text>

              <View style={styles.billActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => confirmMarkPaid(bill)}
                >
                  <Icon name="checkmark-circle-outline" size={24} color="#2DB784" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => onEditBill(bill)}
                >
                  <Icon name="create-outline" size={24} color="#0F7BFF" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => confirmDelete(bill)}
                >
                  <Icon name="trash-outline" size={24} color="#F35D4F" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      ))}
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 5,
  },
  billCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBar: {
    height: 4,
  },
  billContent: {
    padding: 15,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  billTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  billCategory: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  billAmountContainer: {
    alignItems: 'flex-end',
  },
  billAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  billCurrency: {
    fontSize: 14,
    color: '#666666',
  },
  billFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billDue: {
    fontSize: 14,
    fontWeight: '500',
  },
  billActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
  },
});

export default UpcomingBills;