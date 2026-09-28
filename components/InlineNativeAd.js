import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from "./NativeBannerAd";
import { getAdUnitId } from "../services/AdManager";
import { useThemeColors } from "../constants/colors";

export default function InlineNativeAd({ adConfig, containerStyle }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const colors = useThemeColors();

  const styles = React.useMemo(() => StyleSheet.create({
    hiddenContainer: {
      position: 'absolute',
      top: -1000,
      opacity: 0,
      overflow: 'hidden',
    },
    inlineAdContainer: {
      backgroundColor: colors.CARD_BG,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.CARD_BORDER,
      elevation: 3,
      shadowColor: colors.SHADOW,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      paddingVertical: 15,
      paddingHorizontal: 10,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    sponsoredText: {
      fontFamily: "Poppins-Bold",
      color: colors.MUTED,
      fontSize: 11,
      marginBottom: 8,
      alignSelf: "flex-start",
      marginLeft: 10,
    },
  }), [colors]);

  if (hasError) return null;

  return (
    <View style={isLoaded ? [styles.inlineAdContainer, containerStyle] : styles.hiddenContainer}>
      {isLoaded && <Text style={styles.sponsoredText}>Sponsored</Text>}
      <BannerAd
        unitId={getAdUnitId("banner", adConfig?.testAds)}
        size={BannerAdSize.MEDIUM_RECTANGLE}
        onAdLoaded={() => setIsLoaded(true)}
        onAdFailedToLoad={(error) => {
          console.log("Inline Ad failed to load", error);
          setHasError(true);
        }}
      />
    </View>
  );
}

