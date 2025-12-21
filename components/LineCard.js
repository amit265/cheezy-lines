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
  TouchableOpacity,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import { favoritesContext } from "../context/AppContext";
import ShareCard from "./ShareCard";

export default function LineCard({ lines }) {
  const [copy, setCopy] = useState(false);
  const { favorites, setFavorites } = useContext(favoritesContext);
  const shareCardRef = useRef();
  const [isSharing, setIsSharing] = useState(false);

  const isFavorite = favorites.some((fav) => fav.id === lines.id);

  useEffect(() => {
    const copyTimeOut = setTimeout(() => {
      setCopy(false);
    }, 1000);

    return () => clearTimeout(copyTimeOut);
  }, [copy]);

  const shareImage = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      // A. Capture the hidden view as an image
      await Clipboard.setStringAsync(lines?.text);
      setTimeout(async () => {
        try {
          const uri = await captureRef(shareCardRef, {
            format: "png",
            quality: 1.0, // Best quality
            result: "tmpfile",
          });

          // B. Share using native dialog
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share your cheesy line!",
            UTI: "public.png", // Helps on iOS
            // message: `${shareMessage}\n\nGet more cheesy lines here: ${playstoreLink}`,
          });
        } catch (error) {
          // console.error("Error during sharing process", error);
        } finally {
          setIsSharing(false);
        }
      }, 150);
    } catch (error) {
      // console.error("Sharing failed", error);
      setIsSharing(false);
      Alert.alert("Oops", "Could not share the image.");
    }
  };

  const FAVORITES_KEY = "FAVORITE_LINES";

  const addFavorite = async () => {
    try {
      const isAlreadyFavorite = favorites.some((fav) => fav.id === lines.id);
      let updatedFavorites;

      if (isAlreadyFavorite) {
        // Remove from favorites
        updatedFavorites = favorites.filter((fav) => fav.id !== lines.id);
      } else {
        // Add to favorites
        updatedFavorites = [...favorites, lines];
      }

      setFavorites(updatedFavorites);
      await AsyncStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(updatedFavorites)
      );
    } catch (err) {
      // console.error("Failed to update favorites in AsyncStorage:", err);
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

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: lines?.text,
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
        <IconButton
          icon={isFavorite ? "close" : "heart-outline"}
          onPress={addFavorite}
        />
        <IconButton
          icon={copy ? "copy" : "copy-outline"}
          onPress={handleCopy}
        />
       
          {isSharing ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <IconButton icon="send-o" onPress={shareImage} />
          )}
      </View>
    </View>
  );
}

function IconButton({ icon, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.iconButton}>
      {icon === "send-o" ? (
        <FontAwesome name={icon} size={26} color="#000" />
      ) : (
        <Ionicons name={icon} size={26} color="#000" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 26,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  textContainer: {
    backgroundColor: "#fff",
    padding: 16,
    minHeight: 250,
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    paddingHorizontal: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
      alignContent: "center",
    marginTop: -30,
    marginBottom: 20,
  },
  iconButton: {
    padding: 8,
   
  },
  leftComma: {
    fontSize: 30,
    color: "#000",
    fontFamily: "Poppins-Regular",
    textAlign: "left",
  },
  rightComma: {
    fontSize: 30,
    color: "#000",
    fontFamily: "Poppins-Regular",
    textAlign: "right",
  },
   button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    zIndex: 1,
  },

});
