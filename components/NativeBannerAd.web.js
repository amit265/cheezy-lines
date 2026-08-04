import React, { useEffect } from 'react';

// On web, Google Mobile Ads are not available.
// BannerAd immediately fires onAdFailedToLoad so the AdCard hides itself cleanly.
export const BannerAd = ({ onAdFailedToLoad }) => {
  useEffect(() => {
    if (onAdFailedToLoad) onAdFailedToLoad(new Error('Ads not supported on web'));
  }, []);
  return null;
};

export const BannerAdSize = { MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE', ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER' };
