import { AD_CONFIG } from '../config/ads';
import { PlayerProfile } from '../types/mmr';

export type AdType = 'banner' | 'interstitial' | 'rewarded';

export interface AdWatchResult {
  rewardEarned: boolean;
  type: AdType;
  rewardAmount?: number;
}

export class AdService {
  private static matchCountSinceLastAd: number = 0;
  private static lastInterstitialTime: number = 0;

  /**
   * Called whenever a match or floor finishes to determine if an interstitial should show.
   * Never shows if the player has purchased No-Ads or has active VIP!
   */
  static shouldShowInterstitial(profile?: PlayerProfile | null): boolean {
    if (profile?.hasNoAds || profile?.isVip) {
      return false;
    }

    this.matchCountSinceLastAd++;
    const now = Date.now();
    const elapsedSeconds = (now - this.lastInterstitialTime) / 1000;

    if (
      this.matchCountSinceLastAd >= AD_CONFIG.FREQUENCY_RULES.MATCHES_BETWEEN_INTERSTITIALS &&
      elapsedSeconds >= AD_CONFIG.FREQUENCY_RULES.MIN_SECONDS_BETWEEN_INTERSTITIALS
    ) {
      return true;
    }
    return false;
  }

  /**
   * Reset interstitial counter after displaying
   */
  static markInterstitialShown(): void {
    this.matchCountSinceLastAd = 0;
    this.lastInterstitialTime = Date.now();
  }

  /**
   * Checks whether the user can bypass video playback and immediately claim reward
   */
  static canClaimInstantVip(profile?: PlayerProfile | null): boolean {
    return !!(profile?.hasNoAds || profile?.isVip);
  }
}
