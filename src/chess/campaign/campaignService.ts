import { CAMPAIGN_WORLDS, CAMPAIGN_ITEMS } from './campaignData';
import { CampaignProgress, PowerupItemId } from './types';
import { GameThemeId } from '../types';

const CAMPAIGN_STORAGE_KEY = '@chess_campaign_progress_v1';
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

const DEFAULT_PROGRESS: CampaignProgress = {
  currentWorld: 'ninjas',
  unlockedWorldIds: ['ninjas'],
  clearedStageIds: [],
  stageStars: {},
  inventory: {
    undo_one: 3,
    revert_ten: 1,
    engine_hint: 2,
    king_shield: 1,
    pawn_strike: 1,
  },
  coins: 200,
};

export class CampaignService {
  static async loadProgress(): Promise<CampaignProgress> {
    try {
      const json = await safeGetItem(CAMPAIGN_STORAGE_KEY);
      if (json) {
        const parsed = JSON.parse(json);
        return {
          ...DEFAULT_PROGRESS,
          ...parsed,
          inventory: {
            ...DEFAULT_PROGRESS.inventory,
            ...(parsed.inventory || {}),
          },
          stageStars: {
            ...DEFAULT_PROGRESS.stageStars,
            ...(parsed.stageStars || {}),
          },
        };
      }
    } catch {
      // fallback
    }
    return DEFAULT_PROGRESS;
  }

  static async saveProgress(progress: CampaignProgress): Promise<void> {
    try {
      await safeSetItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to save campaign progress:', e);
    }
  }

  static getTotalStars(progress: CampaignProgress): number {
    return Object.values(progress.stageStars).reduce((sum, val) => sum + val, 0);
  }

  static isStageUnlocked(stageId: string, progress: CampaignProgress): boolean {
    // Find stage and world
    let targetWorldIndex = -1;
    let targetStageIndex = -1;

    for (let w = 0; w < CAMPAIGN_WORLDS.length; w++) {
      const world = CAMPAIGN_WORLDS[w];
      const sIdx = world.stages.findIndex((s) => s.id === stageId);
      if (sIdx !== -1) {
        targetWorldIndex = w;
        targetStageIndex = sIdx;
        break;
      }
    }

    if (targetWorldIndex === -1 || targetStageIndex === -1) return false;

    const world = CAMPAIGN_WORLDS[targetWorldIndex];
    if (!progress.unlockedWorldIds.includes(world.id)) return false;

    // First stage in an unlocked world is always unlocked
    if (targetStageIndex === 0) return true;

    // Subsequent stages require the previous stage in that world to be cleared
    const prevStage = world.stages[targetStageIndex - 1];
    return progress.clearedStageIds.includes(prevStage.id);
  }

  static async recordStageClear(
    stageId: string,
    starsEarned: number,
    bonusGold: number,
    itemRewards?: { itemId: PowerupItemId; count: number }[]
  ): Promise<{
    progress: CampaignProgress;
    newWorldUnlocked?: GameThemeId;
    isFirstClear: boolean;
  }> {
    const progress = await this.loadProgress();
    const isFirstClear = !progress.clearedStageIds.includes(stageId);

    const oldStars = progress.stageStars[stageId] || 0;
    const newStars = Math.max(oldStars, starsEarned);

    const updatedClearedStages = isFirstClear
      ? [...progress.clearedStageIds, stageId]
      : progress.clearedStageIds;

    const updatedStageStars = {
      ...progress.stageStars,
      [stageId]: newStars,
    };

    // Update inventory with rewarded items
    const updatedInventory = { ...progress.inventory };
    if (itemRewards && isFirstClear) {
      for (const reward of itemRewards) {
        updatedInventory[reward.itemId] = (updatedInventory[reward.itemId] || 0) + reward.count;
      }
    }

    // Check if this was a boss stage that unlocks the next world
    let newWorldUnlocked: GameThemeId | undefined = undefined;
    const currentWorldIndex = CAMPAIGN_WORLDS.findIndex((w) =>
      w.stages.some((s) => s.id === stageId)
    );

    if (currentWorldIndex !== -1) {
      const currentWorld = CAMPAIGN_WORLDS[currentWorldIndex];
      const isBossStage = currentWorld.stages[currentWorld.stages.length - 1].id === stageId;

      if (isBossStage && currentWorldIndex + 1 < CAMPAIGN_WORLDS.length) {
        const nextWorld = CAMPAIGN_WORLDS[currentWorldIndex + 1];
        if (!progress.unlockedWorldIds.includes(nextWorld.id)) {
          progress.unlockedWorldIds.push(nextWorld.id);
          newWorldUnlocked = nextWorld.id;
        }
      }
    }

    const updatedProgress: CampaignProgress = {
      ...progress,
      clearedStageIds: updatedClearedStages,
      stageStars: updatedStageStars,
      inventory: updatedInventory,
      coins: progress.coins + bonusGold,
    };

    await this.saveProgress(updatedProgress);

    return {
      progress: updatedProgress,
      newWorldUnlocked,
      isFirstClear,
    };
  }

  static async useItem(itemId: PowerupItemId): Promise<boolean> {
    const progress = await this.loadProgress();
    const currentCount = progress.inventory[itemId] || 0;
    if (currentCount <= 0) return false;

    progress.inventory[itemId] = currentCount - 1;
    await this.saveProgress(progress);
    return true;
  }

  static async buyItem(itemId: PowerupItemId): Promise<{ success: boolean; progress: CampaignProgress }> {
    const progress = await this.loadProgress();
    const item = CAMPAIGN_ITEMS[itemId];
    if (!item) return { success: false, progress };

    if (progress.coins < item.cost) {
      return { success: false, progress };
    }

    progress.coins -= item.cost;
    progress.inventory[itemId] = (progress.inventory[itemId] || 0) + 1;
    await this.saveProgress(progress);

    return { success: true, progress };
  }
}
