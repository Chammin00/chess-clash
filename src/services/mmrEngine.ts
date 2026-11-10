import { RankTier, TierInfo } from '../types/mmr';

export interface MmrCalculationResult {
  change: number;          // Net change after differential and decay
  grossDelta: number;      // Change before decay (e.g. +300 or -400)
  decay: number;           // Decay points subtracted (e.g. 50)
  oldMmr: number;
  newMmr: number;
  oldTier: RankTier;
  newTier: RankTier;
  tierChange: 'promoted' | 'demoted' | 'none';
  tierStepDelta: number;   // e.g. +1, -1, 0
  streakBonus: boolean;
}

export const TIER_CONFIG: Record<
  RankTier,
  {
    minMmr: number;
    maxMmr: number;
    badgeColor: string;
    badgeIcon: string;
    order: number;
  }
> = {
  Bronze: { minMmr: 1500, maxMmr: 1999, badgeColor: '#CD7F32', badgeIcon: '🥉', order: 1 },
  Silver: { minMmr: 2000, maxMmr: 2499, badgeColor: '#94A3B8', badgeIcon: '🥈', order: 2 },
  Gold: { minMmr: 2500, maxMmr: 2999, badgeColor: '#F59E0B', badgeIcon: '🥇', order: 3 },
  Platinum: { minMmr: 3000, maxMmr: 3499, badgeColor: '#14B8A6', badgeIcon: '🛡️', order: 4 },
  Diamond: { minMmr: 3500, maxMmr: 3999, badgeColor: '#38BDF8', badgeIcon: '🔷', order: 5 },
  Champion: { minMmr: 4000, maxMmr: 4499, badgeColor: '#8B5CF6', badgeIcon: '⚔️', order: 6 },
  Legend: { minMmr: 4500, maxMmr: 4999, badgeColor: '#EC4899', badgeIcon: '🌟', order: 7 },
  Master: { minMmr: 5000, maxMmr: 5499, badgeColor: '#A855F7', badgeIcon: '🔮', order: 8 },
  Grandmaster: { minMmr: 5500, maxMmr: 5999, badgeColor: '#EF4444', badgeIcon: '👑', order: 9 },
  Sage: { minMmr: 6000, maxMmr: 6499, badgeColor: '#10B981', badgeIcon: '🧙‍♂️', order: 10 },
};

export const ORDERED_TIERS: RankTier[] = [
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Diamond',
  'Champion',
  'Legend',
  'Master',
  'Grandmaster',
  'Sage',
];

export class MmrEngine {
  public static readonly INITIAL_MMR = 1500;
  public static readonly DEFAULT_DECAY = 50;
  public static readonly MIN_MMR = 1000;
  public static readonly MAX_MMR = 6499;

  /**
   * Calculate rating change after a match using Slay the Spire replica MMR formula:
   * 1. Win/Loss Differential:
   *    - Difference between player MMR and opponent MMR
   *    - Win awards differential (with baseline protection for lower-rated foes)
   *    - Loss subtracts differential (with baseline floor)
   * 2. MMR Decay:
   *    - Decays by 50 points per match / inactivity rust
   * 3. MMR Cap:
   *    - Capped at maximum rank threshold (6499 Sage)
   */
  static calculateMmrChange(
    playerMmr: number,
    opponentMmr: number,
    won: boolean,
    totalMatches: number = 0,
    winStreak: number = 0,
    applyDecay: boolean = true,
    decayAmount: number = this.DEFAULT_DECAY
  ): MmrCalculationResult {
    const diff = opponentMmr - playerMmr;
    let grossDelta = 0;

    if (won) {
      // If opponent has higher MMR, award full differential (e.g. 1800 vs 1500 -> +300)
      if (diff > 0) {
        grossDelta = diff;
      } else {
        // Base win reward when defeating an equal or lower-rated opponent
        grossDelta = Math.max(25, 40 + Math.round(diff * 0.15));
      }

      // Streak bonus for mobile retention
      if (winStreak >= 3) {
        const streakMultiplier = winStreak >= 5 ? 1.3 : 1.15;
        grossDelta = Math.round(grossDelta * streakMultiplier);
      }
    } else {
      // If opponent has higher MMR (loss differential, e.g. 2200 vs 1800 -> -400)
      if (diff > 0) {
        grossDelta = -diff;
      } else {
        // Defeat against lower opponent penalizes heavier
        grossDelta = Math.min(-35, -Math.abs(diff) - 30);
      }
    }

    const decay = applyDecay ? decayAmount : 0;
    const netChange = grossDelta - decay;

    // Calculate final MMR with boundaries
    let calculatedMmr = playerMmr + netChange;
    calculatedMmr = Math.max(this.MIN_MMR, Math.min(this.MAX_MMR, calculatedMmr));

    const oldTierInfo = this.getTierInfo(playerMmr);
    const newTierInfo = this.getTierInfo(calculatedMmr);

    const oldOrder = TIER_CONFIG[oldTierInfo.tier].order;
    const newOrder = TIER_CONFIG[newTierInfo.tier].order;
    const tierStepDelta = newOrder - oldOrder;

    let tierChange: 'promoted' | 'demoted' | 'none' = 'none';
    if (tierStepDelta > 0) {
      tierChange = 'promoted';
    } else if (tierStepDelta < 0) {
      tierChange = 'demoted';
    }

    return {
      change: netChange,
      grossDelta,
      decay,
      oldMmr: playerMmr,
      newMmr: calculatedMmr,
      oldTier: oldTierInfo.tier,
      newTier: newTierInfo.tier,
      tierChange,
      tierStepDelta,
      streakBonus: won && winStreak >= 3,
    };
  }

  /**
   * Get rank tier info and division for a given MMR
   */
  static getTierInfo(mmr: number): TierInfo {
    // Sage (Highest Tier)
    if (mmr >= 6000) {
      return {
        tier: 'Sage',
        division: 1,
        minMmr: 6000,
        maxMmr: 6499,
        badgeColor: TIER_CONFIG.Sage.badgeColor,
        badgeIcon: TIER_CONFIG.Sage.badgeIcon,
      };
    }

    // Grandmaster
    if (mmr >= 5500) {
      return {
        tier: 'Grandmaster',
        division: 1,
        minMmr: 5500,
        maxMmr: 5999,
        badgeColor: TIER_CONFIG.Grandmaster.badgeColor,
        badgeIcon: TIER_CONFIG.Grandmaster.badgeIcon,
      };
    }

    // Master
    if (mmr >= 5000) {
      return {
        tier: 'Master',
        division: 1,
        minMmr: 5000,
        maxMmr: 5499,
        badgeColor: TIER_CONFIG.Master.badgeColor,
        badgeIcon: TIER_CONFIG.Master.badgeIcon,
      };
    }

    // Legend
    if (mmr >= 4500) {
      const div = 4 - Math.min(3, Math.floor((mmr - 4500) / 125));
      return {
        tier: 'Legend',
        division: div,
        minMmr: 4500,
        maxMmr: 4999,
        badgeColor: TIER_CONFIG.Legend.badgeColor,
        badgeIcon: TIER_CONFIG.Legend.badgeIcon,
      };
    }

    // Champion
    if (mmr >= 4000) {
      const div = 4 - Math.min(3, Math.floor((mmr - 4000) / 125));
      return {
        tier: 'Champion',
        division: div,
        minMmr: 4000,
        maxMmr: 4499,
        badgeColor: TIER_CONFIG.Champion.badgeColor,
        badgeIcon: TIER_CONFIG.Champion.badgeIcon,
      };
    }

    // Diamond
    if (mmr >= 3500) {
      const div = 4 - Math.min(3, Math.floor((mmr - 3500) / 125));
      return {
        tier: 'Diamond',
        division: div,
        minMmr: 3500,
        maxMmr: 3999,
        badgeColor: TIER_CONFIG.Diamond.badgeColor,
        badgeIcon: TIER_CONFIG.Diamond.badgeIcon,
      };
    }

    // Platinum
    if (mmr >= 3000) {
      const div = 4 - Math.min(3, Math.floor((mmr - 3000) / 125));
      return {
        tier: 'Platinum',
        division: div,
        minMmr: 3000,
        maxMmr: 3499,
        badgeColor: TIER_CONFIG.Platinum.badgeColor,
        badgeIcon: TIER_CONFIG.Platinum.badgeIcon,
      };
    }

    // Gold
    if (mmr >= 2500) {
      const div = 4 - Math.min(3, Math.floor((mmr - 2500) / 125));
      return {
        tier: 'Gold',
        division: div,
        minMmr: 2500,
        maxMmr: 2999,
        badgeColor: TIER_CONFIG.Gold.badgeColor,
        badgeIcon: TIER_CONFIG.Gold.badgeIcon,
      };
    }

    // Silver
    if (mmr >= 2000) {
      const div = 4 - Math.min(3, Math.floor((mmr - 2000) / 125));
      return {
        tier: 'Silver',
        division: div,
        minMmr: 2000,
        maxMmr: 2499,
        badgeColor: TIER_CONFIG.Silver.badgeColor,
        badgeIcon: TIER_CONFIG.Silver.badgeIcon,
      };
    }

    // Bronze (Starting Tier: 1500 - 1999)
    const div = 4 - Math.min(3, Math.floor(Math.max(0, mmr - 1500) / 125));
    return {
      tier: 'Bronze',
      division: Math.max(1, div),
      minMmr: 1500,
      maxMmr: 1999,
      badgeColor: TIER_CONFIG.Bronze.badgeColor,
      badgeIcon: TIER_CONFIG.Bronze.badgeIcon,
    };
  }

  /**
   * Get progress percent (0-100) towards next rank tier
   */
  static getProgressToNextTier(mmr: number): { percent: number; current: number; target: number; nextTierName?: string } {
    const tier = this.getTierInfo(mmr);
    const range = tier.maxMmr - tier.minMmr;
    const progress = Math.min(100, Math.max(0, Math.round(((mmr - tier.minMmr) / range) * 100)));
    
    const currentOrder = TIER_CONFIG[tier.tier].order;
    const nextTier = ORDERED_TIERS.find(t => TIER_CONFIG[t].order === currentOrder + 1);

    return {
      percent: progress,
      current: mmr,
      target: tier.maxMmr + 1,
      nextTierName: nextTier,
    };
  }

  /**
   * Roman numeral helper for division display
   */
  static getDivisionRoman(division: number): string {
    switch (division) {
      case 1: return 'I';
      case 2: return 'II';
      case 3: return 'III';
      case 4: return 'IV';
      default: return 'I';
    }
  }
}
