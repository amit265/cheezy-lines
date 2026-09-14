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
        <View style={styles.watermarkContainer}>
          <Text style={styles.watermarkText}>● cheesy-lines.app</Text>
        </View>
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
    fontSize: 28, // Scaled down but still very clear
    color: "#0C1D59", // Dark Navy
    textAlign: "center",
    fontFamily: "Poppins-Bold",
    lineHeight: 38,
  },
  watermarkContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },
  watermarkText: {
    fontSize: 16,
    color: "rgba(12, 29, 89, 0.5)",
    fontFamily: "Poppins-Bold",
    letterSpacing: 1,
  },
});

export default ShareCard;
