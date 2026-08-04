import { getAnalytics, logEvent as firebaseLogEvent, logScreenView as firebaseLogScreenView } from '@react-native-firebase/analytics';

const analytics = getAnalytics();

export const logEvent = async (eventName, params) => {
  try {
    await firebaseLogEvent(analytics, eventName, params);
  } catch (err) {
    console.log(`[Analytics iOS] Failed to log event: ${eventName}`, err);
  }
};

export const logScreenView = async (screenName, screenClass = 'default') => {
  try {
    await firebaseLogScreenView(analytics, {
      screen_name: screenName,
      screen_class: screenClass,
    });
  } catch (err) {
    console.log(`[Analytics iOS] Failed to log screen view: ${screenName}`, err);
  }
};

export default function useAnalytics() {
  return { logEvent, logScreenView };
}
