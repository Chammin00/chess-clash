import { CARD_COLLECTION, STARTER_DECK_CARD_IDS } from '../config/cards';
import { BoardUnit, Card } from '../types/card';
import { PlayerBattleState } from '../types/game';
import { MmrEngine } from './mmrEngine';

const RIVAL_NAMES = [
  'AeroStrike', 'VoidWalker', 'CrimsonGhost', 'NexusByte',
  'SolarFlare', 'StormReaper', 'IronFist', 'PhantomRider',
  'FrostBane', 'SilverHawk', 'RuneMaster', 'ShadowKnight',
  'EchoPulse', 'ObsidianFury', 'ApexHunter', 'ViperBite'
];

export interface OpponentMatchCandidate {
  id: string;
  name: string;
  mmr: number;
  deck: Card[];
  estimatedWaitSec: number;
}

export class MatchmakerService {
  /**
   * Find or simulate an opponent close to player's MMR
   */
  static findOpponent(playerMmr: number, elapsedSeconds: number = 0): OpponentMatchCandidate {
    // Search tolerance expands over time
    const variance = 40 + Math.min(250, elapsedSeconds * 20);
    const sign = Math.random() > 0.5 ? 1 : -1;
    const delta = Math.floor(Math.random() * variance) * sign;
    const oppMmr = Math.max(1500, playerMmr + delta);

    const randomName = RIVAL_NAMES[Math.floor(Math.random() * RIVAL_NAMES.length)];
    
    // Construct opponent deck
    const deckCards: Card[] = STARTER_DECK_CARD_IDS
      .map(id => CARD_COLLECTION.find(c => c.id === id))
      .filter((c): c is Card => !!c)
      .map(c => ({ ...c }));

    return {
      id: 'rival_' + Math.floor(Math.random() * 99999),
      name: randomName,
      mmr: oppMmr,
      deck: this.shuffle(deckCards),
      estimatedWaitSec: Math.max(1, 4 - Math.floor(elapsedSeconds / 2)),
    };
  }

  static shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * Autonomous AI decision logic for turn-based battle
   */
  static calculateAiTurnActions(
    botState: PlayerBattleState,
    playerState: PlayerBattleState
  ): {
    cardsToPlay: Card[];
    attacks: Array<{ attackerInstanceId: string; targetId: 'hero' | string }>;
  } {
    const cardsToPlay: Card[] = [];
    let availableMana = botState.currentMana;

    // 1. Play playable cards that fit within available mana
    const playableCards = botState.hand
      .filter(c => c.cost <= availableMana)
      .sort((a, b) => b.cost - a.cost);

    let boardSlotCount = botState.board.length;

    for (const card of playableCards) {
      if (card.cost <= availableMana) {
        if (card.type === 'unit') {
          if (boardSlotCount < 4) {
            cardsToPlay.push(card);
            availableMana -= card.cost;
            boardSlotCount++;
          }
        } else {
          // Spell
          cardsToPlay.push(card);
          availableMana -= card.cost;
        }
      }
    }

    // 2. Decide unit attacks
    const attacks: Array<{ attackerInstanceId: string; targetId: 'hero' | string }> = [];
    const playerGuards = playerState.board.filter(u => u.hasGuard && u.currentHp > 0);

    for (const unit of botState.board) {
      if (!unit.canAttack) continue;

      if (playerGuards.length > 0) {
        // Must attack a Guard unit
        const target = playerGuards[0];
        attacks.push({
          attackerInstanceId: unit.instanceId,
          targetId: target.instanceId,
        });
      } else {
        // If enemy board has high-threat unit, trade; otherwise face attack
        const highThreat = playerState.board.find(u => u.currentAttack >= 4 && u.currentHp <= unit.currentAttack);
        if (highThreat) {
          attacks.push({
            attackerInstanceId: unit.instanceId,
            targetId: highThreat.instanceId,
          });
        } else {
          attacks.push({
            attackerInstanceId: unit.instanceId,
            targetId: 'hero',
          });
        }
      }
    }

    return { cardsToPlay, attacks };
  }
}
