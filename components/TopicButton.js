import { adConfigContext } from "@/context/AppContext";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
} from "react-native-reanimated";

const topicImages = {
  coffee: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600&auto=format&fit=crop",
  bar: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
  smooth: "https://images.unsplash.com/photo-1518599904199-0ca897819ddb?q=80&w=600&auto=format&fit=crop",
  funny: "https://images.unsplash.com/photo-1543789648-5221b369528d?q=80&w=600&auto=format&fit=crop",
  nerd: "https://images.unsplash.com/photo-1522881113591-420042f4c475?q=80&w=600&auto=format&fit=crop",
  gym: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop",
  cute: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop",
  dirty: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop",
  default: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=600&auto=format&fit=crop"
};

const SkeletonCard = ({ isLeftColumn, itemMargin }) => {
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
    height: 200,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderRadius: 24,
    marginRight: isLeftColumn ? itemMargin / 2 : 0,
    marginLeft: isLeftColumn ? 0 : itemMargin / 2,
    marginBottom: 10,
  }));

  return <Animated.View style={animatedStyle} />;
};

const AnimatedCard = ({
  item,
  index,
  itemMargin,
  isLeftColumn,
  onPress,
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
      marginBottom: 10,
    };
  });

  const titleKey = item?.title?.toLowerCase() || "";
  let imageUrl = topicImages.default;
  Object.keys(topicImages).forEach(key => {
    if (titleKey.includes(key) || item?.id?.toLowerCase().includes(key)) {
      imageUrl = topicImages[key];
    }
  });

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.itemContainer}
      >
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          transition={500}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.textContainer}>
          <Text style={styles.buttonText}>{item?.title || ""}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default function TopicButton({ data, refreshing, onRefresh }) {
  const router = useRouter();
  const { setClickCount } = useContext(adConfigContext);

  const itemMargin = 10;

  if (!data || data.length === 0) {
    const skeletonData = Array.from({ length: 8 });
    return (
      <View style={styles.container}>
        <FlashList
          data={skeletonData}
          renderItem={({ index }) => <SkeletonCard isLeftColumn={index % 2 === 0} itemMargin={itemMargin} />}
          numColumns={2}
          keyExtractor={(_, index) => `skeleton-${index}`}
          contentContainerStyle={styles.content}
          estimatedItemSize={200}
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
        estimatedItemSize={200}
        refreshControl={
          <RefreshControl refreshing={refreshing || false} onRefresh={onRefresh} tintColor="#FFA500" />
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
    paddingHorizontal: 10,
  },
  itemContainer: {
    height: 200, // Taller cards for editorial look
    borderRadius: 24,
    width: "100%",
    overflow: "hidden",
    borderColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  textContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Outfit-Bold",
    letterSpacing: 0.5,
  },
});
