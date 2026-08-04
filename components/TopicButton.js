import { adConfigContext } from "@/context/AppContext";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
} from "react-native-reanimated";

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
    height: 160,
    backgroundColor: "#E5E5E5",
    borderRadius: 20,
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
      opacityAnim.value = withDelay(delay, withTiming(1, { duration: 400 }));
      slideAnim.value = withDelay(delay, withSpring(0, { damping: 10, stiffness: 100 }));
    }
  }, [index, slideAnim, opacityAnim]);

  const handlePressIn = () => {
    scaleAnim.value = withSpring(0.92, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scaleAnim.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: slideAnim.value }, { scale: scaleAnim.value }],
      opacity: opacityAnim.value,
      flex: 1, // Let FlashList handle the exact widths based on numColumns
      marginRight: isLeftColumn ? itemMargin / 2 : 0,
      marginLeft: isLeftColumn ? 0 : itemMargin / 2,
      marginBottom: 10,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[styles.itemContainer, { backgroundColor: item?.color || "#FDE9B3" }]}
      >
        <Text style={styles.buttonText}>{item?.title || ""}</Text>
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
          estimatedItemSize={150}
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
        estimatedItemSize={150}
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
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    width: "100%",
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: "#333",
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
  },
});
