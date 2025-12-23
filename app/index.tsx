import colors from "@/constants/colors";
import { adConfigContext, dataContext, favoritesContext } from "@/context/AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen } from "expo-router";
import { collection, doc, getDocs, onSnapshot } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import SplashScreenComponent from "../components/SplashScreenComponent";
import TopicButton from "../components/TopicButton";
import { BannerAdComponent, showInterstitialAd } from "../services/AdManager";
import { db } from "../services/firebaseConfig";
import { syncDataWithFirebase } from "../services/syncDataWithFirebase";

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const { adConfig, setAdConfig, clickCount } = useContext(adConfigContext);
  const { data, setData } = useContext(dataContext);
  const { favorites, setFavorites } = useContext(favoritesContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAndSyncData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem("cheezyLines");
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setData(parsedData);
        } else {
          const querySnapshot = await getDocs(collection(db, "cheezy-lines"));
          const fetchedData = querySnapshot.docs.map(doc => doc.data());
          await AsyncStorage.setItem("cheezyLines", JSON.stringify(fetchedData));
          setData(fetchedData);
        }
        setLoading(false);
        syncDataWithFirebase();
      } catch (error) {
        // console.error("❌ Load + Sync error:", error);
      }
    };
    loadAndSyncData();
  }, []);

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
    let unsubscribe;
    const fetchAdSettings = () => {
      try {
        unsubscribe = onSnapshot(
          doc(db, 'config', 'adSettings'),
          (doc) => {
            if (doc.exists()) {
              setAdConfig(doc.data());
            }
          },
          (error) => {}
        );
      } catch (error) {}
    };
    fetchAdSettings();
    return () => {
      if (unsubscribe) unsubscribe();
    };
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
    if (clickCount % adConfig?.interstitialFrequency === 0) {
      showInterstitialAd(adConfig);
    }
  }, [clickCount, adConfig]);

  if (showSplash) {
    return <SplashScreenComponent />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.headerContainer}>
        <Header />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size={"large"}
            color={"#000"}
            style={{ padding: 26 }}
          />
        ) : (
          <TopicButton data={data} />
        )}
      </View>

      {/* Bottom Banner Ad */}
      {adConfig?.showBannerAds && <BannerAdComponent />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  headerContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: colors.BACKGROUND,
    alignItems: "center",
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});