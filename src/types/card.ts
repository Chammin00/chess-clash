export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type CardType = 'unit' | 'spell';

export interface Card {
  id: string;
  name: string;
  cost: number;
  type: CardType;
  rarity: CardRarity;
  attack?: number;
  hp?: number;
  maxHp?: number;
  description: string;
  icon: string;
  color: string;
  effect?: {
    type: 'damage_all' | 'damage_target' | 'heal_hero' | 'buff_attack' | 'guard' | 'rush';
    value: number;
  };
  hasAttackedThisTurn?: boolean;
}

export interface BoardUnit extends Card {
  instanceId: string;
  currentHp: number;
  currentAttack: number;
  canAttack: boolean;
  hasGuard: boolean;
}
