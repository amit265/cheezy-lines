import { Stack } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFonts } from "expo-font";
import * as Network from 'expo-network';
import { ErrorBoundary } from 'react-error-boundary';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MobileAds from "react-native-google-mobile-ads";
import ErrorFallBack from "./ErrorFallback";
import { StatusBar, Text, View } from "react-native";
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

export default function RootLayout() {


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



  return <>
    <ErrorBoundary
      FallbackComponent={ErrorFallBack}
      onError={(error, info) => {
        // console.log('Global Error:', error);
        // console.log('Component Stack:', info.componentStack);
        // Log the error to an external service like Sentry or Firebase
      }}
    >
      <SafeAreaProvider>
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
      </SafeAreaProvider>

    </ErrorBoundary >



  </>;
}
