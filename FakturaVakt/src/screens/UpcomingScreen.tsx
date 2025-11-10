import React, { useMemo, useState } from 'react';
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BillCard from '../components/BillCard';
import EmptyState from '../components/EmptyState';
import FloatingActionButton from '../components/FloatingActionButton';
import { useBillStore } from '../store';
import { useTheme } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type UpcomingScreenNavigation = NativeStackScreenProps<RootStackParamList, 'MainTabs'>['navigation'];

const UpcomingScreen: React.FC = () => {
  const navigation = useNavigation<UpcomingScreenNavigation>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const upcomingBills = useBillStore((state) => state.upcomingBills());
  const overdueBills = useBillStore((state) => state.overdueBills());
  const markPaid = useBillStore((state) => state.markPaid);
  const refreshNotifications = useBillStore((state) => state.refreshNotifications);

  const filteredSections = useMemo(() => {
    const filterFn = (query: string) => (bill: ReturnType<typeof useBillStore.getState>['bills'][number]) => {
      if (!query) {
        return true;
      }
      const normalized = query.toLowerCase();

      return (
        bill.serviceName.toLowerCase().includes(normalized) ||
        bill.category.toLowerCase().includes(normalized) ||
        bill.referenceNumber?.toLowerCase().includes(normalized)
      );
    };

    const predicate = filterFn(search.trim());

    const sections = [];

    if (overdueBills.length > 0) {
      sections.push({
        title: t('screens.dashboard.overdue'),
        data: overdueBills.filter(predicate),
      });
    }

    sections.push({
      title: t('screens.upcoming.title'),
      data: upcomingBills.filter(predicate),
    });

    return sections.filter((section) => section.data.length > 0);
  }, [overdueBills, upcomingBills, search, t]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.searchCard, { backgroundColor: theme.colors.surface }]}>
        <Ionicons name="search-outline" size={18} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          placeholder={t('common.search')}
          placeholderTextColor={theme.colors.textSecondary}
          style={[styles.searchInput, { color: theme.colors.text }]}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <SectionList
        sections={filteredSections}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-outline"
            title={t('screens.upcoming.empty')}
            description={t('screens.upcoming.addBill')}
          />
        }
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <BillCard
            bill={item}
            onPress={() => navigation.navigate('BillForm', { billId: item.id })}
            onMarkPaid={() => markPaid(item.id)}
            onOpenAttachments={() => navigation.navigate('AttachmentViewer', { billId: item.id })}
            onRequestExtension={() => navigation.navigate('PaymentExtension', { billId: item.id })}
          />
        )}
      />
      <FloatingActionButton icon="add" onPress={() => navigation.navigate('BillForm')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
});

export default UpcomingScreen;
