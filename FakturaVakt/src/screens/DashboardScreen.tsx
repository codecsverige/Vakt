import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { VictoryPie } from 'victory-native';
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
          <VictoryPie
            data={chartData}
            colorScale={['#0F7BFF', '#8C5AE3', '#2DB784', '#FFB547', '#F35D4F']}
            innerRadius={60}
            padAngle={2}
            style={{
              labels: {
                fill: theme.colors.text,
                fontSize: 12,
              },
            }}
            height={260}
          />
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
});

export default DashboardScreen;
