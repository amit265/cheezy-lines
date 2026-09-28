import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { useContext, useState, useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Share,
  ScrollView,
  Alert,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { captureRef } from "react-native-view-shot";
import RNShare from "../../components/ShareProxy";
import ShareCard from "../../components/ShareCard";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomAlert from "../../components/CustomAlert";
import DynamicBackground from "../../components/DynamicBackground";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useThemeColors } from "../../constants/colors";
import { favoritesContext, aiCreditsContext } from "../../context/AppContext";
import { generateCheesyLine } from "../../services/groq";
import { getRandomOfflineLine } from "../../services/offlineAILines";
import { BannerAdComponent } from "../../services/AdManager";
import { AI_PROMPT_SUGGESTIONS } from "../../constants/aiPrompts";

export default function AIGenerator() {
  const router = useRouter();
  const { setFavorites } = useContext(favoritesContext);
  const { aiCredits, setAiCredits } = useContext(aiCreditsContext);
  const colors = useThemeColors();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedLine, setGeneratedLine] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasCustomKey, setHasCustomKey] = useState(false);
  const [alertConfig, setAlertConfig] = useState(null);
  
  const shareCardRef = useRef();

  useEffect(() => {
    // Check if user has a custom API key for unlimited generation
    const checkCustomKey = async () => {
      try {
        const key = await SecureStore.getItemAsync("ds_custom_groq_api_key");
        setHasCustomKey(!!key);
      } catch (e) {
        setHasCustomKey(false);
      }
    };
    checkCustomKey();
    
    // Pick 6 random suggestions for the modal
    const shuffled = [...AI_PROMPT_SUGGESTIONS].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 6));
  }, []);

  const backBtnScale = useSharedValue(1);

  const handleBackPressIn = () => {
    backBtnScale.value = withSpring(0.8);
  };

  const handleBackPressOut = () => {
    backBtnScale.value = withSpring(1, {}, (finished) => {
      if (finished) runOnJS(router.back)();
    });
  };

  const backBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backBtnScale.value }],
  }));

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    if (!hasCustomKey && aiCredits <= 0) {
      setAlertConfig({
        title: "Out of AI Credits!",
        message: "You've run out of AI credits for today. Watch a short video in Settings to earn more and get an ad-free experience!",
        buttons: [
          { text: "Cancel", style: "cancel" },
          { text: "Go to Settings", onPress: () => { setAlertConfig(null); router.push("/settings"); } }
        ]
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    setErrorMsg(null);
    setGeneratedLine(null);
    setIsSaved(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const line = await generateCheesyLine(prompt);
      setGeneratedLine(line);
      
      if (!hasCustomKey) {
        const newCredits = aiCredits - 1;
        setAiCredits(newCredits);
        await AsyncStorage.setItem("ds_ai_credits", newCredits.toString());
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      if (error.message === "NO_API_KEY") {
        // Fallback to offline template
        const offlineLine = getRandomOfflineLine();
        setGeneratedLine(offlineLine);
        setErrorMsg("API Key missing. Showing offline line. Add key in Settings!");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setErrorMsg(error.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToFavorites = async () => {
    if (!generatedLine) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      const newCard = {
        id: Math.random().toString(36).substr(2, 9),
        text: generatedLine,
      };
      const existingData = await AsyncStorage.getItem("favorites");
      let favorites = existingData ? JSON.parse(existingData) : [];
      const isDuplicate = favorites.some((fav) => fav.text === newCard.text);

      if (!isDuplicate) {
        favorites.push(newCard);
        await AsyncStorage.setItem("favorites", JSON.stringify(favorites));
        setFavorites(favorites);
      }
      setIsSaved(true);
    } catch (err) {}
  };

  const handleShareAI = async () => {
    if (!generatedLine || isSharing) return;
    setIsSharing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const captionText = `${generatedLine}\n\nGenerated by AI ✨ Get more Cheesy Lines:\nAndroid: https://play.google.com/store/apps/details?id=com.mindcraftlearning.cheezylines\niOS: https://apps.apple.com/us/developer/destya-eka-capricornesia/id1879262455`;
      await Clipboard.setStringAsync(captionText);
      setTimeout(async () => {
        try {
          const uri = await captureRef(shareCardRef, {
            format: "png",
            quality: 1.0,
            result: "tmpfile",
          });

          await RNShare.open({
            url: uri,
            message: captionText,
            title: "Share your AI generated line!",
          });
        } catch (error) {
          // Ignore cancel errors
        } finally {
          setIsSharing(false);
        }
      }, 150);
    } catch (error) {
      setIsSharing(false);
      Alert.alert("Oops", "Could not share the image.");
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
      alignItems: "center",
      backgroundColor: colors.BACKGROUND,
    },
    headerContainer: {
      paddingVertical: 10,
      display: "flex",
      flexDirection: "row",
      gap: 15,
      width: "90%",
      borderBottomWidth: 1,
      borderColor: colors.CARD_BORDER,
      alignItems: "center",
      zIndex: 10,
    },
    headerText: {
      color: colors.TEXT,
      fontSize: 26,
      fontFamily: "Poppins-Bold",
    },
    creditsBadge: {
      backgroundColor: colors.BRAND_ORANGE + "20",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.BRAND_ORANGE,
      marginLeft: "auto",
    },
    creditsText: {
      color: colors.BRAND_ORANGE,
      fontFamily: "Poppins-Bold",
      fontSize: 12,
    },
    content: {
      flex: 1,
      width: "90%",
      alignSelf: "center",
      paddingTop: 30,
    },
    bannerContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    description: {
      fontFamily: "Poppins-Regular",
      fontSize: 16,
      color: colors.MUTED,
      marginBottom: 25,
      textAlign: "center",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
    },

    suggestionChip: {
      backgroundColor: colors.CARD_BG,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.CARD_BORDER,
      width: "100%",
    },
    suggestionText: {
      fontFamily: "Poppins-Regular",
      fontSize: 14,
      color: colors.TEXT,
      textAlign: "center",
    },
    warningText: {
      fontFamily: "Poppins-Regular",
      fontSize: 10,
      color: colors.MUTED,
      textAlign: "center",
      marginBottom: 20,
    },
    suggestionsContainer: {
      flexDirection: "column",
      alignItems: "center",
      gap: 12,
      paddingVertical: 10,
    },
    suggestionTriggerButton: {
      alignSelf: "center",
      backgroundColor: colors.CARD_BG,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      marginBottom: 20,
    },
    suggestionTriggerText: {
      fontFamily: "Poppins-Regular",
      fontSize: 14,
      color: colors.TEXT,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.BACKGROUND,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      padding: 25,
      maxHeight: "80%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    modalTitle: {
      fontFamily: "Poppins-Bold",
      fontSize: 18,
      color: colors.TEXT,
    },
    input: {
      flex: 1,
      backgroundColor: colors.CARD_BG,
      borderRadius: 24,
      padding: 15,
      paddingTop: 15,
      minHeight: 60,
      maxHeight: 120,
      fontFamily: "Poppins-Regular",
      fontSize: 16,
      color: colors.TEXT,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.CARD_BORDER,
    },
    generateButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.BRAND_ORANGE,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.BRAND_ORANGE,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    errorText: {
      fontFamily: "Poppins-Regular",
      color: colors.ERROR || "#E53935",
      fontSize: 14,
      textAlign: "center",
      marginBottom: 20,
    },
    gradientBorderContainer: {
      marginTop: 20,
      shadowColor: colors.BRAND_ORANGE,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      elevation: 10,
    },
    resultCard: {
      borderRadius: 24,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.CARD_BORDER,
      padding: 25,
      alignItems: "center",
      overflow: "hidden",
      backgroundColor: colors.CARD_BG,
    },
    resultText: {
      fontFamily: "Poppins-Bold",
      fontSize: 26,
      color: colors.TEXT,
      textAlign: "center",
      lineHeight: 36,
      marginBottom: 30,
    },
    saveButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.CARD_BG,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 25,
      gap: 8,
    },
    saveButtonText: {
      fontFamily: "Poppins-Bold",
      color: colors.BRAND_ORANGE,
      fontSize: 16,
    },
    shareButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.CARD_BG,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 25,
      gap: 8,
    },
    shareButtonText: {
      fontFamily: "Poppins-Bold",
      color: colors.BRAND_ORANGE,
      fontSize: 16,
    },
    // In-page overlay (replaces Modal so it stays within phone frame on web)
    overlayBackdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
      zIndex: 100,
    },
    overlaySheet: {
      backgroundColor: colors.BACKGROUND,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      padding: 25,
      maxHeight: "75%",
    },
  }), [colors]);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Pressable onPressIn={handleBackPressIn} onPressOut={handleBackPressOut} hitSlop={10}>
          <Animated.View style={backBtnStyle}>
            <Ionicons name="arrow-back-sharp" size={36} color={colors.TEXT} />
          </Animated.View>
        </Pressable>
        <Text style={styles.headerText}>AI Magic ✨</Text>
        <TouchableOpacity style={styles.creditsBadge} onPress={() => router.push("/settings")}>
          <Text style={styles.creditsText}>{hasCustomKey ? "Unlimited" : `${aiCredits} Credits`}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%", marginBottom: 60 }} // Give space for banner
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Description */}
            <Text style={styles.description}>
              Describe a scenario, person, or object, and the AI will generate a custom cheesy line just for you!
            </Text>

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="e.g. A pickup line about coffee..."
                placeholderTextColor={colors.MUTED}
                value={prompt}
                onChangeText={setPrompt}
                multiline
                maxLength={150}
              />
              <TouchableOpacity
                style={[styles.generateButton, !prompt.trim() && { opacity: 0.5 }]}
                onPress={handleGenerate}
                disabled={!prompt.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.BACKGROUND} />
                ) : (
                  <Feather name="zap" size={24} color={colors.BACKGROUND} />
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.warningText}>
              <Feather name="alert-triangle" size={10} color={colors.MUTED} /> AI can make mistakes. Be careful !
            </Text>

            {/* Suggestion Button */}
            <TouchableOpacity 
              style={styles.suggestionTriggerButton}
              onPress={() => setShowSuggestions(true)}
            >
              <Text style={styles.suggestionTriggerText}>{"Don't know what to type? 🤔"}</Text>
            </TouchableOpacity>

            {/* Error Message */}
            {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

            {/* Result Card */}
            {generatedLine && (
              <View style={styles.gradientBorderContainer}>
                <ShareCard ref={shareCardRef} text={generatedLine} />
                <View style={styles.resultCard}>
                  <TouchableOpacity 
                    style={{ position: 'absolute', top: 15, right: 15, padding: 5, zIndex: 10 }} 
                    onPress={() => {
                      setAlertConfig({
                        title: "Report AI Content",
                        message: "Thanks for letting us know! We'll review this AI generation."
                      });
                    }}
                    hitSlop={15}
                  >
                    <Feather name="flag" size={16} color={colors.MUTED} />
                  </TouchableOpacity>

                  <Text style={styles.resultText}>{generatedLine}</Text>
                  
                  <View style={{ flexDirection: "row", gap: 15 }}>
                    <TouchableOpacity 
                      style={[styles.saveButton, isSaved && { backgroundColor: colors.SUCCESS + "20" }]} 
                      onPress={handleSaveToFavorites}
                      disabled={isSaved}
                    >
                      <Feather name={isSaved ? "check" : "heart"} size={20} color={isSaved ? colors.SUCCESS : colors.BRAND_ORANGE} />
                      <Text style={[styles.saveButtonText, isSaved && { color: colors.SUCCESS }]}>
                        {isSaved ? "Saved!" : "Save"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.shareButton} onPress={handleShareAI} disabled={isSharing}>
                      {isSharing ? (
                        <ActivityIndicator size="small" color={colors.BRAND_ORANGE} />
                      ) : (
                        <Feather name="share-2" size={20} color={colors.BRAND_ORANGE} />
                      )}
                      <Text style={styles.shareButtonText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.bannerContainer}>
        <BannerAdComponent />
      </View>

      {/* In-page suggestions overlay — stays within phone frame on web */}
      {showSuggestions && (
        <View style={styles.overlayBackdrop}>
          <View style={styles.overlaySheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Need Inspiration? 💡</Text>
              <TouchableOpacity onPress={() => setShowSuggestions(false)}>
                <Feather name="x" size={24} color={colors.TEXT} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.suggestionsContainer} showsVerticalScrollIndicator={false}>
              {suggestions.map((s, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => {
                    setPrompt(s);
                    Haptics.selectionAsync();
                    setShowSuggestions(false);
                  }}
                >
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
      </SafeAreaView>
      <CustomAlert 
        visible={!!alertConfig} 
        title={alertConfig?.title}
        message={alertConfig?.message}
        buttons={alertConfig?.buttons || []}
        onClose={() => setAlertConfig(null)}
      />
    </View>
  );
}
