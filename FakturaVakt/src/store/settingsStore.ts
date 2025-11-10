import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { changeLanguage, type SupportedLanguage } from '../i18n';
import { zustandStorage } from '../services/storage';
import { DEFAULT_REMINDER_OFFSETS } from '../utils/constants';

export interface SettingsState {
  language: SupportedLanguage;
  preferredTheme: 'light' | 'dark' | 'system';
  defaultReminderOffsets: number[];
  notificationsEnabled: boolean;
  biometricLock: boolean;
  premiumEnabled: boolean;
  setLanguage: (language: SupportedLanguage) => void;
  setPreferredTheme: (theme: SettingsState['preferredTheme']) => void;
  setReminderOffsets: (offsets: number[]) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  toggleBiometricLock: () => void;
  togglePremium: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        language: 'sv',
        preferredTheme: 'system',
        defaultReminderOffsets: DEFAULT_REMINDER_OFFSETS,
        notificationsEnabled: true,
        biometricLock: false,
        premiumEnabled: false,
        setLanguage: (language) => {
          changeLanguage(language);
          set({ language });
        },
        setPreferredTheme: (preferredTheme) => set({ preferredTheme }),
        setReminderOffsets: (defaultReminderOffsets) => set({ defaultReminderOffsets }),
        setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
        toggleBiometricLock: () =>
          set((state) => ({
            biometricLock: !state.biometricLock,
          })),
        togglePremium: () =>
          set((state) => ({
            premiumEnabled: !state.premiumEnabled,
          })),
      }),
      {
        name: 'fakturavakt:settings',
        storage: createJSONStorage(() => zustandStorage),
        version: 1,
      },
    ),
  ),
);
