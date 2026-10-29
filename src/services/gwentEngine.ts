import { BoardUnit, Card, CombatRow, FactionId } from '../types/card';
import { PlayerGwentState, WeatherState } from '../types/game';

export class GwentEngine {
  /**
   * Calculate effective power of units in a row, factoring in:
   * - Weather (reduces non-hero base to 1)
   * - Tight Bond (multiplies by number of matching bond units in row)
   * - Morale Boost (+1 to other units in row)
   * - Commander's Horn (doubles non-hero units)
   * - Heroes (immune to all modifiers)
   */
  static calculateRowPower(
    units: BoardUnit[],
    hasWeather: boolean,
    hasHorn: boolean
  ): { totalPower: number; evaluatedUnits: BoardUnit[] } {
    if (units.length === 0) {
      return { totalPower: 0, evaluatedUnits: [] };
    }

    // 1. Count Tight Bond copies in row
    const bondCounts: Record<string, number> = {};
    units.forEach(u => {
      if (u.ability === 'tight_bond' && u.bondId && !u.isHero) {
        bondCounts[u.bondId] = (bondCounts[u.bondId] || 0) + 1;
      }
    });

    // 2. Count Morale Boost units in row
    const totalMoraleBoosters = units.filter(u => u.ability === 'morale_boost').length;

    let total = 0;
    const evaluatedUnits: BoardUnit[] = units.map(unit => {
      if (unit.isHero) {
        // Hero units are completely immune to weather, horns, and tight bond
        total += unit.power;
        return {
          ...unit,
          currentPower: unit.power,
          basePower: unit.power,
        };
      }

      // Base strength modified by weather
      let effPower = hasWeather ? 1 : unit.power;

      // Apply Tight Bond multiplier
      if (unit.ability === 'tight_bond' && unit.bondId) {
        const count = bondCounts[unit.bondId] || 1;
        effPower = effPower * count;
      }

      // Apply Morale Boost (+1 from other morale boosters, if unit is booster it gets +1 from others)
      const moraleBonus = unit.ability === 'morale_boost'
        ? Math.max(0, totalMoraleBoosters - 1)
        : totalMoraleBoosters;
      effPower += moraleBonus;

      // Apply Commander's Horn
      if (hasHorn) {
        effPower = effPower * 2;
      }

      total += effPower;
      return {
        ...unit,
        currentPower: effPower,
        basePower: unit.power,
        isBuffed: effPower > unit.power,
        isDebuffed: effPower < unit.power,
      };
    });

    return { totalPower: total, evaluatedUnits };
  }

  /**
   * Calculate all 3 rows and return total player power
   */
  static evaluatePlayerBoard(
    player: PlayerGwentState,
    weather: WeatherState
  ): {
    meleeScore: number;
    rangedScore: number;
    siegeScore: number;
    totalScore: number;
    updatedPlayer: PlayerGwentState;
  } {
    const melee = this.calculateRowPower(player.meleeRow, weather.frost, player.hasMeleeHorn);
    const ranged = this.calculateRowPower(player.rangedRow, weather.fog, player.hasRangedHorn);
    const siege = this.calculateRowPower(player.siegeRow, weather.rain, player.hasSiegeHorn);

    const totalScore = melee.totalPower + ranged.totalPower + siege.totalPower;

    const updatedPlayer: PlayerGwentState = {
      ...player,
      meleeRow: melee.evaluatedUnits,
      rangedRow: ranged.evaluatedUnits,
      siegeRow: siege.evaluatedUnits,
    };

    return {
      meleeScore: melee.totalPower,
      rangedScore: ranged.totalPower,
      siegeScore: siege.totalPower,
      totalScore,
      updatedPlayer,
    };
  }

  /**
   * Scorch: Destroys the highest power non-hero unit(s) on target board or specific row
   */
  static executeScorch(targetBoard: {
    meleeRow: BoardUnit[];
    rangedRow: BoardUnit[];
    siegeRow: BoardUnit[];
  }, specificRow?: 'melee' | 'ranged' | 'siege'): {
    destroyed: BoardUnit[];
    newMelee: BoardUnit[];
    newRanged: BoardUnit[];
    newSiege: BoardUnit[];
  } {
    const allNonHeroes: { unit: BoardUnit; row: 'melee' | 'ranged' | 'siege' }[] = [];

    if (!specificRow || specificRow === 'melee') {
      targetBoard.meleeRow.forEach(u => !u.isHero && allNonHeroes.push({ unit: u, row: 'melee' }));
    }
    if (!specificRow || specificRow === 'ranged') {
      targetBoard.rangedRow.forEach(u => !u.isHero && allNonHeroes.push({ unit: u, row: 'ranged' }));
    }
    if (!specificRow || specificRow === 'siege') {
      targetBoard.siegeRow.forEach(u => !u.isHero && allNonHeroes.push({ unit: u, row: 'siege' }));
    }

    if (allNonHeroes.length === 0) {
      return {
        destroyed: [],
        newMelee: [...targetBoard.meleeRow],
        newRanged: [...targetBoard.rangedRow],
        newSiege: [...targetBoard.siegeRow],
      };
    }

    const maxPower = Math.max(...allNonHeroes.map(item => item.unit.currentPower));
    const destroyed: BoardUnit[] = [];

    const newMelee = targetBoard.meleeRow.filter(u => {
      if (!u.isHero && u.currentPower === maxPower && (!specificRow || specificRow === 'melee')) {
        destroyed.push(u);
        return false;
      }
      return true;
    });

    const newRanged = targetBoard.rangedRow.filter(u => {
      if (!u.isHero && u.currentPower === maxPower && (!specificRow || specificRow === 'ranged')) {
        destroyed.push(u);
        return false;
      }
      return true;
    });

    const newSiege = targetBoard.siegeRow.filter(u => {
      if (!u.isHero && u.currentPower === maxPower && (!specificRow || specificRow === 'siege')) {
        destroyed.push(u);
        return false;
      }
      return true;
    });

    return { destroyed, newMelee, newRanged, newSiege };
  }

  /**
   * Determine round winner considering Bushido tie-breaker perk
   */
  static determineRoundWinner(
    playerScore: number,
    opponentScore: number,
    playerFaction: FactionId,
    opponentFaction: FactionId
  ): 'player' | 'opponent' | 'tie' {
    if (playerScore > opponentScore) return 'player';
    if (opponentScore > playerScore) return 'opponent';

    // In a tie, Bushido faction wins!
    if (playerFaction === 'bushido' && opponentFaction !== 'bushido') return 'player';
    if (opponentFaction === 'bushido' && playerFaction !== 'bushido') return 'opponent';

    return 'tie';
  }

  /**
   * Clear board units to graveyard at end of round, factoring in Yokai passive resilience
   */
  static resolveRoundEndBoard(player: PlayerGwentState): {
    survivingUnits: { melee: BoardUnit[]; ranged: BoardUnit[]; siege: BoardUnit[] };
    graveyardAdditions: Card[];
  } {
    const allBoardUnits = [
      ...player.meleeRow,
      ...player.rangedRow,
      ...player.siegeRow,
    ];

    let preservedInstanceId: string | null = null;
    // Yokai passive: 1 random non-hero unit remains on board!
    if (player.faction === 'yokai') {
      const nonHeroes = allBoardUnits.filter(u => !u.isHero);
      if (nonHeroes.length > 0) {
        const randomIndex = Math.floor(Math.random() * nonHeroes.length);
        preservedInstanceId = nonHeroes[randomIndex].instanceId;
      }
    }

    const survivingUnits = {
      melee: player.meleeRow.filter(u => u.instanceId === preservedInstanceId),
      ranged: player.rangedRow.filter(u => u.instanceId === preservedInstanceId),
      siege: player.siegeRow.filter(u => u.instanceId === preservedInstanceId),
    };

    const graveyardAdditions: Card[] = allBoardUnits
      .filter(u => u.instanceId !== preservedInstanceId)
      .map(u => ({ ...u }));

    return { survivingUnits, graveyardAdditions };
  }
}
