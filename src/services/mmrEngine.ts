import { RankTier, TierInfo } from '../types/mmr';

export class MmrEngine {
  /**
   * Calculate expected score using the standard Elo formula
   */
  static getExpectedScore(playerMmr: number, opponentMmr: number): number {
    return 1 / (1 + Math.pow(10, (opponentMmr - playerMmr) / 400));
  }

  /**
   * Determine dynamic K-factor based on player matches played and rating
   */
  static getKFactor(totalMatches: number, currentMmr: number): number {
    if (totalMatches < 10) return 40; // Placement phase
    if (currentMmr >= 2400) return 16; // Elite tier
    if (currentMmr >= 1800) return 24; // High tier
    return 32; // Normal ladder
  }

  /**
   * Calculate rating change after a match
   */
  static calculateMmrChange(
    playerMmr: number,
    opponentMmr: number,
    won: boolean,
    totalMatches: number = 20,
    winStreak: number = 0
  ): { change: number; newMmr: number; streakBonus: boolean } {
    const expected = this.getExpectedScore(playerMmr, opponentMmr);
    const actual = won ? 1 : 0;
    const k = this.getKFactor(totalMatches, playerMmr);

    let rawDelta = Math.round(k * (actual - expected));

    // Minimum gain on win is +12, maximum loss on defeat is -35
    if (won) {
      rawDelta = Math.max(12, rawDelta);
    } else {
      rawDelta = Math.min(-10, rawDelta);
    }

    let streakBonus = false;
    if (won && winStreak >= 3) {
      const bonusMultiplier = winStreak >= 5 ? 1.4 : 1.2;
      rawDelta = Math.round(rawDelta * bonusMultiplier);
      streakBonus = true;
    }

    const newMmr = Math.max(100, playerMmr + rawDelta);
    return {
      change: rawDelta,
      newMmr,
      streakBonus,
    };
  }

  /**
   * Get rank tier info and division for a given MMR
   */
  static getTierInfo(mmr: number): TierInfo {
    if (mmr >= 3000) {
      return {
        tier: 'Grandmaster',
        division: 1,
        minMmr: 3000,
        maxMmr: 9999,
        badgeColor: '#E53E3E',
        badgeIcon: '👑',
      };
    }
    if (mmr >= 2600) {
      return {
        tier: 'Master',
        division: 1,
        minMmr: 2600,
        maxMmr: 2999,
        badgeColor: '#9F7AEA',
        badgeIcon: '💎',
      };
    }
    if (mmr >= 2200) {
      const div = 4 - Math.min(3, Math.floor((mmr - 2200) / 100));
      return {
        tier: 'Diamond',
        division: div,
        minMmr: 2200,
        maxMmr: 2599,
        badgeColor: '#4299E1',
        badgeIcon: '🔷',
      };
    }
    if (mmr >= 1800) {
      const div = 4 - Math.min(3, Math.floor((mmr - 1800) / 100));
      return {
        tier: 'Platinum',
        division: div,
        minMmr: 1800,
        maxMmr: 2199,
        badgeColor: '#38B2AC',
        badgeIcon: '🛡️',
      };
    }
    if (mmr >= 1400) {
      const div = 4 - Math.min(3, Math.floor((mmr - 1400) / 100));
      return {
        tier: 'Gold',
        division: div,
        minMmr: 1400,
        maxMmr: 1799,
        badgeColor: '#ECC94B',
        badgeIcon: '🥇',
      };
    }
    if (mmr >= 1000) {
      const div = 4 - Math.min(3, Math.floor((mmr - 1000) / 100));
      return {
        tier: 'Silver',
        division: div,
        minMmr: 1000,
        maxMmr: 1399,
        badgeColor: '#A0AEC0',
        badgeIcon: '🥈',
      };
    }

    const div = 4 - Math.min(3, Math.floor(mmr / 250));
    return {
      tier: 'Bronze',
      division: Math.max(1, div),
      minMmr: 0,
      maxMmr: 999,
      badgeColor: '#CD7F32',
      badgeIcon: '🥉',
    };
  }

  /**
   * Get progress percent (0-100) towards next rank tier
   */
  static getProgressToNextTier(mmr: number): { percent: number; current: number; target: number } {
    const tier = this.getTierInfo(mmr);
    const range = tier.maxMmr - tier.minMmr;
    const progress = Math.min(100, Math.max(0, Math.round(((mmr - tier.minMmr) / range) * 100)));
    return {
      percent: progress,
      current: mmr,
      target: tier.maxMmr,
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
