import { FontAwesome, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import React, { useContext, useEffect, useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import { favoritesContext } from "../context/AppContext";

export default function LineCard({ lines }) {
  const [copy, setCopy] = useState(false);
  const { favorites, setFavorites } = useContext(favoritesContext);

  const isFavorite = favorites.some((fav) => fav.id === lines.id);

  useEffect(() => {
    const copyTimeOut = setTimeout(() => {
      setCopy(false);
    }, 1000);

    return () => clearTimeout(copyTimeOut);
  }, [copy]);

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
      console.error("Failed to update favorites in AsyncStorage:", err);
    }
  };

  const handleCopy = async () => {
    try {
      setCopy(true);
      await Clipboard.setStringAsync(lines?.text);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: lines?.text,
      });

      if (result.action === Share.sharedAction) {
        console.log("App shared!");
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed.");
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  if (!lines) return null;

  return (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.leftComma}>❝</Text>
        <Text style={styles.text}>{lines.text}</Text>
        <Text style={styles.rightComma}>❞</Text>
      </View>

      <View style={styles.buttonRow}>
        <IconButton
          icon={isFavorite ? "heart" : "heart-outline"}
          onPress={addFavorite}
        />
        <IconButton
          icon={copy ? "copy" : "copy-outline"}
          onPress={handleCopy}
        />
        <IconButton icon="send-o" onPress={handleShare} />
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
    fontSize: 18,
    color: "#000",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingBottom: 20,
    marginTop: -30,
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
});
