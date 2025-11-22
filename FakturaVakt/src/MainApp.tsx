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
export type ScreenType = 'dashboard' | 'fakturor' | 'abonnemang' | 'vab' | 'avtal' | 'statistik' | 'notiser' | 'installningar' | 'billForm';

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
  const [showMenu, setShowMenu] = useState(false);

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
            onSave={addBill}
            onCancel={() => {
              setSelectedBill(null);
              setCurrentScreen('fakturor');
            }}
          />
        );
      case 'abonnemang':
        return (
          <View style={styles.screenContainer}>
            <Text style={styles.screenTitle}>Abonnemang</Text>
            <Text style={styles.comingSoon}>Kommer snart...</Text>
          </View>
        );
      case 'vab':
        return (
          <View style={styles.screenContainer}>
            <Text style={styles.screenTitle}>VAB & Barn</Text>
            <Text style={styles.comingSoon}>Kommer snart...</Text>
          </View>
        );
      case 'avtal':
        return (
          <View style={styles.screenContainer}>
            <Text style={styles.screenTitle}>Avtal & Garantier</Text>
            <Text style={styles.comingSoon}>Kommer snart...</Text>
          </View>
        );
      case 'statistik':
        return (
          <View style={styles.screenContainer}>
            <Text style={styles.screenTitle}>Statistik</Text>
            <Text style={styles.comingSoon}>Kommer snart...</Text>
          </View>
        );
      case 'notiser':
        return (
          <View style={styles.screenContainer}>
            <Text style={styles.screenTitle}>Notiser</Text>
            <Text style={styles.comingSoon}>Kommer snart...</Text>
          </View>
        );
      case 'installningar':
        return (
          <View style={styles.screenContainer}>
            <Text style={styles.screenTitle}>Inställningar</Text>
            <Text style={styles.comingSoon}>Kommer snart...</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderMenu = () => {
    const menuItems: Array<{ id: ScreenType; label: string; icon: string }> = [
      { id: 'dashboard', label: 'Översikt', icon: 'home-outline' },
      { id: 'fakturor', label: 'Fakturor', icon: 'document-text-outline' },
      { id: 'abonnemang', label: 'Abonnemang', icon: 'refresh-outline' },
      { id: 'vab', label: 'VAB & Barn', icon: 'people-outline' },
      { id: 'avtal', label: 'Avtal & Garantier', icon: 'folder-outline' },
      { id: 'statistik', label: 'Statistik', icon: 'bar-chart-outline' },
      { id: 'notiser', label: 'Notiser', icon: 'notifications-outline' },
      { id: 'installningar', label: 'Inställningar', icon: 'settings-outline' }
    ];

    if (!showMenu) return null;

    return (
      <View style={styles.menuOverlay}>
        <TouchableOpacity 
          style={styles.menuBackdrop} 
          activeOpacity={1} 
          onPress={() => setShowMenu(false)}
        />
        <View style={styles.menuContainer}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>FakturaVakt</Text>
            <TouchableOpacity onPress={() => setShowMenu(false)}>
              <Icon name="close" size={30} color="#333333" />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {menuItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => {
                  setCurrentScreen(item.id);
                  setShowMenu(false);
                }}
              >
                <Icon 
                  name={item.icon} 
                  size={24} 
                  color={currentScreen === item.id ? '#0F7BFF' : '#666666'}
                />
                <Text style={[
                  styles.menuItemText,
                  currentScreen === item.id && styles.activeMenuItemText
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowMenu(true)}>
          <Icon name="menu-outline" size={30} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FakturaVakt</Text>
        <TouchableOpacity>
          <Icon name="notifications-outline" size={24} color="#333333" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      {renderMenu()}
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
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '80%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 15,
  },
  activeMenuItemText: {
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