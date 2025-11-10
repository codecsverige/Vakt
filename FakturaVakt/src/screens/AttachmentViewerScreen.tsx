import React from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import AttachmentList from '../components/AttachmentList';
import { useBillStore } from '../store';
import { useTheme } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { removeAttachmentFromDisk } from '../services/attachmentService';

type Props = NativeStackScreenProps<RootStackParamList, 'AttachmentViewer'>;

const AttachmentViewerScreen: React.FC<Props> = ({ route, navigation }) => {
  const { billId } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const bill = useBillStore((state) => state.bills.find((entry) => entry.id === billId));
  const removeAttachmentFromBill = useBillStore((state) => state.removeAttachment);

  if (!bill) {
    navigation.goBack();
    return null;
  }

  const handleRemove = async (attachmentId: string) => {
    const attachment = bill.attachments.find((item) => item.id === attachmentId);
    if (!attachment) {
      return;
    }

    removeAttachmentFromBill(bill.id, attachmentId);
    try {
      await removeAttachmentFromDisk(attachment);
    } catch (error) {
      Alert.alert('Attachments', (error as Error).message);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('screens.attachments.title')}</Text>
      <AttachmentList attachments={bill.attachments} onRemove={handleRemove} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 120,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
});

export default AttachmentViewerScreen;
