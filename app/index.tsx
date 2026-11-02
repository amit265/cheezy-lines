import { adConfigContext, dataContext, favoritesContext, adFreeContext } from "@/context/AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DynamicBackground from "../components/DynamicBackground";
import Header from "../components/Header";
import SplashScreenComponent from "../components/SplashScreenComponent";
import TopicButton from "../components/TopicButton";
import { BannerAdComponent, showInterstitialAd } from "../services/AdManager";

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const { adConfig, clickCount } = useContext(adConfigContext);
  const { isAdFree } = useContext(adFreeContext);
  const { data } = useContext(dataContext);
  const { setFavorites } = useContext(favoritesContext);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate network request
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    prepare();

    // Splash Screen Timer
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);



  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem("FAVORITE_LINES");
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (err) {}
    };
    loadFavorites();
  }, []);

  useEffect(() => {
    if (clickCount > 0 && clickCount % (adConfig?.interstitialFrequency || 5) === 0) {
      showInterstitialAd(adConfig, isAdFree);
    }
  }, [clickCount, adConfig, isAdFree]);

  if (showSplash) {
    return <SplashScreenComponent />;
  }

  return (
    <DynamicBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Header */}
        <View style={styles.headerContainer}>
          <Header />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <TopicButton data={data} refreshing={refreshing} onRefresh={handleRefresh} />
        </View>

        {/* Bottom Banner Ad */}
        {adConfig?.showBannerAds && <BannerAdComponent />}
      </SafeAreaView>
    </DynamicBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: "center",
    zIndex: 10,
  },
  content: {
    flex: 1,
    width: "100%",
  },
});