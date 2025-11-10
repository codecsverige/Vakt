import React from 'react';
import { FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { Attachment } from '../types';
import { useTheme } from '../theme';
import { useTranslation } from 'react-i18next';

interface AttachmentListProps {
  attachments: Attachment[];
  onRemove?: (attachmentId: string) => void;
}

const AttachmentList: React.FC<AttachmentListProps> = ({ attachments, onRemove }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  if (attachments.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={{ color: theme.colors.textSecondary }}>{t('screens.attachments.empty')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={attachments}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View
          style={[
            styles.item,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.divider,
            },
          ]}
        >
          <View style={styles.left}>
            <Ionicons
              name={item.type === 'image' ? 'image-outline' : item.type === 'pdf' ? 'document-text-outline' : 'document-outline'}
              size={22}
              color={theme.colors.primary}
              style={styles.icon}
            />
            <View>
              <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              {item.size && (
                <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
                  {(item.size / 1024).toFixed(1)} KB
                </Text>
              )}
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => Linking.openURL(item.uri)} style={styles.actionButton}>
              <Ionicons name="open-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            {onRemove && (
              <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.actionButton}>
                <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  empty: {
    paddingVertical: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    maxWidth: 180,
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 8,
  },
});

export default AttachmentList;
