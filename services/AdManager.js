import React, { useContext, useEffect, useRef, useState } from "react";
import { AppState, View } from "react-native";
import {
  AdEventType,
  AppOpenAd,
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";
import { adConfigContext } from "../context/AppContext";

// ✅ Helper to get ad unit IDs based on test mode
const getAdUnitId = (type, testAds) => {
  const adUnitIds = {
    banner: testAds
      ? TestIds.ADAPTIVE_BANNER
      : "ca-app-pub-7433519007687449/8440687637",
    interstitial: testAds
      ? TestIds.INTERSTITIAL
      : "ca-app-pub-7433519007687449/9290734877",
    appOpen: testAds
      ? TestIds.APP_OPEN
      : "ca-app-pub-7433519007687449/2418512250",
    nativeAdvanced: testAds
      ? TestIds.NATIVE
      : "ca-app-pub-7433519007687449/2204250645",
  };
  return adUnitIds[type];
};

// ✅ Ad references
let interstitialAd;
let appOpenAd;

const AdManager = () => {
  const { adConfig, setAdConfig } = useContext(adConfigContext);
  let interstitialJustShown = false;
  const appPauseCount = useRef(0); // ✅ Track app pause count
  const stopAppOpenAds = useRef(false); // ✅ Flag to stop ads if needed

  // ✅ Handle app state changes for open app ads
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && !interstitialJustShown) {
        // ✅ Increment pause count
        appPauseCount.current += 1;

        console.log(`App Resume Count: ${appPauseCount.current}`);

        // ✅ Show AppOpenAd every second pause
        if (
          appPauseCount.current % adConfig?.appOpenAdFrequency === 0 && // Show ad every second pause
          adConfig.showAppOpenAds &&
          appOpenAd?.loaded
        ) {
          console.log("Showing App Open Ad");
          appOpenAd.show();
        }
      }

      // ✅ Ensure interstitial doesn't interfere with counting
      interstitialJustShown = false;
    });

    return () => subscription.remove();
  }, [adConfig]);

  // ✅ Load ads when config changes
  useEffect(() => {
    loadAds(adConfig);
  }, [adConfig]);

  // ✅ Load Ads
  let isRewardedAdLoading = false;
  const loadAds = (config) => {
    if (isRewardedAdLoading) return;

    console.log("Loading Ads with config:", config);

    isRewardedAdLoading = true;
    setTimeout(() => (isRewardedAdLoading = false), 5000);

    // ✅ Create ads with updated ad unit IDs
    interstitialAd = InterstitialAd.createForAdRequest(
      getAdUnitId("interstitial", config.testAds)
    );
    appOpenAd = AppOpenAd.createForAdRequest(
      getAdUnitId("appOpen", config.testAds)
    );

    // ✅ Interstitial Ad
    interstitialAd.addAdEventListener(AdEventType.LOADED, () =>
      console.log("Interstitial Ad Loaded!")
    );
    interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      interstitialJustShown = true;
      interstitialAd.load();
    });

    interstitialAd.load();

    // ✅ App Open Ad
    appOpenAd.addAdEventListener(AdEventType.LOADED, () =>
      console.log("App Open Ad Loaded!")
    );
    appOpenAd.addAdEventListener(AdEventType.CLOSED, () =>
      setTimeout(() => appOpenAd.load(), 3000)
    );

    appOpenAd.load();
  };

  return null;
};

// ✅ Functions to Show Ads
export const showInterstitialAd = (adConfig) => {
  if (interstitialAd?.loaded && adConfig.showInterstitialAds) {
    interstitialAd.show();
    interstitialAd.load();
  } else {
    console.log("Interstitial Ad not ready");
    interstitialAd.load();
  }
};

// export const showAppOpenAd = (adConfig) => {
//   if ( !adConfig.showOpenAppAds) return;
//   if (appOpenAd?.loaded) {
//     appOpenAd.show();
//     appOpenAd.load();
//   } else {
//     console.log("App Open Ad not ready");
//     appOpenAd.load();
//   }
// };

// ✅ Banner Ad Component
export const BannerAdComponent = () => {
  const { adConfig } = useContext(adConfigContext);

  const [isAdLoaded, setIsAdLoaded] = useState(false);

  if (!adConfig.showBannerAds) return null;

  return (
    <View
      style={{
        opacity: isAdLoaded ? 1 : 0,
        height: isAdLoaded ? undefined : 0,
      }}
    >
      <BannerAd
        unitId={getAdUnitId("banner", adConfig.testAds)}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdLoaded={() => setIsAdLoaded(true)}
        onAdFailedToLoad={(error) => console.error("Banner Ad Error:", error)}
      />
    </View>
  );
};

export default AdManager;
