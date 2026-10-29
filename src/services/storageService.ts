import AsyncStorage from '@react-native-async-storage/async-storage';
import { STARTER_DECK_CARD_IDS, CARD_COLLECTION } from '../config/cards';
import { LeaderboardEntry, MatchHistoryEntry, PlayerProfile } from '../types/mmr';
import { MmrEngine } from './mmrEngine';

const PROFILE_KEY = '@duel_arena_player_profile';
const HISTORY_KEY = '@duel_arena_match_history';

const INITIAL_PROFILE: PlayerProfile = {
  id: 'player_local_' + Math.floor(Math.random() * 8999 + 1000),
  name: 'Arena Challenger',
  mmr: 1200,
  peakMmr: 1200,
  wins: 0,
  losses: 0,
  winStreak: 0,
  gold: 250,
  gems: 30,
  unlockedCardIds: CARD_COLLECTION.map(c => c.id),
  deckCardIds: [...STARTER_DECK_CARD_IDS],
  selectedFaction: 'shinobi',
  createdAt: Date.now(),
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
        if (!this.cachedProfile?.selectedFaction) {
          this.cachedProfile!.selectedFaction = 'shinobi';
        }
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
      { rank: 1, name: 'VortexKing', mmr: 3250, tier: 'Grandmaster', division: 1, winRate: 74 },
      { rank: 2, name: 'AegisStorm', mmr: 2980, tier: 'Master', division: 1, winRate: 69 },
      { rank: 3, name: 'ShadowFist', mmr: 2750, tier: 'Master', division: 1, winRate: 66 },
      { rank: 4, name: 'Solaris', mmr: 2420, tier: 'Diamond', division: 2, winRate: 63 },
      { rank: 5, name: 'FrostBite', mmr: 2150, tier: 'Platinum', division: 1, winRate: 59 },
      { rank: 6, name: 'Valkyrie99', mmr: 1890, tier: 'Platinum', division: 4, winRate: 57 },
      { rank: 7, name: 'ThunderClaw', mmr: 1650, tier: 'Gold', division: 2, winRate: 54 },
      { rank: 8, name: 'RogueEcho', mmr: 1420, tier: 'Gold', division: 4, winRate: 52 },
      { rank: 9, name: 'TitanGuard', mmr: 1250, tier: 'Silver', division: 2, winRate: 50 },
      { rank: 10, name: 'BladeRunner', mmr: 1080, tier: 'Silver', division: 4, winRate: 48 },
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
