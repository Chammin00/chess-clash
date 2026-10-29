export type CurrencyType = 'gold' | 'gems';

export interface IAPProduct {
  id: string;
  title: string;
  description: string;
  priceUsd: string;
  type: 'consumable' | 'non_consumable' | 'subscription';
  gemAmount?: number;
  bonusGems?: number;
  goldAmount?: number;
  icon: string;
  badge?: string;
  discountPct?: number;
}

export interface PiggyBankState {
  currentGems: number;
  capacity: number;
  priceUsd: string;
  isUnlocked: boolean;
}

export interface VipStatus {
  isVip: boolean;
  hasNoAds: boolean;
  vipExpiresAt?: number;
  dailyClaimDate?: string;
}

export interface StarterPackState {
  purchased: boolean;
  expiresAt: number;
  priceUsd: string;
}

export interface BattlePassReward {
  type: 'gold' | 'gems' | 'crate' | 'card' | 'relic' | 'cosmetic';
  amount: number;
  itemId?: string;
  label: string;
  icon: string;
}

export interface BattlePassTier {
  tier: number;
  xpRequired: number;
  freeReward: BattlePassReward;
  premiumReward: BattlePassReward;
}

export interface BattlePassState {
  seasonId: string;
  seasonName: string;
  seasonEndsAt: number;
  currentXp: number;
  currentTier: number;
  isPremiumUnlocked: boolean;
  claimedFreeTiers: number[];
  claimedPremiumTiers: number[];
}

export interface DailyDealItem {
  id: string;
  title: string;
  type: 'card' | 'gold_pack' | 'energy_refill';
  targetId?: string;
  price: number;
  currency: CurrencyType;
  discountPct: number;
  icon: string;
  purchased: boolean;
}

export interface CrateOpeningResult {
  crateTitle: string;
  goldEarned: number;
  gemsEarned: number;
  cardsUnlocked: {
    id: string;
    name: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    cost: number;
    type: string;
  }[];
  isPityTriggered?: boolean;
}
