import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { BoardRowView } from '../components/BoardRowView';
import { CardView } from '../components/CardView';
import { GwentScoreHeader } from '../components/GwentScoreHeader';
import { MulliganModal, MedicReviveModal } from '../components/GwentActionModals';
import { BoardUnit, Card, CombatRow, FactionId } from '../types/card';
import { BattlePhase, CombatLogEntry, MatchResultData, PlayerGwentState, RoundScoreRecord, WeatherState } from '../types/game';
import { PlayerProfile } from '../types/mmr';
import { MatchmakerService, OpponentMatchCandidate } from '../services/matchmakerService';
import { GwentEngine } from '../services/gwentEngine';
import { FACTION_CONFIGS } from '../config/factions';
import { SoundService } from '../services/soundService';

interface Props {
  playerProfile: PlayerProfile;
  opponent: OpponentMatchCandidate;
  onMatchComplete: (result: MatchResultData) => void;
  onSurrender: () => void;
}

export const BattleScreen: React.FC<Props> = ({
  playerProfile,
  opponent,
  onMatchComplete,
  onSurrender,
}) => {
  const playerFaction: FactionId = playerProfile.selectedFaction || 'shinobi';
  const playerFactionConfig = FACTION_CONFIGS[playerFaction as Exclude<FactionId, 'neutral'>];

  const [roundNumber, setRoundNumber] = useState(1);
  const [roundScoresHistory, setRoundScoresHistory] = useState<RoundScoreRecord[]>([]);
  const [turnTimeLeft, setTurnTimeLeft] = useState(30);
  const [phase, setPhase] = useState<BattlePhase>('starting');
  const [selectedHandIndex, setSelectedHandIndex] = useState<number | null>(null);
  const [combatLogs, setCombatLogs] = useState<CombatLogEntry[]>([]);

  // Modals
  const [showMulligan, setShowMulligan] = useState(false);
  const [mulliganRedrawsLeft, setMulliganRedrawsLeft] = useState(playerFaction === 'shinobi' ? 3 : 2);
  const [showMedicModal, setShowMedicModal] = useState(false);
  const [isDecoyTargeting, setIsDecoyTargeting] = useState(false);
  const [roundBannerText, setRoundBannerText] = useState<string | null>(null);

  // Global Weather
  const [weather, setWeather] = useState<WeatherState>({
    frost: false,
    fog: false,
    rain: false,
  });

  // Player State
  const [playerState, setPlayerState] = useState<PlayerGwentState>(() => {
    const rawDeck = (playerProfile.deckCardIds && playerProfile.deckCardIds.length >= 10)
      ? playerProfile.deckCardIds
      : playerFactionConfig.starterDeckIds;

    const fullCards: Card[] = rawDeck
      .map(id => require('../config/cards').getCardById(id))
      .filter((c): c is Card => !!c)
      .map(c => ({ ...c }));

    const shuffled = MatchmakerService.shuffle(fullCards);
    const hand = shuffled.splice(0, 10); // Gwent starting hand: 10 cards

    return {
      id: playerProfile.id,
      name: playerProfile.name,
      mmr: playerProfile.mmr,
      faction: playerFaction,
      lives: 2,
      hasPassed: false,
      hand,
      deck: shuffled,
      graveyard: [],
      meleeRow: [],
      rangedRow: [],
      siegeRow: [],
      hasMeleeHorn: false,
      hasRangedHorn: false,
      hasSiegeHorn: false,
      leader: playerFactionConfig.leader,
      hasUsedLeader: false,
    };
  });

  // Opponent State
  const [opponentState, setOpponentState] = useState<PlayerGwentState>(() => {
    const oppDeck = [...opponent.deck];
    const shuffled = MatchmakerService.shuffle(oppDeck);
    const hand = shuffled.splice(0, 10);

    return {
      id: opponent.id,
      name: opponent.name,
      mmr: opponent.mmr,
      faction: opponent.faction,
      lives: 2,
      hasPassed: false,
      hand,
      deck: shuffled,
      graveyard: [],
      meleeRow: [],
      rangedRow: [],
      siegeRow: [],
      hasMeleeHorn: false,
      hasRangedHorn: false,
      hasSiegeHorn: false,
      leader: opponent.leader,
      hasUsedLeader: false,
      isBot: true,
    };
  });

  // Start with Mulligan Phase
  useEffect(() => {
    setShowMulligan(true);
    setPhase('mulligan');
    addLog(`Battle commences! Round 1 begins between ${playerState.name} (${playerState.faction}) and ${opponentState.name} (${opponentState.faction}).`, 'turn', 'player');
  }, []);

  // Turn Timer
  useEffect(() => {
    if (phase !== 'player_turn' && phase !== 'opponent_turn') return;

    const timer = setInterval(() => {
      setTurnTimeLeft(prev => {
        if (prev <= 1) {
          // Time expired
          if (phase === 'player_turn') {
            handlePassRound();
          }
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, playerState.hasPassed, opponentState.hasPassed]);

  // Opponent AI Turn Engine
  useEffect(() => {
    if (phase !== 'opponent_turn') return;
    if (opponentState.hasPassed) {
      if (!playerState.hasPassed) {
        setPhase('player_turn');
        setTurnTimeLeft(30);
      } else {
        resolveRoundEnd();
      }
      return;
    }

    const aiDelay = setTimeout(() => {
      executeAiTurn();
    }, 1200);

    return () => clearTimeout(aiDelay);
  }, [phase, opponentState.hasPassed, playerState.hasPassed]);

  // Evaluated scores
  const playerEval = GwentEngine.evaluatePlayerBoard(playerState, weather);
  const oppEval = GwentEngine.evaluatePlayerBoard(opponentState, weather);

  const addLog = (text: string, type: 'attack' | 'spell' | 'summon' | 'turn' | 'heal', actor: 'player' | 'opponent') => {
    setCombatLogs(prev => [
      { id: Math.random().toString(), turn: roundNumber, text, type, actor },
      ...prev.slice(0, 30),
    ]);
  };

  // -------------------------------------------------------------
  // MULLIGAN HANDLERS
  // -------------------------------------------------------------
  const handleMulliganRedraw = (index: number) => {
    if (mulliganRedrawsLeft <= 0) return;
    SoundService.playCardDrop();

    const newHand = [...playerState.hand];
    const newDeck = [...playerState.deck];

    const returnedCard = newHand.splice(index, 1)[0];
    newDeck.push(returnedCard);
    const shuffled = MatchmakerService.shuffle(newDeck);
    const drawn = shuffled.shift();
    if (drawn) {
      newHand.push(drawn);
    }

    setPlayerState(prev => ({ ...prev, hand: newHand, deck: shuffled }));
    setMulliganRedrawsLeft(prev => prev - 1);
  };

  const handleConfirmMulligan = () => {
    setShowMulligan(false);
    setPhase('player_turn');
    setTurnTimeLeft(30);
  };

  // -------------------------------------------------------------
  // PLAYING CARDS
  // -------------------------------------------------------------
  const selectedCard = selectedHandIndex !== null ? playerState.hand[selectedHandIndex] : null;

  const handleCardPress = (index: number) => {
    if (phase !== 'player_turn' || playerState.hasPassed) return;
    SoundService.playButtonClick();

    if (selectedHandIndex === index) {
      setSelectedHandIndex(null);
      setIsDecoyTargeting(false);
    } else {
      setSelectedHandIndex(index);
      const card = playerState.hand[index];
      if (card.ability === 'decoy') {
        setIsDecoyTargeting(true);
      } else {
        setIsDecoyTargeting(false);
      }
    }
  };

  const deploySelectedCard = (targetRow?: 'melee' | 'ranged' | 'siege') => {
    if (!selectedCard || selectedHandIndex === null) return;
    executeCardPlay(selectedCard, selectedHandIndex, targetRow, 'player');
    setSelectedHandIndex(null);
    setIsDecoyTargeting(false);
  };

  const executeCardPlay = (
    card: Card,
    handIndex: number,
    targetRow: 'melee' | 'ranged' | 'siege' | undefined,
    actor: 'player' | 'opponent'
  ) => {
    SoundService.playCardDrop();

    const isPlayer = actor === 'player';
    let currentActorState = isPlayer ? { ...playerState } : { ...opponentState };
    let currentEnemyState = isPlayer ? { ...opponentState } : { ...playerState };

    // Remove card from hand
    currentActorState.hand = [...currentActorState.hand];
    currentActorState.hand.splice(handIndex, 1);

    addLog(`${currentActorState.name} plays ${card.name} (${card.power} Power).`, 'summon', actor);

    // 1. Weather Cards
    if (card.ability === 'weather_frost') {
      setWeather(prev => ({ ...prev, frost: true }));
      addLog(`❄️ Fuji Blizzard blankets the Melee rows!`, 'spell', actor);
    } else if (card.ability === 'weather_fog') {
      setWeather(prev => ({ ...prev, fog: true }));
      addLog(`🌫️ Poison Bamboo Fog blankets the Ranged rows!`, 'spell', actor);
    } else if (card.ability === 'weather_rain') {
      setWeather(prev => ({ ...prev, rain: true }));
      addLog(`🌧️ Typhoon Torrent floods the Siege rows!`, 'spell', actor);
    } else if (card.ability === 'clear_weather') {
      setWeather({ frost: false, fog: false, rain: false });
      addLog(`☀️ Amaterasu Dawn dispels all weather calamities!`, 'spell', actor);
    }
    // 2. Commander's Horn
    else if (card.ability === 'horn' && targetRow) {
      if (targetRow === 'melee') currentActorState.hasMeleeHorn = true;
      if (targetRow === 'ranged') currentActorState.hasRangedHorn = true;
      if (targetRow === 'siege') currentActorState.hasSiegeHorn = true;
      addLog(`🥁 War Taiko drum beats in the ${targetRow} row, doubling strength!`, 'spell', actor);
    }
    // 3. Scorch (Global)
    else if (card.ability === 'scorch') {
      const res = GwentEngine.executeScorch(currentEnemyState);
      currentEnemyState.meleeRow = res.newMelee;
      currentEnemyState.rangedRow = res.newRanged;
      currentEnemyState.siegeRow = res.newSiege;
      currentEnemyState.graveyard = [...currentEnemyState.graveyard, ...res.destroyed];
      addLog(`🔥 Scorch immolates ${res.destroyed.length} enemy warriors!`, 'spell', actor);
    }
    // 4. Spy (Deploys to OPPONENT board, draws 2 cards!)
    else if (card.ability === 'spy') {
      const spyRow = targetRow || (card.row === 'agile' ? 'melee' : card.row as any);
      const newUnit: BoardUnit = {
        ...card,
        instanceId: Math.random().toString(),
        assignedRow: spyRow,
        currentPower: card.power,
        basePower: card.power,
      };

      if (spyRow === 'melee') currentEnemyState.meleeRow = [...currentEnemyState.meleeRow, newUnit];
      if (spyRow === 'ranged') currentEnemyState.rangedRow = [...currentEnemyState.rangedRow, newUnit];
      if (spyRow === 'siege') currentEnemyState.siegeRow = [...currentEnemyState.siegeRow, newUnit];

      // Draw 2 cards for player who played spy
      const deckCopy = [...currentActorState.deck];
      const drawn = deckCopy.splice(0, 2);
      currentActorState.deck = deckCopy;
      currentActorState.hand = [...currentActorState.hand, ...drawn];
      addLog(`🕵️ Spy infiltrated enemy lines! Drew 2 cards.`, 'spell', actor);
    }
    // 5. Units (Standard, Tight Bond, Muster, Medic)
    else {
      const resolvedRow = targetRow || (card.row === 'agile' ? 'melee' : card.row as any);
      const newUnit: BoardUnit = {
        ...card,
        instanceId: Math.random().toString(),
        assignedRow: resolvedRow,
        currentPower: card.power,
        basePower: card.power,
      };

      // Check Scorch Melee
      if (card.ability === 'scorch_melee') {
        const oppMeleePower = GwentEngine.calculateRowPower(currentEnemyState.meleeRow, weather.frost, currentEnemyState.hasMeleeHorn).totalPower;
        if (oppMeleePower >= 10) {
          const res = GwentEngine.executeScorch(currentEnemyState, 'melee');
          currentEnemyState.meleeRow = res.newMelee;
          currentEnemyState.graveyard = [...currentEnemyState.graveyard, ...res.destroyed];
          addLog(`🩸 Shadow Decapitation executed ${res.destroyed.length} enemy melee units!`, 'attack', actor);
        }
      }

      // Add to actor's board row
      if (resolvedRow === 'melee') currentActorState.meleeRow = [...currentActorState.meleeRow, newUnit];
      if (resolvedRow === 'ranged') currentActorState.rangedRow = [...currentActorState.rangedRow, newUnit];
      if (resolvedRow === 'siege') currentActorState.siegeRow = [...currentActorState.siegeRow, newUnit];

      // Check Muster
      if (card.ability === 'muster' && card.musterGroup) {
        const group = card.musterGroup;
        const pulledFromHand: Card[] = [];
        currentActorState.hand = currentActorState.hand.filter(c => {
          if (c.musterGroup === group) {
            pulledFromHand.push(c);
            return false;
          }
          return true;
        });

        const pulledFromDeck: Card[] = [];
        currentActorState.deck = currentActorState.deck.filter(c => {
          if (c.musterGroup === group) {
            pulledFromDeck.push(c);
            return false;
          }
          return true;
        });

        const allMuster = [...pulledFromHand, ...pulledFromDeck];
        allMuster.forEach(mc => {
          const mUnit: BoardUnit = {
            ...mc,
            instanceId: Math.random().toString(),
            assignedRow: resolvedRow,
            currentPower: mc.power,
            basePower: mc.power,
          };
          if (resolvedRow === 'melee') currentActorState.meleeRow.push(mUnit);
          if (resolvedRow === 'ranged') currentActorState.rangedRow.push(mUnit);
          if (resolvedRow === 'siege') currentActorState.siegeRow.push(mUnit);
        });

        if (allMuster.length > 0) {
          addLog(`👥 Muster summoned ${allMuster.length} reinforcements onto the field!`, 'summon', actor);
        }
      }

      // Check Medic
      if (card.ability === 'medic') {
        if (isPlayer) {
          setShowMedicModal(true);
        } else {
          // AI Medic logic
          const eligible = currentActorState.graveyard.filter(c => c.type === 'unit' && !c.isHero);
          if (eligible.length > 0) {
            eligible.sort((a, b) => b.power - a.power);
            const revived = eligible[0];
            currentActorState.graveyard = currentActorState.graveyard.filter(c => c.id !== revived.id);
            const revivedRow = revived.row === 'agile' ? 'melee' : revived.row as any;
            const rUnit: BoardUnit = {
              ...revived,
              instanceId: Math.random().toString(),
              assignedRow: revivedRow,
              currentPower: revived.power,
              basePower: revived.power,
            };
            if (revivedRow === 'melee') currentActorState.meleeRow.push(rUnit);
            if (revivedRow === 'ranged') currentActorState.rangedRow.push(rUnit);
            if (revivedRow === 'siege') currentActorState.siegeRow.push(rUnit);
            addLog(`💉 Medic revived ${revived.name}!`, 'heal', actor);
          }
        }
      }
    }

    // Save states back
    if (isPlayer) {
      setPlayerState(currentActorState);
      setOpponentState(currentEnemyState);
      // Switch turn if opponent hasn't passed
      if (!opponentState.hasPassed) {
        setPhase('opponent_turn');
        setTurnTimeLeft(30);
      }
    } else {
      setOpponentState(currentActorState);
      setPlayerState(currentEnemyState);
      // Switch turn if player hasn't passed
      if (!playerState.hasPassed) {
        setPhase('player_turn');
        setTurnTimeLeft(30);
      }
    }
  };

  // Decoy swap handler
  const handleDecoyTargetUnit = (unit: BoardUnit) => {
    if (!isDecoyTargeting || selectedHandIndex === null || unit.isHero) return;
    SoundService.playCardDrop();

    const decoyCard = playerState.hand[selectedHandIndex];
    const row = unit.assignedRow;

    // Filter out target unit from row
    const newMelee = row === 'melee' ? playerState.meleeRow.filter(u => u.instanceId !== unit.instanceId) : playerState.meleeRow;
    const newRanged = row === 'ranged' ? playerState.rangedRow.filter(u => u.instanceId !== unit.instanceId) : playerState.rangedRow;
    const newSiege = row === 'siege' ? playerState.siegeRow.filter(u => u.instanceId !== unit.instanceId) : playerState.siegeRow;

    // Add Decoy unit in its place
    const decoyUnit: BoardUnit = {
      ...decoyCard,
      instanceId: Math.random().toString(),
      assignedRow: row,
      currentPower: 0,
      basePower: 0,
    };
    if (row === 'melee') newMelee.push(decoyUnit);
    if (row === 'ranged') newRanged.push(decoyUnit);
    if (row === 'siege') newSiege.push(decoyUnit);

    // Return target unit to hand, remove decoy from hand
    const newHand = [...playerState.hand];
    newHand.splice(selectedHandIndex, 1);
    newHand.push({ ...unit });

    setPlayerState(prev => ({
      ...prev,
      hand: newHand,
      meleeRow: newMelee,
      rangedRow: newRanged,
      siegeRow: newSiege,
    }));

    setSelectedHandIndex(null);
    setIsDecoyTargeting(false);
    addLog(`🪵 Decoy Kawarimi swapped ${unit.name} back into your hand!`, 'spell', 'player');

    if (!opponentState.hasPassed) {
      setPhase('opponent_turn');
      setTurnTimeLeft(30);
    }
  };

  // Medic Revive
  const handleSelectRevive = (card: Card) => {
    setShowMedicModal(false);
    const revivedRow = card.row === 'agile' ? 'melee' : card.row as any;
    const rUnit: BoardUnit = {
      ...card,
      instanceId: Math.random().toString(),
      assignedRow: revivedRow,
      currentPower: card.power,
      basePower: card.power,
    };

    setPlayerState(prev => {
      const newGrave = prev.graveyard.filter(c => c.id !== card.id);
      const newMelee = revivedRow === 'melee' ? [...prev.meleeRow, rUnit] : prev.meleeRow;
      const newRanged = revivedRow === 'ranged' ? [...prev.rangedRow, rUnit] : prev.rangedRow;
      const newSiege = revivedRow === 'siege' ? [...prev.siegeRow, rUnit] : prev.siegeRow;
      return {
        ...prev,
        graveyard: newGrave,
        meleeRow: newMelee,
        rangedRow: newRanged,
        siegeRow: newSiege,
      };
    });

    addLog(`💉 Shrine Maiden revived ${card.name} onto the ${revivedRow} row!`, 'heal', 'player');
  };

  // -------------------------------------------------------------
  // LEADER ABILITIES
  // -------------------------------------------------------------
  const handleUsePlayerLeader = () => {
    if (playerState.hasUsedLeader || phase !== 'player_turn' || playerState.hasPassed) return;
    SoundService.playCardDrop();

    const leader = playerState.leader;
    addLog(`👑 ${playerState.name} commands Leader Ability: ${leader.name}!`, 'spell', 'player');

    if (playerFaction === 'shinobi') {
      // Hanzo: Summons a 2-power spy clone to opponent's ranged row, draws 1 card
      const spyClone: BoardUnit = {
        id: 'clone_spy',
        name: 'Shadow Clone Spy',
        faction: 'shinobi',
        type: 'unit',
        row: 'ranged',
        power: 2,
        rarity: 'common',
        ability: 'none',
        description: 'Illusionary shadow clone.',
        icon: '👤',
        color: '#8B5CF6',
        instanceId: Math.random().toString(),
        assignedRow: 'ranged',
        currentPower: 2,
        basePower: 2,
      };
      setOpponentState(prev => ({
        ...prev,
        rangedRow: [...prev.rangedRow, spyClone],
      }));
      setPlayerState(prev => {
        const deckCopy = [...prev.deck];
        const drawn = deckCopy.shift();
        return {
          ...prev,
          deck: deckCopy,
          hand: drawn ? [...prev.hand, drawn] : prev.hand,
          hasUsedLeader: true,
        };
      });
      addLog(`👤 Shadow Clone spy deployed! Drew 1 card.`, 'spell', 'player');
    } else if (playerFaction === 'bushido') {
      // Tadakatsu: War Horn on Melee row
      setPlayerState(prev => ({
        ...prev,
        hasMeleeHorn: true,
        hasUsedLeader: true,
      }));
      addLog(`🎺 Tadakatsu sound the War Horn on Melee row!`, 'spell', 'player');
    } else if (playerFaction === 'yokai') {
      // Shuten-Doji: Summon two 3-power Oni Goblins onto Melee row
      const goblin1: BoardUnit = {
        id: 'yo_oni_imp_1',
        name: 'Lesser Oni Imp',
        faction: 'yokai',
        type: 'unit',
        row: 'melee',
        power: 3,
        rarity: 'common',
        ability: 'none',
        description: 'Fierce little horned imp.',
        icon: '👺',
        color: '#059669',
        instanceId: Math.random().toString(),
        assignedRow: 'melee',
        currentPower: 3,
        basePower: 3,
      };
      const goblin2: BoardUnit = { ...goblin1, instanceId: Math.random().toString() };
      setPlayerState(prev => ({
        ...prev,
        meleeRow: [...prev.meleeRow, goblin1, goblin2],
        hasUsedLeader: true,
      }));
      addLog(`👺 Night Parade summoned two Oni Imps to your Melee row!`, 'summon', 'player');
    } else if (playerFaction === 'onmyo') {
      // Seimei: Clears all weather
      setWeather({ frost: false, fog: false, rain: false });
      setPlayerState(prev => ({ ...prev, hasUsedLeader: true }));
      addLog(`✨ Abe no Seimei purified the heavens! All weather cleared.`, 'spell', 'player');
    } else if (playerFaction === 'shogunate') {
      // Tokugawa: Scorch enemy Siege row
      const res = GwentEngine.executeScorch(opponentState, 'siege');
      setOpponentState(prev => ({
        ...prev,
        siegeRow: res.newSiege,
        graveyard: [...prev.graveyard, ...res.destroyed],
      }));
      setPlayerState(prev => ({ ...prev, hasUsedLeader: true }));
      addLog(`💣 Artillery Barrage scorched ${res.destroyed.length} units on enemy Siege row!`, 'spell', 'player');
    }
  };

  // -------------------------------------------------------------
  // PASSING & ROUND RESOLUTION
  // -------------------------------------------------------------
  const handlePassRound = () => {
    SoundService.playButtonClick();
    addLog(`${playerState.name} has PASSED for this round.`, 'turn', 'player');

    setPlayerState(prev => ({ ...prev, hasPassed: true }));
    setSelectedHandIndex(null);

    if (opponentState.hasPassed) {
      resolveRoundEnd();
    } else {
      setPhase('opponent_turn');
      setTurnTimeLeft(30);
    }
  };

  const executeAiTurn = () => {
    const move = MatchmakerService.decideAiMove(opponentState, playerState, weather, roundNumber);

    if (move.action === 'pass') {
      addLog(`${opponentState.name} has PASSED for this round.`, 'turn', 'opponent');
      setOpponentState(prev => ({ ...prev, hasPassed: true }));

      if (playerState.hasPassed) {
        resolveRoundEnd();
      } else {
        setPhase('player_turn');
        setTurnTimeLeft(30);
      }
    } else if (move.action === 'play_card' && move.cardIndex !== undefined) {
      const card = opponentState.hand[move.cardIndex];
      executeCardPlay(card, move.cardIndex, move.targetRow, 'opponent');
    }
  };

  const resolveRoundEnd = () => {
    setPhase('round_end');

    const finalPlayerScore = playerEval.totalScore;
    const finalOppScore = oppEval.totalScore;

    const roundWinner = GwentEngine.determineRoundWinner(
      finalPlayerScore,
      finalOppScore,
      playerFaction,
      opponentState.faction
    );

    let newPlayerLives = playerState.lives;
    let newOppLives = opponentState.lives;

    if (roundWinner === 'player') {
      newOppLives -= 1;
      setRoundBannerText(`ROUND ${roundNumber} VICTORY! (${finalPlayerScore} vs ${finalOppScore})`);
      addLog(`🏆 ${playerState.name} wins Round ${roundNumber}! ${opponentState.name} loses 1 Gem.`, 'turn', 'player');
    } else if (roundWinner === 'opponent') {
      newPlayerLives -= 1;
      setRoundBannerText(`ROUND ${roundNumber} DEFEAT! (${finalPlayerScore} vs ${finalOppScore})`);
      addLog(`💀 ${opponentState.name} wins Round ${roundNumber}! ${playerState.name} loses 1 Gem.`, 'turn', 'opponent');
    } else {
      // Tie
      newPlayerLives -= 1;
      newOppLives -= 1;
      setRoundBannerText(`ROUND ${roundNumber} TIE! Both lose 1 Gem.`);
      addLog(`⚖️ Round ${roundNumber} ended in a Draw! Both lose 1 Gem.`, 'turn', 'player');
    }

    const record: RoundScoreRecord = {
      round: roundNumber,
      playerScore: finalPlayerScore,
      opponentScore: finalOppScore,
      winner: roundWinner,
    };
    const updatedHistory = [...roundScoresHistory, record];
    setRoundScoresHistory(updatedHistory);

    // Check Match Game Over
    if (newPlayerLives <= 0 || newOppLives <= 0) {
      setTimeout(() => {
        finishMatch(newPlayerLives, newOppLives, updatedHistory);
      }, 2000);
      return;
    }

    // Prepare for Next Round
    setTimeout(() => {
      prepareNextRound(newPlayerLives, newOppLives);
    }, 2500);
  };

  const prepareNextRound = (nextPlayerLives: number, nextOppLives: number) => {
    // Clear board & apply Yokai passive
    const playerClean = GwentEngine.resolveRoundEndBoard(playerState);
    const oppClean = GwentEngine.resolveRoundEndBoard(opponentState);

    // Draw cards for next round: Round 2 gives 2 cards, Round 3 gives 1 card
    const cardsToDraw = roundNumber === 1 ? 2 : 1;

    // Player draw
    let playerDeck = [...playerState.deck];
    let extraDraws = 0;
    // Onmyo passive: +1 card if lost round
    if (playerFaction === 'onmyo' && nextPlayerLives < playerState.lives) extraDraws += 1;
    // Shogunate passive: +1 card on round transition
    if (playerFaction === 'shogunate') extraDraws += 1;

    const playerDrawn = playerDeck.splice(0, cardsToDraw + extraDraws);

    // Opponent draw
    let oppDeck = [...opponentState.deck];
    let oppExtra = 0;
    if (opponentState.faction === 'onmyo' && nextOppLives < opponentState.lives) oppExtra += 1;
    if (opponentState.faction === 'shogunate') oppExtra += 1;
    const oppDrawn = oppDeck.splice(0, cardsToDraw + oppExtra);

    setPlayerState(prev => ({
      ...prev,
      lives: nextPlayerLives,
      hasPassed: false,
      hand: [...prev.hand, ...playerDrawn],
      deck: playerDeck,
      graveyard: [...prev.graveyard, ...playerClean.graveyardAdditions],
      meleeRow: playerClean.survivingUnits.melee,
      rangedRow: playerClean.survivingUnits.ranged,
      siegeRow: playerClean.survivingUnits.siege,
      hasMeleeHorn: false,
      hasRangedHorn: false,
      hasSiegeHorn: false,
    }));

    setOpponentState(prev => ({
      ...prev,
      lives: nextOppLives,
      hasPassed: false,
      hand: [...prev.hand, ...oppDrawn],
      deck: oppDeck,
      graveyard: [...prev.graveyard, ...oppClean.graveyardAdditions],
      meleeRow: oppClean.survivingUnits.melee,
      rangedRow: oppClean.survivingUnits.ranged,
      siegeRow: oppClean.survivingUnits.siege,
      hasMeleeHorn: false,
      hasRangedHorn: false,
      hasSiegeHorn: false,
    }));

    // Reset weather
    setWeather({ frost: false, fog: false, rain: false });
    setRoundNumber(prev => prev + 1);
    setRoundBannerText(null);
    setPhase('player_turn');
    setTurnTimeLeft(30);

    addLog(`Round ${roundNumber + 1} begins! Both players received reinforcements.`, 'turn', 'player');
  };

  const finishMatch = (finalPlayerLives: number, finalOppLives: number, history: RoundScoreRecord[]) => {
    const isPlayerVictory = finalOppLives <= 0 && finalPlayerLives > 0;
    const isTie = finalOppLives <= 0 && finalPlayerLives <= 0;
    const winner: 'player' | 'opponent' | 'tie' = isPlayerVictory ? 'player' : (isTie ? 'tie' : 'opponent');

    const mmrDelta = isPlayerVictory ? 25 : (isTie ? 0 : -20);
    const newMmr = Math.max(100, playerProfile.mmr + mmrDelta);

    const resultData: MatchResultData = {
      winner,
      oldMmr: playerProfile.mmr,
      newMmr,
      mmrDelta,
      roundsPlayed: history.length,
      roundScores: history,
      goldEarned: isPlayerVictory ? 150 : 50,
      xpEarned: isPlayerVictory ? 120 : 50,
      streakBonus: isPlayerVictory && playerProfile.winStreak >= 2,
      playerFaction,
      opponentFaction: opponentState.faction,
    };

    onMatchComplete(resultData);
  };

  return (
    <View style={styles.screen}>
      {/* Gwent Top Score Header & Round Gems */}
      <GwentScoreHeader
        playerName={playerState.name}
        playerFaction={playerFaction}
        playerLives={playerState.lives}
        playerTotalScore={playerEval.totalScore}
        playerHandCount={playerState.hand.length}
        playerPassed={playerState.hasPassed}
        playerLeader={playerState.leader}
        playerLeaderUsed={playerState.hasUsedLeader}
        onUsePlayerLeader={handleUsePlayerLeader}

        opponentName={opponentState.name}
        opponentFaction={opponentState.faction}
        opponentLives={opponentState.lives}
        opponentTotalScore={oppEval.totalScore}
        opponentHandCount={opponentState.hand.length}
        opponentPassed={opponentState.hasPassed}
        opponentLeader={opponentState.leader}
        opponentLeaderUsed={opponentState.hasUsedLeader}

        weather={weather}
        roundNumber={roundNumber}
        turnTimeLeft={turnTimeLeft}
        isPlayerTurn={phase === 'player_turn' && !playerState.hasPassed}
        onPassRound={handlePassRound}
      />

      {/* Round End Banner Overlay */}
      {roundBannerText && (
        <View style={styles.roundBannerContainer}>
          <Text style={styles.roundBannerText}>{roundBannerText}</Text>
        </View>
      )}

      {/* Main 6-Row Gwent Battlefield */}
      <ScrollView style={styles.boardScroll} showsVerticalScrollIndicator={false}>
        {/* OPPONENT ROWS (Top to Bottom: Siege -> Ranged -> Melee) */}
        <BoardRowView
          rowType="siege"
          label="OPP SIEGE"
          isOpponent
          units={opponentState.siegeRow}
          hasHorn={opponentState.hasSiegeHorn}
          hasWeather={weather.rain}
          rowScore={oppEval.siegeScore}
          isValidTarget={selectedCard?.ability === 'spy' && selectedCard.row === 'siege'}
          onRowPress={() => deploySelectedCard('siege')}
        />

        <BoardRowView
          rowType="ranged"
          label="OPP RANGED"
          isOpponent
          units={opponentState.rangedRow}
          hasHorn={opponentState.hasRangedHorn}
          hasWeather={weather.fog}
          rowScore={oppEval.rangedScore}
          isValidTarget={selectedCard?.ability === 'spy' && (selectedCard.row === 'ranged' || selectedCard.row === 'agile')}
          onRowPress={() => deploySelectedCard('ranged')}
        />

        <BoardRowView
          rowType="melee"
          label="OPP MELEE"
          isOpponent
          units={opponentState.meleeRow}
          hasHorn={opponentState.hasMeleeHorn}
          hasWeather={weather.frost}
          rowScore={oppEval.meleeScore}
          isValidTarget={selectedCard?.ability === 'spy' && (selectedCard.row === 'melee' || selectedCard.row === 'agile')}
          onRowPress={() => deploySelectedCard('melee')}
        />

        <View style={styles.battlefieldDivider}>
          <Text style={styles.dividerKanji}>⚔️ 決戦の刻 ⚔️</Text>
        </View>

        {/* PLAYER ROWS (Top to Bottom: Melee -> Ranged -> Siege) */}
        <BoardRowView
          rowType="melee"
          label="MELEE"
          units={playerState.meleeRow}
          hasHorn={playerState.hasMeleeHorn}
          hasWeather={weather.frost}
          rowScore={playerEval.meleeScore}
          isValidTarget={
            selectedCard?.type === 'unit' &&
            selectedCard.ability !== 'spy' &&
            (selectedCard.row === 'melee' || selectedCard.row === 'agile') ||
            selectedCard?.ability === 'horn'
          }
          onRowPress={() => deploySelectedCard('melee')}
          onUnitPress={handleDecoyTargetUnit}
        />

        <BoardRowView
          rowType="ranged"
          label="RANGED"
          units={playerState.rangedRow}
          hasHorn={playerState.hasRangedHorn}
          hasWeather={weather.fog}
          rowScore={playerEval.rangedScore}
          isValidTarget={
            selectedCard?.type === 'unit' &&
            selectedCard.ability !== 'spy' &&
            (selectedCard.row === 'ranged' || selectedCard.row === 'agile') ||
            selectedCard?.ability === 'horn'
          }
          onRowPress={() => deploySelectedCard('ranged')}
          onUnitPress={handleDecoyTargetUnit}
        />

        <BoardRowView
          rowType="siege"
          label="SIEGE"
          units={playerState.siegeRow}
          hasHorn={playerState.hasSiegeHorn}
          hasWeather={weather.rain}
          rowScore={playerEval.siegeScore}
          isValidTarget={
            selectedCard?.type === 'unit' &&
            selectedCard.ability !== 'spy' &&
            selectedCard.row === 'siege' ||
            selectedCard?.ability === 'horn'
          }
          onRowPress={() => deploySelectedCard('siege')}
          onUnitPress={handleDecoyTargetUnit}
        />
      </ScrollView>

      {/* Selected Special Action Bar (For Scorch, Weather, etc.) */}
      {selectedCard && (selectedCard.type === 'weather' || selectedCard.ability === 'scorch') && (
        <View style={styles.specialCardActionBanner}>
          <Text style={styles.specialActionText}>
            Selected: <Text style={styles.specialActionBold}>{selectedCard.name}</Text>
          </Text>
          <TouchableOpacity
            style={styles.castSpecialButton}
            onPress={() => deploySelectedCard(undefined)}
          >
            <Text style={styles.castSpecialText}>CAST TO BATTLEFIELD ⚡</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Decoy Targeting Instructions */}
      {isDecoyTargeting && (
        <View style={styles.decoyNoticeBanner}>
          <Text style={styles.decoyNoticeText}>
            🪵 Tap a friendly non-hero card on the battlefield to return it to your hand!
          </Text>
        </View>
      )}

      {/* Bottom Player Hand Tray */}
      <View style={styles.handTrayContainer}>
        <View style={styles.handHeaderRow}>
          <Text style={styles.handTitle}>
            YOUR HAND ({playerState.hand.length})
          </Text>
          <TouchableOpacity style={styles.surrenderPill} onPress={onSurrender}>
            <Text style={styles.surrenderText}>Surrender</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.handScroll}
        >
          {playerState.hand.map((card, idx) => (
            <CardView
              key={`${card.id}_${idx}`}
              card={card}
              selected={selectedHandIndex === idx}
              disabled={phase !== 'player_turn' || playerState.hasPassed}
              onPress={() => handleCardPress(idx)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Opening Mulligan Modal */}
      <MulliganModal
        visible={showMulligan}
        hand={playerState.hand}
        redrawsLeft={mulliganRedrawsLeft}
        onRedrawCard={handleMulliganRedraw}
        onConfirmHand={handleConfirmMulligan}
      />

      {/* Medic Revive Modal */}
      <MedicReviveModal
        visible={showMedicModal}
        graveyard={playerState.graveyard}
        onSelectRevive={handleSelectRevive}
        onCancel={() => setShowMedicModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#090807',
  },
  boardScroll: {
    flex: 1,
    paddingHorizontal: 6,
  },
  battlefieldDivider: {
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1917',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#78350F',
    marginVertical: 2,
  },
  dividerKanji: {
    color: '#D97706',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },
  roundBannerContainer: {
    backgroundColor: '#991B1B',
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: '#F59E0B',
  },
  roundBannerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  specialCardActionBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#7C2D12',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderColor: '#EA580C',
  },
  specialActionText: {
    color: '#FEF08A',
    fontSize: 11,
  },
  specialActionBold: {
    fontWeight: '900',
  },
  castSpecialButton: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  castSpecialText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  decoyNoticeBanner: {
    backgroundColor: '#78350F',
    paddingVertical: 6,
    alignItems: 'center',
  },
  decoyNoticeText: {
    color: '#FEF3C7',
    fontSize: 11,
    fontWeight: '800',
  },
  handTrayContainer: {
    backgroundColor: '#141210',
    borderTopWidth: 2,
    borderTopColor: '#44403C',
    paddingTop: 4,
    paddingBottom: 8,
  },
  handHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  handTitle: {
    color: '#A8A29E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  surrenderPill: {
    backgroundColor: '#292524',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  surrenderText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '700',
  },
  handScroll: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
