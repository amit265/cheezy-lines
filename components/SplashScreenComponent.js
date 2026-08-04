import React, { useEffect } from "react";
import { Image, StyleSheet, View, Text } from "react-native";
import Colors from "../constants/colors";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";

const SplashScreenComponent = () => {
  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.5);

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 1000 });
    scaleAnim.value = withSpring(1, { damping: 6, stiffness: 40 });
  }, [fadeAnim, scaleAnim]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          animatedStyle
        ]}
      >
        <Image
          source={require("../assets/images/splash-icon.png")}
          style={styles.iconImage}
          resizeMode="contain"
        />
      </Animated.View>

      <Text style={styles.brandingText}>● built by destyastudio.</Text>
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
  },
  brandingText: {
    position: "absolute",
    bottom: 50,
    fontFamily: "monospace",
    fontSize: 10,
    color: "rgba(0, 0, 0, 0.4)",
    letterSpacing: 1.5,
  }
});

export default SplashScreenComponent;