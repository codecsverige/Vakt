import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import EncryptedStorage from 'react-native-encrypted-storage';

// Screens
import DashboardScreen from './screens/SimpleDashboard';
import UpcomingScreen from './screens/UpcomingBills';
import BillFormScreen from './screens/BillForm';

// Types
export type ScreenType = 'dashboard' | 'upcoming' | 'billForm' | 'archive' | 'settings';

export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
  currency: string;
}

const MainApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const storedBills = await EncryptedStorage.getItem('bills');
      if (storedBills) {
        setBills(JSON.parse(storedBills));
      }
    } catch (error) {
      console.error('Error loading bills:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBills = async (newBills: Bill[]) => {
    try {
      await EncryptedStorage.setItem('bills', JSON.stringify(newBills));
      setBills(newBills);
    } catch (error) {
      console.error('Error saving bills:', error);
    }
  };

  const addBill = async (bill: Omit<Bill, 'id' | 'isPaid'>) => {
    const newBill: Bill = {
      ...bill,
      id: Date.now().toString(),
      isPaid: false
    };
    const updatedBills = [...bills, newBill];
    await saveBills(updatedBills);
    setCurrentScreen('upcoming');
  };

  const toggleBillPaid = async (billId: string) => {
    const updatedBills = bills.map(bill => 
      bill.id === billId ? { ...bill, isPaid: !bill.isPaid } : bill
    );
    await saveBills(updatedBills);
  };

  const deleteBill = async (billId: string) => {
    const updatedBills = bills.filter(bill => bill.id !== billId);
    await saveBills(updatedBills);
  };

  const renderScreen = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F7BFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    switch (currentScreen) {
      case 'dashboard':
        return (
          <DashboardScreen 
            bills={bills} 
            onNavigate={setCurrentScreen}
          />
        );
      case 'upcoming':
        return (
          <UpcomingScreen 
            bills={bills}
            onTogglePaid={toggleBillPaid}
            onDeleteBill={deleteBill}
            onEditBill={(bill) => {
              setSelectedBill(bill);
              setCurrentScreen('billForm');
            }}
          />
        );
      case 'billForm':
        return (
          <BillFormScreen
            bill={selectedBill}
            onSave={addBill}
            onCancel={() => {
              setSelectedBill(null);
              setCurrentScreen('upcoming');
            }}
          />
        );
      case 'archive':
        return (
          <View style={styles.screenContainer}>
            <Text style={styles.screenTitle}>Archive</Text>
            <Text style={styles.comingSoon}>Coming Soon...</Text>
          </View>
        );
      case 'settings':
        return (
          <View style={styles.screenContainer}>
            <Text style={styles.screenTitle}>Settings</Text>
            <Text style={styles.comingSoon}>Coming Soon...</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderBottomTab = () => {
    const tabs: Array<{ id: ScreenType; label: string; icon: string }> = [
      { id: 'dashboard', label: 'Dashboard', icon: 'home-outline' },
      { id: 'upcoming', label: 'Upcoming', icon: 'calendar-outline' },
      { id: 'billForm', label: 'Add', icon: 'add-circle-outline' },
      { id: 'archive', label: 'Archive', icon: 'archive-outline' },
      { id: 'settings', label: 'Settings', icon: 'settings-outline' }
    ];

    return (
      <View style={styles.bottomTab}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabButton}
            onPress={() => {
              if (tab.id === 'billForm') {
                setSelectedBill(null);
              }
              setCurrentScreen(tab.id);
            }}
          >
            <Icon 
              name={tab.icon} 
              size={24} 
              color={currentScreen === tab.id ? '#0F7BFF' : '#8E8E93'}
            />
            <Text style={[
              styles.tabLabel,
              currentScreen === tab.id && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FakturaVakt</Text>
        <TouchableOpacity>
          <Icon name="notifications-outline" size={24} color="#333333" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      {renderBottomTab()}
    </SafeAreaView>
  );
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  content: {
    flex: 1,
  },
  bottomTab: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingBottom: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  activeTabLabel: {
    color: '#0F7BFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  comingSoon: {
    fontSize: 18,
    color: '#666666',
  },
});

export default MainApp;