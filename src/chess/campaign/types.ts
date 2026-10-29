import { GameThemeId, ChessBotProfile, PieceType, Position } from '../types';

export type PowerupItemId = 'undo_one' | 'revert_ten' | 'engine_hint' | 'king_shield' | 'pawn_strike';

export interface CampaignItem {
  id: PowerupItemId;
  name: string;
  icon: string;
  description: string;
  cost: number;
}

export type StageType = 'battle' | 'boss' | 'puzzle' | 'treasure';

export interface StageStarCondition {
  id: string;
  description: string;
  type: 'win' | 'max_moves' | 'no_items' | 'material_lead' | 'survive_turns';
  targetValue?: number;
}

export interface CampaignStage {
  id: string;
  stageNumber: number; // 1 to 5
  title: string;
  subtitle: string;
  type: StageType;
  lore: string;
  opponent: ChessBotProfile;
  starConditions: StageStarCondition[];
  rewards: {
    gold: number;
    items?: { itemId: PowerupItemId; count: number }[];
  };
  customBoardSetup?: {
    playerAdvantage?: boolean;
    puzzleFen?: string;
  };
}

export interface CampaignWorld {
  id: GameThemeId;
  worldNumber: number; // 1 to 10
  name: string;
  tagline: string;
  banner: string;
  stages: CampaignStage[];
  requiredStarsToUnlock: number;
}

export interface CampaignProgress {
  currentWorld: GameThemeId;
  unlockedWorldIds: GameThemeId[];
  clearedStageIds: string[];
  stageStars: Record<string, number>; // stageId -> stars (1 to 3)
  inventory: Record<PowerupItemId, number>;
  coins: number;
}
