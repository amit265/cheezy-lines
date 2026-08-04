import { getAnalytics, logEvent as firebaseLogEvent } from "firebase/analytics";
import { app } from "./firebaseConfig";

let analytics;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.log("Analytics not supported in this environment");
}

export const logEvent = (eventName, params) => {
  if (analytics) {
    firebaseLogEvent(analytics, eventName, params);
  }
  console.log(`[Analytics Web] Event: ${eventName}`, params);
};

export const logScreenView = (screenName, screenClass) => {
  if (analytics) {
    firebaseLogEvent(analytics, 'screen_view', {
      firebase_screen: screenName,
      firebase_screen_class: screenClass
    });
  }
  console.log(`[Analytics Web] Screen: ${screenName}`);
};

export default function useAnalytics() {
  return { logEvent, logScreenView };
}
