import { adConfigContext } from "@/context/AppContext";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View, RefreshControl } from "react-native";
import { FlashList } from "@shopify/flash-list";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withDelay } from "react-native-reanimated";

const AnimatedCard = ({
  item,
  index,
  itemWidth,
  itemMargin,
  isLeftColumn,
  onPress,
}) => {
  const slideAnim = useSharedValue(50);
  const opacityAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);

  useEffect(() => {
    const delay = index * 100;
    opacityAnim.value = withDelay(delay, withTiming(1, { duration: 500 }));
    slideAnim.value = withDelay(delay, withSpring(0, { damping: 10, stiffness: 100 }));
  }, [index, slideAnim, opacityAnim]);

  const handlePressIn = () => {
    scaleAnim.value = withSpring(0.92, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scaleAnim.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideAnim.value }, { scale: scaleAnim.value }],
    opacity: opacityAnim.value,
    width: itemWidth,
    marginRight: isLeftColumn ? itemMargin / 2 : 0,
    marginLeft: isLeftColumn ? 0 : itemMargin / 2,
    marginBottom: 10,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[styles.itemContainer, { backgroundColor: item?.color }]}
      >
        <Text style={styles.buttonText}>{item?.title}</Text>
      </Pressable>
    </Animated.View>
  );
};

export default function TopicButton({ data, refreshing, onRefresh }) {
  const router = useRouter();
  const { setClickCount } = useContext(adConfigContext);

  if (!data) return null;

  const screenWidth = Dimensions.get("window").width;
  const itemMargin = 10;
  const itemWidth = (screenWidth - itemMargin * 3) / 2;

  const renderItem = ({ item, index }) => {
    const isLeftColumn = index % 2 === 0;

    return (
      <AnimatedCard
        item={item}
        index={index}
        itemWidth={itemWidth}
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
  },
  itemContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#5D4037",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
  },
});
