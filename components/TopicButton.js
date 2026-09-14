import { adConfigContext } from "@/context/AppContext";
import { useRouter } from "expo-router";
import React, { useContext, useEffect } from "react";
import { Pressable, StyleSheet, Text, View, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../constants/colors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
} from "react-native-reanimated";

const getTopicDesign = (title) => {
  const key = title?.toLowerCase() || "";
  if (key.includes("cheesy")) return { icon: "pizza-outline", tint: "#FFB74D" };
  if (key.includes("funny")) return { icon: "happy-outline", tint: "#FF69B4" };
  if (key.includes("cute")) return { icon: "paw-outline", tint: "#FFB6C1" };
  if (key.includes("clever") || key.includes("nerd")) return { icon: "bulb-outline", tint: "#87CEFA" };
  if (key.includes("cringe")) return { icon: "sad-outline", tint: "#D8BFD8" };
  if (key.includes("romantic") || key.includes("flirty")) return { icon: "flame-outline", tint: "#FF6347" };
  if (key.includes("poetic")) return { icon: "book-outline", tint: "#F5DEB3" };
  if (key.includes("sincere")) return { icon: "leaf-outline", tint: "#98FB98" };
  if (key.includes("wholesome")) return { icon: "sunny-outline", tint: "#FFD700" };
  if (key.includes("sarcastic")) return { icon: "chatbubble-ellipses-outline", tint: "#D3D3D3" };
  if (key.includes("film")) return { icon: "videocam-outline", tint: "#FFFACD" };
  if (key.includes("emotion")) return { icon: "water-outline", tint: "#87CEEB" };
  if (key.includes("couple")) return { icon: "people-outline", tint: "#F08080" };
  return { icon: "star-outline", tint: "#A9A9A9" };
};

const SkeletonCard = ({ isLeftColumn, itemMargin, colors }) => {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    flex: 1,
    height: 160,
    backgroundColor: colors.CARD_BG,
    borderColor: colors.CARD_BORDER,
    borderWidth: 1,
    borderRadius: 24,
    marginRight: isLeftColumn ? itemMargin / 2 : 0,
    marginLeft: isLeftColumn ? 0 : itemMargin / 2,
    marginBottom: 15,
  }));

  return <Animated.View style={animatedStyle} />;
};

const AnimatedCard = ({
  item,
  index,
  itemMargin,
  isLeftColumn,
  onPress,
  colors,
}) => {
  const slideAnim = useSharedValue(50);
  const opacityAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);

  useEffect(() => {
    if (index !== undefined) {
      const delay = index * 50;
      opacityAnim.value = withDelay(delay, withTiming(1, { duration: 500 }));
      slideAnim.value = withDelay(delay, withSpring(0, { damping: 12, stiffness: 90 }));
    }
  }, [index, slideAnim, opacityAnim]);

  const handlePressIn = () => {
    scaleAnim.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scaleAnim.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: slideAnim.value }, { scale: scaleAnim.value }],
      opacity: opacityAnim.value,
      flex: 1,
      marginRight: isLeftColumn ? itemMargin / 2 : 0,
      marginLeft: isLeftColumn ? 0 : itemMargin / 2,
      marginBottom: 15,
    };
  });

  const { icon, tint } = getTopicDesign(item?.title);
  const lineCount = item?.lines?.length || 0;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.itemContainer,
          { backgroundColor: colors.CARD_BG, borderColor: colors.CARD_BORDER }
        ]}
      >
        <View style={styles.contentWrapper}>
          {/* Top Section: Icon */}
          <View style={[styles.iconWrapper, { backgroundColor: `${tint}15` }]}>
            <Ionicons name={icon} size={32} color={tint} />
          </View>
          
          {/* Bottom Section: Texts */}
          <View style={styles.textWrapper}>
            <Text style={[styles.buttonText, { color: colors.TEXT }]} numberOfLines={1}>
              {item?.title || "Topic"}
            </Text>
            <Text style={[styles.subtitleText, { color: colors.TEXT_MUTED }]}>
              {lineCount} {lineCount === 1 ? "Line" : "Lines"}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default function TopicButton({ data, refreshing, onRefresh }) {
  const router = useRouter();
  const { setClickCount } = useContext(adConfigContext);
  const colors = useThemeColors();
  const itemMargin = 15;

  if (!data || data.length === 0) {
    const skeletonData = Array.from({ length: 8 });
    return (
      <View style={styles.container}>
        <FlashList
          data={skeletonData}
          renderItem={({ index }) => <SkeletonCard isLeftColumn={index % 2 === 0} itemMargin={itemMargin} colors={colors} />}
          numColumns={2}
          keyExtractor={(_, index) => `skeleton-${index}`}
          contentContainerStyle={styles.content}
          estimatedItemSize={160}
        />
      </View>
    );
  }

  const renderItem = ({ item, index }) => {
    const isLeftColumn = index % 2 === 0;

    return (
      <AnimatedCard
        item={item}
        index={index}
        itemMargin={itemMargin}
        isLeftColumn={isLeftColumn}
        colors={colors}
        onPress={() => {
          router.push({
            pathname: `/topics/${item?.id}`,
            params: {
              dataParams: JSON.stringify(item),
            },
          });
          setClickCount((prev) => prev + 1);
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlashList
        data={data}
        renderItem={renderItem}
        numColumns={2}
        keyExtractor={(item, index) => `${item?.id}-${index}`}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={160}
        refreshControl={
          <RefreshControl refreshing={refreshing || false} onRefresh={onRefresh} tintColor={colors.BRAND_ORANGE || "#FFA500"} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  itemContainer: {
    height: 160,
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  contentWrapper: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  textWrapper: {
    gap: 4,
  },
  buttonText: {
    fontSize: 20,
    fontFamily: "Outfit-Bold",
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 14,
    fontFamily: "Outfit-Regular",
  }
});
