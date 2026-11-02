import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from "./NativeBannerAd";
import { getAdUnitId } from "../services/AdManager";

export default function InlineNativeAd({ adConfig, containerStyle }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !adConfig?.showBannerAds) return null;

  return (
    <View style={[styles.container, containerStyle]}>
      <BannerAd
        unitId={getAdUnitId("banner", adConfig?.testAds)}
        size={BannerAdSize.MEDIUM_RECTANGLE}
        onAdFailedToLoad={(error) => {
          console.warn("Inline Ad failed to load", error);
          setHasError(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});

