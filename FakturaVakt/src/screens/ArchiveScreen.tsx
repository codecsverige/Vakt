import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BillCard from '../components/BillCard';
import EmptyState from '../components/EmptyState';
import { useBillStore } from '../store';
import { useTheme } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type ArchiveNavigation = NativeStackNavigationProp<RootStackParamList>;

const ArchiveScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<ArchiveNavigation>();
  const paidBills = useBillStore((state) => state.paidBills());

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('screens.archive.title')}</Text>
      <FlatList
        data={paidBills}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon='archive-outline'
            title={t('screens.archive.empty')}
          />
        }
        renderItem={({ item }) => (
          <BillCard
            bill={item}
            onPress={() => navigation.navigate('BillForm', { billId: item.id })}
            onOpenAttachments={() => navigation.navigate('AttachmentViewer', { billId: item.id })}
            onRequestExtension={() => navigation.navigate('PaymentExtension', { billId: item.id })}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
});

export default ArchiveScreen;
