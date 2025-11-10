import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
  icon?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, actionLabel, onPressAction, icon = 'sparkles-outline' }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Ionicons name={icon} size={18} color={theme.colors.textSecondary} style={styles.icon} />
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
      </View>
      {actionLabel && onPressAction && (
        <TouchableOpacity onPress={onPressAction} style={styles.action}>
          <Text style={[styles.actionText, { color: theme.colors.primary }]}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});

export default SectionHeader;
