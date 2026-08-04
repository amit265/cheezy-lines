# Desty Studio Apps: Common Architecture & Guidelines

This document outlines the standard configurations, design paradigms, and cross-platform behaviors implemented across Desty Studio's suite of 5 mobile applications:

1. **Spin the Wheel : Pick for me** (Entertainment)
2. **CodeRespite: Refresh Your Tech Skills** (Productivity)
3. **AI Icebreaker: Question Games** (Social / Lifestyle)
4. **Cheesy Lines: So Bad, It Works** (Entertainment)
5. **Trivia Quest AI: Fun Quiz Game** (Education)

link

https://destyastudio.com/products/spin-the-wheel
https://destyastudio.com/products/code-respite
https://destyastudio.com/products/question-games
https://destyastudio.com/products/cheezylines
https://destyastudio.com/products/trivia-quest-ai

logo

https://destyastudio.com/_next/image?url=%2Fapps%2Fspin-the-wheel%2Ficon.png&w=1920&q=75
https://destyastudio.com/_next/image?url=%2Fapps%2Fcode-respite%2Ficon.png&w=1920&q=75
https://destyastudio.com/_next/image?url=%2Fapps%2Fquestion-games%2Ficon.png&w=1920&q=75
https://destyastudio.com/_next/image?url=%2Fapps%2Fcheezylines%2Ficon.png&w=1920&q=75
https://destyastudio.com/_next/image?url=%2Fapps%2Ftrivia-quest-ai%2Ficon.png&w=1920&q=75

Use this as a reference guide when developing, updating, or unifying any Desty Studio codebases.

---

## 1. Brand Identity & Design Tokens

To ensure immediately recognizable studio branding, all apps use a consistent structural design system.

### A. Theme Colors

- **Brand Colors:** Deep Indigo (`#132F94`), Dark Slate (`#0C1D59`), and Accent/CTA Neon Amber (`#FFA500`).
- **Application UI:** Keep tab bars, popup headers, settings menus, and modals consistent across all apps using these brand colors. Content elements (e.g. wheels, quiz cards, cheesy lines lists) can use app-specific color themes.

### B. Logo Intro Stamp

- **Startup/Landing Branding:** At the bottom of welcome pages, startup splash screens (`SplashScreens.jsx`), or sign-in layouts, display:
  `● built by destyastudio.`
  Use a small, clean, monospaced font style to maintain a premium feel. Position it absolutely at the bottom of the splash page:
  ```jsx
  brandingText: {
    position: "absolute",
    bottom: 50,
    fontFamily: "monospace",
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.4)",
    letterSpacing: 1.5,
  }
  ```

---

## 2. Web Environment Constraints & Gatekeeping

To drive native mobile app installs, Web builds are constrained as interactive promotional previews.

### A. Centered Portrait Layout (App Simulator)

- **Behavior:** On desktop monitors, the app must not stretch landscape to fill the screen. It must render inside a centered, phone-sized portrait container. On mobile browsers, it expands to normal full-screen portrait.
- **Implementation (`app/_layout.tsx`):**
  ```jsx
  {
    Platform.OS === "web" ? (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0C1D59",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 480,
            height: "95%",
            maxHeight: 850,
            borderRadius: 20,
            overflow: "hidden",
            backgroundColor: "#132F94",
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }} />
          </SafeAreaView>
        </View>
      </View>
    ) : (
      <SafeAreaView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
    );
  }
  ```

### B. Web Tab Interception & Download Prompts

- **Behavior:** Users on the Web version can explore the **Home** tab freely. Clicking on other tabs (e.g. _Quiz_, _Explore_, _Profile_) blocks the navigation transition and shows a beautiful modal prompting them to download the mobile app.
- **Implementation (`app/(tabs)/_layout.jsx`):**
  ```javascript
  const webTabListener = {
    tabPress: (e) => {
      if (Platform.OS === "web") {
        e.preventDefault(); // Stop tab switch
        setIsDownloadModalVisible(true); // Open the Modal
      }
    },
  };
  ```

### C. Web Layout & Dimension Calculations (Avoiding SSR Width Crashes)

- **Constraint:** Never use `Dimensions.get("window")` or `Dimensions.get("screen")` globally at the module import level. During Web bundle/SSR generation, this evaluates to `0`, leading to negative card widths or broken grids.
- **Solution:** Compute dimensions dynamically inside the component body using the `useWindowDimensions` hook:

  ```javascript
  import { useWindowDimensions } from "react-native";

  export default function MyGridComponent() {
    const { width } = useWindowDimensions();
    const screenWidth = Math.min(width || 480, 480);
    const cardWidth = (screenWidth - padding) / columns;
    // ...
  }
  ```

---

## 3. Platform-Specific Dependency Isolation

Metro statically analyzes all imports. Native-only dependencies must be completely isolated from the Web target.

### A. Ad & Consent Manager Isolation

Use Metro's platform-specific suffix resolution to separate Web code from Native code:

- **`AdManager.js` (Native Android/iOS):** Imports `react-native-google-mobile-ads` to display Banner, Interstitial, and Rewarded ads.
- **`AdManager.web.js` (Web Preview):** A mock component exporting the same layout interfaces and hooks, returning `null` or mocked success promises.
- **`adInit.js` / `adInit.web.js`:** Separate files containing platform-isolated initialization procedures to avoid static `require()` errors on Web builds.

---

## 4. Brand Cross-Promotion & Synergy

To maximize organic traction, all apps feature standard cross-promotion hooks.

### A. The "More from Destya Studio" Hub

- **Behavior:** Add a dedicated visual card list inside the Settings or Profile screen displaying the other 4 Desty Studio apps.
- **Robust Fallback:** Hardcode the list of the other 4 apps in the component state as a local default. This guarantees the cross-promotion cards are visible even if the device is offline or the Firebase Config database fails:

  ```javascript
  const FALLBACK_APPS = [
    {
      name: "Spin the Wheel : Pick for me",
      description:
        "Spin the wheel to decide fun topics, games, meals, or challenges!",
      icon: "https://destyastudio.com/apps/spin-the-wheel/icon.png",
      androidUrl: "https://destyastudio.com/products/spin-the-wheel",
      iosUrl: "https://destyastudio.com/products/spin-the-wheel",
      isAvailableOnIOS: true,
    },
    // ... other 3 apps
  ];

  const [moreApps, setMoreApps] = useState(FALLBACK_APPS);
  ```

### B. Redirection URL Queries

- **Redirection page:** The landing page redirection script handles redirect paths based on parameters (e.g. `?app=spin-the-wheel` or `?app=cheezylines`) to direct the user to the correct app store link automatically.

### C. Gamified Cross-Promotion Rewards

- **Behavior:** Reward users in App A for trying out App B.
- **Example:** Give 2 free AI Quiz generations or +50 XP when they tap to open "Cheesy Lines" or "Spin the Wheel".
- **Tracking:** Save a local key `ds_cross_promo_[target_app_slug]_clicked` in `AsyncStorage` when redirecting, and reward them immediately upon detection.

---

## 5. Local & Push Notifications

All apps implement remote push channels for campaigns, and daily local notifications to boost user retention.

- **Libraries:** `expo-notifications`
- **Daily Engagement Prompts (Local):** Schedule recurring reminders locally so they trigger offline. Ensure these are cleared and reset upon app launch to prevent notification stacking:
  ```javascript
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Ready for your daily challenge?",
      body: "Unlock new AI topics and test your knowledge now!",
    },
    trigger: {
      hour: 19, // 7:00 PM
      minute: 0,
      repeats: true,
    },
  });
  ```

---

## 6. Event Analytics

To measure user retention, campaign conversions, and milestone actions, integrate custom event tracking.

- **Native Engine:** `@react-native-firebase/analytics` (Native dependency match required, e.g. matching major version numbers of `@react-native-firebase/app` using `--legacy-peer-deps`).
- **Web Engine Fallback:** Log event parameters to browser console or Google Analytics gtag.
- **Standard Events to Track:**
  - `quiz_completed` / `wheel_spun` / `line_saved`
  - `score_shared` / `invite_sent`
  - `in_app_purchase_clicked`

---

## 7. Android Target API Compliance (Android 16 / API 36+)

To ensure that Desty Studio apps remain updateable and compliant on Google Play:

- **Requirement:** Apps must target Android 16 (API level 36) or higher.
- **Constraint:** From August 31, 2026, updates will be disabled if the target API level is not within 1 year of the latest Android release.
- **Implementation:** Configure the SDK build properties in `app.json` under plugins:
  ```json
  {
    "expo": {
      "plugins": [
        [
          "expo-build-properties",
          {
            "android": {
              "targetSdkVersion": 36
            }
          }
        ]
      ]
    }
  }
  ```
- **Action Required:** Bump target SDK, verify compiling, and release a new version to production.

---

## 8. App Store Optimization (ASO) & Store Presence

To maximize organic discoverability and increase App Store and Google Play conversions across all Desty Studio apps, adhere to the following metadata and store presence rules:

### A. Metadata Constraints & Search Terms

- **App Title:** Keep titles short and impact-driven (≤ 30 characters on both platforms) containing the brand name and one primary search term (e.g. `CodeRespite: Refresh skills` or `Trivia Quest AI: Fun Quiz`).
- **Short Description / Subtitle:** Limit to ≤ 30 characters on iOS App Store and ≤ 80 characters on Google Play Store. Highlight the unique selling proposition (USP).
- **Keyword Density:** Maintain a natural 2% to 3% keyword density in the App Store full description. Avoid keyword stuffing.

### B. Promotional Landing Pages (Web Previews)

- **Visuals:** On wide desktop screens, configure a side promotion panel adjacent to the portrait Web Simulator.
- **Content:** The panel must feature:
  - Clear app title and descriptive text detailing core features.
  - Bulleted key benefits.
  - App Store and Google Play redirection buttons (using standard links) to guide desktop visitors to mobile installations.
- **Example Layout (`app/_layout.tsx`):** Use a `flexDirection: "row"` container on Web builds that wraps to `column` on small viewport screens to present side-by-side promotional badges and mockups.

---

## 9. Deep Linking (Android App Links)

To maximize viral growth, all Destya Studio apps should support seamless deep linking.

- **Configuration (`app.json`):** Use `intentFilters` with `"autoVerify": true`.
  ```json
  "intentFilters": [
    {
      "action": "VIEW",
      "autoVerify": true,
      "data": [
        { "scheme": "https", "host": "destyastudio.com", "pathPrefix": "/spinny" }
      ],
      "category": ["BROWSABLE", "DEFAULT"]
    }
  ]
  ```
- **Verification:** Ensure `destyastudio.com/.well-known/assetlinks.json` includes the app's package name and SHA-256 fingerprint.
- **Handling in App:** Implement a `useDeepLinkHandler` hook that listens to both `Linking.getInitialURL()` (cold start) and `Linking.addEventListener('url')` (foreground) to extract URL parameters and update the app state.

---

## 10. In-App Update System (GitHub Hosted)

To bypass store review times and ensure users update to the latest features, use a GitHub-hosted update checker.

- **Remote Manifest:** Host a `version.json` file in the GitHub repo root containing `latestVersion` and a `whatsNew` array.
- **Update Hook:** Create a `useUpdateChecker.js` hook that fetches the raw `version.json` on app cold start (using `cache: 'no-store'`).
- **Trigger:** If the remote version is greater than `Constants.expoConfig.version`, display an `UpdateModal` showing what's new. Use `AsyncStorage` to ensure the modal only shows once per JS session.

---

## 11. Groq AI Integration (Free & Unlimited)

Instead of relying on costly backend OpenAI services, utilize Groq Cloud API directly on the client for instant generation.

- **Model Selection:** Default to `llama-3.3-70b-versatile` via `https://api.groq.com/openai/v1/chat/completions` for extreme speed.
- **In-App API Key Configuration:** Since the apps are free, include a setup guide asking users to enter their own Groq API key for unlimited generations. Save this key securely in `AsyncStorage`.
- **Fallback Engine:** Always provide hardcoded JSON templates as offline fallbacks so the feature functions smoothly even without an internet connection or an API key.

---

## 12. App Store & Google Play AI Compliance Policies

To prevent app rejections under Apple's User Generated Content (UGC) safety policies (Guideline 1.2) and Google Play's Generative AI requirements, all AI-enabled features must implement the following safeguards:

### A. Safety Prompts & Input Moderation
- **Rule:** Configure the system prompt to explicitly reject inappropriate, harmful, sexual, hateful, or violent user inputs.
- **Implementation:** Instruct the LLM to output a standardized error format (e.g. `[{"error": "Inappropriate topic..."}]`) if it detects violation, and handle it gracefully in the UI.

### B. AI Content Disclaimers
- **Rule:** Display a visible warning label near all AI-generated content blocks to alert users about model hallucinations.
- **Sample Text:** `"⚠️ AI responses are generated dynamically and may contain errors. Please verify critical facts."`

### C. Output Reporting & Flagging
- **Rule:** Provide an immediate mechanism for users to report or flag offensive/incorrect AI output.
- **Implementation:** Add a "Report output" button or flag icon adjacent to AI responses that registers a flag event and notifies the user.

---

## 13. Ad Placement & Monetization Strategy

To balance effective monetization with a premium user experience, follow these guidelines for integrating `react-native-google-mobile-ads`:

### A. Native Advanced Ads
- **Effectiveness:** Native Ads are the highest performing format because they blend seamlessly into the app's UI.
- **Placement:** Insert Native Ads into vertical scrolling feeds, grids, or directly below primary content blocks (e.g., between standard content cards on the Home tab). 
- **Styling:** Style the native ad container to match the padding, border radius, and shadow of adjacent standard UI cards. Ensure it includes the mandatory "Ad" attribution badge.

### B. Interstitial & App Open Ads
- **Effectiveness:** High CPM, but can be highly disruptive.
- **App Open Placement:** Trigger App Open ads *only* during cold starts or when the app is resumed from the background after a significant delay (e.g., > 1 hour), never on brief multitasking swaps.
- **Interstitial Placement:** Trigger these *only* at natural transition points. Examples: completing a level, finishing a quiz, or navigating between major, disconnected sections. Avoid showing them back-to-back.

### C. Banner Ads
- **Effectiveness:** Low CPM, but consistent impressions.
- **Placement:** Anchor banner ads to the absolute bottom of the screen above the tab bar, or top of non-intrusive screens. Never place them near interactive buttons where accidental clicks can occur, as this violates policy.

### D. Ad Layout & Spacing (Native & Banner)
- **Constraint:** Ad components (both Native and Banner) must only occupy screen space if they successfully load.
- **Implementation:** Track the ad loading state (`isAdLoaded`) and apply styling conditionally so the container has `opacity: 0` and `height: 0` (or returns `null`) until the ad successfully loads, ensuring no empty padding or background color remains visible on the screen.

---

## 14. Purposeful AI Integration

AI features (via Groq/Llama) should enhance the app experience, not overwhelm it. Avoid "AI for the sake of AI".

### A. When to Use AI
- **Generative Content Extension:** Use AI to generate infinite variations of core content (e.g., custom quizzes, personalized learning roadmaps, dynamic trivia questions).
- **Interactive Assistance:** Use AI as a contextual helper (e.g., a "Tutor" chatbot, explanation generator for incorrect answers).

### B. When to Avoid AI
- **Core Navigation:** Do not replace standard UI navigation with a conversational interface if buttons are faster.
- **Static Content:** Do not use AI to generate static text that could easily be hardcoded or retrieved from a database (e.g., privacy policies, standard app instructions).

### C. UI Integration
- **Opt-In Experience:** AI generation can be unpredictable. Make AI features distinct and opt-in. Keep standard, deterministic content available by default.
- **Visual Separation:** Clearly delineate AI-generated content (e.g., using a subtle gradient background or a "Sparkles" icon) so users understand it was dynamically created.

---

## 15. In-App Review & ASO Optimization

To organically boost ASO rankings across Desty Studio apps, rely on the native `expo-store-review` package rather than expecting users to manually visit the App Store.

### A. The Core Principle: Ask at Peak Satisfaction
- **Rule:** Never interrupt a user's flow to ask for a review randomly.
- **Implementation:** Trigger the review prompt immediately *after* a high-dopamine event, such as:
  - Closing a "Level Up" modal.
  - Getting a 100% perfect score on a quiz.
  - Earning a rare badge or achievement.

### B. How to Integrate
1. **Install:** Run `npx expo install expo-store-review`.
2. **Safe Triggering:** Native review modules crash in standard Expo Go or unsupported environments if not handled safely. Always wrap the trigger in a safe async block.
3. **Anti-Spam Checks:** Use `AsyncStorage` to ensure you only ask the user once per milestone (e.g. they shouldn't be asked every time they get a perfect score).

### C. Standard Boilerplate Logic
Use this template for triggering a review safely:
```javascript
import * as StoreReview from "expo-store-review";
import AsyncStorage from "@react-native-async-storage/async-storage";

const triggerStoreReview = async (storageKey = "hasPromptedReview") => {
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
```
*Note: The native UI will only appear in a production build or Custom Dev Client, but `StoreReview.hasAction()` ensures development environments degrade gracefully.*

---

## 16. Data Refresh & State Management

To ensure users always have access to the latest content (e.g., dynamically updated Firebase configurations, new questions, or fresh courses) without needing to restart the app:

### A. Pull-to-Refresh Implementation
- **Behavior:** Implement standard "Pull-to-Refresh" functionality using React Native's `RefreshControl` component on all main scrollable screens (like `FlatList` or `ScrollView`).
- **Data Sync:** When triggered, the `onRefresh` handler must explicitly re-fetch remote data (such as querying Firestore or fetching a remote JSON manifest) and update the local context or state immediately.
- **Platform Constraint:** Note that native pull-to-refresh physics and interactions are strictly designed for **Native Mobile environments (iOS and Android)**. On the Web version, this gesture is typically not supported natively by browsers, so web builds will rely on normal component mounting logic or manual reload buttons. Ensure the `RefreshControl` is implemented but understand it will primarily act as a mobile-exclusive feature.

---

## 17. Over-the-Air (OTA) Updates via EAS Update

For rapid deployment of JavaScript and asset changes without requiring users to download a new binary from the App Store or Google Play, all Desty Studio apps use **EAS Update**.

### A. How it Works
- **Mechanism:** Expo Application Services (EAS) hosts your new JavaScript bundle. When users open the app, the `expo-updates` client checks for a new version, downloads it in the background, and applies it upon the next cold start.
- **Constraints:** You can *only* use EAS Update for changes to JavaScript (React components, hooks, styles) and local assets (images, fonts). If you add new native modules (like a new package requiring `pod install` or Android build changes), you **must** build a new binary and submit it to the stores.

### B. Publishing an EAS Update
1. Test your app thoroughly using a local build (`npx expo start -c`).
2. Run the update command in your terminal targeting the specific branch (usually `production` or `preview`):
   ```bash
   eas update --branch production --message "Describe your fixes or features"
   ```
3. The CLI will bundle the app and upload it. The update is instantly available to any user on that branch.

### C. Combining with GitHub Hosted Checker
If you make a native change requiring a store update, do NOT use EAS Update. Instead, bump the `"version"` in `app.config.js`, update the remote `version.json` (as described in Section 10), and submit a new binary to the stores. The custom modal will then prompt users to manually update their app.

---

## 18. High-Performance Storage (SecureStore)

To ensure secure storage of sensitive keys, we utilize Expo Secure Store.

### B. Expo Secure Store
- **Usage:** Use `expo-secure-store` exclusively for sensitive credentials (e.g., Groq API Keys, Authentication Tokens).
- **Security:** This ensures data is encrypted and stored in the iOS Keychain or Android Keystore, preventing unauthorized access on rooted/jailbroken devices.

---

## 19. High-Performance Lists (FlashList)

To guarantee smooth 60fps/120fps scrolling on both high-end and low-end devices, avoid using React Native's standard `FlatList` for long data arrays.

- **Library:** `@shopify/flash-list`
- **Implementation:** Replace `<FlatList>` with `<FlashList>`.
- **Requirement:** You **must** provide an accurate `estimatedItemSize` prop to `FlashList` to ensure the native view recycling engine calculates layout bounds correctly before rendering.

---

## 20. Advanced UI Animations (Reanimated)

React Native's legacy `Animated` API runs on the JS thread by default (unless `useNativeDriver: true` is provided, which is limited). To unlock complex, buttery-smooth animations that run entirely on the UI thread, we use React Native Reanimated.

- **Library:** `react-native-reanimated` (v3+)
- **Concepts:** Replace `Animated.Value` with `useSharedValue()`. Replace standard inline styles with `useAnimatedStyle()`. Use `withSpring()` and `withTiming()` worklets to drive the shared values.
- **Performance:** This eliminates JS thread bottlenecks during heavy renders, ensuring UI animations (like card flips, swipes, and pop-ins) remain fluid.

---

## 21. Server State & Cache Management (React Query)

Avoid using scattered `useState` and `useEffect` hooks combined with manual `AsyncStorage` cache checks for remote data fetching.

- **Library:** `@tanstack/react-query`
- **Implementation:** Wrap the application in a `<QueryClientProvider>`. Replace custom fetch logic with the `useQuery` hook.
- **Benefits:** React Query automatically handles caching, deduping simultaneous requests, background refetching on window focus, and stale-time management, drastically reducing boilerplate code and race conditions.

---

## 22. Crash Reporting & Observability (Sentry)

To gain full visibility into production crashes, unhandled promise rejections, and performance bottlenecks, we integrate Sentry.

- **Library:** `@sentry/react-native`
- **Implementation:** Initialize Sentry at the very top of the app's entry point (`app/_layout.tsx`) using `Sentry.init()`. Wrap the root component in `Sentry.wrap()`.
- **Action:** Ensure the Expo plugin `@sentry/react-native/expo` is added to `app.config.js` to automatically upload source maps during the EAS build process.
