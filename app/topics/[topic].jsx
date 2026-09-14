import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DynamicBackground from "../../components/DynamicBackground";
import SwipeDeck from "../../components/SwipeDeck";
import colors from "../../constants/colors";
import { adConfigContext } from "../../context/AppContext";
import { BannerAdComponent } from "../../services/AdManager";

export default function Topic() {
  const { dataParams } = useLocalSearchParams();
  const { adConfig } = useContext(adConfigContext);
  const router = useRouter();

  // Safety check in case params are missing
  const data = dataParams ? JSON.parse(dataParams) : {};
  const lines = data?.lines || [];

  return (
    <DynamicBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back-sharp" size={36} color="white" />
          </Pressable>
        
        <Text style={styles.headerText}>{data?.title}</Text>
      </View>

      {/* Content (SwipeDeck) */}
      <View style={styles.content}>
       <SwipeDeck card={lines}/>
      </View>
      
      {/* Banner Ad */}
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
    alignItems: "center",
  },
  headerContainer: {
    paddingVertical: 10,
    display: "flex",
    flexDirection: "row",
    gap: 15,
    width: "90%",
    borderBottomWidth: 1,
    alignItems: "center",
    zIndex: 10,
    borderColor: "rgba(255,255,255,0.1)",
  },
  content: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
  },
  headerText: {
    color: "#FFF",
    fontSize: 26,
    fontFamily: "Poppins-Bold",
    textAlign: "left",
  },
});