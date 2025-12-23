import colors from "@/constants/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, TouchableOpacity, View } from "react-native";

export default function Header() {
  const router = useRouter();

  // 1. Initialize Animated Values
  const heartScale = useRef(new Animated.Value(1)).current;
  const settingsRotate = useRef(new Animated.Value(0)).current;

  // 2. Define Animation Logic
  const animateHeart = (callback) => {
    // Sequence: Rapidly scale up to 1.3, then spring back to 1
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  const animateSettings = (callback) => {
    // Rotation logic handled by interpolation below (0 -> 1 value change)
    settingsRotate.setValue(0);
    Animated.timing(settingsRotate, {
      toValue: 1,
      duration: 600,
      easing: Easing.elastic(1.5), // Adds a little "wobble" at the end
      useNativeDriver: true,
    }).start(() => {
      settingsRotate.setValue(0); // Reset for next time
      if (callback) callback();
    });
  };

  // 3. Run on Load (Mount)
  useEffect(() => {
    // Add a slight delay so it happens after the page slide-in
    setTimeout(() => {
      animateHeart();
      animateSettings();
    }, 500);
  }, []);

  // 4. Interpolate Rotation Value for Settings
  const spin = settingsRotate.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["0deg", "45deg", "0deg"], // Rotates 45 degrees and back
  });

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "90%",
        paddingBottom: 20,
        borderBottomWidth: 1,
      }}
    >
      <Text
        style={{
          fontFamily: "Baloo2",
          fontSize: 24,
          color: colors.TEXT,
          fontWeight: "800",
        }}
      >
        Cheesy Lines
      </Text>

      <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        {/* Heart Icon */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            animateHeart(() => router.push("/favorites"));
          }}
        >
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons name="heart" size={36} color="red" />
          </Animated.View>
        </TouchableOpacity>

        {/* Settings Icon */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            animateSettings(() => router.push("/settings"));
          }}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="settings-outline" size={36} color="black" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}