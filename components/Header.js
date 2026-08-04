import colors from "@/constants/colors";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  interpolate,
  runOnJS,
} from "react-native-reanimated";

export default function Header() {
  const router = useRouter();

  const heartScale = useSharedValue(1);
  const settingsRotate = useSharedValue(0);
  // 0 → 1 repeating forever, represents 0° → 360°
  const aiSpin = useSharedValue(0);

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
    // Hold face → quick spin → hold other face → quick spin → repeat
    aiSpin.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 2000 }),       // hold zap for 2s
        withTiming(0.5, { duration: 400 }),      // spin fast to AI
        withTiming(0.5, { duration: 2000 }),     // hold AI for 2s
        withTiming(1, { duration: 400 }),        // spin fast back to zap
      ),
      -1,
      false
    );
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

  // Full rotation mapped 0→0.5→1 = 0°→180°→360°
  const aiIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${aiSpin.value * 360}deg` }],
  }));

  // Zap visible during 0–0.5 range, hidden during 0.5–1
  const aiZapStyle = useAnimatedStyle(() => ({
    opacity: aiSpin.value < 0.5 ? 1 : 0,
  }));

  // AI text visible during 0.5–1 range, hidden during 0–0.5
  // Counter-rotate so it always appears right-side-up
  const aiTextStyle = useAnimatedStyle(() => ({
    opacity: aiSpin.value >= 0.5 ? 1 : 0,
    transform: [{ rotate: `${-aiSpin.value * 360}deg` }],
  }));

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "90%",
        paddingBottom: 10,
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

      <View style={{ display: "flex", flexDirection: "row", gap: 10, alignItems: "center" }}>
        {/* AI Magic Icon — spinning with zap ↔ AI flip */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/ai")}
        >
          <Animated.View style={[aiIconStyle, { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }]}>
            {/* Zap icon: first half */}
            <Animated.View style={[{ position: 'absolute' }, aiZapStyle]}>
              <Feather name="zap" size={32} color="#0277BD" />
            </Animated.View>
            {/* AI text: second half */}
            <Animated.View style={[{ position: 'absolute' }, aiTextStyle]}>
              <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 14, color: '#0277BD', letterSpacing: 1 }}>AI</Text>
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>

        {/* Heart Icon */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            animateHeart(() => router.push("/favorites"));
          }}
        >
          <Animated.View style={heartStyle}>
            <Feather name="heart" size={32} color="#EE5242" />
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
            <Feather name="settings" size={32} color="black" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}