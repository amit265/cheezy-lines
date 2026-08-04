import * as StoreReview from "expo-store-review";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const triggerStoreReview = async (storageKey = "hasPromptedReview") => {
  try {
    const hasPrompted = await AsyncStorage.getItem(storageKey);
    // 1. Check if we haven't spammed them
    // 2. Safely check if the native Action exists (prevents Expo Go crashes)
    if (!hasPrompted && await StoreReview.hasAction()) {
      await StoreReview.requestReview();
      await AsyncStorage.setItem(storageKey, "true");
    }
  } catch (err) {
    console.log("[StoreReview] Failed to trigger:", err);
  }
};
