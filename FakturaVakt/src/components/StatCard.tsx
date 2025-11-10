import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme';

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  trend?: string;
  trendColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend, trendColor }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.divider,
          shadowColor: theme.shadows.light.shadowColor,
        },
      ]}
    >
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
      </View>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.colors.text }]}>{value}</Text>
      {trend && (
        <Text style={[styles.trend, { color: trendColor ?? theme.colors.textSecondary }]}>{trend}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 12,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
  trend: {
    marginTop: 6,
    fontSize: 12,
  },
});

export default StatCard;
