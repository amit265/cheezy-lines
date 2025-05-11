import { Stack } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFonts } from "expo-font";
import * as Network from 'expo-network';
import { ErrorBoundary } from 'react-error-boundary';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MobileAds from "react-native-google-mobile-ads";
import ErrorFallBack from "./ErrorFallback";
import { StatusBar, Text, View } from "react-native";
import { adConfigContext, dbUpdateContext, favoritesContext, dataContext,  } from "../context/AppContext";
import AdManager from "../services/AdManager";
import colors from "@/constants/colors";

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
  const [data, setData] = useState([]);


  const dbUpdateValue = useMemo(() => ({ dbUpdate, setUpdate }), [dbUpdate]);
  const adConfigValue = useMemo(() => ({ adConfig, setAdConfig, clickCount, setClickCount }), [clickCount, setClickCount, adConfig])
  const questionDataValue = useMemo(() => ({ data, setData }), [data])
  const favoritesValue = useMemo(() => ({ favorites, setFavorites }), [favorites])


  const checkConnection = useCallback(async () => {
    try {
      const { isConnected } = await Network.getNetworkStateAsync();
      setIsConnected(isConnected);
    } catch (error) {
      console.error('Error checking network status:', error);
    }
  }, []);


  useEffect(() => {

    checkConnection();
    const subscription = Network.addNetworkStateListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => subscription && subscription.remove();

  }, []);



  // ✅ Use useEffect for side effects (initialize mobile ads)
  useEffect(() => {
    MobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('Mobile Ads Initialized');
      })
      .catch(error => {
        console.error("Mobile Ads Init Error:", error);
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
    console.log("font laoded");

    return null; // Or a loading spinner
  }



  return <>
    <ErrorBoundary
      FallbackComponent={ErrorFallBack}
      onError={(error, info) => {
        console.log('Global Error:', error);
        console.log('Component Stack:', info.componentStack);
        // Log the error to an external service like Sentry or Firebase
      }}
    >
      <SafeAreaProvider>
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
      </SafeAreaProvider>

    </ErrorBoundary >



  </>;
}
