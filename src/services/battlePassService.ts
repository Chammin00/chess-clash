import AsyncStorage from '@react-native-async-storage/async-storage';
import { BattlePassState, BattlePassTier } from '../types/monetization';
import { BATTLE_PASS_SEASON, BATTLE_PASS_TIERS } from '../config/monetization';
import { PlayerProfile } from '../types/mmr';
import { StorageService } from './storageService';

const BATTLE_PASS_STORAGE_KEY = '@aether_ascent_battle_pass';

export class BattlePassService {
  private static cachedState: BattlePassState | null = null;

  /**
   * Get current battle pass state
   */
  static async getBattlePassState(): Promise<BattlePassState> {
    if (this.cachedState) return this.cachedState;

    try {
      const data = await AsyncStorage.getItem(BATTLE_PASS_STORAGE_KEY);
      if (data) {
        this.cachedState = JSON.parse(data);
        return this.cachedState!;
      }
    } catch {
      // Fallback
    }

    const initial: BattlePassState = {
      seasonId: BATTLE_PASS_SEASON.seasonId,
      seasonName: BATTLE_PASS_SEASON.seasonName,
      seasonEndsAt: Date.now() + BATTLE_PASS_SEASON.durationDays * 24 * 60 * 60 * 1000,
      currentXp: 150,
      currentTier: 1,
      isPremiumUnlocked: false,
      claimedFreeTiers: [],
      claimedPremiumTiers: [],
    };

    await this.saveBattlePassState(initial);
    return initial;
  }

  /**
   * Save battle pass state to storage
   */
  static async saveBattlePassState(state: BattlePassState): Promise<void> {
    this.cachedState = state;
    try {
      await AsyncStorage.setItem(BATTLE_PASS_STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Failed saving battle pass state:', err);
    }
  }

  /**
   * Add XP to Battle Pass and calculate tier unlocks
   */
  static async addXp(
    amount: number
  ): Promise<{ state: BattlePassState; tiersGained: number }> {
    const state = await this.getBattlePassState();
    const oldTier = state.currentTier;
    const newXp = state.currentXp + amount;

    // Calculate current tier
    let newTier = 1;
    for (const tier of BATTLE_PASS_TIERS) {
      if (newXp >= tier.xpRequired) {
        newTier = Math.max(newTier, tier.tier + 1);
      }
    }
    newTier = Math.min(newTier, BATTLE_PASS_TIERS.length);

    const updated: BattlePassState = {
      ...state,
      currentXp: newXp,
      currentTier: newTier,
    };

    await this.saveBattlePassState(updated);
    return { state: updated, tiersGained: Math.max(0, newTier - oldTier) };
  }

  /**
   * Unlock Premium Battle Pass Track
   */
  static async unlockPremium(
    profile: PlayerProfile,
    isBundle: boolean = false
  ): Promise<{ success: boolean; error?: string; updatedProfile: PlayerProfile; state: BattlePassState }> {
    const costGems = isBundle
      ? BATTLE_PASS_SEASON.bundlePriceGems
      : BATTLE_PASS_SEASON.premiumPriceGems;

    if (profile.gems < costGems) {
      const state = await this.getBattlePassState();
      return { success: false, error: `Requires ${costGems} Gems!`, updatedProfile: profile, state };
    }

    const state = await this.getBattlePassState();
    let currentXp = state.currentXp;
    let currentTier = state.currentTier;

    if (isBundle) {
      currentXp += BATTLE_PASS_SEASON.bundleTiersGranted * BATTLE_PASS_SEASON.xpPerTier;
      currentTier = Math.min(BATTLE_PASS_TIERS.length, currentTier + BATTLE_PASS_SEASON.bundleTiersGranted);
    }

    const updatedState: BattlePassState = {
      ...state,
      currentXp,
      currentTier,
      isPremiumUnlocked: true,
    };

    const updatedProfile: PlayerProfile = {
      ...profile,
      gems: profile.gems - costGems,
      isSeasonPassPremium: true,
      avatarFrame: isBundle ? 'mythic_celestial' : profile.avatarFrame,
    };

    await this.saveBattlePassState(updatedState);
    await StorageService.saveProfile(updatedProfile);

    return { success: true, updatedProfile, state: updatedState };
  }

  /**
   * Claim reward for a specific tier
   */
  static async claimTierReward(
    tierNumber: number,
    track: 'free' | 'premium',
    profile: PlayerProfile
  ): Promise<{ success: boolean; error?: string; updatedProfile: PlayerProfile; state: BattlePassState }> {
    const state = await this.getBattlePassState();
    const tierConfig = BATTLE_PASS_TIERS.find((t) => t.tier === tierNumber);

    if (!tierConfig) {
      return { success: false, error: 'Tier does not exist', updatedProfile: profile, state };
    }

    if (state.currentTier < tierNumber) {
      return { success: false, error: 'Tier not yet unlocked!', updatedProfile: profile, state };
    }

    if (track === 'free' && state.claimedFreeTiers.includes(tierNumber)) {
      return { success: false, error: 'Free reward already claimed', updatedProfile: profile, state };
    }

    if (track === 'premium') {
      if (!state.isPremiumUnlocked) {
        return { success: false, error: 'Premium Pass not unlocked!', updatedProfile: profile, state };
      }
      if (state.claimedPremiumTiers.includes(tierNumber)) {
        return { success: false, error: 'Premium reward already claimed', updatedProfile: profile, state };
      }
    }

    const reward = track === 'free' ? tierConfig.freeReward : tierConfig.premiumReward;
    const updatedProfile: PlayerProfile = { ...profile };

    if (reward.type === 'gold') {
      updatedProfile.gold += reward.amount;
    } else if (reward.type === 'gems') {
      updatedProfile.gems += reward.amount;
    } else if (reward.type === 'card' && reward.itemId) {
      if (!updatedProfile.unlockedCardIds.includes(reward.itemId)) {
        updatedProfile.unlockedCardIds = [...updatedProfile.unlockedCardIds, reward.itemId];
      }
    }

    const updatedState: BattlePassState = {
      ...state,
      claimedFreeTiers: track === 'free' ? [...state.claimedFreeTiers, tierNumber] : state.claimedFreeTiers,
      claimedPremiumTiers: track === 'premium' ? [...state.claimedPremiumTiers, tierNumber] : state.claimedPremiumTiers,
    };

    await this.saveBattlePassState(updatedState);
    await StorageService.saveProfile(updatedProfile);

    return { success: true, updatedProfile, state: updatedState };
  }
}
