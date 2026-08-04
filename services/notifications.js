import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications behave when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
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

    // Cancel all previously scheduled notifications to avoid stacking
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule daily notification at 7 PM
    await Notifications.scheduleNotificationAsync({
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
    
    // console.log("Scheduled daily reminder for 7 PM");
  } catch (err) {
    console.log("Failed to schedule notifications", err);
  }
};
