import colors from "@/constants/colors";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  runOnJS,
} from "react-native-reanimated";

export default function Header() {
  const router = useRouter();

  const heartScale = useSharedValue(1);
  const settingsRotate = useSharedValue(0);
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

    aiSpin.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 2000 }),
        withTiming(0.5, { duration: 400 }),
        withTiming(0.5, { duration: 2000 }),
        withTiming(1, { duration: 400 }),
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

  const aiIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${aiSpin.value * 360}deg` }],
  }));

  const aiZapStyle = useAnimatedStyle(() => ({
    opacity: aiSpin.value < 0.5 ? 1 : 0,
  }));

  const aiTextStyle = useAnimatedStyle(() => ({
    opacity: aiSpin.value >= 0.5 ? 1 : 0,
    transform: [{ rotate: `${-aiSpin.value * 360}deg` }],
  }));

  return (
    <BlurView intensity={50} tint="dark" style={styles.headerContainer}>
      <Text style={styles.title}>
        Cheesy Lines
      </Text>

      <View style={styles.iconContainer}>
        {/* AI Magic Icon */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/ai")}
        >
          <Animated.View style={[aiIconStyle, styles.aiWrapper]}>
            <Animated.View style={[styles.absoluteCenter, aiZapStyle]}>
              <Feather name="zap" size={26} color={colors.ELECTRIC_CYAN} />
            </Animated.View>
            <Animated.View style={[styles.absoluteCenter, aiTextStyle]}>
              <Text style={styles.aiText}>AI</Text>
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
            <Feather name="heart" size={26} color={colors.NEON_PINK} />
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
            <Feather name="settings" size={26} color="#FFF" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 10,
  },
  title: {
    fontFamily: "Outfit-Bold",
    fontSize: 22,
    color: "#FFF",
  },
  iconContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
  },
  aiWrapper: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  absoluteCenter: {
    position: 'absolute',
  },
  aiText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 12,
    color: colors.ELECTRIC_CYAN,
    letterSpacing: 1,
  },
});