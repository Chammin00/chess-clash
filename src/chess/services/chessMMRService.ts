import {
  ChessBotProfile,
  ChessMatchRecord,
  ChessRankTier,
  GameThemeId,
  GameThemeMMR,
  PlayerChessProfile,
} from '../types';

const STORAGE_KEY = '@chess_master_profile_v1';
const memoryStore = new Map<string, string>();

async function safeGetItem(key: string): Promise<string | null> {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    if (AsyncStorage?.getItem) {
      return await AsyncStorage.getItem(key);
    }
  } catch {}
  return memoryStore.get(key) || null;
}

async function safeSetItem(key: string, value: string): Promise<void> {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    if (AsyncStorage?.setItem) {
      await AsyncStorage.setItem(key, value);
      return;
    }
  } catch {}
  memoryStore.set(key, value);
}

export const TIERS: { name: ChessRankTier; minMmr: number; color: string; icon: string }[] = [
  { name: 'Novice', minMmr: 0, color: '#9CA3AF', icon: '🌱' },
  { name: 'Bronze', minMmr: 800, color: '#CD7F32', icon: '🥉' },
  { name: 'Silver', minMmr: 1100, color: '#C0C0C0', icon: '🥈' },
  { name: 'Gold', minMmr: 1400, color: '#F59E0B', icon: '🥇' },
  { name: 'Platinum', minMmr: 1700, color: '#06B6D4', icon: '💎' },
  { name: 'Diamond', minMmr: 2000, color: '#A855F7', icon: '👑' },
  { name: 'Master', minMmr: 2300, color: '#EF4444', icon: '⚡' },
  { name: 'Grandmaster', minMmr: 2600, color: '#F43F5E', icon: '🌟' },
  { name: 'Stockfish God', minMmr: 2900, color: '#10B981', icon: '🧠' },
];

export function getTierFromMmr(mmr: number): ChessRankTier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (mmr >= TIERS[i].minMmr) {
      return TIERS[i].name;
    }
  }
  return 'Novice';
}

export function getTierColor(tier: ChessRankTier): string {
  const match = TIERS.find((t) => t.name === tier);
  return match ? match.color : '#9CA3AF';
}

export function getTierIcon(tier: ChessRankTier): string {
  const match = TIERS.find((t) => t.name === tier);
  return match ? match.icon : '🌱';
}

const DEFAULT_THEME_MMR = (themeId: GameThemeId): GameThemeMMR => ({
  themeId,
  mmr: 1000,
  tier: 'Bronze',
  wins: 0,
  losses: 0,
  draws: 0,
  streak: 0,
  peakMmr: 1000,
});

const DEFAULT_PROFILE: PlayerChessProfile = {
  overallMmr: 1000,
  highestTier: 'Bronze',
  totalGames: 0,
  totalWins: 0,
  themeStats: {
    ninjas: DEFAULT_THEME_MMR('ninjas'),
    samurais: DEFAULT_THEME_MMR('samurais'),
    pirates: DEFAULT_THEME_MMR('pirates'),
    animals: DEFAULT_THEME_MMR('animals'),
    sea_creatures: DEFAULT_THEME_MMR('sea_creatures'),
    cyber_mecha: DEFAULT_THEME_MMR('cyber_mecha'),
    necropolis: DEFAULT_THEME_MMR('necropolis'),
    mythic_gods: DEFAULT_THEME_MMR('mythic_gods'),
    jurassic: DEFAULT_THEME_MMR('jurassic'),
    space_fleet: DEFAULT_THEME_MMR('space_fleet'),
  },
  recentMatches: [],
};

export const BOT_ROSTER: ChessBotProfile[] = [
  // Novice / Bronze Bots (600 - 1100)
  {
    id: 'bot_genin_taro',
    name: 'Genin Taro',
    avatar: '🥷',
    country: '🇯🇵 JP',
    mmr: 750,
    engine: 'maia',
    targetDepth: 1,
    blunderRate: 0.28,
    playstyle: 'Aggressive',
    quote: 'I rush in without checking the smoke veil!',
  },
  {
    id: 'bot_cabin_boy_jack',
    name: 'Cabin Boy Jack',
    avatar: '🦜',
    country: '🏴‍☠️ Caribbean',
    mmr: 880,
    engine: 'maia',
    targetDepth: 2,
    blunderRate: 0.22,
    playstyle: 'Tactical',
    quote: 'Shiny pieces be me favorite plunder!',
  },
  {
    id: 'bot_meerkat_timon',
    name: 'Sentry Pip',
    avatar: '🐾',
    country: '🇰🇪 KE',
    mmr: 1020,
    engine: 'maia',
    targetDepth: 2,
    blunderRate: 0.16,
    playstyle: 'Defensive',
    quote: 'Always looking out for big cats.',
  },

  // Silver / Gold Bots (1100 - 1650)
  {
    id: 'bot_ronin_musashi',
    name: 'Ronin Musashi',
    avatar: '⚔️',
    country: '🇯🇵 JP',
    mmr: 1250,
    engine: 'stockfish',
    targetDepth: 2,
    blunderRate: 0.10,
    playstyle: 'Positional',
    quote: 'The blade does not hesitate.',
  },
  {
    id: 'bot_netrunner_v',
    name: 'Netrunner Zero',
    avatar: '🤖',
    country: '🌐 Cyber',
    mmr: 1420,
    engine: 'alphazero',
    targetDepth: 2,
    blunderRate: 0.08,
    playstyle: 'Tactical',
    quote: 'Analyzing grid frequencies for breaches.',
  },
  {
    id: 'bot_captain_blackbeard',
    name: 'Captain Ironhook',
    avatar: '🏴‍☠️',
    country: '🇬🇧 UK',
    mmr: 1580,
    engine: 'stockfish',
    targetDepth: 3,
    blunderRate: 0.06,
    playstyle: 'Swarm',
    quote: 'Cannons primed down every file, matey!',
  },

  // Platinum / Diamond Bots (1700 - 2250)
  {
    id: 'bot_banshee_sylvia',
    name: 'Banshee Morwen',
    avatar: '👻',
    country: '🏰 Crypt',
    mmr: 1840,
    engine: 'maia',
    targetDepth: 3,
    blunderRate: 0.03,
    playstyle: 'Aggressive',
    quote: 'Your king will hear the wail of doom.',
  },
  {
    id: 'bot_athena_pallas',
    name: 'Oracle Athena',
    avatar: '🦉',
    country: '🇬🇷 GR',
    mmr: 2050,
    engine: 'alphazero',
    targetDepth: 3,
    blunderRate: 0.01,
    playstyle: 'Positional',
    quote: 'Strategy triumphs over raw fury.',
  },
  {
    id: 'bot_apex_spino',
    name: 'Apex Spinosaurus',
    avatar: '🦖',
    country: '🌋 Cretaceous',
    mmr: 2220,
    engine: 'stockfish',
    targetDepth: 4,
    blunderRate: 0.01,
    playstyle: 'Aggressive',
    quote: 'Territorial crush leaves no survivors.',
  },

  // Master / Grandmaster Bots (2300 - 2800+)
  {
    id: 'bot_admiral_sol',
    name: 'Grand Admiral Sol',
    avatar: '🚀',
    country: '🌌 Sector 7',
    mmr: 2480,
    engine: 'stockfish',
    targetDepth: 4,
    blunderRate: 0.0,
    playstyle: 'Adaptive',
    quote: 'Orbital vectors calculated to perfection.',
  },
  {
    id: 'bot_deep_kraken',
    name: 'Ancient Leviathan',
    avatar: '🐙',
    country: '🌊 Mariana',
    mmr: 2650,
    engine: 'alphazero',
    targetDepth: 4,
    blunderRate: 0.0,
    playstyle: 'Positional',
    quote: 'The crushing pressure of the depths.',
  },
  {
    id: 'bot_stockfish_overlord',
    name: 'Stockfish Master NNUE',
    avatar: '🧠',
    country: '⚡ Quantum Core',
    mmr: 2850,
    engine: 'stockfish',
    targetDepth: 5,
    blunderRate: 0.0,
    playstyle: 'Adaptive',
    quote: 'Evaluating 100,000 nodes per second.',
  },
];

export class ChessMMRService {
  static async loadProfile(): Promise<PlayerChessProfile> {
    try {
      const json = await safeGetItem(STORAGE_KEY);
      if (json) {
        const parsed = JSON.parse(json);
        // Merge with defaults to ensure all themes exist
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          themeStats: {
            ...DEFAULT_PROFILE.themeStats,
            ...(parsed.themeStats || {}),
          },
        };
      }
    } catch {
      // fallback
    }
    return DEFAULT_PROFILE;
  }

  static async saveProfile(profile: PlayerChessProfile): Promise<void> {
    try {
      await safeSetItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save chess profile:', e);
    }
  }

  /**
   * Standard Elo Rating Calculation with streak bonus
   */
  static calculateEloChange(
    playerMmr: number,
    opponentMmr: number,
    result: 'win' | 'loss' | 'draw',
    currentStreak: number
  ): number {
    const K = 32;
    const expectedScore = 1 / (1 + Math.pow(10, (opponentMmr - playerMmr) / 400));
    const actualScore = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;

    let delta = Math.round(K * (actualScore - expectedScore));

    // Win streak bonus
    if (result === 'win' && currentStreak >= 2) {
      delta += Math.min(10, currentStreak * 2);
    }

    // Minimum gain/loss constraints
    if (result === 'win' && delta < 5) delta = 5;
    if (result === 'loss' && delta > -5) delta = -5;

    return delta;
  }

  static async recordMatchResult(
    themeId: GameThemeId,
    opponent: ChessBotProfile,
    result: 'win' | 'loss' | 'draw',
    moveCount: number
  ): Promise<{ profile: PlayerChessProfile; mmrDelta: number; newMmr: number; tierChanged: boolean }> {
    const profile = await this.loadProfile();
    const currentThemeStat = profile.themeStats[themeId] || DEFAULT_THEME_MMR(themeId);

    const oldMmr = currentThemeStat.mmr;
    const oldTier = currentThemeStat.tier;

    const streak = result === 'win' ? currentThemeStat.streak + 1 : 0;
    const mmrDelta = this.calculateEloChange(oldMmr, opponent.mmr, result, currentThemeStat.streak);
    const newMmr = Math.max(100, oldMmr + mmrDelta);
    const newTier = getTierFromMmr(newMmr);

    const updatedThemeStat: GameThemeMMR = {
      ...currentThemeStat,
      mmr: newMmr,
      tier: newTier,
      wins: result === 'win' ? currentThemeStat.wins + 1 : currentThemeStat.wins,
      losses: result === 'loss' ? currentThemeStat.losses + 1 : currentThemeStat.losses,
      draws: result === 'draw' ? currentThemeStat.draws + 1 : currentThemeStat.draws,
      streak,
      peakMmr: Math.max(currentThemeStat.peakMmr, newMmr),
    };

    const matchRecord: ChessMatchRecord = {
      id: `match_${Date.now()}`,
      themeId,
      timestamp: Date.now(),
      opponentName: opponent.name,
      opponentMmr: opponent.mmr,
      opponentAvatar: opponent.avatar,
      result,
      mmrChange: mmrDelta,
      newMmr,
      moveCount,
      engineType: opponent.engine,
    };

    // Recalculate overall MMR (average of top 3 themes or all active)
    const allThemeMmrs = Object.values({
      ...profile.themeStats,
      [themeId]: updatedThemeStat,
    }).map((s) => s.mmr);
    const overallMmr = Math.round(allThemeMmrs.reduce((a, b) => a + b, 0) / allThemeMmrs.length);

    const updatedProfile: PlayerChessProfile = {
      ...profile,
      overallMmr,
      highestTier: getTierFromMmr(overallMmr),
      totalGames: profile.totalGames + 1,
      totalWins: profile.totalWins + (result === 'win' ? 1 : 0),
      themeStats: {
        ...profile.themeStats,
        [themeId]: updatedThemeStat,
      },
      recentMatches: [matchRecord, ...profile.recentMatches].slice(0, 20),
    };

    await this.saveProfile(updatedProfile);

    return {
      profile: updatedProfile,
      mmrDelta,
      newMmr,
      tierChanged: oldTier !== newTier,
    };
  }

  static findMatchmakingOpponent(playerMmr: number): ChessBotProfile {
    // Sort bots by closest MMR to player
    const sorted = [...BOT_ROSTER].sort(
      (a, b) => Math.abs(a.mmr - playerMmr) - Math.abs(b.mmr - playerMmr)
    );

    // Pick among the top 3 closest for variety
    const pool = sorted.slice(0, 3);
    return pool[Math.floor(Math.random() * pool.length)];
  }
}
