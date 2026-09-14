import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const scheduleDailyReminder = async () => {
  try {
    if (Platform.OS === 'web') return; // Not supported on web

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    // Ensure we only schedule this once per install to avoid the Android bug
    // where re-scheduling a recurring alarm for a time in the past fires immediately
    const hasScheduled = await AsyncStorage.getItem("daily_notification_scheduled");
    if (hasScheduled === "true") {
      return;
    }

    // Schedule daily notification at 7 PM
    await Notifications.scheduleNotificationAsync({
      identifier: "daily-cheesy-reminder",
      content: {
        title: "Ready for your daily cheesy line? 🧀",
        body: "Unlock new cheesy lines to share tonight!",
      },
      trigger: {
        hour: 19, // 7:00 PM
        minute: 0,
        repeats: true,
      },
    });
    
    await AsyncStorage.setItem("daily_notification_scheduled", "true");
  } catch (err) {
    console.log("Failed to schedule notifications", err);
  }
};
