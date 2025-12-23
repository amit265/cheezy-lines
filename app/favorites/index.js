import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext, useEffect, useRef } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LineCard from "../../components/LineCard";
import colors from "../../constants/colors";
import { favoritesContext } from "../../context/AppContext";
import { BannerAdComponent } from "../../services/AdManager";

// --- SUB-COMPONENT: Animated List Item ---
const AnimatedItem = ({ children, index }) => {
  const slideAnim = useRef(new Animated.Value(50)).current; // Start 50px down
  const fadeAnim = useRef(new Animated.Value(0)).current;   // Start transparent

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100, // Stagger effect
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
};

export default function Index() {
  const router = useRouter();
  const { favorites } = useContext(favoritesContext);

  // --- HEADER ANIMATION STATE ---
  const headerSlide = useRef(new Animated.Value(-50)).current;
  const headerFade = useRef(new Animated.Value(0)).current;
  const backBtnScale = useRef(new Animated.Value(1)).current;

  // --- EMPTY STATE ANIMATION ---
  const emptyStateFade = useRef(new Animated.Value(0)).current;
  const emptyStateScale = useRef(new Animated.Value(0.8)).current;

  // --- ON LOAD ANIMATION ---
  useEffect(() => {
    // Animate Header
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // If empty, animate the empty message
    if (favorites?.length === 0) {
      Animated.parallel([
        Animated.timing(emptyStateFade, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(emptyStateScale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, []);

  // --- INTERACTION HANDLERS ---
  const handleBackPressIn = () => {
    Animated.spring(backBtnScale, {
      toValue: 0.8,
      speed: 20,
      useNativeDriver: true,
    }).start();
  };

  const handleBackPressOut = () => {
    Animated.spring(backBtnScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start(() => {
      router.back();
    });
  };

  const renderItem = ({ item, index }) => (
    <AnimatedItem index={index}>
      <View>
        <LineCard lines={item} />
      </View>
    </AnimatedItem>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.headerContainer,
          { opacity: headerFade, transform: [{ translateY: headerSlide }] }
        ]}
      >
        <Pressable
          onPressIn={handleBackPressIn}
          onPressOut={handleBackPressOut}
          hitSlop={10}
        >
          <Animated.View style={{ transform: [{ scale: backBtnScale }] }}>
            <Ionicons name="arrow-back-sharp" size={36} color="black" />
          </Animated.View>
        </Pressable>
        <Text style={styles.headerText}>Favorites</Text>
      </Animated.View>

      {/* Content Area */}
      {favorites?.length === 0 ? (
        <Animated.View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            opacity: emptyStateFade,
            transform: [{ scale: emptyStateScale }],
          }}
        >
          <TouchableOpacity onPress={() => router.push("/")}>
            <Text style={[styles.buttonText, { fontSize: 25 }]}>
              No Favorites yet 💔
            </Text>
            <Text style={[styles.buttonText, { textAlign: 'center', marginTop: 10, color: colors.PRIMARY }]}>
              Tap to find some lines!
            </Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item?.id}-${index}`}
          contentContainerStyle={{ paddingBottom: 60 }} // Extra padding for ad
        />
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
});