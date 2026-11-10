import AsyncStorage from '@react-native-async-storage/async-storage';
import { STARTER_DECK_CARD_IDS, CARD_COLLECTION } from '../config/cards';
import { LeaderboardEntry, MatchHistoryEntry, PlayerProfile } from '../types/mmr';
import { MmrEngine } from './mmrEngine';

const PROFILE_KEY = '@duel_arena_player_profile';
const HISTORY_KEY = '@duel_arena_match_history';

const INITIAL_PROFILE: PlayerProfile = {
  id: 'player_local_' + Math.floor(Math.random() * 8999 + 1000),
  name: 'Spire Challenger',
  mmr: 1500,
  peakMmr: 1500,
  wins: 0,
  losses: 0,
  winStreak: 0,
  gold: 250,
  gems: 30,
  unlockedCardIds: CARD_COLLECTION.map(c => c.id),
  deckCardIds: [...STARTER_DECK_CARD_IDS],
  createdAt: Date.now(),
  lastPlayedAt: Date.now(),
};

export class StorageService {
  private static cachedProfile: PlayerProfile | null = null;
  private static cachedHistory: MatchHistoryEntry[] | null = null;

  static async getProfile(): Promise<PlayerProfile> {
    if (this.cachedProfile) return this.cachedProfile;
    try {
      const data = await AsyncStorage.getItem(PROFILE_KEY);
      if (data) {
        this.cachedProfile = JSON.parse(data);
        return this.cachedProfile!;
      }
    } catch {
      // Fallback
    }
    this.cachedProfile = { ...INITIAL_PROFILE };
    await this.saveProfile(this.cachedProfile);
    return this.cachedProfile;
  }

  static async saveProfile(profile: PlayerProfile): Promise<void> {
    this.cachedProfile = profile;
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (err) {
      console.warn('Failed saving profile to storage:', err);
    }
  }

  static async getMatchHistory(): Promise<MatchHistoryEntry[]> {
    if (this.cachedHistory) return this.cachedHistory;
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      if (data) {
        this.cachedHistory = JSON.parse(data);
        return this.cachedHistory!;
      }
    } catch {
      // Fallback
    }
    this.cachedHistory = [];
    return [];
  }

  static async recordMatch(entry: MatchHistoryEntry): Promise<void> {
    const history = await this.getMatchHistory();
    history.unshift(entry);
    const trimmed = history.slice(0, 30); // keep last 30 matches
    this.cachedHistory = trimmed;
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch (err) {
      console.warn('Failed saving match history:', err);
    }
  }

  static generateLeaderboard(player: PlayerProfile): LeaderboardEntry[] {
    const bots: LeaderboardEntry[] = [
      { rank: 1, name: 'Sage Of The Spire', mmr: 6350, tier: 'Sage', division: 1, winRate: 79 },
      { rank: 2, name: 'VortexGrandmaster', mmr: 5820, tier: 'Grandmaster', division: 1, winRate: 74 },
      { rank: 3, name: 'AegisMaster', mmr: 5210, tier: 'Master', division: 1, winRate: 71 },
      { rank: 4, name: 'LegendShadow', mmr: 4720, tier: 'Legend', division: 2, winRate: 67 },
      { rank: 5, name: 'ChampionSolaris', mmr: 4250, tier: 'Champion', division: 2, winRate: 64 },
      { rank: 6, name: 'DiamondFrost', mmr: 3750, tier: 'Diamond', division: 1, winRate: 61 },
      { rank: 7, name: 'PlatinumValkyrie', mmr: 3200, tier: 'Platinum', division: 3, winRate: 58 },
      { rank: 8, name: 'GoldThunder', mmr: 2750, tier: 'Gold', division: 2, winRate: 55 },
      { rank: 9, name: 'SilverRogue', mmr: 2200, tier: 'Silver', division: 3, winRate: 52 },
      { rank: 10, name: 'BronzeTitan', mmr: 1750, tier: 'Bronze', division: 2, winRate: 49 },
    ];

    const playerTier = MmrEngine.getTierInfo(player.mmr);
    const total = player.wins + player.losses;
    const playerWinRate = total > 0 ? Math.round((player.wins / total) * 100) : 50;

    const playerEntry: LeaderboardEntry = {
      rank: 99,
      name: player.name + ' (You)',
      mmr: player.mmr,
      tier: playerTier.tier,
      division: playerTier.division,
      winRate: playerWinRate,
      isPlayer: true,
    };

    const combined = [...bots, playerEntry].sort((a, b) => b.mmr - a.mmr);
    return combined.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }
}
