import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import LineCard from "../../components/LineCard";
import colors from "../../constants/colors";
import { favoritesContext } from "../../context/AppContext";
import { BannerAdComponent } from "../../services/AdManager";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

// --- SUB-COMPONENT: Animated List Item ---
const AnimatedItem = ({ children, index }) => {
  const slideAnim = useSharedValue(50);
  const fadeAnim = useSharedValue(0);

  useEffect(() => {
    fadeAnim.value = withDelay(index * 100, withTiming(1, { duration: 500 }));
    slideAnim.value = withDelay(index * 100, withSpring(0, { damping: 6, stiffness: 40 }));
  }, [index, fadeAnim, slideAnim]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
};

export default function Index() {
  const router = useRouter();
  const { favorites, setFavorites } = useContext(favoritesContext);
  const [refreshing, setRefreshing] = useState(false);

  // --- HEADER ANIMATION STATE ---
  const headerSlide = useSharedValue(-50);
  const headerFade = useSharedValue(0);
  const backBtnScale = useSharedValue(1);

  // --- EMPTY STATE ANIMATION ---
  const emptyStateFade = useSharedValue(0);
  const emptyStateScale = useSharedValue(0.8);

  // --- ON LOAD ANIMATION ---
  useEffect(() => {
    headerFade.value = withTiming(1, { duration: 500 });
    headerSlide.value = withSpring(0, { damping: 6, stiffness: 40 });

    if (favorites?.length === 0) {
      emptyStateFade.value = withTiming(1, { duration: 800 });
      emptyStateScale.value = withSpring(1, { damping: 5, stiffness: 100 });
    }
  }, [favorites?.length, headerFade, headerSlide, emptyStateFade, emptyStateScale]);

  // --- INTERACTION HANDLERS ---
  const handleBackPressIn = () => {
    backBtnScale.value = withSpring(0.8, { damping: 15, stiffness: 300 });
  };

  const handleBackPressOut = () => {
    backBtnScale.value = withSpring(1, { damping: 4, stiffness: 40 }, (finished) => {
      if (finished) {
        runOnJS(router.back)();
      }
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const storedFavorites = await AsyncStorage.getItem("FAVORITE_LINES");
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (err) {}
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderItem = ({ item, index }) => (
    <AnimatedItem index={index}>
      <View>
        <LineCard lines={item} />
      </View>
    </AnimatedItem>
  );

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerFade.value,
    transform: [{ translateY: headerSlide.value }]
  }));

  const backBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backBtnScale.value }]
  }));

  const emptyStateStyle = useAnimatedStyle(() => ({
    opacity: emptyStateFade.value,
    transform: [{ scale: emptyStateScale.value }]
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.headerContainer, headerStyle]}>
        <Pressable onPressIn={handleBackPressIn} onPressOut={handleBackPressOut} hitSlop={10}>
          <Animated.View style={backBtnStyle}>
            <Ionicons name="arrow-back-sharp" size={36} color="black" />
          </Animated.View>
        </Pressable>
        <Text style={styles.headerText}>Favorites</Text>
      </Animated.View>

      {/* Content Area */}
      {favorites?.length === 0 ? (
        <Animated.View style={[{ flex: 1, justifyContent: "center", alignItems: "center", width: "100%", paddingHorizontal: 40 }, emptyStateStyle]}>
          <View style={styles.illustratedCircle}>
            <Ionicons name="heart-dislike-outline" size={80} color="#FFB74D" />
          </View>
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptySubtitle}>
            {"You haven't saved any cheesy lines yet. Swipe right on your favorites to see them here!"}
          </Text>
          <TouchableOpacity style={styles.exploreButton} onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}>
            <Text style={styles.exploreButtonText}>Explore Lines</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <View style={{ flex: 1, width: "100%" }}>
          <FlashList
            data={favorites}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item?.id}-${index}`}
            contentContainerStyle={{ paddingBottom: 60 }}
            estimatedItemSize={200}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FFA500" />
            }
          />
        </View>
      )}

      <View style={styles.bannerContainer}>
        <BannerAdComponent />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
    alignItems: "center",
  },
  headerContainer: {
    paddingVertical: 10,
    backgroundColor: colors.BACKGROUND,
    display: "flex",
    flexDirection: "row",
    gap: 15,
    width: "90%",
    borderBottomWidth: 1,
    alignItems: "center",
    zIndex: 10,
  },
  headerText: {
    color: "#000",
    fontSize: 26,
    fontFamily: "Poppins-Bold",
    textAlign: "left",
  },
  bannerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.BACKGROUND,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    textAlign: "left",
  },
  illustratedCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#FFF3E0", // Soft orange background
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#FFB74D",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#777",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  exploreButton: {
    backgroundColor: "#FFB74D",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: "#FFB74D",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  exploreButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "Poppins-Bold",
  },
});