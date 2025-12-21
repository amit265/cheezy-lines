import { collection, onSnapshot } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "./firebaseConfig"; // adjust path as needed

export const syncDataWithFirebase = () => {
  const questionsRef = collection(db, "cheezy-lines");

  const unsubscribe = onSnapshot(
    questionsRef,
    async (querySnapshot) => {
      try {
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (data.length === 0) return;

        const existingDataStr = await AsyncStorage.getItem("cheezyLines");
        const existingData = existingDataStr ? JSON.parse(existingDataStr) : null;

        const hasChanged = JSON.stringify(existingData) !== JSON.stringify(data);

        if (hasChanged) {
          await AsyncStorage.setItem("cheezyLines", JSON.stringify(data));
          // console.log("🔥 Firebase updated, synced with AsyncStorage");
        } else {
          // console.log("✅ Firebase updated, but no data change");
        }
      } catch (error) {
        // console.error("❌ Error syncing with Firebase:", error);
      }
    },
    (error) => {
      // console.error("❌ Snapshot listener error:", error);
    }
  );

  return unsubscribe; // optionally use to stop listener later
};
