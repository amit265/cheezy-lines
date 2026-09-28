import { useThemeColors } from "@/constants/colors";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
} from "react-native-reanimated";

export default function Header() {
  const router = useRouter();
  const colors = useThemeColors();

  const heartScale = useSharedValue(1);
  const settingsRotate = useSharedValue(0);
  const aiSpin = useSharedValue(0);

  const animateHeart = () => {
    heartScale.value = withSequence(
      withTiming(1.3, { duration: 150 }),
      withSpring(1, { damping: 4, stiffness: 40 })
    );
  };

  const animateSettings = () => {
    settingsRotate.value = 0;
    settingsRotate.value = withTiming(1, { duration: 600 });
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

  const styles = useMemo(() => StyleSheet.create({
    headerOuter: {
      width: "100%",
      alignItems: "center",
    },
    headerContainer: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "90%",
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 30,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.CARD_BORDER,
      overflow: "hidden",
      marginTop: 10,
      marginBottom: 10,
    },
    headerOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.HEADER_BG,
      opacity: 0.8, // Blur + Opacity looks nice in both themes
      zIndex: -1,
    },
    title: {
      fontFamily: "Baloo2",
      fontSize: 26,
      color: colors.TEXT,
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
      fontFamily: 'Poppins-Bold',
      fontSize: 12,
      color: colors.BRAND_ORANGE,
      letterSpacing: 1,
    },
  }), [colors]);

  return (
    <View style={styles.headerOuter}>
      <BlurView intensity={50} tint="default" style={styles.headerContainer}>
        <View style={styles.headerOverlay} />
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
              <Feather name="zap" size={26} color={colors.BRAND_ORANGE} />
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
            animateHeart();
            setTimeout(() => router.push("/favorites"), 150);
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
            animateSettings();
            setTimeout(() => router.push("/settings"), 150);
          }}
        >
          <Animated.View style={settingsStyle}>
            <Feather name="settings" size={26} color={colors.ICON} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </BlurView>
  </View>
  );
}