import {
  AntDesign,
  Feather,
  FontAwesome,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useMemo } from "react";
import {
  Alert,
  Linking,
  Share,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import CrossPromoHub from "../components/CrossPromoHub";
import { useThemeColors } from "../constants/colors";
import { BannerAdComponent } from "../services/AdManager";
import { globalConfigContext, themeContext, adConfigContext } from "../context/AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";

export default function Settings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { globalConfig } = useContext(globalConfigContext);
  const { themePreference, setThemePreference } = useContext(themeContext);
  const { adConfig, setAdConfig } = useContext(adConfigContext);
  const colors = useThemeColors();
  
  // Developer tap logic
  const devTapCount = React.useRef(0);
  const lastDevTapTime = React.useRef(0);

  const hapticTap = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleThemeChange = async (theme) => {
    hapticTap();
    setThemePreference(theme);
    await AsyncStorage.setItem("ds_theme_preference", theme);
  };
  
  const styles = useMemo(() => StyleSheet.create({
    screen: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    headerTextWrap: {
      flex: 1,
    },
    heading: {
      fontFamily: "Poppins-Bold",
      fontSize: 28,
      color: colors.TEXT,
    },
    closeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.CARD_BG,
      borderWidth: 1,
      borderColor: colors.CARD_BORDER,
      justifyContent: "center",
      alignItems: "center",
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      gap: 20,
    },
    panel: {
      borderRadius: 24,
      padding: 16,
      borderWidth: 1,
      backgroundColor: colors.CARD_BG,
      borderColor: colors.CARD_BORDER,
    },
    sectionTitle: {
      fontFamily: "Poppins-Bold",
      fontSize: 14,
      textTransform: "uppercase",
      letterSpacing: 1.2,
      marginBottom: 16,
      color: colors.PRIMARY,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: colors.CARD_BG,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
      backgroundColor: colors.CARD_BG,
    },
    copyWrap: {
      flex: 1,
    },
    label: {
      fontFamily: "Poppins-Bold",
      fontSize: 15,
      marginBottom: 2,
      color: colors.TEXT,
    },
    hint: {
      fontFamily: "Poppins-Regular",
      fontSize: 12,
      color: colors.MUTED,
    },
    divider: {
      height: 1,
      backgroundColor: colors.CARD_BORDER,
      marginVertical: 4,
      marginHorizontal: 12,
    },
    segmentWrap: {
      flexDirection: 'row',
      backgroundColor: 'rgba(0,0,0,0.05)',
      borderRadius: 12,
      padding: 4,
      marginTop: 8,
    },
    segmentButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 8,
    },
    segmentButtonActive: {
      backgroundColor: colors.CARD_BG,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    segmentText: {
      fontFamily: 'Poppins-Bold',
      fontSize: 13,
      color: colors.MUTED,
    },
    segmentTextActive: {
      color: colors.TEXT,
    },
    versionText: {
      fontFamily: 'Poppins-Regular',
      fontSize: 12,
      color: colors.MUTED,
      textAlign: 'center',
      opacity: 0.5,
    }
  }), [colors]);

  const handleContactUs = () => {
    const email = globalConfig?.email || "mindcraftlearning97@gmail.com";
    const subject = `Support Request for ${globalConfig?.brandName || "Cheesy Lines"}`;
    const body = "Hi, I need help with...";
    const url = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url).catch((err) =>
      Alert.alert("Error", "Could not open email client.")
    );
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message:
          `Check out this amazing app!\n\n${globalConfig?.socialLinks?.playStore || "https://destyastudio.com/products/cheezylines"}`,
      });

      if (result.action === Share.sharedAction) {
        // App shared!
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const SETTINGS_ITEMS = [
    {
      key: "share",
      label: "Share App",
      hint: "Invite someone else into the experience.",
      iconFamily: AntDesign,
      iconName: "sharealt",
      iconSize: 22,
    },
    {
      key: "contact",
      label: "Contact Us",
      hint: "Reach out for help, feedback, or ideas.",
      iconFamily: FontAwesome,
      iconName: "send",
      iconSize: 20,
    },
    {
      key: "privacy",
      label: "Privacy Policy",
      hint: "See how the app handles data and consent.",
      iconFamily: MaterialIcons,
      iconName: "privacy-tip",
      iconSize: 22,
    },
    {
      key: "reviews",
      label: "Rate and Review",
      hint: "Help others discover the app.",
      iconFamily: MaterialIcons,
      iconName: "reviews",
      iconSize: 22,
    },
  ];

  const handlePress = (key) => {
    if (key === "share") return handleShare();
    if (key === "contact") return handleContactUs();
    if (key === "privacy") return Linking.openURL(`${globalConfig?.legal?.privacyBaseUrl}/cheezylines/privacy` || "https://mindcraftlearning.github.io/cheezy-lines");
    if (key === "reviews") return Linking.openURL(globalConfig?.socialLinks?.playStore || "https://destyastudio.com/products/cheezylines");
  };

  const renderIcon = (item, color) => {
    const IconComponent = item.iconFamily;
    return <IconComponent name={item.iconName} size={item.iconSize} color={color} />;
  };

  return (
    <LinearGradient colors={[colors.BACKGROUND, colors.DARK_INDIGO]} style={styles.screen}>
      <SafeAreaView
        style={[styles.safeArea, { paddingTop: insets.top + 8 }]}
        edges={["left", "right"]}
      >
        <View style={styles.header}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.heading}>
              Settings
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <Feather name="x" size={24} color={colors.TEXT} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Custom AI Settings */}
          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>
              Advanced Features
            </Text>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push("/ai-settings")}
              activeOpacity={0.85}
            >
              <View style={styles.iconWrap}>
                <AntDesign name="setting" size={22} color={colors.PRIMARY} />
              </View>
              <View style={styles.copyWrap}>
                <Text style={styles.label}>AI Magic Settings</Text>
                <Text style={styles.hint}>Configure your own Groq API key</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.MUTED} />
            </TouchableOpacity>
          </View>

          {/* Appearance */}
          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>
              Appearance
            </Text>
            <View style={styles.segmentWrap}>
              {['light', 'system', 'dark'].map((themeOpt) => {
                const isActive = themePreference === themeOpt;
                return (
                  <TouchableOpacity
                    key={themeOpt}
                    style={[styles.segmentButton, isActive && styles.segmentButtonActive]}
                    onPress={() => handleThemeChange(themeOpt)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                      {themeOpt.charAt(0).toUpperCase() + themeOpt.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Support and About */}
          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>
              Support & About
            </Text>

            {SETTINGS_ITEMS.map((item, index) => (
              <React.Fragment key={item.key}>
                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => handlePress(item.key)}
                  activeOpacity={0.85}
                >
                  <View style={styles.iconWrap}>
                    {renderIcon(item, colors.PRIMARY)}
                  </View>
                  <View style={styles.copyWrap}>
                    <Text style={styles.label}>{item.label}</Text>
                    <Text style={styles.hint}>{item.hint}</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={colors.MUTED} />
                </TouchableOpacity>
                {index < SETTINGS_ITEMS.length - 1 && (
                  <View style={styles.divider} />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* More Apps */}
          <View style={[styles.panel, { padding: 0, paddingBottom: 15, backgroundColor: 'transparent', borderColor: 'transparent' }]}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: 16, paddingTop: 16 }]}>
              More Apps from Destya Studio
            </Text>
            <CrossPromoHub />
          </View>
          
        </ScrollView>
        <View style={{ width: "100%", alignItems: "center", paddingBottom: insets.bottom || 20, gap: 12 }}>
          
          <TouchableOpacity
            activeOpacity={1}
            onPress={async () => {
              const now = Date.now();
              if (now - lastDevTapTime.current > 1000) {
                devTapCount.current = 1;
              } else {
                devTapCount.current += 1;
              }
              lastDevTapTime.current = now;
              
              if (devTapCount.current >= 5) {
                devTapCount.current = 0;
                hapticTap();
                setTimeout(() => hapticTap(), 150);

                try {
                  const nextAdState = !adConfig?.showAds;
                  setAdConfig(prev => ({ ...prev, showAds: nextAdState, showInterstitialAds: nextAdState, showAppOpenAds: nextAdState, showRewardedAds: nextAdState, showBannerAds: nextAdState }));
                  await AsyncStorage.setItem("ds_is_ad_free", String(!nextAdState));
                } catch (e) {
                  console.error("Dev toggle error", e);
                }
              }
            }}
          >
            <Text style={styles.versionText}>
              App Version: {Constants.expoConfig?.version || "1.1.4"}
            </Text>
          </TouchableOpacity>

          <BannerAdComponent />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
