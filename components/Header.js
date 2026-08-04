import colors from "@/constants/colors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
} from "react-native-reanimated";

export default function Header() {
  const router = useRouter();

  const heartScale = useSharedValue(1);
  const settingsRotate = useSharedValue(0);

  const animateHeart = (callback) => {
    heartScale.value = withSequence(
      withTiming(1.3, { duration: 150 }),
      withSpring(1, { damping: 4, stiffness: 40 }, (finished) => {
        if (finished && callback) {
          runOnJS(callback)();
        }
      })
    );
  };

  const animateSettings = (callback) => {
    settingsRotate.value = 0;
    settingsRotate.value = withTiming(
      1,
      { duration: 600 },
      (finished) => {
        if (finished) {
          settingsRotate.value = 0;
          if (callback) runOnJS(callback)();
        }
      }
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      animateHeart();
      animateSettings();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const settingsStyle = useAnimatedStyle(() => {
    let deg = 0;
    if (settingsRotate.value <= 0.5) {
      deg = settingsRotate.value * 90;
    } else {
      deg = (1 - settingsRotate.value) * 90;
    }
    return {
      transform: [{ rotate: `${deg}deg` }],
    };
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
          <Animated.View style={heartStyle}>
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
          <Animated.View style={settingsStyle}>
            <Ionicons name="settings-outline" size={36} color="black" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}