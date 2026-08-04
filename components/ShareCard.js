import { Assets } from "@react-navigation/elements";
import { forwardRef, useEffect, useState } from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";

// This is the blank template image you generated (put it in your assets folder)
const TEMPLATE_IMAGE = require("../assets/images/template.png");







const ShareCard = forwardRef(({ text }, ref) => {
   
  return (
    <View
      ref={ref}
      style={styles.container}
      collapsable={false} // Crucial for Android capture
    >
      <ImageBackground
        source={TEMPLATE_IMAGE}
        style={styles.image}
        resizeMode="cover"
      >
        {/* The Text Overlay */}
        <View style={styles.textContainer}>
          <Text style={styles.quoteText}>{text}</Text>
        </View>

        {/* Branding / Footer is already in your image, but we can add more if needed */}
      </ImageBackground>
    </View>
  );
});

ShareCard.displayName = "ShareCard";

const styles = StyleSheet.create({
  container: {
    // Shrunk by 50% for vastly improved capture speed.
    // Device pixel ratio (2x or 3x) will still result in high-res images (1080x1600+).
    width: 540,
    height: 800,
    position: "absolute", // Hide it off-screen
    left: -9999,
    top: 0,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    width: "80%", // Keep text away from edges
    height: "50%", // Focus text in the middle
    justifyContent: "center",
    alignItems: "center",
    marginTop: -50, // Scaled down
  },
  quoteText: {
    fontSize: 24, // Scaled down but still very clear
    fontWeight: "bold",
    color: "#4A3B32", // Dark Brown to match theme
    textAlign: "center",
    fontFamily: "serif",
    lineHeight: 34,
  },
});

export default ShareCard;
