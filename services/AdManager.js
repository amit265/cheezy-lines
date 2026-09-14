import React, { useContext, useEffect, useRef, useState } from "react";
import { AppState, View, Platform } from "react-native";
import {
  AdEventType,
  AppOpenAd,
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "react-native-google-mobile-ads";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { adConfigContext, adFreeContext } from "../context/AppContext";

// ✅ Helper to get ad unit IDs based on test mode
export const getAdUnitId = (type, testAds) => {
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
    rewarded: testAds
      ? TestIds.REWARDED
      : "ca-app-pub-7433519007687449/9302071640",
    nativeAdvanced: testAds
      ? TestIds.NATIVE
      : "ca-app-pub-7433519007687449/2204250645",
  };
  return adUnitIds[type];
};

// ✅ Ad references
let interstitialAd;
let appOpenAd;
export let rewardedAd;

const AdManager = () => {
  const { adConfig, setAdConfig } = useContext(adConfigContext);
  const { isAdFree } = useContext(adFreeContext);
  let interstitialJustShown = false;
  const appPauseCount = useRef(0); // ✅ Track app pause count
  const stopAppOpenAds = useRef(false); // ✅ Flag to stop ads if needed

  // ✅ Handle app state changes for open app ads
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && !interstitialJustShown) {
        // ✅ Increment pause count
        appPauseCount.current += 1;

        // ✅ Show AppOpenAd every second pause, provided ads aren't suppressed
        if (
          !isAdFree &&
          appPauseCount.current % adConfig?.appOpenAdFrequency === 0 && // Show ad every second pause
          adConfig.showAppOpenAds &&
          appOpenAd?.loaded
        ) {
          appOpenAd.show();
        }
      }

      // ✅ Ensure interstitial doesn't interfere with counting
      interstitialJustShown = false;
    });

    return () => subscription.remove();
  }, [adConfig]);

  // ✅ Request Tracking Permission on iOS, then load ads
  useEffect(() => {
    const initAds = async () => {
      try {
        if (Platform.OS === "ios") {
          // Request tracking consent
          await requestTrackingPermissionsAsync();
        }
      } catch (err) {
        console.warn("Error requesting tracking permissions:", err);
      }
      loadAds(adConfig);
    };

    initAds();
  }, [adConfig]);

  // ✅ Load Ads
  let isRewardedAdLoading = false;
  const loadAds = (config) => {
    if (isRewardedAdLoading) return;

    // console.log("Loading Ads with config:", config);

    isRewardedAdLoading = true;
    setTimeout(() => (isRewardedAdLoading = false), 5000);

    // ✅ Create ads with updated ad unit IDs
    interstitialAd = InterstitialAd.createForAdRequest(
      getAdUnitId("interstitial", config.testAds)
    );
    appOpenAd = AppOpenAd.createForAdRequest(
      getAdUnitId("appOpen", config.testAds)
    );
    rewardedAd = RewardedAd.createForAdRequest(
      getAdUnitId("rewarded", config.testAds)
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

    // ✅ Rewarded Ad
    rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () =>
      console.log("Rewarded Ad Loaded!")
    );
    rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      if (!rewardedAd?.loaded) rewardedAd.load();
    });
    
    rewardedAd.load();
  };

  return null;
};

// ✅ Functions to Show Ads
export const showInterstitialAd = (adConfig, isAdFree) => {
  if (isAdFree) return;
  if (interstitialAd?.loaded && adConfig.showInterstitialAds) {
    interstitialAd.show();
    interstitialAd.load();
  } else {
    interstitialAd?.load();
  }
};

export const showRewardedAd = (adConfig, onReward, onAdFreeUnlock) => {
  if (!adConfig?.showRewardedAds) {
    return Promise.reject("Rewarded Ads disabled");
  }

  return new Promise((resolve, reject) => {
    try {
      if (rewardedAd?.loaded) {
        let earned = false;

        const rewardListener = rewardedAd.addAdEventListener(
          RewardedAdEventType.EARNED_REWARD,
          (reward) => {
            earned = true;
            if (onReward) onReward(reward);
            // 15 minutes of ad-free time
            const until = Date.now() + 15 * 60 * 1000;
            AsyncStorage.setItem("ad_free_until", until.toString())
              .then(() => {
                if (onAdFreeUnlock) onAdFreeUnlock(until);
              })
              .catch((err) => console.error("Error setting ad_free_until:", err));
          }
        );

        const closeListener = rewardedAd.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            rewardListener();
            closeListener();
            rewardedAd.load();
            if (earned) {
              resolve(true);
            } else {
              reject(new Error("USER_CANCELED"));
            }
          }
        );

        rewardedAd.show();
      } else {
        rewardedAd?.load();
        reject(new Error("Rewarded Ad not loaded yet. Try again later."));
      }
    } catch (e) {
      reject(e);
    }
  });
};

// ✅ Banner Ad Component
export const BannerAdComponent = () => {
  const { adConfig } = useContext(adConfigContext);
  const { isAdFree } = useContext(adFreeContext);

  const [isAdLoaded, setIsAdLoaded] = useState(false);

  if (isAdFree || !adConfig.showBannerAds) return null;

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
