import { Platform } from 'react-native';

/**
 * Google AdMob Official Test Ad Unit IDs
 * Use these during development to avoid policy violations.
 * Replace with your real AdMob Ad Unit IDs before production release.
 */
export const AD_CONFIG = {
  APP_ID: {
    android: 'ca-app-pub-3940256099942544~3347511713',
    ios: 'ca-app-pub-3940256099942544~1458602516',
  },
  BANNER_ID: Platform.select({
    android: 'ca-app-pub-3940256099942544/6300978111',
    ios: 'ca-app-pub-3940256099942544/2934735716',
    default: 'ca-app-pub-3940256099942544/6300978111',
  }),
  INTERSTITIAL_ID: Platform.select({
    android: 'ca-app-pub-3940256099942544/1033173712',
    ios: 'ca-app-pub-3940256099942544/4411468910',
    default: 'ca-app-pub-3940256099942544/1033173712',
  }),
  REWARDED_ID: Platform.select({
    android: 'ca-app-pub-3940256099942544/5224354917',
    ios: 'ca-app-pub-3940256099942544/1712485313',
    default: 'ca-app-pub-3940256099942544/5224354917',
  }),
  FREQUENCY_RULES: {
    MATCHES_BETWEEN_INTERSTITIALS: 3,
    MIN_SECONDS_BETWEEN_INTERSTITIALS: 90,
  },
  REWARDS: {
    POST_MATCH_BONUS_GOLD: 100,
    SHOP_DAILY_FREE_PACK_ADS: 3,
  },
};
