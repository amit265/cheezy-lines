import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useEffect, useState, useMemo } from "react";
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
import { useThemeColors } from "../../constants/colors";
import { favoritesContext, adConfigContext } from "../../context/AppContext";
import { BannerAdComponent } from "../../services/AdManager";
import InlineNativeAd from "../../components/InlineNativeAd";
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
  const { adConfig } = useContext(adConfigContext);
  const colors = useThemeColors();
  const [refreshing, setRefreshing] = useState(false);

  const styles = useMemo(() => StyleSheet.create({
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
      borderColor: colors.BORDER,
      alignItems: "center",
      zIndex: 10,
    },
    headerText: {
      color: colors.TEXT,
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
      color: colors.TEXT,
      fontSize: 16,
      fontFamily: "Poppins-Regular",
      textAlign: "left",
    },
    illustratedCircle: {
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: colors.FAVORITES_BG,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 30,
      shadowColor: colors.BRAND_ORANGE,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 10,
    },
    emptyTitle: {
      fontSize: 24,
      fontFamily: "Poppins-Bold",
      color: colors.TEXT,
      marginBottom: 10,
      textAlign: "center",
    },
    emptySubtitle: {
      fontSize: 16,
      fontFamily: "Poppins-Regular",
      color: colors.MUTED,
      textAlign: "center",
      marginBottom: 40,
      lineHeight: 24,
    },
    exploreButton: {
      backgroundColor: colors.BRAND_ORANGE,
      paddingVertical: 15,
      paddingHorizontal: 40,
      borderRadius: 30,
      shadowColor: colors.BRAND_ORANGE,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 5,
    },
    exploreButtonText: {
      color: "#FFF", // Button text stays white for high contrast on orange
      fontSize: 18,
      fontFamily: "Poppins-Bold",
    },
  }), [colors]);

  const favoritesWithAds = useMemo(() => {
    if (!favorites || favorites.length === 0) return [];
    const newFavs = [];
    favorites.forEach((fav, index) => {
      newFavs.push(fav);
      // Inject an ad every 5 favorites
      if ((index + 1) % 5 === 0 && index !== favorites.length - 1) {
        newFavs.push({ id: `ad-${index}`, isAd: true });
      }
    });
    return newFavs;
  }, [favorites]);

  // --- HEADER ANIMATION STATE ---
  const headerSlide = useSharedValue(-50);
  const headerFade = useSharedValue(0);
  const backBtnScale = useSharedValue(1);

  // --- EMPTY STATE ANIMATION ---
  const emptyStateFade = useSharedValue(0);
  const emptyStateScale = useSharedValue(0.8);

  // --- ON MOUNT LOAD & ANIMATION ---
  useEffect(() => {
    headerFade.value = withTiming(1, { duration: 500 });
    headerSlide.value = withSpring(0, { damping: 6, stiffness: 40 });

    const loadFavs = async () => {
      try {
        const storedFavs1 = await AsyncStorage.getItem("FAVORITE_LINES");
        const storedFavs2 = await AsyncStorage.getItem("favorites");
        let parsedFavs = [];
        if (storedFavs1) parsedFavs = JSON.parse(storedFavs1);
        if (storedFavs2) {
          const parsedFavs2 = JSON.parse(storedFavs2);
          parsedFavs2.forEach((item) => {
            if (!parsedFavs.some((f) => f.id === item.id || f.text === item.text)) {
              parsedFavs.push(item);
            }
          });
        }
        if (parsedFavs.length > 0) {
          setFavorites(parsedFavs);
        }
      } catch (err) {}
    };
    loadFavs();

    if (favorites?.length === 0) {
      emptyStateFade.value = withTiming(1, { duration: 800 });
      emptyStateScale.value = withSpring(1, { damping: 5, stiffness: 100 });
    }
  }, [favorites?.length, headerFade, headerSlide, emptyStateFade, emptyStateScale, setFavorites]);

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
      const storedFavs1 = await AsyncStorage.getItem("FAVORITE_LINES");
      const storedFavs2 = await AsyncStorage.getItem("favorites");
      let parsedFavs = [];
      if (storedFavs1) parsedFavs = JSON.parse(storedFavs1);
      if (storedFavs2) {
        const parsedFavs2 = JSON.parse(storedFavs2);
        parsedFavs2.forEach((item) => {
          if (!parsedFavs.some((f) => f.id === item.id || f.text === item.text)) {
            parsedFavs.push(item);
          }
        });
      }
      setFavorites(parsedFavs);
    } catch (err) {}
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderItem = ({ item, index }) => {
    if (item.isAd) {
      return (
        <AnimatedItem index={index}>
          <InlineNativeAd adConfig={adConfig} containerStyle={{ margin: 16 }} />
        </AnimatedItem>
      );
    }

    return (
      <AnimatedItem index={index}>
        <View>
          <LineCard lines={item} />
        </View>
      </AnimatedItem>
    );
  };

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
            <Ionicons name="arrow-back-sharp" size={36} color={colors.ICON} />
          </Animated.View>
        </Pressable>
        <Text style={styles.headerText}>
          Favorites {favorites?.length > 0 ? `(${favorites.length})` : ""}
        </Text>
      </Animated.View>

      {/* Content Area */}
      {favorites?.length === 0 ? (
        <Animated.View style={[{ flex: 1, justifyContent: "center", alignItems: "center", width: "100%", paddingHorizontal: 40 }, emptyStateStyle]}>
          <View style={styles.illustratedCircle}>
            <Ionicons name="heart-dislike-outline" size={80} color={colors.BRAND_ORANGE} />
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
            data={favoritesWithAds}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item?.id}-${index}`}
            contentContainerStyle={{ paddingBottom: 60 }}
            estimatedItemSize={200}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.BRAND_ORANGE} />
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
