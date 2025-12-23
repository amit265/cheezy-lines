import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";
import Colors from "../constants/colors";

const SplashScreenComponent = () => {
  // 1. Initialize Animated Values
  const fadeAnim = useRef(new Animated.Value(0)).current; // Starts invisible
  const scaleAnim = useRef(new Animated.Value(0.5)).current; // Starts at half size

  useEffect(() => {
    // 2. Run Animations in Parallel
    Animated.parallel([
      // Fade In
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000, // 1 second
        useNativeDriver: true,
      }),
      // Spring Bounce Effect (Trending "Pop" feel)
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,  // Lower = more bouncy
        tension: 40,  // Higher = faster
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }], // Bind scale to animated value
          },
        ]}
      >
        <Image
          source={require("../assets/images/splash-icon.png")}
          style={styles.iconImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Optional: Add a loading spinner below that fades in later */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    // Note: Removed fixed marginTop/height constraints on container 
    // to allow the animation to flow naturally
  },
  iconImage: {
    width: 200,
    height: 200,
    // Adjusted margins to center visually; 
    // negative margins can sometimes clip animations
  },
});

export default SplashScreenComponent;