import { forwardRef } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColors } from "../constants/colors";







const ShareCard = forwardRef(({ text }, ref) => {
  const colors = useThemeColors();
  
  return (
    <View
      ref={ref}
      style={styles.container}
      collapsable={false} // Crucial for Android capture
    >
      <LinearGradient
        colors={colors.GRADIENT_PRIMARY || ["#FF007F", "#FFA500"]} // Deep pink to vibrant orange (fallback)
        style={styles.gradientBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.glassCard}>
          <Text style={styles.commaLeft}>❝</Text>
          <View style={styles.textContainer}>
            <Text style={styles.quoteText}>{text}</Text>
          </View>
          <Text style={styles.commaRight}>❞</Text>
        </View>

        <View style={styles.watermarkContainer}>
          <Image source={require("../assets/images/icon.png")} style={styles.appIcon} />
          <View>
            <Text style={styles.watermarkTitle}>Cheesy Lines</Text>
            <Text style={styles.watermarkText}>Available on iOS & Android</Text>
          </View>
        </View>
      </LinearGradient>
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
  gradientBg: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  glassCard: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.15)", // Glass effect
    borderRadius: 30,
    padding: 40,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  commaLeft: {
    fontFamily: "Poppins-Bold",
    fontSize: 60,
    color: "rgba(255, 255, 255, 0.4)",
    marginBottom: -30,
  },
  commaRight: {
    fontFamily: "Poppins-Bold",
    fontSize: 60,
    color: "rgba(255, 255, 255, 0.4)",
    textAlign: "right",
    marginTop: -20,
  },
  textContainer: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 180,
  },
  quoteText: {
    fontSize: 34,
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "Poppins-Bold",
    lineHeight: 46,
  },
  watermarkContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: 15,
  },
  watermarkTitle: {
    fontSize: 28,
    color: "#FFFFFF",
    fontFamily: "Baloo2",
    marginBottom: -2,
  },
  watermarkText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: "Poppins-Regular",
    letterSpacing: 0.5,
  },
});

export default ShareCard;
