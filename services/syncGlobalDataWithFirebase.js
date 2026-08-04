import { collection, onSnapshot, doc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { globalDb } from "./globalFirebaseConfig";
import localStorage from "./localStorage";

export const syncGlobalDataWithFirebase = () => {
  const unsubscribes = [];

  const onError = (key, err) => {
    if (err.code === "permission-denied") {
      // Expected — global Destya Studio Firebase has restricted rules. Silently skip.
    } else {
      console.warn(`[Firebase] Snapshot error for "${key}":`, err.message);
    }
  };

  // 🧩 1. GLOBAL CONFIG (/global/config)
  const configRef = doc(globalDb, "global", "config");
  unsubscribes.push(
    onSnapshot(configRef, async (snapshot) => {
      if (snapshot.exists()) {
        await localStorage.saveData(localStorage.KEYS.GLOBAL_CONFIG, snapshot.data());
      }
    }, (err) => onError("global/config", err))
  );

  // 📄 2. ABOUT SECTION (/global/about)
  const aboutRef = doc(globalDb, "global", "about");
  unsubscribes.push(
    onSnapshot(aboutRef, async (snapshot) => {
      if (snapshot.exists()) {
        await localStorage.saveData(localStorage.KEYS.ABOUT_SECTION, snapshot.data());
      }
    }, (err) => onError("global/about", err))
  );

  // 📱 3. APPS REGISTRY (/apps)
  const appsRef = collection(globalDb, "apps");
  unsubscribes.push(
    onSnapshot(appsRef, async (querySnapshot) => {
      const apps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (apps.length > 0) {
        await localStorage.saveData(localStorage.KEYS.APPS_REGISTRY, apps);
      }
    }, (err) => onError("apps", err))
  );

  // 📢 4. ANNOUNCEMENTS (/announcements)
  const announcementsRef = collection(globalDb, "announcements");
  unsubscribes.push(
    onSnapshot(announcementsRef, async (querySnapshot) => {
      const announcements = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (announcements.length > 0) {
        await localStorage.saveData(localStorage.KEYS.ANNOUNCEMENTS, announcements);
      }
    }, (err) => onError("announcements", err))
  );

  // 🎯 5. BANNERS (/banners)
  const bannersRef = collection(globalDb, "banners");
  unsubscribes.push(
    onSnapshot(bannersRef, async (querySnapshot) => {
      const banners = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (banners.length > 0) {
        await localStorage.saveData(localStorage.KEYS.BANNERS, banners);
      }
    }, (err) => onError("banners", err))
  );

  return () => unsubscribes.forEach(unsub => unsub());
};


