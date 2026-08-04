import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fetch version.json from the github repo for update checking
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/destyastudio/cheezy-lines/main/version.json"; // Update this with actual URL if different

export default function useUpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const hasPrompted = await AsyncStorage.getItem("updatePromptedThisSession");
        if (hasPrompted) return; // Only show once per session

        const response = await fetch(GITHUB_RAW_URL, { cache: 'no-store' });
        const data = await response.json();
        
        const currentVersion = Constants.expoConfig.version;
        if (data && data.latestVersion && compareVersions(data.latestVersion, currentVersion) > 0) {
          setUpdateAvailable(true);
          setUpdateInfo(data);
          await AsyncStorage.setItem("updatePromptedThisSession", "true");
        }
      } catch (err) {
        console.log("Update check failed:", err);
      }
    };
    checkUpdate();
  }, []);

  return { updateAvailable, updateInfo, setUpdateAvailable };
}

// simple version comparison a > b => 1, a < b => -1, a == b => 0
function compareVersions(v1, v2) {
  if (!v1 || !v2) return 0;
  const a = v1.split('.').map(Number);
  const b = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const na = a[i] || 0;
    const nb = b[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}
