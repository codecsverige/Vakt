import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import { useBillStore } from '../store';
import { useTheme } from '../theme';
import { formatCurrency } from '../utils/formatters';

const DashboardScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const metrics = useBillStore((state) => state.metrics());

  const chartData = useMemo(() => {
    if (metrics.topCategories.length === 0) {
      return [];
    }

    return metrics.topCategories.map((entry) => ({
      x: entry.category,
      y: entry.amount,
      label: `${entry.category}\n${formatCurrency(entry.amount, 'SEK', i18n.language)}`,
    }));
  }, [metrics.topCategories, i18n.language]);

  const comparison = metrics.previousMonthTotal === 0
    ? '—'
    : `${(((metrics.currentMonthTotal - metrics.previousMonthTotal) / metrics.previousMonthTotal) * 100).toFixed(1)}%`;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>{t('screens.dashboard.title')}</Text>
      <View style={styles.statsRow}>
        <StatCard
          icon="wallet-outline"
          label={t('screens.dashboard.currentMonth')}
          value={formatCurrency(metrics.currentMonthTotal, 'SEK', i18n.language)}
          trend={metrics.previousMonthTotal > 0 ? `${t('screens.dashboard.comparison')} ${comparison}` : undefined}
          trendColor={comparison.startsWith('-') ? theme.colors.success : theme.colors.warning}
        />
        <StatCard
          icon="calendar-outline"
          label={t('screens.dashboard.previousMonth')}
          value={formatCurrency(metrics.previousMonthTotal, 'SEK', i18n.language)}
        />
      </View>

      <View style={styles.section}>
        <SectionHeader title={t('screens.dashboard.topCategories')} icon="stats-chart-outline" />
        {chartData.length === 0 ? (
          <EmptyState
            icon="pie-chart-outline"
            title={t('screens.dashboard.noData')}
          />
        ) : (
          <View style={styles.categoriesContainer}>
            {chartData.map((item, index) => (
              <View key={index} style={[styles.categoryItem, { backgroundColor: theme.colors.surface }]}>
                <View style={[styles.categoryColor, { backgroundColor: ['#0F7BFF', '#8C5AE3', '#2DB784', '#FFB547', '#F35D4F'][index % 5] }]} />
                <View style={styles.categoryInfo}>
                  <Text style={[styles.categoryName, { color: theme.colors.text }]}>{item.x}</Text>
                  <Text style={[styles.categoryAmount, { color: theme.colors.textSecondary }]}>
                    {formatCurrency(item.y, 'SEK', i18n.language)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader title={t('screens.dashboard.upcomingThisWeek')} icon="time-outline" />
        <View style={[styles.indicatorCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.indicatorValue, { color: theme.colors.text }]}>
            {metrics.upcomingWeekCount}
          </Text>
          <Text style={[styles.indicatorLabel, { color: theme.colors.textSecondary }]}>
            {t('screens.dashboard.upcomingThisWeek')}
          </Text>
        </View>
      </View>
      <View style={styles.section}>
        <SectionHeader title={t('screens.dashboard.overdue')} icon="alert-circle-outline" />
        <View style={[styles.indicatorCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.indicatorValue, { color: theme.colors.text }]}>{metrics.overdueCount}</Text>
          <Text style={[styles.indicatorLabel, { color: theme.colors.danger }]}>
            {t('screens.dashboard.overdue')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  indicatorCard: {
    borderRadius: 16,
    paddingVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  indicatorLabel: {
    marginTop: 8,
    fontSize: 14,
  },
  categoriesContainer: {
    marginTop: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  categoryAmount: {
    fontSize: 12,
  },
});

export default DashboardScreen;
