import { BoardUnit, Card } from './card';

export interface PlayerBattleState {
  id: string;
  name: string;
  mmr: number;
  hp: number;
  maxHp: number;
  currentMana: number;
  maxMana: number;
  hand: Card[];
  deck: Card[];
  board: BoardUnit[];
  isBot?: boolean;
}

export type BattlePhase = 
  | 'starting'
  | 'player_turn'
  | 'opponent_turn'
  | 'resolving'
  | 'victory'
  | 'defeat';

export interface CombatLogEntry {
  id: string;
  turn: number;
  text: string;
  type: 'attack' | 'spell' | 'summon' | 'turn' | 'heal';
  actor: 'player' | 'opponent';
}

import { RankTier } from './mmr';

export interface MatchResultData {
  winner: 'player' | 'opponent';
  oldMmr: number;
  newMmr: number;
  mmrDelta: number;
  decayApplied?: number;
  rankChange?: 'promoted' | 'demoted' | 'none';
  oldTier?: RankTier;
  newTier?: RankTier;
  tierStepDelta?: number;
  turnsPlayed: number;
  goldEarned: number;
  xpEarned: number;
  streakBonus: boolean;
}
