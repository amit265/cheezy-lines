import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { useContext, useEffect, useRef, useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated, // Import Animated
  Pressable, // Import Pressable for better touch handling
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  View,
} from "react-native";
import RNShare from "./ShareProxy";
import * as Haptics from "expo-haptics";
import * as StoreReview from "expo-store-review";
import Feather from "@expo/vector-icons/Feather";
import Swiper from "react-native-deck-swiper";
import { captureRef } from "react-native-view-shot";
import { BlurView } from "expo-blur";
import { useThemeColors } from "../constants/colors";
import { shareCaptions } from "../constants/constant";
import { favoritesContext, adConfigContext } from "../context/AppContext";
import { shuffleArray } from "../utils/shuffleQuestion";
import ShareCard from "./ShareCard";
import { getAdUnitId } from "../services/AdManager";
import { BannerAd, BannerAdSize } from "./NativeBannerAd";

// --- SUB-COMPONENT: Ad Card (only renders when ad is loaded) ---
const AdCard = ({ unitId, isTopCard, colors }) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adFailed, setAdFailed] = useState(false);

  // If ad failed to load, render nothing (invisible card)
  if (adFailed) {
    return <View style={{ width: 0, height: 0 }} />;
  }

  return (
    <View style={[
      stylesAdCard(colors).card,
      { justifyContent: "center", alignItems: "center" },
      !adLoaded && { opacity: 0 },
    ]}>
      {adLoaded && isTopCard && (
        <Text style={{ fontFamily: "Poppins-Bold", color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 10 }}>
          Sponsored
        </Text>
      )}
      <View style={{ opacity: isTopCard ? 1 : 0 }}>
        <BannerAd
          unitId={unitId}
          size={BannerAdSize.MEDIUM_RECTANGLE}
          onAdLoaded={() => setAdLoaded(true)}
          onAdFailedToLoad={() => setAdFailed(true)}
        />
      </View>
    </View>
  );
};

const stylesAdCard = (colors) => StyleSheet.create({
  card: {
    flex: 0.65,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.CARD_BORDER,
    backgroundColor: colors.CARD_BG,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    overflow: "hidden", 
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  }
});

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
  const { adConfig } = useContext(adConfigContext);
  const shareCardRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width, 480) - 40;
  const [isSharing, setIsSharing] = useState(false);
  const [currentCardText, setCurrentCardText] = useState(card[0]?.text || "");
  const [isEndOfDeck, setIsEndOfDeck] = useState(false);
  const [deckKey, setDeckKey] = useState(0);
  const playstoreLink = "https://bit.ly/question-games";
  const shareMessage = shuffleArray(shareCaptions);
  const colors = useThemeColors();

  // --- COMPUTE CARDS WITH ADS ---
  const cardsWithAds = useMemo(() => {
    if (!card || card.length === 0) return [];
    const newCards = [];
    card.forEach((c, index) => {
      newCards.push(c);
      // Inject an ad every 6 cards (after index 5)
      if ((index + 1) % 6 === 0 && index !== card.length - 1) {
        newCards.push({ id: `ad-${index}`, isAd: true });
      }
    });
    return newCards;
  }, [card]);

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSharing(true);
    
    const currentCard = cardsWithAds[currentIndex];
    if (!currentCard || currentCard.isAd) {
      setIsSharing(false);
      Alert.alert("Oops", "You cannot share an ad!");
      return;
    }

    const currentId = currentCard.id || currentIndex;
    const captionText = `${currentCardText}\n\nGet more Cheesy Lines:\nAndroid: https://play.google.com/store/apps/details?id=com.mindcraftlearning.cheezylines\niOS: https://apps.apple.com/us/developer/destya-eka-capricornesia/id1879262455`;
    try {
      await Clipboard.setStringAsync(captionText);
      setTimeout(async () => {
        try {
          const uri = await captureRef(shareCardRef, {
            format: "png",
            quality: 1.0,
            result: "tmpfile",
          });
          // Use react-native-share to share both image and text seamlessly on all platforms
          await RNShare.open({
            url: uri, // local file URI
            message: captionText,
            title: "Share your cheesy line!", // Used in email subjects or similar intents
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

  const handleCardIndexChange = async (index) => {
    setCurrentIndex(index);
    if (cardsWithAds[index] && !cardsWithAds[index].isAd) {
      setCurrentCardText(cardsWithAds[index].text);
    }
    
    // Request Store Review after 15 swipes
    if (index === 15) {
      try {
        if (await StoreReview.hasAction()) {
          StoreReview.requestReview();
        }
      } catch (err) {}
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

  const renderCard = (cardItem, index) => {
    if (!cardItem) return <View style={styles.card} />;
    
    const isTopCard = index === currentIndex;

    if (cardItem.isAd) {
      // Only render the ad card once the ad is confirmed loaded
      return (
        <AdCard
          unitId={getAdUnitId("banner", adConfig?.testAds)}
          isTopCard={isTopCard}
          colors={colors}
        />
      );
    }

    const actualCardIndex = card.indexOf(cardItem) + 1;

    return (
      <View style={styles.card}>
        {/* Hide text when card is in the stack behind the top card */}
        <View style={{ opacity: isTopCard ? 1 : 0, width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
          <Text
            style={{
              position: "absolute",
              right: -10,
              top: -10,
              fontFamily: "Poppins-Regular",
              color: colors.TEXT_MUTED,
              zIndex: 10,
            }}
          >{`${actualCardIndex > 0 ? actualCardIndex : currentIndex + 1} / ${card?.length}`}</Text>
          <Text style={styles.cardText}>{cardItem.text}</Text>
        </View>
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

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent",
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
      borderRadius: 30,
      borderWidth: 1,
      borderColor: colors.CARD_BORDER,
      backgroundColor: colors.CARD_BG,
      justifyContent: "center",
      alignItems: "center",
      padding: 30,
      overflow: "hidden", 
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 15,
    },
    cardText: {
      fontSize: 22,
      textAlign: "center",
      color: colors.TEXT,
      fontFamily: "Poppins-Bold",
      lineHeight: 32,
    },
    buttonsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 20,
      marginBottom: 30,
    },
    button: {
      justifyContent: "center",
      alignItems: "center",
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
    },
    dislikeButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.CARD_BG,
      borderColor: colors.CARD_BORDER,
      borderWidth: 1,
    },
    likeButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.BRAND_ORANGE,
      shadowColor: colors.BRAND_ORANGE,
      shadowOpacity: 0.4,
      shadowRadius: 15,
      elevation: 10,
    },
    buttonText: {
      fontSize: 30,
    },
    shareButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.CARD_BG,
      borderColor: colors.CARD_BORDER,
      borderWidth: 1,
    },
    // Finished Screen Styles
    finishedTitle: {
      fontSize: 28,
      fontFamily: "Poppins-Bold",
      color: colors.TEXT,
      marginBottom: 10,
      textAlign: "center",
    },
    finishedSubtitle: {
      fontSize: 16,
      color: colors.TEXT_MUTED,
      fontFamily: "Poppins-Regular",
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
      backgroundColor: colors.BRAND_ORANGE,
    },
    goBackButton: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: colors.CARD_BORDER,
    },
    actionButtonText: {
      fontSize: 16,
      fontFamily: "Poppins-Bold",
      color: "#FFF",
    },
  }), [colors]);

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
          cards={cardsWithAds}
          renderCard={renderCard}
          onSwipedRight={(cardIndex) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const likedCard = cardsWithAds[cardIndex];
            if (likedCard && !likedCard.isAd) {
              saveToFavorites(likedCard);
            }
          }}
          onSwipedLeft={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          onSwiped={(index) => handleCardIndexChange(index + 1)}
          onSwipedAll={handleSwipedAll}
          cardIndex={0}
          backgroundColor={"transparent"}
          stackSize={3}
          cardStyle={{ width: cardWidth, left: 20 }}
          cardVerticalMargin={0}
          cardHorizontalMargin={20}
          overlayLabels={{
            left: {
              title: "NOPE",
              style: {
                label: {
                  borderColor: colors.NEON_PINK,
                  color: colors.NEON_PINK,
                  borderWidth: 2,
                  textAlign: "right",
                  fontFamily: "Poppins-Bold",
                },
              },
            },
            right: {
              title: "LIKE",
              style: {
                label: { 
                  borderColor: colors.ELECTRIC_CYAN, 
                  color: colors.ELECTRIC_CYAN, 
                  borderWidth: 2,
                  fontFamily: "Poppins-Bold",
                },
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
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            swiperRef.current.swipeLeft();
          }}
        >
          <Feather name="x" size={26} color={colors.TEXT} />
        </BouncyButton>

        <BouncyButton
          style={[styles.button, styles.likeButton]}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            swiperRef.current.swipeRight();
          }}
        >
          <Feather name="heart" size={36} color="#FFF" />
        </BouncyButton>

        <BouncyButton
          style={[styles.button, styles.shareButton]}
          onPress={shareImage}
          disabled={isSharing}
        >
          {isSharing ? (
            <ActivityIndicator size="small" color={colors.TEXT} />
          ) : (
            <Feather name="send" size={24} color={colors.TEXT} />
          )}
        </BouncyButton>
      </View>
    </View>
  );
}