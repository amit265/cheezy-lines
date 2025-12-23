import { FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated, // Import Animated
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import { favoritesContext } from "../context/AppContext";
import ShareCard from "./ShareCard";

// --- SUB-COMPONENT: Bouncy Icon Button ---
const BouncyIconButton = ({ icon, onPress, library = "Ionicons", color = "#000" }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.8, // Shrink
      speed: 20,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1, // Bounce back
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
    if (onPress) onPress();
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.iconButton}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
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

  // --- ANIMATION REFS ---
  const heartScale = useRef(new Animated.Value(1)).current;

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
      await Clipboard.setStringAsync(lines?.text);
      setTimeout(async () => {
        try {
          const uri = await captureRef(shareCardRef, {
            format: "png",
            quality: 1.0,
            result: "tmpfile",
          });

          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share your cheesy line!",
            UTI: "public.png",
          });
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
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

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
        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
           <BouncyIconButton
            icon={isFavorite ? "close" : "heart-outline"} // Keeping your logic (close if favorite)
            color={isFavorite ? "#E53935" : "#000"} // Added Red color if it's a remove action
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
    backgroundColor: "#fff",
    borderRadius: 26,
    overflow: "hidden",
    elevation: 4, // Increased slightly for better depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  textContainer: {
    backgroundColor: "#fff",
    padding: 16,
    minHeight: 250,
    justifyContent: "center",
  },
  text: {
    fontSize: 18, // Increased slightly for readability
    color: "#000",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    paddingHorizontal: 20,
    lineHeight: 28, // Better line height
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center", // Fixed alignContent -> alignItems
    marginTop: -30,
    marginBottom: 20,
  },
  iconButton: {
    padding: 10, // Increased padding for easier tapping
    borderRadius: 20,
    backgroundColor: "#f5f5f5", // Subtle background for buttons
  },
  loaderContainer: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  leftComma: {
    fontSize: 40, // Made quotes larger
    color: "#DDD", // Made quotes lighter
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