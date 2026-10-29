export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type CardType = 'unit' | 'special' | 'weather' | 'leader';
export type CombatRow = 'melee' | 'ranged' | 'siege' | 'agile' | 'special';
export type FactionId = 'shinobi' | 'bushido' | 'yokai' | 'onmyo' | 'shogunate' | 'neutral';

export type CardAbility =
  | 'none'
  | 'spy'
  | 'tight_bond'
  | 'muster'
  | 'medic'
  | 'scorch'
  | 'scorch_melee'
  | 'horn'
  | 'decoy'
  | 'weather_frost'
  | 'weather_fog'
  | 'weather_rain'
  | 'clear_weather'
  | 'morale_boost';

export interface Card {
  id: string;
  name: string;
  faction: FactionId;
  type: CardType;
  row: CombatRow;
  power: number; // Base strength in Gwent
  rarity: CardRarity;
  isHero?: boolean; // Gold border, immune to weather, scorch, decoys, horns
  ability: CardAbility;
  bondId?: string; // For Tight Bond matching
  musterGroup?: string; // For Muster reinforcement
  description: string;
  icon: string;
  color: string;
  quote?: string;
  // Backward compatibility / optional helpers
  cost?: number;
}

export interface BoardUnit extends Card {
  instanceId: string;
  assignedRow: 'melee' | 'ranged' | 'siege';
  currentPower: number;
  basePower: number;
  isBuffed?: boolean;
  isDebuffed?: boolean;
}
