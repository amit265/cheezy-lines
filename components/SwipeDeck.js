import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated, // Import Animated
  Pressable, // Import Pressable for better touch handling
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { captureRef } from "react-native-view-shot";
import colors from "../constants/colors";
import { shareCaptions } from "../constants/constant";
import { favoritesContext } from "../context/AppContext";
import { shuffleArray } from "../utils/shuffleQuestion";
import ShareCard from "./ShareCard";

// --- SUB-COMPONENT: Reusable Bouncy Button ---
const BouncyButton = ({ onPress, style, children, disabled }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.8, // Shrink effect
      speed: 20,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1, // Bounce back
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
    if (onPress) onPress();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={{ zIndex: 10 }} // Ensure touches register
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function SwipeDeck({ card }) {
  const swiperRef = useRef(null);
  const navigation = useNavigation();
  const { setFavorites } = useContext(favoritesContext);
  const shareCardRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [currentCardText, setCurrentCardText] = useState(card[0]?.text || "");
  const [isEndOfDeck, setIsEndOfDeck] = useState(false);
  const [deckKey, setDeckKey] = useState(0);
  const playstoreLink = "https://bit.ly/question-games";
  const shareMessage = shuffleArray(shareCaptions);

  // --- ANIMATION REFS ---
  const deckOpacity = useRef(new Animated.Value(0)).current;
  const deckSlide = useRef(new Animated.Value(50)).current; // Starts 50px lower
  const finishedOpacity = useRef(new Animated.Value(0)).current;

  // --- EFFECT: Animate Deck Entrance ---
  useEffect(() => {
    // Reset values first
    deckOpacity.setValue(0);
    deckSlide.setValue(50);

    // Play Animation
    Animated.parallel([
      Animated.timing(deckOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(deckSlide, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [deckKey]); // Re-run when deck restarts

  // --- EFFECT: Animate Finished Screen ---
  useEffect(() => {
    if (isEndOfDeck) {
      Animated.timing(finishedOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [isEndOfDeck]);

  // --- SHARE FUNCTION ---
  const shareImage = async () => {
    if (isSharing) return;
    setIsSharing(true);
    const captionText = `${currentCardText}\n\nGet more Cheesy Lines: https://play.google.com/store/apps/details?id=com.mindcraftlearning.cheezylines`;
    try {
      await Clipboard.setStringAsync(captionText);
      setTimeout(async () => {
        try {
          const uri = await captureRef(shareCardRef, {
            format: "png",
            quality: 1.0,
            result: "tmpfile",
          });
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share your cheesy line!",
            UTI: "public.png",
          });
        } catch (error) {
          // console.error("Error", error);
        } finally {
          setIsSharing(false);
        }
      }, 150);
    } catch (error) {
      setIsSharing(false);
      Alert.alert("Oops", "Could not share the image.");
    }
  };

  const handleCardIndexChange = (index) => {
    setCurrentIndex(index);
    if (card[index]) {
      setCurrentCardText(card[index].text);
    }
  };

  const saveToFavorites = async (cardItem) => {
    try {
      const existingData = await AsyncStorage.getItem("favorites");
      let favorites = existingData ? JSON.parse(existingData) : [];
      const isDuplicate = favorites.some((fav) => fav.text === cardItem.text);

      if (!isDuplicate) {
        favorites.push(cardItem);
        await AsyncStorage.setItem("favorites", JSON.stringify(favorites));
        setFavorites(favorites);
      }
    } catch (error) {}
  };

  const renderCard = (cardItem) => {
    if (!cardItem) return <View style={styles.card} />;
    return (
      <View style={styles.card}>
        <Text
          style={{
            position: "absolute",
            right: 10,
            top: 8,
            fontFamily: "Baloo2",
          }}
        >{`${currentIndex + 1} / ${card?.length}`}</Text>
        <Text style={styles.cardText}>{cardItem.text}</Text>
      </View>
    );
  };

  const handleSwipedAll = () => {
    setIsEndOfDeck(true);
  };

  const handleRestart = () => {
    setIsEndOfDeck(false);
    setDeckKey((prev) => prev + 1);
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // --- 1. VIEW: FINISHED SCREEN (Animated) ---
  if (isEndOfDeck) {
    return (
      <Animated.View
        style={[
          styles.container,
          styles.centerContent,
          { opacity: finishedOpacity },
        ]}
      >
        <Text style={styles.finishedTitle}>That&apos;s all for now! 🎉</Text>
        <Text style={styles.finishedSubtitle}>
          You&apos;ve seen all the lines in this category.
        </Text>

        <BouncyButton
          style={[styles.actionButton, styles.restartButton]}
          onPress={handleRestart}
        >
          <Text style={styles.actionButtonText}>🔄 Restart Category</Text>
        </BouncyButton>

        <BouncyButton
          style={[styles.actionButton, styles.goBackButton]}
          onPress={handleGoBack}
        >
          <Text style={styles.actionButtonText}>🔙 Go Back</Text>
        </BouncyButton>
      </Animated.View>
    );
  }

  // --- 2. VIEW: SWIPE DECK ---
  return (
    <View style={styles.container}>
      {/* Hidden container for screenshot */}
      <View style={{ position: "absolute", opacity: 0, zIndex: -1 }}>
        <ShareCard ref={shareCardRef} text={currentCardText} />
      </View>

      {/* Animated Wrapper for Swiper */}
      <Animated.View
        style={[
          styles.swiperContainer,
          {
            opacity: deckOpacity,
            transform: [{ translateY: deckSlide }],
          },
        ]}
      >
        <Swiper
          key={deckKey}
          ref={swiperRef}
          cards={card}
          renderCard={renderCard}
          onSwipedRight={(cardIndex) => {
            const likedCard = card[cardIndex];
            saveToFavorites(likedCard);
          }}
          onSwiped={(index) => handleCardIndexChange(index + 1)}
          onSwipedAll={handleSwipedAll}
          cardIndex={0}
          backgroundColor={"transparent"}
          stackSize={3}
          cardVerticalMargin={0}
          overlayLabels={{
            left: {
              title: "NOPE",
              style: {
                label: {
                  borderColor: "red",
                  color: "red",
                  borderWidth: 1,
                  textAlign: "right",
                },
              },
            },
            right: {
              title: "LIKE",
              style: {
                label: { borderColor: "green", color: "green", borderWidth: 1 },
              },
            },
          }}
          animateOverlayLabelsOpacity
        />
      </Animated.View>

      {/* Buttons (Uses BouncyButton) */}
      <View style={styles.buttonsContainer}>
        <BouncyButton
          style={[styles.button, styles.dislikeButton]}
          onPress={() => swiperRef.current.swipeLeft()}
        >
          <Text style={styles.buttonText}>❌</Text>
        </BouncyButton>

        <BouncyButton
          style={[styles.button, styles.likeButton]}
          onPress={() => swiperRef.current.swipeRight()}
        >
          <Text style={styles.buttonText}>❤️</Text>
        </BouncyButton>

        <BouncyButton
          style={[styles.button, styles.shareButton]}
          onPress={shareImage}
          disabled={isSharing}
        >
          {isSharing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>📤</Text>
          )}
        </BouncyButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
    justifyContent: "center",
  },
  centerContent: {
    alignItems: "center",
    padding: 20,
  },
  swiperContainer: {
    flex: 1,
    marginTop: 50,
    marginBottom: 50,
  },
  card: {
    flex: 0.65,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E8E8E8",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#4A3B32",
    fontFamily: "Poppins-Regular",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginBottom: 40,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  dislikeButton: {
    backgroundColor: "#FFCDD2",
  },
  likeButton: {
    backgroundColor: "#C8E6C9",
  },
  buttonText: {
    fontSize: 30,
  },
  shareButton: {
    backgroundColor: "#4FC3F7",
  },
  // Finished Screen Styles
  finishedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A3B32",
    marginBottom: 10,
    textAlign: "center",
  },
  finishedSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  actionButton: {
    width: "100%", // Adjusted to work well inside BouncyButton
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
    // Note: widths should usually be defined on the child of BouncyButton or container
    minWidth: 200, 
  },
  restartButton: {
    backgroundColor: "#FFD54F",
  },
  goBackButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#CCC",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});