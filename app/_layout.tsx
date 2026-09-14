// ─── Imports ─────────────────────────────────────────────────────────────────
import { Stack, usePathname, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFonts } from "expo-font";
import { Outfit_400Regular, Outfit_700Bold } from "@expo-google-fonts/outfit";
import { PlayfairDisplay_400Regular, PlayfairDisplay_700Bold, PlayfairDisplay_700Bold_Italic } from "@expo-google-fonts/playfair-display";
import * as Network from "expo-network";
import { ErrorBoundary } from "react-error-boundary";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useThemeColors } from "@/constants/colors";
import {
  Alert,
  Linking,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  useColorScheme,
} from "react-native";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Sentry from "@sentry/react-native";

import ErrorFallBack from "./ErrorFallback";
import MobileAds from "../components/MobileAdsProxy";
import AdManager from "../services/AdManager";
import localStorage from "@/services/localStorage";
import { sampleTopics } from "@/constants/topics";
import useUpdateChecker from "../hooks/useUpdateChecker";
import useDeepLinkHandler from "../hooks/useDeepLinkHandler";
import { scheduleDailyReminder } from "../services/notifications";
import {
  adConfigContext,
  dbUpdateContext,
  favoritesContext,
  dataContext,
  globalConfigContext,
  appsRegistryContext,
  aboutContext,
  announcementsContext,
  bannersContext,
  themeContext,
  aiCreditsContext,
  adFreeContext,
} from "../context/AppContext";

// Default data from assets
import defaultConfig from "@/assets/data/config.json";
import defaultApps from "@/assets/data/apps.json";
import defaultAbout from "@/assets/data/about.json";
import defaultAnnouncements from "@/assets/data/announcements.json";
import defaultBanners from "@/assets/data/banners.json";

// ─── Sentry & QueryClient ─────────────────────────────────────────────────────
Sentry.init({ dsn: "" }); // Add your DSN here
const queryClient = new QueryClient();

// ─── App Providers ────────────────────────────────────────────────────────────
function AppProviders({ children, values }) {
  const {
    globalConfigValue,
    appsRegistryValue,
    aboutValue,
    announcementsValue,
    bannersValue,
    questionDataValue,
    favoritesValue,
    dbUpdateValue,
    adConfigValue,
    themeValue,
    aiCreditsValue,
    adFreeValue,
  } = values;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <globalConfigContext.Provider value={globalConfigValue}>
          <appsRegistryContext.Provider value={appsRegistryValue}>
            <aboutContext.Provider value={aboutValue}>
              <announcementsContext.Provider value={announcementsValue}>
                <bannersContext.Provider value={bannersValue}>
                  <dataContext.Provider value={questionDataValue}>
                    <favoritesContext.Provider value={favoritesValue}>
                      <dbUpdateContext.Provider value={dbUpdateValue}>
                        <adConfigContext.Provider value={adConfigValue}>
                          <themeContext.Provider value={themeValue}>
                            <aiCreditsContext.Provider value={aiCreditsValue}>
                              <adFreeContext.Provider value={adFreeValue}>
                                <AdManager />
                                {children}
                              </adFreeContext.Provider>
                            </aiCreditsContext.Provider>
                          </themeContext.Provider>
                        </adConfigContext.Provider>
                      </dbUpdateContext.Provider>
                    </favoritesContext.Provider>
                  </dataContext.Provider>
                </bannersContext.Provider>
              </announcementsContext.Provider>
            </aboutContext.Provider>
          </appsRegistryContext.Provider>
        </globalConfigContext.Provider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

// ─── Web Gate Modal (blocks non-home routes, prompts download) ────────────────
const PRODUCT_URL = "https://destyastudio.com/products/cheezylines";

// Routes that are freely accessible as a preview on web
const WEB_PREVIEW_ROUTES = ["/", "/index"];

function WebGateModal({ visible, onClose }) {
  if (!visible) return null;
  return (
    <View style={{
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(12,29,89,0.96)",
      justifyContent: "center", alignItems: "center",
      zIndex: 999, padding: 24,
    }}>
      {/* Card */}
      <View style={{
        backgroundColor: "#fff", borderRadius: 28, padding: 28,
        width: "100%", maxWidth: 380, alignItems: "center",
        shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 30, elevation: 20,
      }}>
        {/* Icon */}
        <Text style={{ fontSize: 52, marginBottom: 12 }}>📱</Text>

        <Text style={{
          fontFamily: "Poppins-Bold", fontSize: 22, color: "#0C1D59",
          textAlign: "center", marginBottom: 8,
        }}>
          Get the Full App
        </Text>

        <Text style={{
          fontFamily: "Poppins-Regular", fontSize: 14, color: "#666",
          textAlign: "center", lineHeight: 22, marginBottom: 24,
        }}>
          {"You're viewing a preview. Download\n"}
          <Text style={{ fontFamily: "Poppins-Bold", color: "#132F94" }}>Cheesy Lines</Text>
          {" on your phone to unlock all features — favorites, AI magic, settings, and more!"}
        </Text>

        {/* Download button */}
        <TouchableOpacity
          style={{
            backgroundColor: "#132F94", borderRadius: 14, paddingVertical: 16,
            paddingHorizontal: 24, width: "100%", alignItems: "center", marginBottom: 16,
          }}
          onPress={() => Linking.openURL(PRODUCT_URL)}
        >
          <Text style={{ fontFamily: "Poppins-Bold", color: "#fff", fontSize: 16 }}>
            📲  Download Cheesy Lines
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Linking.openURL(PRODUCT_URL)} style={{ marginBottom: 16 }}>
          <Text style={{
            fontFamily: "Poppins-Regular", fontSize: 13, color: "#999",
            textDecorationLine: "underline",
          }}>
            destyastudio.com/products/cheezylines
          </Text>
        </TouchableOpacity>

        {/* Back to preview */}
        <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
          <Text style={{ fontFamily: "Poppins-Regular", fontSize: 13, color: "#aaa" }}>
            ← Back to preview
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Web Layout (phone frame + optional landscape panel) ──────────────────────
function WebLayout({ values }) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height && width > 768;
  const pathname = usePathname();
  const router = useRouter();

  // Show gate if current route is not in the allowed preview list
  const isGated = Platform.OS === "web" && !WEB_PREVIEW_ROUTES.includes(pathname);
  const [gateVisible, setGateVisible] = useState(false);
  const [lastAllowedPath] = useState("/");

  useEffect(() => {
    if (isGated) {
      setGateVisible(true);
    } else {
      setGateVisible(false);
    }
  }, [isGated]);

  const handleGateClose = () => {
    setGateVisible(false);
    // Navigate back to home preview
    router.replace("/");
  };

  // Phone frame: responsive to viewport, max 480px wide
  const frameWidth = Math.min(480, width * 0.95);
  const frameHeight = Math.min(900, height * 0.95);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0C1D59",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Side panel — only visible in wide landscape */}
      {isLandscape && (
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            maxWidth: 380,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 40,
              fontFamily: "Poppins-Bold",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Cheesy Lines
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: 17,
              fontFamily: "Poppins-Regular",
              textAlign: "center",
              marginBottom: 40,
              lineHeight: 26,
            }}
          >
            Get the best cheesy pickup lines for every situation! Available now
            on iOS and Android.
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL(PRODUCT_URL)}>
            <View
              style={{
                backgroundColor: "#FFA500",
                paddingVertical: 14,
                paddingHorizontal: 32,
                borderRadius: 14,
              }}
            >
              <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16, color: "#0C1D59" }}>
                📲  Download the App
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Phone frame — always centered */}
      <View
        style={{
          width: frameWidth,
          height: frameHeight,
          borderRadius: 40,
          overflow: "hidden",
          backgroundColor: "#fff",
          shadowColor: "#000",
          shadowOpacity: 0.5,
          shadowRadius: 40,
          elevation: 20,
          borderWidth: 8,
          borderColor: "#1a1a2e",
        }}
      >
        <AppProviders values={values}>
          <Stack screenOptions={{ headerShown: false }} />
        </AppProviders>

        {/* Gate modal — rendered inside phone frame so it's contained */}
        <WebGateModal visible={gateVisible} onClose={handleGateClose} />
      </View>
    </View>
  );
}


// ─── Root Layout ──────────────────────────────────────────────────────────────
function RootLayout() {
  useDeepLinkHandler();
  const { updateAvailable, updateInfo } = useUpdateChecker();

  // Notifications — not supported on web
  useEffect(() => {
    if (Platform.OS !== "web") {
      scheduleDailyReminder();
    }
  }, []);

  // Update alert — only on native
  useEffect(() => {
    if (updateAvailable && updateInfo && Platform.OS !== "web") {
      Alert.alert(
        "Update Available",
        `Version ${updateInfo.latestVersion} is available!\n\nWhat's New:\n${updateInfo.whatsNew.join("\n")}`,
        [{ text: "OK" }]
      );
    }
  }, [updateAvailable, updateInfo]);

  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    Baloo2: require("../assets/fonts/Baloo2-SemiBold.ttf"),
    "Outfit-Regular": Outfit_400Regular,
    "Outfit-Bold": Outfit_700Bold,
    "Playfair-Regular": PlayfairDisplay_400Regular,
    "Playfair-Bold": PlayfairDisplay_700Bold,
    "Playfair-BoldItalic": PlayfairDisplay_700Bold_Italic,
  });

  // ── State ──
  const [adConfig, setAdConfig] = useState({
    showAds: true,
    showInterstitialAds: true,
    showAppOpenAds: true,
    showRewardedAds: true,
    showBannerAds: true,
    testAds: true,
    interstitialFrequency: 10,
    appOpenAdFrequency: 10,
  });
  const [dbUpdate, setUpdate] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [clickCount, setClickCount] = useState(1);
  const [data, setData] = useState(sampleTopics);

  // Global ecosystem states
  const [globalConfig, setGlobalConfig] = useState(defaultConfig);
  const [appsRegistry, setAppsRegistry] = useState(defaultApps);
  const [about, setAbout] = useState(defaultAbout);
  const [announcements, setAnnouncements] = useState(defaultAnnouncements);
  const [banners, setBanners] = useState(defaultBanners);
  const [themePreference, setThemePreference] = useState("light");
  
  // AI Credits & Ad-Free state
  const [aiCredits, setAiCredits] = useState(5);
  const [isAdFree, setIsAdFree] = useState(false);

  // ── Theme hooks (must be called before early returns) ──
  const themeValue = useMemo(() => ({ themePreference, setThemePreference }), [themePreference]);

  const colors = useThemeColors();
  const manualTheme = themePreference;
  const isDark = manualTheme === 'system' ? useColorScheme() === 'dark' : manualTheme === 'dark';

  // ── Memoized context values ──
  const dbUpdateValue = useMemo(() => ({ dbUpdate, setUpdate }), [dbUpdate]);
  const adConfigValue = useMemo(
    () => ({ adConfig, setAdConfig, clickCount, setClickCount }),
    [adConfig, clickCount]
  );
  const questionDataValue = useMemo(() => ({ data, setData }), [data]);
  const favoritesValue = useMemo(
    () => ({ favorites, setFavorites }),
    [favorites]
  );
  const globalConfigValue = useMemo(
    () => ({ globalConfig, setGlobalConfig }),
    [globalConfig]
  );
  const appsRegistryValue = useMemo(
    () => ({ appsRegistry, setAppsRegistry }),
    [appsRegistry]
  );
  const aboutValue = useMemo(() => ({ about, setAbout }), [about]);
  const announcementsValue = useMemo(
    () => ({ announcements, setAnnouncements }),
    [announcements]
  );
  const bannersValue = useMemo(() => ({ banners, setBanners }), [banners]);
  const aiCreditsValue = useMemo(() => ({ aiCredits, setAiCredits }), [aiCredits]);
  const adFreeValue = useMemo(() => ({ isAdFree, setIsAdFree }), [isAdFree]);

  // ── Network monitoring (skip on web — not reliable) ──
  const checkConnection = useCallback(async () => {
    if (Platform.OS === "web") return;
    try {
      const { isConnected: connected } = await Network.getNetworkStateAsync();
      setIsConnected(connected ?? true);
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") return;
    checkConnection();
    const subscription = Network.addNetworkStateListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => subscription && subscription.remove();
  }, []);

  // ── Initialize local storage ──
  useEffect(() => {
    const initData = async () => {
      const defaults = {
        [localStorage.KEYS.GLOBAL_CONFIG]: defaultConfig,
        [localStorage.KEYS.APPS_REGISTRY]: defaultApps,
        [localStorage.KEYS.ABOUT_SECTION]: defaultAbout,
        [localStorage.KEYS.ANNOUNCEMENTS]: defaultAnnouncements,
        [localStorage.KEYS.BANNERS]: defaultBanners,
        [localStorage.KEYS.CHEEZY_LINES]: sampleTopics,
      };

      await localStorage.initializeLocalStorage(defaults);

      import("@react-native-async-storage/async-storage").then(async ({ default: AsyncStorage }) => {
        // Theme
        const storedTheme = await AsyncStorage.getItem("ds_theme_preference");
        if (storedTheme) {
          setThemePreference(storedTheme);
        }
        
        // Developer Ad-Free (from settings tap)
        const isDevAdFree = await AsyncStorage.getItem("ds_is_ad_free");
        if (isDevAdFree === "true") {
          setAdConfig(prev => ({ 
            ...prev, 
            showAds: false, 
            showInterstitialAds: false, 
            showAppOpenAds: false, 
            showRewardedAds: false, 
            showBannerAds: false 
          }));
        }

        // Rewarded Ad-Free Timer
        const adFreeUntilStr = await AsyncStorage.getItem("ad_free_until");
        if (adFreeUntilStr) {
          const adFreeUntil = parseInt(adFreeUntilStr, 10);
          if (Date.now() < adFreeUntil) {
            setIsAdFree(true);
            // Automatically clear ad-free state when time expires
            setTimeout(() => {
              setIsAdFree(false);
              AsyncStorage.removeItem("ad_free_until");
            }, adFreeUntil - Date.now());
          } else {
            AsyncStorage.removeItem("ad_free_until");
          }
        }

        // AI Credits logic (refill 5 daily)
        const storedCreditsStr = await AsyncStorage.getItem("ds_ai_credits");
        let currentCredits = storedCreditsStr !== null ? parseInt(storedCreditsStr, 10) : 5;
        
        const lastRefillDate = await AsyncStorage.getItem("last_ai_credit_refill");
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
        
        if (lastRefillDate !== today) {
          if (currentCredits < 5) {
            currentCredits = 5;
          }
          await AsyncStorage.setItem("last_ai_credit_refill", today);
        }
        setAiCredits(currentCredits);
        await AsyncStorage.setItem("ds_ai_credits", currentCredits.toString());
      });

      const cachedConfig = await localStorage.getData(localStorage.KEYS.GLOBAL_CONFIG);
      const cachedApps = await localStorage.getData(localStorage.KEYS.APPS_REGISTRY);
      const cachedAbout = await localStorage.getData(localStorage.KEYS.ABOUT_SECTION);
      const cachedAnnouncements = await localStorage.getData(localStorage.KEYS.ANNOUNCEMENTS);
      const cachedBanners = await localStorage.getData(localStorage.KEYS.BANNERS);
      const cachedData = await localStorage.getData(localStorage.KEYS.CHEEZY_LINES);

      if (cachedConfig) setGlobalConfig(cachedConfig);
      if (cachedApps) setAppsRegistry(cachedApps);
      if (cachedAbout) setAbout(cachedAbout);
      if (cachedAnnouncements) setAnnouncements(cachedAnnouncements);
      if (cachedBanners) setBanners(cachedBanners);
      if (cachedData) setData(cachedData);
    };

    initData();
  }, []);

  // ── Initialize Mobile Ads (native only) ──
  useEffect(() => {
    if (Platform.OS === "web") return;
    MobileAds()
      .initialize()
      .catch(() => {});
  }, []);

  // ── Early returns ──
  if (!fontsLoaded) return null;

  const contextValues = {
    globalConfigValue,
    appsRegistryValue,
    aboutValue,
    announcementsValue,
    bannersValue,
    questionDataValue,
    favoritesValue,
    dbUpdateValue,
    adConfigValue,
    themeValue,
    aiCreditsValue,
    adFreeValue,
  };

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallBack}
      onError={(error) => Sentry.captureException(error)}
    >
      <StatusBar
        backgroundColor={colors.BACKGROUND}
        barStyle={isDark ? "light-content" : "dark-content"}
        hidden={false}
      />
      {Platform.OS === "web" ? (
        <WebLayout values={contextValues} />
      ) : (
        <View style={{ flex: 1 }}>
          <AppProviders values={contextValues}>
            <Stack screenOptions={{ headerShown: false }} />
          </AppProviders>
        </View>
      )}
    </ErrorBoundary>
  );
}

export default Sentry.wrap(RootLayout);
