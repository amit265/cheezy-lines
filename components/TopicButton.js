import { adConfigContext } from "@/context/AppContext";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// 1. Create a sub-component to handle individual animations
// ... imports stay the same

const AnimatedCard = ({
  item,
  index,
  itemWidth,
  itemMargin,
  isLeftColumn,
  onPress,
}) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const delay = index * 100;
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        delay: delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Visual Only: Shrink when touched
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  // Visual Only: Bounce back when released (or scroll starts)
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
    // REMOVED onPress() from here!
  };

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        opacity: opacityAnim,
        width: itemWidth,
        marginRight: isLeftColumn ? itemMargin / 2 : 0,
        marginLeft: isLeftColumn ? 0 : itemMargin / 2,
        marginBottom: 10,
      }}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress} // <--- Action goes here! This won't fire during scroll.
        style={[styles.itemContainer, { backgroundColor: item?.color }]}
      >
        <Text style={styles.buttonText}>{item?.title}</Text>
      </Pressable>
    </Animated.View>
  );
};

export default function TopicButton({ data }) {
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
      <FlatList
        data={data}
        renderItem={renderItem}
        numColumns={2}
        keyExtractor={(item, index) => `${item?.id}-${index}`}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  content: {
    paddingVertical: 10,
  },
  itemContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    width: "100%", // Important: ensure inner view fills the Animated.View wrapper

    // Add Shadow for better 3D "Pop" feel
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
