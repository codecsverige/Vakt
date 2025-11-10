import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../i18n';
import { useSettingsStore } from '../store';
import { useTheme } from '../theme';

const LanguageToggle: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const inactiveLabelStyle = React.useMemo(
    () => ({ color: theme.colors.textSecondary }),
    [theme.colors.textSecondary],
  );

  return (
    <View>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{t('screens.settings.languageLabel')}</Text>
      <View style={styles.row}>
        {supportedLanguages.map((option) => {
          const isActive = option.code === language;
          return (
            <TouchableOpacity
              key={option.code}
              onPress={() => setLanguage(option.code)}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? theme.colors.primary : theme.colors.surface,
                  borderColor: isActive ? theme.colors.primary : theme.colors.divider,
                },
              ]}
            >
              <Text
                style={[
                  styles.pillLabel,
                  isActive ? styles.pillLabelActive : inactiveLabelStyle,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
});

export default LanguageToggle;
