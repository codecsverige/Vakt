import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon = 'calendar-clear-outline', title, description }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconWrapper,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.divider,
          },
        ]}
      >
        <Ionicons name={icon} size={32} color={theme.colors.textSecondary} />
      </View>
      <Text style={[styles.title, { color: theme.colors.textSecondary }]}>{title}</Text>
      {description && (
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>{description}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default EmptyState;
