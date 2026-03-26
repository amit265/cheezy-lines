import { collection, onSnapshot, doc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { globalDb } from "./globalFirebaseConfig";
import localStorage from "./localStorage";

export const syncGlobalDataWithFirebase = () => {
  const unsubscribes = [];

  // 🧩 1. GLOBAL CONFIG (/global/config/main)
  const configRef = doc(globalDb, "global", "config", "main");
  unsubscribes.push(
    onSnapshot(configRef, async (snapshot) => {
      if (snapshot.exists()) {
        await localStorage.saveData(localStorage.KEYS.GLOBAL_CONFIG, snapshot.data());
      }
    })
  );

  // 📄 2. ABOUT SECTION (/global/about/main)
  const aboutRef = doc(globalDb, "global", "about", "main");
  unsubscribes.push(
    onSnapshot(aboutRef, async (snapshot) => {
      if (snapshot.exists()) {
        await localStorage.saveData(localStorage.KEYS.ABOUT_SECTION, snapshot.data());
      }
    })
  );

  // 📱 3. APPS REGISTRY (/global/apps)
  const appsRef = collection(globalDb, "global", "apps");
  unsubscribes.push(
    onSnapshot(appsRef, async (querySnapshot) => {
      const apps = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (apps.length > 0) {
        await localStorage.saveData(localStorage.KEYS.APPS_REGISTRY, apps);
      }
    })
  );

  // 📢 4. ANNOUNCEMENTS (/global/announcements)
  const announcementsRef = collection(globalDb, "global", "announcements");
  unsubscribes.push(
    onSnapshot(announcementsRef, async (querySnapshot) => {
      const announcements = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (announcements.length > 0) {
        await localStorage.saveData(localStorage.KEYS.ANNOUNCEMENTS, announcements);
      }
    })
  );

  // 🎯 5. BANNERS (/global/banners)
  const bannersRef = collection(globalDb, "global", "banners");
  unsubscribes.push(
    onSnapshot(bannersRef, async (querySnapshot) => {
      const banners = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (banners.length > 0) {
        await localStorage.saveData(localStorage.KEYS.BANNERS, banners);
      }
    })
  );

  return () => unsubscribes.forEach(unsub => unsub());
};
