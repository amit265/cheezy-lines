import colors from "@/constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SplashScreenComponent from "../components/SplashScreenComponent";
import { BannerAdComponent } from "../services/AdManager";
import { db } from "../services/firebaseConfig";


export default function Index() {
  const [showSplash, setShowSplash] = useState(true);

  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "cheezy-lines"));
      const data = querySnapshot.docs.map(doc => doc.data());
      console.log("🔥 Data from Firebase:", data);
      await AsyncStorage.setItem("cheezy-lines", JSON.stringify(data));


    } catch (error) {

    }
  }




  useEffect(() => {
    async function prepare() {
      try {
        // Simulate loading fonts/assets
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        // ✅ Hide the native splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();

    // Show custom splash screen for 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => {
      if (timer) clearTimeout(timer);
    }
  }, []);


  if (showSplash) {
    return <SplashScreenComponent />
  }
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Pressable>
        <Text>Update Database</Text>
      </Pressable>
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
    paddingTop: 10, // For status bar spacing, adjust as needed
    paddingBottom: 10,
    backgroundColor: colors.BACKGROUND,
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: "white",
  },
  bannerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 4,
    backgroundColor: colors.BACKGROUND, // Optional: to avoid transparency glitches
  },
});

