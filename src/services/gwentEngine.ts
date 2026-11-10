import {
  GwentCard,
  GwentGameState,
  GwentPlayerState,
  GwentRow,
  GwentRoundResult,
} from '../types/gwent';
import {
  getPlayerStarterGwentDeck,
  getOpponentStarterGwentDeck,
} from '../data/gwentCards';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export class GwentEngine {
  /**
   * Initializes a fresh Witcher Gwent match.
   * Both sides shuffle decks and draw 10 starting cards.
   */
  public static initMatch(playerName: string = 'Ryu Hayabusa'): GwentGameState {
    const playerFullDeck = shuffle(getPlayerStarterGwentDeck());
    const opponentFullDeck = shuffle(getOpponentStarterGwentDeck());

    const playerHand = playerFullDeck.splice(0, 10);
    const opponentHand = opponentFullDeck.splice(0, 10);

    const player: GwentPlayerState = {
      name: playerName,
      faction: 'hayabusa_clan',
      lives: 2,
      passed: false,
      deck: playerFullDeck,
      hand: playerHand,
      graveyard: [],
      rows: {
        melee: { rowType: 'melee', cards: [], hasHorn: false, rowScore: 0 },
        ranged: { rowType: 'ranged', cards: [], hasHorn: false, rowScore: 0 },
        siege: { rowType: 'siege', cards: [], hasHorn: false, rowScore: 0 },
      },
      totalScore: 0,
    };

    const opponent: GwentPlayerState = {
      name: 'Shadow Shogunate & Yokai',
      faction: 'shadow_shogunate',
      lives: 2,
      passed: false,
      deck: opponentFullDeck,
      hand: opponentHand,
      graveyard: [],
      rows: {
        melee: { rowType: 'melee', cards: [], hasHorn: false, rowScore: 0 },
        ranged: { rowType: 'ranged', cards: [], hasHorn: false, rowScore: 0 },
        siege: { rowType: 'siege', cards: [], hasHorn: false, rowScore: 0 },
      },
      totalScore: 0,
    };

    const initialState: GwentGameState = {
      round: 1,
      player,
      opponent,
      activeTurn: 'player',
      status: 'mulligan',
      matchWinner: null,
      roundHistory: [],
      weather: {
        frost: false,
        fog: false,
        rain: false,
      },
      mulligansRemaining: 2,
      combatLog: ['The tavern doors shut tight. Gwent duel begins! Select up to 2 cards to redraw.'],
      inspectedCard: null,
      medicPending: false,
      agilePendingCard: null,
      decoyPending: false,
    };

    return this.recalculateScores(initialState);
  }

  /**
   * Redraw a card during the initial mulligan phase.
   */
  public static redrawMulligan(state: GwentGameState, cardId: string): GwentGameState {
    if (state.status !== 'mulligan' || state.mulligansRemaining <= 0) return state;

    const cardIdx = state.player.hand.findIndex((c) => c.id === cardId);
    if (cardIdx === -1) return state;

    const [cardToReturn] = state.player.hand.splice(cardIdx, 1);
    state.player.deck.push(cardToReturn);
    state.player.deck = shuffle(state.player.deck);

    if (state.player.deck.length > 0) {
      const newCard = state.player.deck.shift()!;
      state.player.hand.push(newCard);
    }

    state.mulligansRemaining -= 1;
    state.combatLog.unshift(`Redrew [${cardToReturn.name}] during Mulligan phase.`);

    return { ...state };
  }

  /**
   * Finalize the mulligan phase and begin active battle.
   */
  public static finishMulligan(state: GwentGameState): GwentGameState {
    state.status = 'playing';
    state.combatLog.unshift('Mulligan complete. Round 1 begins! Ryu Hayabusa holds priority.');
    return { ...state };
  }

  /**
   * Calculates dynamic strength for all rows and players accounting for
   * Weather, Tight Bond, Morale Boost, and Commander's Horn.
   */
  public static recalculateScores(state: GwentGameState): GwentGameState {
    const calculateSide = (playerState: GwentPlayerState) => {
      let totalSideScore = 0;
      const rowKeys: GwentRow[] = ['melee', 'ranged', 'siege'];

      for (const rowKey of rowKeys) {
        const row = playerState.rows[rowKey];
        const isWeatherActive =
          (rowKey === 'melee' && state.weather.frost) ||
          (rowKey === 'ranged' && state.weather.fog) ||
          (rowKey === 'siege' && state.weather.rain);

        // Count Morale Boosts in this row (each morale boost gives +1 to other cards)
        const moraleBoostCount = row.cards.filter((c) => c.ability === 'morale_boost').length;

        // Count Tight Bond groups in this row
        const tightBondCounts: Record<string, number> = {};
        for (const card of row.cards) {
          if (card.ability === 'tight_bond' && card.tightBondGroup) {
            tightBondCounts[card.tightBondGroup] =
              (tightBondCounts[card.tightBondGroup] || 0) + 1;
          }
        }

        let nonHeroRowScore = 0;
        let heroRowScore = 0;

        for (const card of row.cards) {
          if (card.isHero) {
            card.currentPower = card.power;
            heroRowScore += card.power;
            continue;
          }

          let effectivePower = card.power;

          // 1. Weather penalty
          if (isWeatherActive) {
            effectivePower = 1;
          }

          // 2. Tight Bond multiplier (x2 for 2, x3 for 3)
          if (card.ability === 'tight_bond' && card.tightBondGroup) {
            const count = tightBondCounts[card.tightBondGroup] || 1;
            effectivePower = effectivePower * count;
          }

          // 3. Morale Boost (+1 for each other morale booster)
          if (moraleBoostCount > 0) {
            const boostsForThisCard =
              card.ability === 'morale_boost' ? moraleBoostCount - 1 : moraleBoostCount;
            effectivePower += Math.max(0, boostsForThisCard);
          }

          card.currentPower = effectivePower;
          nonHeroRowScore += effectivePower;
        }

        // 4. Commander's Horn doubles non-hero row score
        if (row.hasHorn) {
          nonHeroRowScore *= 2;
        }

        row.rowScore = nonHeroRowScore + heroRowScore;
        totalSideScore += row.rowScore;
      }

      playerState.totalScore = totalSideScore;
    };

    calculateSide(state.player);
    calculateSide(state.opponent);

    return { ...state };
  }

  /**
   * Plays a card from hand for the given side (player or opponent).
   */
  public static playCard(
    state: GwentGameState,
    cardId: string,
    side: 'player' | 'opponent',
    targetRow?: GwentRow
  ): GwentGameState {
    const actor = side === 'player' ? state.player : state.opponent;
    const opponent = side === 'player' ? state.opponent : state.player;

    const cardIndex = actor.hand.findIndex((c) => c.id === cardId);
    if (cardIndex === -1) return state;

    const [card] = actor.hand.splice(cardIndex, 1);

    // 1. Weather Cards
    if (card.row === 'weather') {
      if (card.ability === 'weather_frost') {
        state.weather.frost = true;
        state.combatLog.unshift(`❄️ [${actor.name}] called Biting Frost! Melee rows frozen to 1.`);
      } else if (card.ability === 'weather_fog') {
        state.weather.fog = true;
        state.combatLog.unshift(`🌫️ [${actor.name}] summoned Impenetrable Fog! Ranged rows smothered.`);
      } else if (card.ability === 'weather_rain') {
        state.weather.rain = true;
        state.combatLog.unshift(`🌧️ [${actor.name}] summoned Torrential Rain! Siege rows drenched.`);
      } else if (card.ability === 'weather_clear') {
        state.weather.frost = false;
        state.weather.fog = false;
        state.weather.rain = false;
        state.combatLog.unshift(`☀️ [${actor.name}] invoked Clear Sky! All weather dispelled.`);
      }
      actor.graveyard.push(card);
    }
    // 2. Commander's Horn Special Card
    else if (card.ability === 'commanders_horn') {
      const chosenRow = targetRow || 'melee';
      actor.rows[chosenRow].hasHorn = true;
      state.combatLog.unshift(
        `📯 [${actor.name}] sounded Commander's War Horn on the ${chosenRow.toUpperCase()} row! Combat strength doubled!`
      );
      actor.graveyard.push(card);
    }
    // 3. Scorch Special Card
    else if (card.ability === 'scorch_special') {
      state.combatLog.unshift(`🔥 [${actor.name}] unleashed Ninpo Scorch! Finding strongest units...`);
      this.executeGlobalScorch(state);
      actor.graveyard.push(card);
    }
    // 4. Spy Units: played onto the OPPONENT's battlefield!
    else if (card.ability === 'spy') {
      const spyRow: GwentRow = card.row === 'agile' ? targetRow || 'melee' : (card.row as GwentRow);
      card.activeRow = spyRow;
      opponent.rows[spyRow].cards.push(card);

      // Draw 2 cards from actor's deck
      let drawnCount = 0;
      if (actor.deck.length > 0) {
        actor.hand.push(actor.deck.shift()!);
        drawnCount++;
      }
      if (actor.deck.length > 0) {
        actor.hand.push(actor.deck.shift()!);
        drawnCount++;
      }

      state.combatLog.unshift(
        `👁️ [${actor.name}] sent Spy [${card.name}] (+${card.power} to opponent) and drew ${drawnCount} tactical cards!`
      );
    }
    // 5. Standard Unit / Hero / Medic / Scorch Unit
    else {
      let destRow: GwentRow = 'melee';
      if (card.row === 'agile') {
        destRow = targetRow || 'melee';
      } else if (card.row === 'ranged' || card.row === 'siege') {
        destRow = card.row;
      }
      card.activeRow = destRow;
      actor.rows[destRow].cards.push(card);

      state.combatLog.unshift(
        `⚔️ [${actor.name}] deployed [${card.name}] (${card.power} Power) to ${destRow.toUpperCase()} row.`
      );

      // Scorch Unit ability (e.g. Ninpo Adept on Ranged row)
      if (card.ability === 'scorch_unit') {
        this.executeTargetedScorch(state, opponent, destRow);
      }

      // Muster ability (summons matching duplicates from deck)
      if (card.ability === 'muster' && card.musterGroup) {
        this.executeMuster(actor, destRow, card.musterGroup, state.combatLog);
      }

      // Medic ability (revives from graveyard)
      if (card.ability === 'medic') {
        if (side === 'player') {
          const eligible = actor.graveyard.filter((c) => !c.isHero && c.row !== 'special' && c.row !== 'weather');
          if (eligible.length > 0) {
            state.medicPending = true;
            state.combatLog.unshift(`🌿 [${card.name}] channels shrine mercy! Choose a fallen ally to revive.`);
          }
        } else {
          // AI auto-medic
          this.executeAiMedic(actor, state);
        }
      }
    }

    this.recalculateScores(state);

    // Switch turn if opponent hasn't passed
    if (side === 'player') {
      if (!state.opponent.passed) {
        state.activeTurn = 'opponent';
      }
    } else {
      if (!state.player.passed) {
        state.activeTurn = 'player';
      }
    }

    return state;
  }

  /**
   * Revive a chosen card from graveyard via Medic.
   */
  public static reviveCardFromGraveyard(
    state: GwentGameState,
    cardId: string,
    side: 'player' | 'opponent',
    chosenRow?: GwentRow
  ): GwentGameState {
    const actor = side === 'player' ? state.player : state.opponent;
    const gIndex = actor.graveyard.findIndex((c) => c.id === cardId);
    if (gIndex === -1) return state;

    const [card] = actor.graveyard.splice(gIndex, 1);
    state.medicPending = false;

    let destRow: GwentRow = 'melee';
    if (card.row === 'agile') {
      destRow = chosenRow || 'melee';
    } else if (card.row === 'ranged' || card.row === 'siege') {
      destRow = card.row;
    }
    card.activeRow = destRow;
    actor.rows[destRow].cards.push(card);

    state.combatLog.unshift(`✨ [${actor.name}] revived [${card.name}] from the Graveyard to ${destRow.toUpperCase()}!`);

    this.recalculateScores(state);
    return state;
  }

  /**
   * Muster summons all cards in the deck with matching musterGroup.
   */
  private static executeMuster(
    actor: GwentPlayerState,
    row: GwentRow,
    musterGroup: string,
    combatLog: string[]
  ): void {
    const pulledCards: GwentCard[] = [];
    const remainingDeck: GwentCard[] = [];

    for (const c of actor.deck) {
      if (c.musterGroup === musterGroup) {
        pulledCards.push(c);
      } else {
        remainingDeck.push(c);
      }
    }

    actor.deck = remainingDeck;

    for (const c of pulledCards) {
      c.activeRow = row;
      actor.rows[row].cards.push(c);
    }

    if (pulledCards.length > 0) {
      combatLog.unshift(
        `🌀 MUSTER! [${pulledCards.length}] duplicate [${pulledCards[0].name}] summoned directly from deck!`
      );
    }
  }

  /**
   * Scorch special destroys the highest-power non-hero cards on the whole battlefield.
   */
  private static executeGlobalScorch(state: GwentGameState): void {
    let maxPower = -1;
    const allNonHeroCards: { card: GwentCard; player: GwentPlayerState; row: GwentRow }[] = [];

    const scanPlayer = (p: GwentPlayerState) => {
      const rows: GwentRow[] = ['melee', 'ranged', 'siege'];
      for (const r of rows) {
        for (const card of p.rows[r].cards) {
          if (!card.isHero && (card.currentPower || card.power) > 0) {
            const pwr = card.currentPower || card.power;
            if (pwr > maxPower) maxPower = pwr;
            allNonHeroCards.push({ card, player: p, row: r });
          }
        }
      }
    };

    scanPlayer(state.player);
    scanPlayer(state.opponent);

    if (maxPower <= 0) {
      state.combatLog.unshift('🔥 Scorch fizzled: No targetable units found.');
      return;
    }

    const scorched = allNonHeroCards.filter(
      (item) => (item.card.currentPower || item.card.power) === maxPower
    );

    for (const item of scorched) {
      const idx = item.player.rows[item.row].cards.findIndex((c) => c.id === item.card.id);
      if (idx !== -1) {
        const [deadCard] = item.player.rows[item.row].cards.splice(idx, 1);
        item.player.graveyard.push(deadCard);
      }
    }

    state.combatLog.unshift(
      `💥 SCORCH incinerated ${scorched.length} highest-strength unit(s) (${maxPower} Power)!`
    );
  }

  /**
   * Unit-level Scorch (e.g. Flame Adept targeting opponent's row).
   */
  private static executeTargetedScorch(
    state: GwentGameState,
    targetPlayer: GwentPlayerState,
    targetRow: GwentRow
  ): void {
    const rowCards = targetPlayer.rows[targetRow].cards.filter((c) => !c.isHero);
    if (rowCards.length === 0) return;

    let maxPower = -1;
    for (const c of rowCards) {
      const pwr = c.currentPower || c.power;
      if (pwr > maxPower) maxPower = pwr;
    }

    if (maxPower <= 0) return;

    const toKill = rowCards.filter((c) => (c.currentPower || c.power) === maxPower);
    for (const item of toKill) {
      const idx = targetPlayer.rows[targetRow].cards.findIndex((c) => c.id === item.id);
      if (idx !== -1) {
        const [deadCard] = targetPlayer.rows[targetRow].cards.splice(idx, 1);
        targetPlayer.graveyard.push(deadCard);
      }
    }

    state.combatLog.unshift(
      `🔥 Ninpo Flame breath incinerated ${toKill.length} unit(s) on ${targetPlayer.name}'s ${targetRow.toUpperCase()} row!`
    );
  }

  /**
   * AI auto medic picks the highest power non-hero card in its graveyard.
   */
  private static executeAiMedic(actor: GwentPlayerState, state: GwentGameState): void {
    const eligible = actor.graveyard.filter((c) => !c.isHero && c.row !== 'special' && c.row !== 'weather');
    if (eligible.length === 0) return;

    eligible.sort((a, b) => b.power - a.power);
    const bestCard = eligible[0];

    const idx = actor.graveyard.findIndex((c) => c.id === bestCard.id);
    if (idx !== -1) {
      actor.graveyard.splice(idx, 1);
      const row: GwentRow = bestCard.row === 'agile' ? 'melee' : (bestCard.row as GwentRow);
      bestCard.activeRow = row;
      actor.rows[row].cards.push(bestCard);
      state.combatLog.unshift(`🦊 [${actor.name}] Kitsune Medic reanimated [${bestCard.name}] (${bestCard.power} Power)!`);
    }
  }

  /**
   * Pass turn for the active player.
   */
  public static passTurn(state: GwentGameState, side: 'player' | 'opponent'): GwentGameState {
    if (side === 'player') {
      state.player.passed = true;
      state.combatLog.unshift(`🛡️ [${state.player.name}] PASSED for this round.`);
      if (!state.opponent.passed) {
        state.activeTurn = 'opponent';
      }
    } else {
      state.opponent.passed = true;
      state.combatLog.unshift(`🛡️ [${state.opponent.name}] PASSED for this round.`);
      if (!state.player.passed) {
        state.activeTurn = 'player';
      }
    }

    // If both passed, evaluate round!
    if (state.player.passed && state.opponent.passed) {
      this.evaluateRound(state);
    }

    return { ...state };
  }

  /**
   * Evaluates the winner of the current round.
   */
  public static evaluateRound(state: GwentGameState): GwentGameState {
    state.status = 'round_end';
    const pScore = state.player.totalScore;
    const oScore = state.opponent.totalScore;

    let roundWinner: 'player' | 'opponent' | 'draw';

    if (pScore > oScore) {
      roundWinner = 'player';
      state.opponent.lives -= 1;
      state.combatLog.unshift(`🏆 ROUND ${state.round} WON by ${state.player.name} (${pScore} vs ${oScore})!`);
    } else if (oScore > pScore) {
      roundWinner = 'opponent';
      state.player.lives -= 1;
      state.combatLog.unshift(`💀 ROUND ${state.round} WON by ${state.opponent.name} (${oScore} vs ${pScore})!`);
    } else {
      roundWinner = 'draw';
      state.player.lives -= 1;
      state.opponent.lives -= 1;
      state.combatLog.unshift(`⚖️ ROUND ${state.round} DRAW! Both combatants lose a life crystal (${pScore} - ${oScore}).`);
    }

    const result: GwentRoundResult = {
      roundNumber: state.round,
      playerScore: pScore,
      opponentScore: oScore,
      winner: roundWinner,
    };
    state.roundHistory.push(result);

    // Check match victory/loss
    if (state.player.lives <= 0 && state.opponent.lives <= 0) {
      state.status = 'game_over';
      state.matchWinner = 'draw';
      state.combatLog.unshift('MATCH DRAW! Both lords fell in glorious mutual combat.');
    } else if (state.player.lives <= 0) {
      state.status = 'game_over';
      state.matchWinner = 'opponent';
      state.combatLog.unshift(`MATCH LOST! ${state.opponent.name} conquered the tavern board.`);
    } else if (state.opponent.lives <= 0) {
      state.status = 'game_over';
      state.matchWinner = 'player';
      state.combatLog.unshift(`VICTORY! ${state.player.name} stands supreme in Gwent!`);
    }

    return { ...state };
  }

  /**
   * Prepares the board for the next round (clears battlefield to graveyard).
   */
  public static startNextRound(state: GwentGameState): GwentGameState {
    if (state.status === 'game_over') return state;

    const clearRows = (p: GwentPlayerState) => {
      const rows: GwentRow[] = ['melee', 'ranged', 'siege'];
      for (const r of rows) {
        for (const card of p.rows[r].cards) {
          p.graveyard.push(card);
        }
        p.rows[r].cards = [];
        p.rows[r].hasHorn = false;
        p.rows[r].rowScore = 0;
      }
      p.passed = false;
      p.totalScore = 0;
    };

    clearRows(state.player);
    clearRows(state.opponent);

    // Reset weather
    state.weather.frost = false;
    state.weather.fog = false;
    state.weather.rain = false;

    state.round += 1;
    state.status = 'playing';

    // Round winner goes first
    const lastResult = state.roundHistory[state.roundHistory.length - 1];
    state.activeTurn = lastResult && lastResult.winner === 'opponent' ? 'opponent' : 'player';

    state.combatLog.unshift(`⚔️ Round ${state.round} underway! Battle lines reset.`);

    return this.recalculateScores(state);
  }

  /**
   * Tactical AI turn decision maker.
   */
  public static executeAiTurn(state: GwentGameState): GwentGameState {
    if (state.activeTurn !== 'opponent' || state.opponent.passed || state.status !== 'playing') {
      return state;
    }

    const ai = state.opponent;
    const player = state.player;

    // Rule 1: If player passed
    if (player.passed) {
      // If AI is already winning, PASS immediately!
      if (ai.totalScore > player.totalScore) {
        return this.passTurn(state, 'opponent');
      }

      // If AI is behind, can AI win with 1 card?
      const winCard = ai.hand.find((c) => {
        const potential = c.power;
        return ai.totalScore + potential > player.totalScore;
      });

      if (winCard) {
        return this.playCard(state, winCard.id, 'opponent');
      }

      // If AI has 2 lives and player only needs this to win, AI fights hard; otherwise if gap is > 20, pass!
      if (player.totalScore - ai.totalScore > 20 && ai.lives > 1) {
        return this.passTurn(state, 'opponent');
      }
    }

    // Rule 2: Play Spies early in round 1 or when hand is low
    const spyCard = ai.hand.find((c) => c.ability === 'spy');
    if (spyCard && (state.round === 1 || ai.hand.length < 5)) {
      return this.playCard(state, spyCard.id, 'opponent');
    }

    // Rule 3: Counter heavy player melee row with Frost
    const frostCard = ai.hand.find((c) => c.ability === 'weather_frost');
    if (frostCard && !state.weather.frost && player.rows.melee.rowScore >= 12 && ai.rows.melee.rowScore < 8) {
      return this.playCard(state, frostCard.id, 'opponent');
    }

    // Rule 4: Play Tight Bond pairs if one is already on the board
    const tightBondCard = ai.hand.find((c) => {
      if (c.ability !== 'tight_bond' || !c.tightBondGroup) return false;
      const group = c.tightBondGroup;
      const rowKey: GwentRow = c.row === 'agile' ? 'melee' : (c.row as GwentRow);
      return ai.rows[rowKey].cards.some((existing) => existing.tightBondGroup === group);
    });
    if (tightBondCard) {
      return this.playCard(state, tightBondCard.id, 'opponent');
    }

    // Rule 5: Play Commander's Horn if row has good density
    const hornCard = ai.hand.find((c) => c.ability === 'commanders_horn');
    if (hornCard) {
      const rows: GwentRow[] = ['melee', 'ranged', 'siege'];
      const bestRow = rows.find((r) => !ai.rows[r].hasHorn && ai.rows[r].cards.length >= 2 && ai.rows[r].rowScore >= 10);
      if (bestRow) {
        return this.playCard(state, hornCard.id, 'opponent', bestRow);
      }
    }

    // Rule 6: If AI has big lead in round 1 (e.g. +15 points), consider passing to preserve cards
    if (state.round === 1 && ai.totalScore - player.totalScore >= 16 && ai.hand.length <= player.hand.length) {
      return this.passTurn(state, 'opponent');
    }

    // Rule 7: Play standard card (prefer muster, then units with power)
    const musterCard = ai.hand.find((c) => c.ability === 'muster');
    if (musterCard) {
      return this.playCard(state, musterCard.id, 'opponent');
    }

    const unitCards = ai.hand.filter((c) => c.row !== 'special' && c.row !== 'weather');
    if (unitCards.length > 0) {
      // Play middle power card to pace the round
      unitCards.sort((a, b) => a.power - b.power);
      const chosen = unitCards[Math.floor(unitCards.length / 2)];
      return this.playCard(state, chosen.id, 'opponent');
    }

    // Fallback: If only special cards remain or nothing useful, pass
    return this.passTurn(state, 'opponent');
  }
}
