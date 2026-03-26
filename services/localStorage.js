import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  GLOBAL_CONFIG: 'global_config',
  APPS_REGISTRY: 'apps_registry',
  ABOUT_SECTION: 'about_section',
  ANNOUNCEMENTS: 'announcements',
  BANNERS: 'banners',
  CHEEZY_LINES: 'cheezyLines',
};

export const saveData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
  }
};

export const getData = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    return null;
  }
};

export const initializeLocalStorage = async (defaultData = {}) => {
  try {
    for (const [key, value] of Object.entries(defaultData)) {
      const existingData = await getData(key);
      if (!existingData) {
        await saveData(key, value);
      }
    }
  } catch (error) {
    console.error('Error initializing local storage:', error);
  }
};

export default {
  KEYS,
  saveData,
  getData,
  initializeLocalStorage,
};
