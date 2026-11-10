export type GwentRow = 'melee' | 'ranged' | 'siege';

export type GwentCardType = 'unit' | 'hero' | 'special' | 'weather';

export type GwentCardAbility =
  | 'none'
  | 'hero'
  | 'spy'
  | 'medic'
  | 'tight_bond'
  | 'morale_boost'
  | 'muster'
  | 'scorch_unit'
  | 'scorch_special'
  | 'commanders_horn'
  | 'decoy'
  | 'weather_frost'
  | 'weather_fog'
  | 'weather_rain'
  | 'weather_clear';

export type GwentFaction =
  | 'hayabusa_clan'
  | 'shadow_shogunate'
  | 'dragon_order'
  | 'yokai_horde';

export interface GwentCard {
  id: string;
  name: string;
  title: string;
  quote: string;
  power: number;
  currentPower?: number;
  row: GwentRow | 'agile' | 'special' | 'weather';
  activeRow?: GwentRow;
  isHero: boolean;
  ability: GwentCardAbility;
  tightBondGroup?: string;
  musterGroup?: string;
  artUrl: string;
  faction: GwentFaction;
  characterFoundation?: string;
  flavorLore: string;
  frameAccentColor?: string;
}

export interface GwentBoardRow {
  rowType: GwentRow;
  cards: GwentCard[];
  hasHorn: boolean;
  rowScore: number;
}

export interface GwentPlayerState {
  name: string;
  faction: GwentFaction;
  lives: number; // 2 gems at match start
  passed: boolean;
  deck: GwentCard[];
  hand: GwentCard[];
  graveyard: GwentCard[];
  rows: {
    melee: GwentBoardRow;
    ranged: GwentBoardRow;
    siege: GwentBoardRow;
  };
  totalScore: number;
}

export interface GwentRoundResult {
  roundNumber: number;
  playerScore: number;
  opponentScore: number;
  winner: 'player' | 'opponent' | 'draw';
}

export interface GwentGameState {
  round: number;
  player: GwentPlayerState;
  opponent: GwentPlayerState;
  activeTurn: 'player' | 'opponent';
  status: 'mulligan' | 'playing' | 'round_end' | 'game_over';
  matchWinner: 'player' | 'opponent' | 'draw' | null;
  roundHistory: GwentRoundResult[];
  weather: {
    frost: boolean;
    fog: boolean;
    rain: boolean;
  };
  mulligansRemaining: number;
  combatLog: string[];
  inspectedCard: GwentCard | null;
  medicPending: boolean;
  agilePendingCard: GwentCard | null;
  decoyPending: boolean;
}
