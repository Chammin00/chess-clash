export type CardType = 'attack' | 'skill' | 'power' | 'status' | 'curse';
export type CardRarity = 'starter' | 'common' | 'uncommon' | 'rare' | 'status' | 'curse';
export type CardTarget = 'enemy' | 'all_enemies' | 'self';

export interface FloatingText {
  id: string;
  text: string;
  color: string;
  type: 'damage' | 'block' | 'heal' | 'buff';
}

export interface SpireCard {
  id: string;
  name: string;
  cost: number;
  type: CardType;
  rarity: CardRarity;
  description: string;
  damage?: number;
  block?: number;
  magicNumber?: number;
  target: CardTarget;
  isUpgraded?: boolean;
  exhaust?: boolean;
  ethereal?: boolean;
  unplayable?: boolean;
  color?: string;
  artEmoji?: string;
}

export interface StatusEffect {
  type: 
    | 'strength' 
    | 'dexterity' 
    | 'vulnerable' 
    | 'weak' 
    | 'frail' 
    | 'poison' 
    | 'barricade' 
    | 'demon_form' 
    | 'metallicize' 
    | 'thorns'
    | 'intangible'
    | 'berserk'
    | 'feel_no_pain'
    | 'dark_embrace'
    | 'evolve'
    | 'fire_breathing'
    | 'rupture'
    | 'combust'
    | 'juggernaut'
    | 'brutality'
    | 'double_tap'
    | 'temp_strength_down'
    | 'curl_up'
    | 'spore_cloud'
    | 'enrage'
    | 'mode_shift'
    | 'artifact'
    | 'ritual';
  amount: number;
}

export type EnemyIntentType = 
  | 'attack' 
  | 'defend' 
  | 'buff' 
  | 'debuff' 
  | 'attack_defend' 
  | 'attack_debuff'
  | 'special';

export interface EnemyIntent {
  type: EnemyIntentType;
  value: number;
  hits?: number;
  secondaryValue?: number;
  description: string;
  icon: string;
}

export interface SpireEnemy {
  id: string;
  name: string;
  title: string;
  hp: number;
  maxHp: number;
  block: number;
  intent: EnemyIntent;
  statuses: StatusEffect[];
  spriteIcon: string;
  themeColor: string;
  aiTurn: number;
  pattern: (turn: number, hp: number, maxHp: number) => EnemyIntent;
}

export interface SpireRelic {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'starter' | 'common' | 'uncommon' | 'rare' | 'boss';
  counter?: number;
}

export interface SpirePotion {
  id: string;
  name: string;
  description: string;
  icon: string;
  target: 'enemy' | 'self';
}

export type NodeType = 'monster' | 'elite' | 'rest' | 'shop' | 'event' | 'treasure' | 'boss';

export interface MapNode {
  id: string;
  floor: number;
  col: number;
  type: NodeType;
  visited: boolean;
  accessible: boolean;
  nextIds: string[];
}

export interface SpireHero {
  name: string;
  className: 'Riftblade' | 'Shadowstalker' | 'Chrono-Mage';
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  block: number;
  gold: number;
  deck: SpireCard[];
  drawPile: SpireCard[];
  hand: SpireCard[];
  discardPile: SpireCard[];
  exhaustPile: SpireCard[];
  statuses: StatusEffect[];
  relics: SpireRelic[];
  potions: (SpirePotion | null)[];
}

export interface SpireRunState {
  act: number;
  actName: string;
  floor: number;
  seed: number;
  map: MapNode[][];
  currentNodeId: string | null;
  hero: SpireHero;
  isOver: boolean;
  victory: boolean;
  score: number;
  monstersDefeated: number;
  elitesDefeated: number;
  bossesDefeated: number;
}
