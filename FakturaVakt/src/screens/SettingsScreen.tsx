import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LanguageToggle from '../components/LanguageToggle';
import { useBillStore, useFamilyStore, useSettingsStore } from '../store';
import { useTheme } from '../theme';
import { DEFAULT_REMINDER_OFFSETS } from '../utils/constants';
import { notificationService } from '../services/notificationService';

const reminderOptions = [1, 3, 7, 14];

const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const {
    preferredTheme,
    setPreferredTheme,
    notificationsEnabled,
    setNotificationsEnabled,
    defaultReminderOffsets,
    setReminderOffsets,
    premiumEnabled,
    togglePremium,
  } = useSettingsStore();
  const refreshNotifications = useBillStore((state) => state.refreshNotifications);
  const refreshFamilyReminders = useFamilyStore((state) => state.refreshReminders);
  const primaryTextColor = React.useMemo(() => ({ color: theme.colors.text }), [theme.colors.text]);
  const secondaryTextColor = React.useMemo(
    () => ({ color: theme.colors.textSecondary }),
    [theme.colors.textSecondary],
  );

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);

    if (value) {
      try {
        await notificationService.initialize();
        await refreshNotifications();
        await refreshFamilyReminders();
      } catch (error) {
        setNotificationsEnabled(false);
        Alert.alert('Notifications', 'Unable to enable notifications: ' + (error as Error).message);
      }
    } else {
      try {
        await notificationService.cancelAllReminders();
      } catch (error) {
        setNotificationsEnabled(true);
        Alert.alert('Notifications', 'Unable to disable notifications: ' + (error as Error).message);
      }
    }
  };

  const toggleReminder = (offset: number) => {
    const exists = defaultReminderOffsets.includes(offset);
    if (exists) {
      const next = defaultReminderOffsets.filter((item) => item !== offset);
      setReminderOffsets(next.length ? next : DEFAULT_REMINDER_OFFSETS);
    } else {
      setReminderOffsets([...defaultReminderOffsets, offset].sort((a, b) => a - b));
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
        <Text style={[styles.title, primaryTextColor]}>{t('screens.settings.title')}</Text>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <LanguageToggle />
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, primaryTextColor]}>{t('common.theme')}</Text>
        <View style={styles.row}>
          {(['light', 'dark', 'system'] as const).map((mode) => {
            const isActive = preferredTheme === mode;
            return (
              <TouchableOpacity
                key={mode}
                onPress={() => setPreferredTheme(mode)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isActive ? theme.colors.primary : theme.colors.surfaceElevated,
                    borderColor: isActive ? theme.colors.primary : theme.colors.divider,
                  },
                ]}
              >
                  <Text
                    style={[
                      styles.pillLabel,
                      isActive ? styles.pillLabelActive : primaryTextColor,
                    ]}
                  >
                  {t(`common.${mode}` as const)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <Ionicons name="notifications-outline" size={20} color={theme.colors.text} style={styles.icon} />
            <View>
                <Text style={[styles.cardTitle, primaryTextColor]}>{t('screens.settings.notificationsTitle')}</Text>
                <Text style={[styles.cardSubtitle, secondaryTextColor]}>
                {t('screens.settings.notificationsDescription')}
              </Text>
            </View>
          </View>
          <Switch value={notificationsEnabled} onValueChange={handleNotificationToggle} />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, primaryTextColor]}>{t('screens.settings.notificationLeadTime')}</Text>
        <View style={styles.row}>
          {reminderOptions.map((option) => {
            const isActive = defaultReminderOffsets.includes(option);
            return (
              <TouchableOpacity
                key={option}
                onPress={() => toggleReminder(option)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isActive ? theme.colors.primary : theme.colors.surfaceElevated,
                    borderColor: isActive ? theme.colors.primary : theme.colors.divider,
                  },
                ]}
              >
                  <Text
                    style={[
                      styles.pillLabel,
                      isActive ? styles.pillLabelActive : secondaryTextColor,
                    ]}
                  >
                  {t('screens.settings.reminderDays', { count: option })}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, primaryTextColor]}>{t('screens.settings.backup')}</Text>
          <Text style={[styles.cardSubtitle, secondaryTextColor]}>{t('screens.settings.backupDescription')}</Text>
        <TouchableOpacity
          onPress={togglePremium}
          style={[
            styles.premiumButton,
            { backgroundColor: premiumEnabled ? theme.colors.accent : theme.colors.primary },
          ]}
        >
          <Text style={styles.premiumLabel}>{t('screens.settings.premiumCta')}</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  pillLabelActive: {
    color: '#fff',
  },
  icon: {
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 4,
    maxWidth: 260,
  },
  premiumButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  premiumLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default SettingsScreen;
