import { CARD_COLLECTION, getCardById } from '../config/cards';
import { FACTION_CONFIGS } from '../config/factions';
import { BoardUnit, Card, CombatRow, FactionId } from '../types/card';
import { PlayerGwentState, WeatherState } from '../types/game';
import { GwentEngine } from './gwentEngine';

const RIVAL_NAMES = [
  'KageHattori', 'RoninTadashi', 'OniKurokawa', 'SeimeiDisciple',
  'ShogunKatsumoto', 'TsukuyomiBlade', 'CrimsonTengu', 'SilverKunoichi',
  'MusashiRival', 'DaimyoYukimura', 'GhostOfTsushima', 'LotusAssassin'
];

export interface OpponentMatchCandidate {
  id: string;
  name: string;
  mmr: number;
  faction: FactionId;
  leader: Card;
  deck: Card[];
  estimatedWaitSec: number;
}

export class MatchmakerService {
  /**
   * Find or simulate an opponent with one of the 5 Feudal Japanese decks
   */
  static findOpponent(playerMmr: number, playerFaction: FactionId = 'shinobi', elapsedSeconds: number = 0): OpponentMatchCandidate {
    const variance = 40 + Math.min(250, elapsedSeconds * 20);
    const sign = Math.random() > 0.5 ? 1 : -1;
    const oppMmr = Math.max(200, playerMmr + Math.floor(Math.random() * variance) * sign);

    const randomName = RIVAL_NAMES[Math.floor(Math.random() * RIVAL_NAMES.length)];

    // Pick opponent faction (try to pick a different faction for variety)
    const availableFactions: FactionId[] = ['shinobi', 'bushido', 'yokai', 'onmyo', 'shogunate'];
    const otherFactions = availableFactions.filter(f => f !== playerFaction);
    const oppFaction = otherFactions[Math.floor(Math.random() * otherFactions.length)] || 'bushido';

    const factionConfig = FACTION_CONFIGS[oppFaction as Exclude<FactionId, 'neutral'>];
    const deckCards: Card[] = factionConfig.starterDeckIds
      .map(id => getCardById(id))
      .filter((c): c is Card => !!c)
      .map(c => ({ ...c }));

    return {
      id: 'rival_' + Math.floor(Math.random() * 99999),
      name: randomName,
      mmr: oppMmr,
      faction: oppFaction,
      leader: factionConfig.leader,
      deck: this.shuffle(deckCards),
      estimatedWaitSec: Math.max(1, 3 - Math.floor(elapsedSeconds / 2)),
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
   * Intelligent Gwent AI: decides whether to Pass or which card to play
   */
  static decideAiMove(
    aiState: PlayerGwentState,
    playerState: PlayerGwentState,
    weather: WeatherState,
    roundNumber: number
  ): { action: 'pass' | 'play_card'; cardIndex?: number; targetRow?: 'melee' | 'ranged' | 'siege' } {
    const aiScores = GwentEngine.evaluatePlayerBoard(aiState, weather);
    const playerScores = GwentEngine.evaluatePlayerBoard(playerState, weather);

    // If AI has no cards left in hand, it must pass
    if (aiState.hand.length === 0) {
      return { action: 'pass' };
    }

    // 1. If Player has already passed:
    if (playerState.hasPassed) {
      // If AI is already winning, pass immediately to save cards!
      if (aiScores.totalScore > playerScores.totalScore) {
        return { action: 'pass' };
      }

      // If AI is behind, evaluate if we can win or if it's futile
      const scoreDiff = playerScores.totalScore - aiScores.totalScore;
      // If Round 1 and AI is behind by > 28 points, AI concedes round to conserve hand!
      if (roundNumber === 1 && scoreDiff > 28 && aiState.hand.length <= 6) {
        return { action: 'pass' };
      }
    }

    // 2. If AI has 1 life left (facing elimination in Round 2 or 3), fight to the end!
    const isEliminationRound = aiState.lives === 1;

    // 3. In Round 1, if AI has substantial lead (e.g. +22) and player has not passed, AI might pass
    if (roundNumber === 1 && !playerState.hasPassed && aiScores.totalScore - playerScores.totalScore > 24) {
      if (Math.random() > 0.4) {
        return { action: 'pass' };
      }
    }

    // 4. Select best card to play:
    // Priority A: Spies (if Round 1 or early Round 2) to build massive card advantage!
    const spyIndex = aiState.hand.findIndex(c => c.ability === 'spy');
    if (spyIndex !== -1 && roundNumber <= 2) {
      const card = aiState.hand[spyIndex];
      const targetRow = card.row === 'agile' ? 'melee' : card.row as ('melee' | 'ranged');
      return { action: 'play_card', cardIndex: spyIndex, targetRow };
    }

    // Priority B: Weather cards (if opponent row is heavily stacked)
    if (!weather.frost && playerScores.meleeScore >= 14) {
      const frostIndex = aiState.hand.findIndex(c => c.ability === 'weather_frost');
      if (frostIndex !== -1) return { action: 'play_card', cardIndex: frostIndex };
    }
    if (!weather.fog && playerScores.rangedScore >= 14) {
      const fogIndex = aiState.hand.findIndex(c => c.ability === 'weather_fog');
      if (fogIndex !== -1) return { action: 'play_card', cardIndex: fogIndex };
    }
    if (!weather.rain && playerScores.siegeScore >= 14) {
      const rainIndex = aiState.hand.findIndex(c => c.ability === 'weather_rain');
      if (rainIndex !== -1) return { action: 'play_card', cardIndex: rainIndex };
    }

    // Priority C: Commander's Horn (if one of AI rows has >= 10 non-hero power and no horn)
    const hornIndex = aiState.hand.findIndex(c => c.ability === 'horn');
    if (hornIndex !== -1) {
      if (!aiState.hasMeleeHorn && aiScores.meleeScore >= 10) {
        return { action: 'play_card', cardIndex: hornIndex, targetRow: 'melee' };
      }
      if (!aiState.hasRangedHorn && aiScores.rangedScore >= 10) {
        return { action: 'play_card', cardIndex: hornIndex, targetRow: 'ranged' };
      }
      if (!aiState.hasSiegeHorn && aiScores.siegeScore >= 10) {
        return { action: 'play_card', cardIndex: hornIndex, targetRow: 'siege' };
      }
    }

    // Priority D: Regular units (prioritize Tight Bond pairs or standard power curves)
    // Find matching Tight Bond card if one already on board
    const boardBondIds = new Set(
      [...aiState.meleeRow, ...aiState.rangedRow, ...aiState.siegeRow]
        .map(u => u.bondId)
        .filter(Boolean)
    );
    const matchingBondIndex = aiState.hand.findIndex(c => c.bondId && boardBondIds.has(c.bondId));
    if (matchingBondIndex !== -1) {
      const card = aiState.hand[matchingBondIndex];
      return { action: 'play_card', cardIndex: matchingBondIndex, targetRow: card.row as any };
    }

    // Otherwise pick a playable unit
    const playableUnitIndices = aiState.hand
      .map((c, i) => ({ card: c, index: i }))
      .filter(item => item.card.type === 'unit');

    if (playableUnitIndices.length > 0) {
      // Sort by power descending if behind, ascending if ahead
      const isBehind = playerScores.totalScore >= aiScores.totalScore;
      playableUnitIndices.sort((a, b) => isBehind ? b.card.power - a.card.power : a.card.power - b.card.power);
      const chosen = playableUnitIndices[0];
      const targetRow = chosen.card.row === 'agile' ? 'melee' : (chosen.card.row as any);
      return { action: 'play_card', cardIndex: chosen.index, targetRow };
    }

    // Fallback: play first available card
    return { action: 'play_card', cardIndex: 0 };
  }
}
