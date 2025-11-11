import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';
import type { MainTabsParamList, RootStackParamList } from './types';
import DashboardScreen from '../screens/DashboardScreen';
import UpcomingScreen from '../screens/UpcomingScreen';
import ArchiveScreen from '../screens/ArchiveScreen';
import SettingsScreen from '../screens/SettingsScreen';
import FamilyCareScreen from '../screens/FamilyCareScreen';
import BillFormScreen from '../screens/BillFormScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import PaymentExtensionScreen from '../screens/PaymentExtensionScreen';
import AttachmentViewerScreen from '../screens/AttachmentViewerScreen';

const Tabs = createBottomTabNavigator<MainTabsParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TAB_ICON_MAP: Record<keyof MainTabsParamList, { active: string; inactive: string }> = {
  Upcoming: { active: 'calendar', inactive: 'calendar-outline' },
  Dashboard: { active: 'analytics', inactive: 'analytics-outline' },
  Archive: { active: 'archive', inactive: 'archive-outline' },
  FamilyCare: { active: 'people', inactive: 'people-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

const renderTabIcon = (
  routeName: keyof MainTabsParamList,
  focused: boolean,
  color: string,
  size: number,
) => {
  const { active, inactive } = TAB_ICON_MAP[routeName];
  const iconName = focused ? active : inactive;

  return <Ionicons name={iconName} color={color} size={size} />;
};

const MainTabsNavigator = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.divider,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarIcon: ({ color, focused, size }) =>
          renderTabIcon(route.name as keyof MainTabsParamList, focused, color, size),
        })}
      >
        <Tabs.Screen name="Upcoming" component={UpcomingScreen} options={{ title: t('nav.upcoming') }} />
        <Tabs.Screen name="Dashboard" component={DashboardScreen} options={{ title: t('nav.dashboard') }} />
        <Tabs.Screen name="Archive" component={ArchiveScreen} options={{ title: t('nav.archive') }} />
        <Tabs.Screen name="FamilyCare" component={FamilyCareScreen} options={{ title: t('nav.family') }} />
        <Tabs.Screen name="Settings" component={SettingsScreen} options={{ title: t('nav.settings') }} />
      </Tabs.Navigator>
  );
};

const AppNavigator = () => {
  const { theme } = useTheme();

  return (
    <NavigationContainer theme={theme.navigation}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
        <Stack.Screen name="BillForm" component={BillFormScreen} />
        <Stack.Screen name="QRScanner" component={QRScannerScreen} />
        <Stack.Screen name="PaymentExtension" component={PaymentExtensionScreen} />
        <Stack.Screen name="AttachmentViewer" component={AttachmentViewerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
