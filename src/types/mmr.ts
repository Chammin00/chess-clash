export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster';

export interface TierInfo {
  tier: RankTier;
  division: number; // 1 to 4
  minMmr: number;
  maxMmr: number;
  badgeColor: string;
  badgeIcon: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  mmr: number;
  peakMmr: number;
  wins: number;
  losses: number;
  winStreak: number;
  gold: number;
  gems: number;
  unlockedCardIds: string[];
  deckCardIds: string[];
  selectedFaction?: import('./card').FactionId;
  factionDecks?: Record<string, string[]>;
  createdAt: number;
  hasNoAds?: boolean;
  isVip?: boolean;
  vipExpiresAt?: number;
  starterPackPurchased?: boolean;
  piggyBankGems?: number;
  pityCounter?: number;
  avatarFrame?: string;
  seasonPassXp?: number;
  isSeasonPassPremium?: boolean;
}

export interface MatchHistoryEntry {
  id: string;
  timestamp: number;
  opponentName: string;
  opponentMmr: number;
  result: 'win' | 'loss' | 'draw';
  mmrChange: number;
  oldMmr: number;
  newMmr: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  mmr: number;
  tier: RankTier;
  division: number;
  winRate: number;
  isPlayer?: boolean;
}
