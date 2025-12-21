import {
  AntDesign,
  Feather,
  FontAwesome,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Linking,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../constants/colors";
import { BannerAdComponent } from "../services/AdManager";
export default function Settings() {
  const router = useRouter();

  const handleContactUs = () => {

    const email = "mindcraftlearning97@gmail.com";
    const subject = "Support Request for Cheesy Lines";
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
          "Check out this amazing app on the Play Store!\n\nhttps://play.google.com/store/apps/details?id=com.mindcraftlearning.cheezylines",
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

      <View
        style={{
          width: "90%",
          backgroundColor: "white",
          borderRadius: 60,
          padding: 20,
          height: "70%",
        }}
      >
        {/* Number of Spins */}

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
                "https://mindcraftlearning.github.io/cheezy-lines"
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
                "https://play.google.com/store/apps/details?id=com.mindcraftlearning.cheezylines"
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
      </View>

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
