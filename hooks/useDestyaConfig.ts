import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'destya_remote_config';
const API_URL = 'https://destyastudio.com/api/app-config';

export const fallbackConfig = {
  version: "1.0.0",
  legal: {
    privacyBaseUrl: "https://destyastudio.com/legal",
    termsBaseUrl: "https://destyastudio.com/legal",
    supportBaseUrl: "https://destyastudio.com/legal",
    website: "https://destyastudio.com",
    contactEmail: "hello@destyastudio.com",
  },
  ai: {
    model: "llama-3.3-70b-versatile",
    enabled: true,
  },
  ads: {
    globalKillSwitch: false,
    banner: { enabled: true },
    interstitial: { enabled: true, frequency: 5 },
    rewarded: { enabled: true },
    native: { enabled: true },
    appOpen: { enabled: true, frequency: 1 },
  },
  announcement: {
    show: false,
    message: "Welcome to Destya Studio!",
    url: "https://destyastudio.com",
  },
  crossPromoApps: [],
  versions: {},
  maintenanceMode: false,
};

export function useDestyaConfig() {
  const [config, setConfig] = useState(fallbackConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadConfig = async () => {
      try {
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached && isMounted) {
          setConfig(JSON.parse(cached));
        }

        const response = await fetch(API_URL);
        if (response.ok) {
          const freshConfig = await response.json();
          if (isMounted) {
            setConfig(freshConfig);
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(freshConfig));
          }
        }
      } catch (error) {
        console.log("Failed to fetch remote config. Using fallback/cache.", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  return { config, loading };
}
