import { PlayerProfile } from '../types/mmr';
import { IAPProduct, CrateOpeningResult, DailyDealItem } from '../types/monetization';
import { IAP_PRODUCTS, CRATE_CONFIGS, INITIAL_DAILY_DEALS } from '../config/monetization';
import { CARD_COLLECTION } from '../config/cards';
import { StorageService } from './storageService';

export class MonetizationService {
  /**
   * Process an In-App Purchase (IAP)
   * In local/Expo preview mode, this immediately verifies and fulfills the transaction.
   * Can be connected directly to react-native-iap / expo-in-app-purchases in production.
   */
  static async purchaseProduct(
    productId: string,
    profile: PlayerProfile
  ): Promise<{ success: boolean; message: string; updatedProfile: PlayerProfile }> {
    const product = IAP_PRODUCTS.find((p) => p.id === productId);
    if (!product) {
      return { success: false, message: 'Product not found', updatedProfile: profile };
    }

    const updated: PlayerProfile = { ...profile };

    switch (productId) {
      case 'com.aether.gems.tier1':
        updated.gems += 80;
        break;
      case 'com.aether.gems.tier2':
        updated.gems += 550; // 500 + 50 bonus
        break;
      case 'com.aether.gems.tier3':
        updated.gems += 1400; // 1200 + 200 bonus
        break;
      case 'com.aether.gems.tier4':
        updated.gems += 4000; // 3200 + 800 bonus
        break;
      case 'com.aether.starter_pack':
        if (updated.starterPackPurchased) {
          return { success: false, message: 'Starter Pack already claimed!', updatedProfile: profile };
        }
        updated.starterPackPurchased = true;
        updated.gems += 500;
        updated.gold += 2500;
        updated.avatarFrame = 'legendary_gold';
        // Unlock Dawn Valkyrie card if not owned
        if (!updated.unlockedCardIds.includes('dawn_valkyrie')) {
          updated.unlockedCardIds = [...updated.unlockedCardIds, 'dawn_valkyrie'];
        }
        break;
      case 'com.aether.supporter_club':
        updated.hasNoAds = true;
        updated.avatarFrame = 'vip_crest';
        break;
      case 'com.aether.vip_subscription':
        updated.isVip = true;
        updated.hasNoAds = true;
        updated.gems += 300;
        updated.vipExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
        break;
      default:
        break;
    }

    await StorageService.saveProfile(updated);
    return {
      success: true,
      message: `Successfully purchased ${product.title}!`,
      updatedProfile: updated,
    };
  }

  /**
   * Unlock Piggy Bank / Spire Vault for $1.99
   */
  static async unlockPiggyBank(
    profile: PlayerProfile
  ): Promise<{ success: boolean; gemsAwarded: number; updatedProfile: PlayerProfile }> {
    const gemsToClaim = profile.piggyBankGems || 350;
    const updated: PlayerProfile = {
      ...profile,
      gems: profile.gems + gemsToClaim,
      piggyBankGems: 0,
    };

    await StorageService.saveProfile(updated);
    return { success: true, gemsAwarded: gemsToClaim, updatedProfile: updated };
  }

  /**
   * Add bonus gems to the player's Piggy Bank on match / Spire floor completion
   */
  static async addPiggyBankGems(profile: PlayerProfile, amount: number): Promise<PlayerProfile> {
    const current = profile.piggyBankGems || 0;
    const maxCapacity = 500;
    const nextAmount = Math.min(maxCapacity, current + amount);
    const updated: PlayerProfile = { ...profile, piggyBankGems: nextAmount };
    await StorageService.saveProfile(updated);
    return updated;
  }

  /**
   * Open a Gacha Crate (Novice, Heroic, Mythic) with Pity & RNG guarantees
   */
  static async openCrate(
    crateId: string,
    profile: PlayerProfile
  ): Promise<{ success: boolean; result?: CrateOpeningResult; error?: string; updatedProfile: PlayerProfile }> {
    const crate = CRATE_CONFIGS.find((c) => c.id === crateId);
    if (!crate) {
      return { success: false, error: 'Crate not found', updatedProfile: profile };
    }

    // Check currency
    if (crate.goldCost > 0 && profile.gold < crate.goldCost) {
      return { success: false, error: 'Insufficient Gold!', updatedProfile: profile };
    }
    if (crate.gemCost > 0 && profile.gems < crate.gemCost) {
      return { success: false, error: 'Insufficient Gems!', updatedProfile: profile };
    }

    const updatedProfile: PlayerProfile = {
      ...profile,
      gold: profile.gold - crate.goldCost,
      gems: profile.gems - crate.gemCost,
    };

    // Calculate Pity
    let pity = profile.pityCounter || 0;
    pity += crate.pityWeight;
    let isPityTriggered = false;

    // Determine card rewards
    const cardsUnlocked: CrateOpeningResult['cardsUnlocked'] = [];
    const pool = CARD_COLLECTION;

    for (let i = 0; i < crate.dropCount; i++) {
      let cardRarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
      const roll = Math.random();

      if (crateId === 'crate_mythic') {
        if (pity >= 10 || roll < 0.35) {
          cardRarity = 'legendary';
          if (pity >= 10) isPityTriggered = true;
          pity = 0;
        } else {
          cardRarity = 'epic';
        }
      } else if (crateId === 'crate_heroic') {
        if (roll < 0.1) cardRarity = 'legendary';
        else if (roll < 0.4) cardRarity = 'epic';
        else cardRarity = 'rare';
      } else {
        if (roll < 0.25) cardRarity = 'rare';
        else cardRarity = 'common';
      }

      const matchingCards = pool.filter((c) => c.rarity === cardRarity);
      const chosen = matchingCards.length > 0 
        ? matchingCards[Math.floor(Math.random() * matchingCards.length)]
        : pool[Math.floor(Math.random() * pool.length)];

      cardsUnlocked.push({
        id: chosen.id,
        name: chosen.name,
        rarity: chosen.rarity,
        cost: chosen.power || chosen.cost || 0,
        type: chosen.type,
      });

      // Add to player unlocked cards
      if (!updatedProfile.unlockedCardIds.includes(chosen.id)) {
        updatedProfile.unlockedCardIds = [...updatedProfile.unlockedCardIds, chosen.id];
      }
    }

    // Bonus gold from crate
    const goldEarned = Math.floor(Math.random() * (crate.maxGold - crate.minGold + 1)) + crate.minGold;
    updatedProfile.gold += goldEarned;
    updatedProfile.pityCounter = pity;

    await StorageService.saveProfile(updatedProfile);

    const result: CrateOpeningResult = {
      crateTitle: crate.title,
      goldEarned,
      gemsEarned: crateId === 'crate_mythic' ? 25 : 0,
      cardsUnlocked,
      isPityTriggered,
    };

    return { success: true, result, updatedProfile };
  }

  /**
   * Purchase a Daily Deal item
   */
  static async purchaseDailyDeal(
    deal: DailyDealItem,
    profile: PlayerProfile
  ): Promise<{ success: boolean; error?: string; updatedProfile: PlayerProfile }> {
    if (deal.currency === 'gold' && profile.gold < deal.price) {
      return { success: false, error: 'Not enough Gold!', updatedProfile: profile };
    }
    if (deal.currency === 'gems' && profile.gems < deal.price) {
      return { success: false, error: 'Not enough Gems!', updatedProfile: profile };
    }

    const updated: PlayerProfile = {
      ...profile,
      gold: deal.currency === 'gold' ? profile.gold - deal.price : profile.gold,
      gems: deal.currency === 'gems' ? profile.gems - deal.price : profile.gems,
    };

    if (deal.type === 'card' && deal.targetId) {
      if (!updated.unlockedCardIds.includes(deal.targetId)) {
        updated.unlockedCardIds = [...updated.unlockedCardIds, deal.targetId];
      }
    } else if (deal.type === 'gold_pack') {
      updated.gold += 1000;
    }

    await StorageService.saveProfile(updated);
    return { success: true, updatedProfile: updated };
  }
}
