import { Stack } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFonts } from "expo-font";
import * as Network from 'expo-network';
import { ErrorBoundary } from 'react-error-boundary';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MobileAds from "react-native-google-mobile-ads";
import * as Sentry from '@sentry/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

Sentry.init({
  dsn: '', // Add your DSN here
});

const queryClient = new QueryClient();

import ErrorFallBack from "./ErrorFallback";
import { StatusBar, Text, View, Platform, StyleSheet } from "react-native";
import { adConfigContext, dbUpdateContext, favoritesContext, dataContext, globalConfigContext, appsRegistryContext, aboutContext, announcementsContext, bannersContext } from "../context/AppContext";
import AdManager from "../services/AdManager";
import colors from "@/constants/colors";
import localStorage from "@/services/localStorage";
import { sampleTopics } from "@/constants/topics";

// Default data from assets
import defaultConfig from "@/assets/data/config.json";
import defaultApps from "@/assets/data/apps.json";
import defaultAbout from "@/assets/data/about.json";
import defaultAnnouncements from "@/assets/data/announcements.json";
import defaultBanners from "@/assets/data/banners.json";
import useUpdateChecker from "../hooks/useUpdateChecker";
import useDeepLinkHandler from "../hooks/useDeepLinkHandler";
import { scheduleDailyReminder } from "../services/notifications";
import { Alert, TouchableOpacity, Linking, Image } from "react-native";

function RootLayout() {
  useDeepLinkHandler(); // Listen for deep links
  const { updateAvailable, updateInfo } = useUpdateChecker();

  useEffect(() => {
    scheduleDailyReminder(); // Initialize daily notifications
  }, []);

  useEffect(() => {
    if (updateAvailable && updateInfo) {
      Alert.alert(
        "Update Available",
        `Version ${updateInfo.latestVersion} is available!\n\nWhat's New:\n${updateInfo.whatsNew.join('\n')}`,
        [{ text: "OK" }]
      );
    }
  }, [updateAvailable, updateInfo]);


  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Baloo2": require("../assets/fonts/Baloo2-SemiBold.ttf")
  });



  const [adConfig, setAdConfig] = useState({
    showAds: true,
    showInterstitialAds: true,
    showAppOpenAds: true,
    showRewardedAds: true,
    showBannerAds: true,
    testAds: true,
    interstitialFrequency: 10,
    appOpenAdFrequency: 10
  });
  const [dbUpdate, setUpdate] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [clickCount, setClickCount] = useState(1);
  const [data, setData] = useState(sampleTopics);

  // Global Ecosystem States
  const [globalConfig, setGlobalConfig] = useState(defaultConfig);
  const [appsRegistry, setAppsRegistry] = useState(defaultApps);
  const [about, setAbout] = useState(defaultAbout);
  const [announcements, setAnnouncements] = useState(defaultAnnouncements);
  const [banners, setBanners] = useState(defaultBanners);


  const dbUpdateValue = useMemo(() => ({ dbUpdate, setUpdate }), [dbUpdate]);
  const adConfigValue = useMemo(() => ({ adConfig, setAdConfig, clickCount, setClickCount }), [clickCount, setClickCount, adConfig])
  const questionDataValue = useMemo(() => ({ data, setData }), [data])
  const favoritesValue = useMemo(() => ({ favorites, setFavorites }), [favorites])

  // Global Ecosystem Memoized Values
  const globalConfigValue = useMemo(() => ({ globalConfig, setGlobalConfig }), [globalConfig]);
  const appsRegistryValue = useMemo(() => ({ appsRegistry, setAppsRegistry }), [appsRegistry]);
  const aboutValue = useMemo(() => ({ about, setAbout }), [about]);
  const announcementsValue = useMemo(() => ({ announcements, setAnnouncements }), [announcements]);
  const bannersValue = useMemo(() => ({ banners, setBanners }), [banners]);


  const checkConnection = useCallback(async () => {
    try {
      const { isConnected } = await Network.getNetworkStateAsync();
      setIsConnected(isConnected);
    } catch (error) {
      // console.error('Error checking network status:', error);
    }
  }, []);


  useEffect(() => {

    checkConnection();
    const subscription = Network.addNetworkStateListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => subscription && subscription.remove();

  }, []);



  // ✅ Initialize Local Storage with default data
  useEffect(() => {
    let unsubscribeGlobal;
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

      // Load from storage (in case there were updates previously)
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

      // Start syncing global data from Firebase
      unsubscribeGlobal = syncGlobalDataWithFirebase();
    };

    initData();

    return () => {
      if (unsubscribeGlobal) unsubscribeGlobal();
    };
  }, []);



  // ✅ Use useEffect for side effects (initialize mobile ads)
  useEffect(() => {
    MobileAds()
      .initialize()
      .then(adapterStatuses => {
        // console.log('Mobile Ads Initialized');
      })
      .catch(error => {
        // console.error("Mobile Ads Init Error:", error);
      });



  }, [checkConnection]); // Only runs once




  if (!isConnected) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffcccc' }}>
        <Text style={{ color: '#ff0000', fontSize: 18, fontWeight: 'bold' }}>No Internet Connection 😢</Text>
      </View>
    );
  }



  if (!fontsLoaded) {
    // console.log("font laoded");

    return null; // Or a loading spinner
  }



  const RootContent = () => (
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
                          <StatusBar backgroundColor={colors.BACKGROUND} barStyle="dark-content" hidden={false} />
                          <AdManager />
                          <Stack screenOptions={{ headerShown: false }} />
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

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallBack}
      onError={(error, info) => {
        Sentry.captureException(error);
      }}
    >
      {Platform.OS === 'web' ? (
        <View style={{ flex: 1, backgroundColor: "#0C1D59", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
          {/* Side Panel for Wide Screens (hidden on narrow screens via standard flex wrap or max-width, but here we just use fixed max-width) */}
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, maxWidth: 400 }}>
            <Text style={{ color: "white", fontSize: 40, fontFamily: "Poppins-Bold", textAlign: 'center', marginBottom: 20 }}>
              Cheesy Lines
            </Text>
            <Text style={{ color: "white", fontSize: 18, fontFamily: "Poppins-Regular", textAlign: 'center', marginBottom: 40 }}>
              Get the best cheesy pickup lines for every situation! Available now on iOS and Android.
            </Text>
            <View style={{ flexDirection: 'row', gap: 20 }}>
              <TouchableOpacity onPress={() => Linking.openURL('https://apps.apple.com')}>
                <View style={{ backgroundColor: '#fff', padding: 10, borderRadius: 10 }}><Text style={{fontFamily: 'Poppins-Bold'}}>App Store</Text></View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => Linking.openURL('https://play.google.com')}>
                <View style={{ backgroundColor: '#fff', padding: 10, borderRadius: 10 }}><Text style={{fontFamily: 'Poppins-Bold'}}>Google Play</Text></View>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={{ width: "100%", maxWidth: 480, height: "95%", maxHeight: 850, borderRadius: 20, overflow: "hidden", backgroundColor: "#132F94", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}>
             <RootContent />
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
           <RootContent />
        </View>
      )}
    </ErrorBoundary>
  );
}

export default Sentry.wrap(RootLayout);
