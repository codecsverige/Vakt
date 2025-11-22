import EncryptedStorage from 'react-native-encrypted-storage';
import { StateStorage } from 'zustand/middleware';

// Use EncryptedStorage directly instead of MMKV
export const ensureStorage = async () => {
  // EncryptedStorage doesn't need initialization
  return Promise.resolve();
};

export const getStorage = () => {
  return {
    getString: async (key: string) => {
      return await EncryptedStorage.getItem(key) || undefined;
    },
    set: async (key: string, value: string) => {
      await EncryptedStorage.setItem(key, value);
    },
    delete: async (key: string) => {
      await EncryptedStorage.removeItem(key);
    },
    clearAll: async () => {
      await EncryptedStorage.clear();
    },
    getAllKeys: async () => {
      const keys = await EncryptedStorage.getAllKeys();
      return keys || [];
    },
  };
};

export const zustandStorage: StateStorage = {
  getItem: async (name) => {
    try {
      const value = await EncryptedStorage.getItem(name);
      return value ?? null;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  setItem: async (name, value) => {
    try {
      await EncryptedStorage.setItem(name, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
    }
  },
  removeItem: async (name) => {
    try {
      await EncryptedStorage.removeItem(name);
    } catch (error) {
      console.error('Storage removeItem error:', error);
    }
  },
};
