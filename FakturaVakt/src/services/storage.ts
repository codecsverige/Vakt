import EncryptedStorage from 'react-native-encrypted-storage';
import { MMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const ENCRYPTION_KEY_KEY = 'fakturavakt:mmkv-key';
let mmkvInstance: MMKV | null = null;
let initializingPromise: Promise<MMKV> | null = null;

const createStorageInstance = async () => {
  if (mmkvInstance) {
    return mmkvInstance;
  }

  if (initializingPromise) {
    return initializingPromise;
  }

  initializingPromise = (async () => {
    let encryptionKey = await EncryptedStorage.getItem(ENCRYPTION_KEY_KEY);

    if (!encryptionKey) {
      encryptionKey = uuidv4();
      await EncryptedStorage.setItem(ENCRYPTION_KEY_KEY, encryptionKey);
    }

    mmkvInstance = new MMKV({
      id: 'fakturavakt-storage',
      encryptionKey,
    });

    initializingPromise = null;

    return mmkvInstance;
  })();

  return initializingPromise;
};

export const ensureStorage = async () => createStorageInstance();

export const getStorage = () => {
  if (!mmkvInstance) {
    throw new Error('MMKV storage has not been initialised yet. Call ensureStorage() first.');
  }

  return mmkvInstance;
};

export const zustandStorage: StateStorage = {
  getItem: async (name) => {
    const storage = await createStorageInstance();
    const value = storage.getString(name);

    return value ?? null;
  },
  setItem: async (name, value) => {
    const storage = await createStorageInstance();
    storage.set(name, value);
  },
  removeItem: async (name) => {
    const storage = await createStorageInstance();
    storage.delete(name);
  },
};
