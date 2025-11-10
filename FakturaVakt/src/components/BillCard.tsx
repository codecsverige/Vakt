import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import dayjs from 'dayjs';
import { useTheme } from '../theme';
import type { Bill } from '../types';
import { displayRelativeDue } from '../utils/dates';
import { formatCurrency } from '../utils/formatters';
import { useTranslation } from 'react-i18next';

interface BillCardProps {
  bill: Bill;
  onPress?: () => void;
  onMarkPaid?: () => void;
  onOpenAttachments?: () => void;
  onRequestExtension?: () => void;
}

const BillCard: React.FC<BillCardProps> = ({
  bill,
  onPress,
  onMarkPaid,
  onOpenAttachments,
  onRequestExtension,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isOverdue = bill.status === 'overdue';
  const isPaid = bill.status === 'paid';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.divider,
          shadowColor: theme.shadows.light.shadowColor,
        },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {bill.serviceName}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {bill.category}
          </Text>
        </View>
        <Text style={[styles.amount, { color: theme.colors.primary }]}>
          {formatCurrency(bill.amount, bill.currency)}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons
            name={isOverdue ? 'alert-circle' : 'calendar-outline'}
            size={16}
            color={isOverdue ? theme.colors.danger : theme.colors.textSecondary}
            style={styles.metaIcon}
          />
          <Text
            style={[
              styles.metaText,
              { color: isOverdue ? theme.colors.danger : theme.colors.textSecondary },
            ]}
          >
            {displayRelativeDue(bill, t)}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons
            name="calendar"
            size={16}
            color={theme.colors.textSecondary}
            style={styles.metaIcon}
          />
          <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
            {dayjs(bill.dueDate).format('DD MMM YYYY')}
          </Text>
        </View>
      </View>
      <View style={styles.actionsRow}>
          {onMarkPaid && !isPaid && (
          <TouchableOpacity
            onPress={onMarkPaid}
            style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
          >
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={styles.actionLabel}>{t('common.markPaid')}</Text>
          </TouchableOpacity>
        )}
        {onOpenAttachments && (
          <TouchableOpacity
            onPress={onOpenAttachments}
            style={[styles.actionButton, { backgroundColor: theme.colors.surfaceElevated }]}
          >
            <Ionicons name="attach" size={16} color={theme.colors.text} />
            <Text style={[styles.actionLabel, { color: theme.colors.text }]}>{t('common.attachments')}</Text>
          </TouchableOpacity>
        )}
        {onRequestExtension && (
          <TouchableOpacity
            onPress={onRequestExtension}
            style={[styles.actionButton, { backgroundColor: theme.colors.accent }]}
          >
            <Ionicons name="mail" size={16} color="#fff" />
            <Text style={styles.actionLabel}>{t('common.assistant')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 6,
  },
  metaText: {
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default BillCard;
