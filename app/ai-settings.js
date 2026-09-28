import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect, useMemo } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

import { useThemeColors } from "../constants/colors";
import { BannerAdComponent } from "../services/AdManager";

export default function AISettings() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const colors = useThemeColors();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.BACKGROUND,
      alignItems: "center",
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
    content: {
      paddingTop: 30,
      paddingHorizontal: 20,
      paddingBottom: 50,
    },
    infoCard: {
      backgroundColor: colors.CARD_BG,
      borderRadius: 20,
      padding: 25,
      alignItems: "center",
      marginBottom: 30,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.PRIMARY + "30",
    },
    cardTitle: {
      fontFamily: "Poppins-Bold",
      fontSize: 22,
      color: colors.TEXT,
      marginBottom: 10,
    },
    cardDescription: {
      fontFamily: "Poppins-Regular",
      fontSize: 14,
      color: colors.MUTED,
      textAlign: "center",
      lineHeight: 22,
    },
    stepsContainer: {
      marginBottom: 25,
    },
    stepsHeader: {
      fontFamily: "Poppins-Bold",
      fontSize: 18,
      color: colors.TEXT,
      marginBottom: 15,
    },
    stepItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 15,
      paddingRight: 20,
    },
    stepCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.PRIMARY,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
    },
    stepNumber: {
      color: "#FFF",
      fontFamily: "Poppins-Bold",
      fontSize: 14,
    },
    stepText: {
      fontFamily: "Poppins-Regular",
      fontSize: 14,
      color: colors.TEXT,
      flex: 1,
    },
    groqButton: {
      backgroundColor: colors.TEXT,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 15,
      borderRadius: 12,
      gap: 10,
      marginBottom: 40,
    },
    groqButtonText: {
      color: colors.BACKGROUND,
      fontFamily: "Poppins-Bold",
      fontSize: 16,
    },
    inputContainer: {
      backgroundColor: colors.CARD_BG,
      padding: 20,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.CARD_BORDER,
    },
    inputLabel: {
      fontFamily: "Poppins-Bold",
      fontSize: 16,
      color: colors.TEXT,
      marginBottom: 10,
    },
    input: {
      backgroundColor: colors.BACKGROUND,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.CARD_BORDER,
      borderRadius: 10,
      padding: 15,
      fontFamily: "Poppins-Regular",
      fontSize: 14,
      color: colors.TEXT,
      marginBottom: 10,
    },
    secureNote: {
      fontFamily: "Poppins-Regular",
      fontSize: 12,
      color: colors.MUTED,
    },
  }), [colors]);

  const backBtnScale = useSharedValue(1);

  useEffect(() => {
    const loadKey = async () => {
      // First check secure store
      let key = await SecureStore.getItemAsync("ds_custom_groq_api_key");
      // Fallback to legacy AsyncStorage
      if (!key) {
        key = await AsyncStorage.getItem("GROQ_API_KEY");
      }
      if (key) setApiKey(key);
    };
    loadKey();
  }, []);

  const saveKey = async (text) => {
    setApiKey(text);
    if (text) {
      await SecureStore.setItemAsync("ds_custom_groq_api_key", text);
    } else {
      await SecureStore.deleteItemAsync("ds_custom_groq_api_key");
    }
  };

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Pressable onPressIn={handleBackPressIn} onPressOut={handleBackPressOut} hitSlop={10}>
          <Animated.View style={backBtnStyle}>
            <Ionicons name="arrow-back-sharp" size={36} color={colors.TEXT} />
          </Animated.View>
        </Pressable>
        <Text style={styles.headerText}>AI Setup</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            
            <View style={styles.infoCard}>
              <Feather name="zap" size={40} color={colors.PRIMARY} style={{ marginBottom: 15 }} />
              <Text style={styles.cardTitle}>Unlock AI Magic</Text>
              <Text style={styles.cardDescription}>
                {"Cheesy Lines uses the ultra-fast Llama 3 model via Groq. To generate unlimited custom lines for free, you just need to grab your own API key. It's completely free and takes 1 minute!"}
              </Text>
            </View>

            <View style={styles.stepsContainer}>
              <Text style={styles.stepsHeader}>How to get a free key:</Text>
              
              <View style={styles.stepItem}>
                <View style={styles.stepCircle}><Text style={styles.stepNumber}>1</Text></View>
                <Text style={styles.stepText}>Tap the button below to go to the Groq Console.</Text>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepCircle}><Text style={styles.stepNumber}>2</Text></View>
                <Text style={styles.stepText}>Sign up or log in (you can use Google).</Text>
              </View>

              <View style={styles.stepItem}>
                <View style={styles.stepCircle}><Text style={styles.stepNumber}>3</Text></View>
                <Text style={styles.stepText}>{"Click \"Create API Key\", copy it, and paste it below!"}</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.groqButton} 
              onPress={() => Linking.openURL("https://console.groq.com/keys")}
            >
              <Text style={styles.groqButtonText}>Open Groq Console</Text>
              <Feather name="external-link" size={18} color={colors.BACKGROUND} />
            </TouchableOpacity>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Your API Key</Text>
              <TextInput
                style={styles.input}
                placeholder="gsk_..."
                placeholderTextColor={colors.MUTED}
                value={apiKey}
                onChangeText={saveKey}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.secureNote}>
                <Feather name="lock" size={12} color={colors.MUTED} /> Stored securely and exclusively on your device.
              </Text>
            </View>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <View style={{ width: "100%", alignItems: "center", marginBottom: 10 }}>
        <BannerAdComponent />
      </View>
    </SafeAreaView>
  );
}
