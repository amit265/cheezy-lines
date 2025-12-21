import AsyncStorage from "@react-native-async-storage/async-storage"; // Make sure to install this
import { useNavigation } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard"; // <--- Import this
import * as Sharing from "expo-sharing";
import { useContext, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
export default function SwipeDeck({ card }) {
  const swiperRef = useRef(null);
  const navigation = useNavigation();
  const { setFavorites } = useContext(favoritesContext);
  const shareCardRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [currentCardText, setCurrentCardText] = useState(card[0]?.text || "");
  // State to track if the deck is finished
  const [isEndOfDeck, setIsEndOfDeck] = useState(false);
  // State to force a full reset of the component (the "Restart" trick)
  const [deckKey, setDeckKey] = useState(0);
  const playstoreLink = "https://bit.ly/question-games";
  const shareMessage = shuffleArray(shareCaptions);


//   console.log("SwipeDeck Rendered with cards:", card.length);
  // --- THE MAGIC SHARE FUNCTION ---
  const shareImage = async () => {
    if (isSharing) return;
    setIsSharing(true);
    const captionText = `${currentCardText}\n\nGet more Cheesy Lines: https://play.google.com/store/apps/details?id=com.mindcraftlearning.cheezylines`;
    try {
      // A. Capture the hidden view as an image
      await Clipboard.setStringAsync(captionText);
      setTimeout(async () => {
        try {
          const uri = await captureRef(shareCardRef, {
            format: "png",
            quality: 1.0, // Best quality
            result: "tmpfile",
          });

          // B. Share using native dialog
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Share your cheesy line!",
            UTI: "public.png", // Helps on iOS
            // message: `${shareMessage}\n\nGet more cheesy lines here: ${playstoreLink}`,
          });
        } catch (error) {
        //   console.error("Error during sharing process", error);
        } finally {
          setIsSharing(false);
        }
      }, 150);
    } catch (error) {
    //   console.error("Sharing failed", error);
      setIsSharing(false);
      Alert.alert("Oops", "Could not share the image.");
    }
  };

  // Update current text whenever user swipes so we share the RIGHT card
  const handleCardIndexChange = (index) => {
    // Safety check if we run out of cards
    setCurrentIndex(index);
    if (card[index]) {
      setCurrentCardText(card[index].text);
    }
  };

  // --- SAVE LOGIC ---
  const saveToFavorites = async (cardItem) => {
    try {
      // 1. Get existing favorites
      const existingData = await AsyncStorage.getItem("favorites");
      let favorites = existingData ? JSON.parse(existingData) : [];

      // 2. Check for duplicates (optional, prevents saving same line twice)
      const isDuplicate = favorites.some((fav) => fav.text === cardItem.text);

      if (!isDuplicate) {
        // 3. Add new card and save
        favorites.push(cardItem);
        await AsyncStorage.setItem("favorites", JSON.stringify(favorites));
        setFavorites(favorites); // Update context
        // console.log("Saved to favorites:", cardItem.text);
      } else {
        // console.log("Already in favorites");
      }
    } catch (error) {
    //   console.error("Error saving favorite:", error);
    }
  };

  // --- RENDER CARD ---
  const renderCard = (cardItem) => {
    // Handle case where card data might be missing/empty
    if (!cardItem) return <View style={styles.card} />

    ;


    return (
      <View style={styles.card}>
        <Text style={{position: "absolute", right: 10, top: 8, fontFamily: "Baloo2"}}>{`${currentIndex + 1} / ${card?.length}`}</Text> 
        
        <Text style={styles.cardText}>{cardItem.text}</Text>
      </View>
    );
  };

  // --- HANDLERS ---
  const handleSwipedAll = () => {
    // console.log("All cards swiped");
    setIsEndOfDeck(true); // Switch the view to the "Finished" screen
  };

  const handleRestart = () => {
    setIsEndOfDeck(false);
    setDeckKey((prev) => prev + 1); // Changing the key forces the Swiper to re-mount from scratch
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  // --- 1. VIEW: FINISHED SCREEN ---
  if (isEndOfDeck) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.finishedTitle}>That&apos;s all for now! 🎉</Text>
        <Text style={styles.finishedSubtitle}>
          You&apos;ve seen all the lines in this category.
        </Text>

        <TouchableOpacity
          style={[styles.actionButton, styles.restartButton]}
          onPress={handleRestart}
        >
          <Text style={styles.actionButtonText}>🔄 Restart Category</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.goBackButton]}
          onPress={handleGoBack}
        >
          <Text style={styles.actionButtonText}>🔙 Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- 2. VIEW: SWIPE DECK ---
  return (
    <View style={styles.container}>
      <ShareCard ref={shareCardRef} text={currentCardText} />

      <View style={styles.swiperContainer}>
        <Swiper
          key={deckKey} // Key trick to allow restarting
          ref={swiperRef}
          cards={card}
          renderCard={renderCard}
          onSwipedRight={(cardIndex) => {
            // Get the actual card object and save it
            const likedCard = card[cardIndex];
            saveToFavorites(likedCard);
          }}
          onSwiped={(index) => handleCardIndexChange(index + 1)} // Update text for next card
          onSwipedLeft={(cardIndex) => console.log("PASSED")}
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
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.dislikeButton]}
          onPress={() => swiperRef.current.swipeLeft()}
        >
          <Text style={styles.buttonText}>❌</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.likeButton]}
          onPress={() => swiperRef.current.swipeRight()}
        >
          <Text style={styles.buttonText}>❤️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.shareButton]}
          onPress={shareImage}
          disabled={isSharing} // Disable button while loading
        >
          {isSharing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>📤</Text>
          )}
        </TouchableOpacity>
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
    backgroundColor: "#fff", // Ensure card has white background
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
    zIndex: 1,
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
    backgroundColor: "#4FC3F7", // Nice Blue for share
    marginBottom: 10, // Adjust position as needed
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
    width: "80%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
  },
  restartButton: {
    backgroundColor: "#FFD54F", // Yellow/Gold
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
