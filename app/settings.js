import {
  AntDesign,
  Feather,
  FontAwesome,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import {
  Alert,
  Linking,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import CrossPromoHub from "../components/CrossPromoHub";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../constants/colors";
import { BannerAdComponent } from "../services/AdManager";
import { globalConfigContext } from "../context/AppContext";

export default function Settings() {
  const router = useRouter();
  const { globalConfig } = useContext(globalConfigContext);


  const handleContactUs = () => {
    const email = globalConfig?.email || "mindcraftlearning97@gmail.com";
    const subject = `Support Request for ${globalConfig?.brandName || "Cheesy Lines"}`;
    const body = "Hi, I need help with...";
    const url = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url).catch((err) =>
      Alert.alert("Error", "Could not open email client.")
    );
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message:
          `Check out this amazing app!\n\n${globalConfig?.socialLinks?.playStore || "https://destyastudio.com/products/cheezylines"}`,
      });

      if (result.action === Share.sharedAction) {
        // console.log("App shared!");
      } else if (result.action === Share.dismissedAction) {
        // console.log("Share dismissed.");
      }
    } catch (error) {
      // console.log(error.message);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: colors.BACKGROUND,
      }}
    >
      <View>
        <BannerAdComponent />
      </View>
      <Text
        style={{
          fontSize: 25,
          fontFamily: "Poppins-Bold",
          marginBottom: 20,
          textAlign: "center",
          color: colors.TEXT,
          marginTop: 30,
        }}
      >
        Settings
      </Text>

      <ScrollView
        style={{
          width: "90%",
          backgroundColor: "white",
          borderRadius: 20,
          padding: 20,
          height: "70%",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Number of Spins */}

        {/* AI Key Settings Link */}
        <TouchableOpacity 
          style={{ marginBottom: 20, padding: 15, backgroundColor: "#FDF5E6", borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          onPress={() => router.push("/ai-settings")}
        >
          <View>
            <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16, color: "#333", marginBottom: 5 }}>AI Magic Settings</Text>
            <Text style={{ fontFamily: "Poppins-Regular", fontSize: 12, color: "#666" }}>
              Configure your Groq API Key
            </Text>
          </View>
          <Feather name="chevron-right" size={24} color="#333" />
        </TouchableOpacity>

        {/* Footer links */}
        <View
          style={{
            flexDirection: "column",
            justifyContent: "space-around",
            marginTop: 10,
            alignItems: "center",
            marginHorizontal: 20,
            paddingTop: 20,
            padding: 10,
            gap: 20,
          }}
        >
          <TouchableOpacity
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: 20,
            }}
            onPress={handleShare}
          >
            <AntDesign name="sharealt" size={24} color="#000000" />
            <Text
              style={{
                color: "#000000",
                fontFamily: "Poppins-Regular",
                fontSize: 18,
              }}
            >
              Share
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: 20,
            }}
            onPress={handleContactUs}
          >
            <FontAwesome name="send" size={24} color="#000000" />
            <Text
              style={{
                color: "#000000",
                fontFamily: "Poppins-Regular",
                fontSize: 18,
              }}
            >
              Contact Us
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: 20,
            }}
            onPress={() =>
              Linking.openURL(
                `${globalConfig?.legal?.privacyBaseUrl}/cheezylines/privacy` || "https://mindcraftlearning.github.io/cheezy-lines"
              )
            }
          >
            <MaterialIcons name="privacy-tip" size={24} color="#000000" />
            <Text
              style={{
                color: "#000000",
                fontFamily: "Poppins-Regular",
                fontSize: 18,
              }}
            >
              Privacy Policy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: 20,
            }}
            onPress={() =>
              Linking.openURL(
                globalConfig?.socialLinks?.playStore || "https://destyastudio.com/products/cheezylines"
              )
            }
          >
            <MaterialIcons name="reviews" size={24} color="#000000" />
            <Text
              style={{
                color: "#000000",
                fontFamily: "Poppins-Regular",
                fontSize: 18,
              }}
            >
              Rate and reviews
            </Text>
          </TouchableOpacity>
        </View>
        <CrossPromoHub />
      </ScrollView>

      <TouchableOpacity
        onPress={() => {
          router.back();
        }}
        style={{
          padding: 18,
          zIndex: 1,
          bottom: 40,
        }}
      >
        <Feather name="x-circle" size={50} color="black" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
