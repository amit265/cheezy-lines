import { FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import RNShare from "./ShareProxy";
import { captureRef } from "react-native-view-shot";
import { favoritesContext } from "../context/AppContext";
import ShareCard from "./ShareCard";
import colors from "../constants/colors";
import { triggerStoreReview } from "../services/storeReview";
import useAnalytics from "../services/useAnalytics";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence, runOnJS } from "react-native-reanimated";

// --- SUB-COMPONENT: Bouncy Icon Button ---
const BouncyIconButton = ({ icon, onPress, library = "Ionicons", color = "#000" }) => {
  const scaleAnim = useSharedValue(1);

  const handlePressIn = () => {
    scaleAnim.value = withSpring(0.8, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scaleAnim.value = withSpring(1, { damping: 4, stiffness: 40 }, (finished) => {
      if (finished && onPress) {
        runOnJS(onPress)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.iconButton}>
      <Animated.View style={animatedStyle}>
        {library === "FontAwesome" ? (
          <FontAwesome name={icon} size={26} color={color} />
        ) : (
          <Ionicons name={icon} size={26} color={color} />
        )}
      </Animated.View>
    </Pressable>
  );
};

export default function LineCard({ lines }) {
  const [copy, setCopy] = useState(false);
  const { favorites, setFavorites } = useContext(favoritesContext);
  const shareCardRef = useRef();
  const [isSharing, setIsSharing] = useState(false);
  const { logEvent } = useAnalytics();

  // --- ANIMATION REFS ---
  const heartScale = useSharedValue(1);

  const isFavorite = favorites.some((fav) => fav.id === lines.id);

  useEffect(() => {
    const copyTimeOut = setTimeout(() => {
      setCopy(false);
    }, 1000);

    return () => clearTimeout(copyTimeOut);
  }, [copy]);

  // --- SHARE LOGIC ---
  const shareImage = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const captionText = `${lines?.text}\n\nGet more Cheesy Lines: https://destyastudio.com/products/cheezylines?lineId=${lines?.id}`;
      await Clipboard.setStringAsync(captionText);
      setTimeout(async () => {
        try {
          const uri = await captureRef(shareCardRef, {
            format: "png",
            quality: 1.0,
            result: "tmpfile",
          });

            await RNShare.open({
              url: uri, // local file URI
              message: captionText,
              title: "Share your cheesy line!", // Used in email subjects or similar intents
            });
            logEvent('line_shared', { line_id: lines?.id });
          } catch (error) {
            // console.error("Error sharing", error);
          } finally {
            setIsSharing(false);
          }
      }, 150);
    } catch (error) {
      setIsSharing(false);
      Alert.alert("Oops", "Could not share the image.");
    }
  };

  const FAVORITES_KEY = "FAVORITE_LINES";

  const addFavorite = async () => {
    // 1. Animate the heart pop manually before processing state
    heartScale.value = withSequence(
      withTiming(1.3, { duration: 100 }),
      withSpring(1, { damping: 4, stiffness: 40 })
    );

    // 2. Logic
    try {
      const isAlreadyFavorite = favorites.some((fav) => fav.id === lines.id);
      let updatedFavorites;

      if (isAlreadyFavorite) {
        updatedFavorites = favorites.filter((fav) => fav.id !== lines.id);
      } else {
        updatedFavorites = [...favorites, lines];
      }

      setFavorites(updatedFavorites);
      await AsyncStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(updatedFavorites)
      );

      if (!isAlreadyFavorite) {
        logEvent('line_saved', { line_id: lines?.id });
        if (updatedFavorites.length === 5) {
          triggerStoreReview();
        }
      }

    } catch (err) {
      // console.error("Failed to update favorites", err);
    }
  };

  const handleCopy = async () => {
    try {
      setCopy(true);
      await Clipboard.setStringAsync(lines?.text);
    } catch (err) {
      // console.error("Copy failed", err);
    }
  };

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }]
  }));

  if (!lines) return null;

  return (
    <View style={styles.card}>
      <ShareCard ref={shareCardRef} text={lines?.text} />

      <View style={styles.textContainer}>
        <Text style={styles.leftComma}>❝</Text>
        <Text style={styles.text}>{lines.text}</Text>
        <Text style={styles.rightComma}>❞</Text>
      </View>

      <View style={styles.buttonRow}>
        {/* Favorite Button with Special Pop Animation Wrapper */}
        <Animated.View style={heartStyle}>
          <BouncyIconButton
            icon={isFavorite ? "close" : "heart-outline"} // Keeping your logic (close if favorite)
            color={isFavorite ? colors.BRAND_ORANGE : "#000"} // Orange when favorite
            onPress={addFavorite}
          />
        </Animated.View>

        {/* Copy Button */}
        <BouncyIconButton
          icon={copy ? "checkmark-circle" : "copy-outline"} // Changed "copy" to checkmark for better feedback
          color={copy ? "#4CAF50" : "#000"} // Green when copied
          onPress={handleCopy}
        />
       
        {/* Share Button */}
        {isSharing ? (
          <View style={styles.loaderContainer}>
             <ActivityIndicator size="small" color="#000" />
          </View>
        ) : (
          <BouncyIconButton 
            icon="send-o" 
            library="FontAwesome" 
            onPress={shareImage} 
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    backgroundColor: "#FAFAFA",
    borderRadius: 26,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  textContainer: {
    backgroundColor: "#FAFAFA",
    padding: 16,
    minHeight: 250,
    justifyContent: "center",
  },
  text: {
    fontSize: 22,
    color: "#000",
    textAlign: "center",
    fontFamily: "Poppins-Bold",
    paddingHorizontal: 20,
    lineHeight: 32,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginTop: -30,
    marginBottom: 20,
  },
  iconButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  loaderContainer: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  leftComma: {
    fontSize: 40,
    color: "#DDD",
    fontFamily: "Poppins-Regular",
    textAlign: "left",
    marginLeft: 10,
  },
  rightComma: {
    fontSize: 40,
    color: "#DDD",
    fontFamily: "Poppins-Regular",
    textAlign: "right",
    marginRight: 10,
  },
});