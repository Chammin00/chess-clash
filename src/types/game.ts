import { BoardUnit, Card, FactionId } from './card';

export interface WeatherState {
  frost: boolean; // Affects both players' melee rows -> non-heroes reduced to 1
  fog: boolean;   // Affects both players' ranged rows -> non-heroes reduced to 1
  rain: boolean;  // Affects both players' siege rows -> non-heroes reduced to 1
}

export interface PlayerGwentState {
  id: string;
  name: string;
  mmr: number;
  faction: FactionId;
  lives: number; // Crowns / life gems (starts at 2)
  hasPassed: boolean;
  hand: Card[];
  deck: Card[];
  graveyard: Card[];
  meleeRow: BoardUnit[];
  rangedRow: BoardUnit[];
  siegeRow: BoardUnit[];
  hasMeleeHorn: boolean;
  hasRangedHorn: boolean;
  hasSiegeHorn: boolean;
  leader: Card;
  hasUsedLeader: boolean;
  isBot?: boolean;
}

export type BattlePhase = 
  | 'starting'
  | 'mulligan'
  | 'player_turn'
  | 'opponent_turn'
  | 'medic_revive'
  | 'decoy_target'
  | 'agile_select'
  | 'round_end'
  | 'victory'
  | 'defeat';

export interface CombatLogEntry {
  id: string;
  turn: number;
  text: string;
  type: 'attack' | 'spell' | 'summon' | 'turn' | 'heal';
  actor: 'player' | 'opponent';
}

export interface RoundScoreRecord {
  round: number;
  playerScore: number;
  opponentScore: number;
  winner: 'player' | 'opponent' | 'tie';
}

export interface MatchResultData {
  winner: 'player' | 'opponent' | 'tie';
  oldMmr: number;
  newMmr: number;
  mmrDelta: number;
  roundsPlayed: number;
  roundScores: RoundScoreRecord[];
  goldEarned: number;
  xpEarned: number;
  streakBonus: boolean;
  playerFaction: FactionId;
  opponentFaction: FactionId;
}

// Backward compatibility alias for components
export type PlayerBattleState = PlayerGwentState;
