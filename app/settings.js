import {
  AntDesign,
  Feather,
  FontAwesome,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
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
import colors from "../constants/colors";
import { BannerAdComponent } from "../services/AdManager";
import { globalConfigContext } from "../context/AppContext";

export default function Settings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { globalConfig } = useContext(globalConfigContext);

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
    <LinearGradient colors={[colors.BACKGROUND, "#0A1128"]} style={styles.screen}>
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
        <View style={{ width: "100%", alignItems: "center", paddingBottom: insets.bottom || 20 }}>
          <BannerAdComponent />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
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
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderColor: "rgba(255, 255, 255, 0.08)",
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
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
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
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginVertical: 4,
    marginHorizontal: 12,
  },
});
