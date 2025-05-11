import colors from "@/constants/colors";
import { adConfigContext, dataContext } from "@/context/AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen } from "expo-router";
import { collection, doc, getDocs, onSnapshot } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import SplashScreenComponent from "../components/SplashScreenComponent";
import TopicButton from "../components/TopicButton";
import { BannerAdComponent } from "../services/AdManager";
import { db } from "../services/firebaseConfig";
import { syncDataWithFirebase } from "../services/syncDataWithFirebase";
export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const { adConfig, setAdConfig } = useContext(adConfigContext);
  const { data, setData } = useContext(dataContext);

  useEffect(() => {
    const loadAndSyncData = async () => {
      try {
        // Check if data exists in AsyncStorage
        const cachedData = await AsyncStorage.getItem("cheezyLines");

        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setData(parsedData);
        } else {
          // Fetch from Firebase only if not cached
          const querySnapshot = await getDocs(collection(db, "cheezy-lines"));
          const fetchedData = querySnapshot.docs.map(doc => doc.data());
          console.log("🔥 Data from Firebase:", fetchedData);

          // Save and set
          await AsyncStorage.setItem("cheezyLines", JSON.stringify(fetchedData));
          setData(fetchedData);
        }

        // Sync in background
        syncDataWithFirebase();
      } catch (error) {
        console.error("❌ Load + Sync error:", error);
      }
    };

    loadAndSyncData();
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        await SplashScreen.hideAsync();
      }
    }

    prepare();

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000);

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
          (error) => {
            console.log('Error fetching ad settings:', error);
          }
        );
      } catch (error) {
        console.log('Error setting up snapshot:', error);
      }
    };

    fetchAdSettings();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);


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
        {/* Your main content here */}
        <TopicButton data={data} />
      </View>

      {/* Bottom Banner Ad */}
      <View style={styles.bannerContainer}>
        <BannerAdComponent />
      </View>
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
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 4,
    backgroundColor: colors.BACKGROUND,
  },
});
