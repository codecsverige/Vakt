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
import InvoiceScanner from './screens/InvoiceScanner';

// Types
export type ScreenType = 'hem' | 'fakturor' | 'abonnemang' | 'kontrakt' | 'profil' | 'billForm' | 'scanner';

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
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('hem');
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [scannedData, setScannedData] = useState<any>(null);

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
    setCurrentScreen('fakturor');
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
      case 'hem':
        return (
          <DashboardScreen 
            bills={bills} 
            onNavigate={setCurrentScreen}
          />
        );
      case 'fakturor':
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
            scannedData={scannedData}
            onSave={(data) => {
              addBill(data);
              setScannedData(null);
            }}
            onCancel={() => {
              setSelectedBill(null);
              setScannedData(null);
              setCurrentScreen('fakturor');
            }}
            onScan={() => setCurrentScreen('scanner')}
          />
        );
      case 'abonnemang':
        return (
          <View style={styles.screenContainer}>
            <Icon name="card-outline" size={64} color="#CCCCCC" style={{ marginBottom: 20 }} />
            <Text style={styles.screenTitle}>Abonnemang</Text>
            <Text style={styles.comingSoon}>Kommer snart...</Text>
          </View>
        );
      case 'kontrakt':
        return (
          <View style={styles.screenContainer}>
            <Icon name="document-text-outline" size={64} color="#CCCCCC" style={{ marginBottom: 20 }} />
            <Text style={styles.screenTitle}>Kontrakt</Text>
            <Text style={styles.comingSoon}>Kommer snart...</Text>
          </View>
        );
      case 'profil':
        return (
          <View style={styles.screenContainer}>
            <Icon name="person-circle-outline" size={64} color="#CCCCCC" style={{ marginBottom: 20 }} />
            <Text style={styles.screenTitle}>Min Profil</Text>
            <Text style={styles.comingSoon}>Kommer snart...</Text>
          </View>
        );
      case 'scanner':
        return (
          <InvoiceScanner
            onScanComplete={(data) => {
              setScannedData(data);
              setCurrentScreen('billForm');
            }}
            onCancel={() => setCurrentScreen('billForm')}
          />
        );
      default:
        return null;
    }
  };

  const renderBottomNavigation = () => {
    const navItems = [
      { id: 'hem' as ScreenType, label: 'Hem', icon: 'home', iconActive: 'home' },
      { id: 'fakturor' as ScreenType, label: 'Fakturor', icon: 'document-text-outline', iconActive: 'document-text' },
      { id: 'abonnemang' as ScreenType, label: 'Abonnemang', icon: 'card-outline', iconActive: 'card' },
      { id: 'kontrakt' as ScreenType, label: 'Kontrakt', icon: 'document-outline', iconActive: 'document' },
      { id: 'profil' as ScreenType, label: 'Profil', icon: 'person-outline', iconActive: 'person' }
    ];

    // Don't show bottom navigation when in bill form or scanner
    if (currentScreen === 'billForm' || currentScreen === 'scanner') {
      return null;
    }

    return (
      <View style={styles.bottomNavigation}>
        {navItems.map(item => {
          const isActive = currentScreen === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={() => setCurrentScreen(item.id)}
            >
              <Icon 
                name={isActive ? item.iconActive : item.icon} 
                size={24} 
                color={isActive ? '#0F7BFF' : '#666666'}
              />
              <Text style={[
                styles.navLabel,
                isActive && styles.activeNavLabel
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {currentScreen !== 'billForm' && currentScreen !== 'scanner' && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>FakturaVakt</Text>
          <TouchableOpacity>
            <Icon name="notifications-outline" size={24} color="#333333" />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.content}>
        {renderScreen()}
      </View>
      {renderBottomNavigation()}
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
    justifyContent: 'center',
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
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 11,
    marginTop: 4,
    color: '#666666',
  },
  activeNavLabel: {
    color: '#0F7BFF',
    fontWeight: '600',
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
    padding: 20,
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