import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { BoardSlot } from '../components/BoardSlot';
import { CardView } from '../components/CardView';
import { HeroView } from '../components/HeroView';
import { ManaBar } from '../components/ManaBar';
import { BoardUnit, Card } from '../types/card';
import { BattlePhase, CombatLogEntry, PlayerBattleState, MatchResultData } from '../types/game';
import { PlayerProfile } from '../types/mmr';
import { OpponentMatchCandidate, MatchmakerService } from '../services/matchmakerService';
import { MmrEngine } from '../services/mmrEngine';
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
  const [turn, setTurn] = useState(1);
  const [turnTimeLeft, setTurnTimeLeft] = useState(25);
  const [phase, setPhase] = useState<BattlePhase>('player_turn');
  const [selectedHandIndex, setSelectedHandIndex] = useState<number | null>(null);
  const [selectedUnitInstanceId, setSelectedUnitInstanceId] = useState<string | null>(null);
  const [combatLogs, setCombatLogs] = useState<CombatLogEntry[]>([]);

  // Player State
  const [playerState, setPlayerState] = useState<PlayerBattleState>(() => {
    const deck = MatchmakerService.shuffle([...opponent.deck]);
    const hand = deck.splice(0, 3);
    return {
      id: playerProfile.id,
      name: playerProfile.name,
      mmr: playerProfile.mmr,
      hp: 25,
      maxHp: 25,
      currentMana: 1,
      maxMana: 1,
      hand,
      deck,
      board: [],
    };
  });

  // Opponent State
  const [opponentState, setOpponentState] = useState<PlayerBattleState>(() => {
    const deck = MatchmakerService.shuffle([...opponent.deck]);
    const hand = deck.splice(0, 3);
    return {
      id: opponent.id,
      name: opponent.name,
      mmr: opponent.mmr,
      hp: 25,
      maxHp: 25,
      currentMana: 1,
      maxMana: 1,
      hand,
      deck,
      board: [],
      isBot: true,
    };
  });

  const addLog = (text: string, type: CombatLogEntry['type'], actor: 'player' | 'opponent') => {
    setCombatLogs(prev => [
      { id: Math.random().toString(), turn, text, type, actor },
      ...prev.slice(0, 15),
    ]);
  };

  // Turn Timer countdown
  useEffect(() => {
    if (phase === 'victory' || phase === 'defeat') return;

    const timer = setInterval(() => {
      setTurnTimeLeft(prev => {
        if (prev <= 1) {
          if (phase === 'player_turn') {
            endPlayerTurn();
          }
          return 25;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, turn]);

  // Check Game Over
  useEffect(() => {
    if (opponentState.hp <= 0 && phase !== 'victory') {
      setPhase('victory');
      SoundService.playVictory();
      const mmrCalc = MmrEngine.calculateMmrChange(
        playerProfile.mmr,
        opponent.mmr,
        true,
        playerProfile.wins + playerProfile.losses,
        playerProfile.winStreak
      );
      onMatchComplete({
        winner: 'player',
        oldMmr: playerProfile.mmr,
        newMmr: mmrCalc.newMmr,
        mmrDelta: mmrCalc.change,
        decayApplied: mmrCalc.decay,
        rankChange: mmrCalc.tierChange,
        oldTier: mmrCalc.oldTier,
        newTier: mmrCalc.newTier,
        tierStepDelta: mmrCalc.tierStepDelta,
        turnsPlayed: turn,
        goldEarned: 50,
        xpEarned: 100,
        streakBonus: mmrCalc.streakBonus,
      });
    } else if (playerState.hp <= 0 && phase !== 'defeat') {
      setPhase('defeat');
      SoundService.playDefeat();
      const mmrCalc = MmrEngine.calculateMmrChange(
        playerProfile.mmr,
        opponent.mmr,
        false,
        playerProfile.wins + playerProfile.losses,
        0
      );
      onMatchComplete({
        winner: 'opponent',
        oldMmr: playerProfile.mmr,
        newMmr: mmrCalc.newMmr,
        mmrDelta: mmrCalc.change,
        decayApplied: mmrCalc.decay,
        rankChange: mmrCalc.tierChange,
        oldTier: mmrCalc.oldTier,
        newTier: mmrCalc.newTier,
        tierStepDelta: mmrCalc.tierStepDelta,
        turnsPlayed: turn,
        goldEarned: 15,
        xpEarned: 35,
        streakBonus: false,
      });
    }
  }, [playerState.hp, opponentState.hp]);

  // Player Plays Card from Hand
  const handlePlayCard = (index: number) => {
    if (phase !== 'player_turn') return;
    const card = playerState.hand[index];
    if (card.cost > playerState.currentMana) return;

    if (card.type === 'unit') {
      if (playerState.board.length >= 4) {
        Alert.alert('Board Full', 'You can only have up to 4 units on the battlefield.');
        return;
      }

      SoundService.playCardDrop();
      const newUnit: BoardUnit = {
        ...card,
        instanceId: 'unit_' + Math.random().toString(),
        currentHp: card.hp || 1,
        currentAttack: card.attack || 1,
        canAttack: card.effect?.type === 'rush',
        hasGuard: card.effect?.type === 'guard',
      };

      // Apply battlecry effects
      if (card.effect?.type === 'damage_all') {
        const dmg = card.effect.value;
        setOpponentState(opp => ({
          ...opp,
          board: opp.board
            .map(u => ({ ...u, currentHp: u.currentHp - dmg }))
            .filter(u => u.currentHp > 0),
        }));
        addLog(`💥 ${card.name} dealt ${dmg} damage to all enemy units!`, 'spell', 'player');
      }

      setPlayerState(prev => ({
        ...prev,
        currentMana: prev.currentMana - card.cost,
        board: [...prev.board, newUnit],
        hand: prev.hand.filter((_, i) => i !== index),
      }));

      addLog(`🛡️ Summoned ${card.name}`, 'summon', 'player');
    } else if (card.type === 'spell') {
      // Cast Spell
      SoundService.playCardDrop();
      if (card.effect?.type === 'heal_hero') {
        const heal = card.effect.value;
        setPlayerState(prev => ({
          ...prev,
          currentMana: prev.currentMana - card.cost,
          hp: Math.min(prev.maxHp, prev.hp + heal),
          hand: prev.hand.filter((_, i) => i !== index),
        }));
        addLog(`✨ Cast ${card.name}: Healed Hero for +${heal} HP`, 'heal', 'player');
      } else if (card.effect?.type === 'damage_target') {
        const dmg = card.effect.value;
        setOpponentState(opp => ({
          ...opp,
          hp: Math.max(0, opp.hp - dmg),
        }));
        setPlayerState(prev => ({
          ...prev,
          currentMana: prev.currentMana - card.cost,
          hand: prev.hand.filter((_, i) => i !== index),
        }));
        addLog(`⚡ Cast ${card.name}: Dealt ${dmg} damage to Enemy Hero!`, 'spell', 'player');
      }
    }

    setSelectedHandIndex(null);
  };

  // Player attacks with selected unit
  const handleSelectAttacker = (unit: BoardUnit) => {
    if (phase !== 'player_turn' || !unit.canAttack) return;
    SoundService.playButtonClick();
    setSelectedUnitInstanceId(unit.instanceId === selectedUnitInstanceId ? null : unit.instanceId);
  };

  const handleAttackTarget = (targetUnit?: BoardUnit) => {
    if (!selectedUnitInstanceId || phase !== 'player_turn') return;
    const attacker = playerState.board.find(u => u.instanceId === selectedUnitInstanceId);
    if (!attacker || !attacker.canAttack) return;

    const oppGuards = opponentState.board.filter(u => u.hasGuard && u.currentHp > 0);

    if (targetUnit) {
      if (oppGuards.length > 0 && !targetUnit.hasGuard) {
        Alert.alert('Guard Active', 'You must attack enemy units with Guard first!');
        return;
      }

      SoundService.playAttack();
      // Unit trades damage
      const targetHpAfter = targetUnit.currentHp - attacker.currentAttack;
      const attackerHpAfter = attacker.currentHp - targetUnit.currentAttack;

      setOpponentState(opp => ({
        ...opp,
        board: opp.board
          .map(u => (u.instanceId === targetUnit.instanceId ? { ...u, currentHp: targetHpAfter } : u))
          .filter(u => u.currentHp > 0),
      }));

      setPlayerState(prev => ({
        ...prev,
        board: prev.board
          .map(u => (u.instanceId === attacker.instanceId ? { ...u, currentHp: attackerHpAfter, canAttack: false } : u))
          .filter(u => u.currentHp > 0),
      }));

      addLog(`⚔️ ${attacker.name} attacked ${targetUnit.name}`, 'attack', 'player');
    } else {
      // Attack Hero
      if (oppGuards.length > 0) {
        Alert.alert('Guard Active', 'You cannot attack the enemy hero while a Guard unit is on the field!');
        return;
      }

      SoundService.playAttack();
      setOpponentState(opp => ({
        ...opp,
        hp: Math.max(0, opp.hp - attacker.currentAttack),
      }));

      setPlayerState(prev => ({
        ...prev,
        board: prev.board.map(u => (u.instanceId === attacker.instanceId ? { ...u, canAttack: false } : u)),
      }));

      addLog(`🎯 ${attacker.name} hit Enemy Hero for ${attacker.currentAttack} DMG!`, 'attack', 'player');
    }

    setSelectedUnitInstanceId(null);
  };

  // Turn Transitions
  const endPlayerTurn = () => {
    setSelectedUnitInstanceId(null);
    setSelectedHandIndex(null);
    setPhase('opponent_turn');
    addLog(`⏳ Turn passed to ${opponent.name}`, 'turn', 'player');

    // Execute Bot AI Turn after short dramatic delay
    setTimeout(() => {
      runBotTurn();
    }, 1200);
  };

  const runBotTurn = () => {
    // 1. Ramp mana for bot
    const newMaxMana = Math.min(10, opponentState.maxMana + 1);
    let workingOppState: PlayerBattleState = {
      ...opponentState,
      maxMana: newMaxMana,
      currentMana: newMaxMana,
      board: opponentState.board.map(u => ({ ...u, canAttack: true })),
    };

    // Draw card for bot
    if (workingOppState.deck.length > 0) {
      const drawn = workingOppState.deck[0];
      workingOppState.deck = workingOppState.deck.slice(1);
      workingOppState.hand = [...workingOppState.hand, drawn];
    }

    // AI decisions
    const { cardsToPlay, attacks } = MatchmakerService.calculateAiTurnActions(
      workingOppState,
      playerState
    );

    // Process Bot Card Plays
    for (const card of cardsToPlay) {
      if (card.type === 'unit' && workingOppState.board.length < 4) {
        workingOppState.board.push({
          ...card,
          instanceId: 'bot_unit_' + Math.random().toString(),
          currentHp: card.hp || 1,
          currentAttack: card.attack || 1,
          canAttack: card.effect?.type === 'rush',
          hasGuard: card.effect?.type === 'guard',
        });
        workingOppState.currentMana -= card.cost;
        workingOppState.hand = workingOppState.hand.filter(c => c.id !== card.id);
        addLog(`👾 ${opponent.name} summoned ${card.name}`, 'summon', 'opponent');
      } else if (card.type === 'spell') {
        if (card.effect?.type === 'heal_hero') {
          workingOppState.hp = Math.min(workingOppState.maxHp, workingOppState.hp + card.effect.value);
        } else if (card.effect?.type === 'damage_target') {
          setPlayerState(p => ({ ...p, hp: Math.max(0, p.hp - card.effect!.value) }));
        }
        workingOppState.currentMana -= card.cost;
        workingOppState.hand = workingOppState.hand.filter(c => c.id !== card.id);
      }
    }

    // Process Bot Attacks
    for (const atk of attacks) {
      const botUnit = workingOppState.board.find(u => u.instanceId === atk.attackerInstanceId);
      if (!botUnit) continue;

      if (atk.targetId === 'hero') {
        setPlayerState(p => ({ ...p, hp: Math.max(0, p.hp - botUnit.currentAttack) }));
        addLog(`🗡️ ${botUnit.name} attacked your Hero for ${botUnit.currentAttack} DMG!`, 'attack', 'opponent');
      } else {
        const playerUnit = playerState.board.find(u => u.instanceId === atk.targetId);
        if (playerUnit) {
          const pRemaining = playerUnit.currentHp - botUnit.currentAttack;
          botUnit.currentHp -= playerUnit.currentAttack;

          setPlayerState(p => ({
            ...p,
            board: p.board
              .map(u => (u.instanceId === playerUnit.instanceId ? { ...u, currentHp: pRemaining } : u))
              .filter(u => u.currentHp > 0),
          }));
          addLog(`⚔️ ${botUnit.name} fought ${playerUnit.name}`, 'attack', 'opponent');
        }
      }
    }

    workingOppState.board = workingOppState.board.filter(u => u.currentHp > 0);
    setOpponentState(workingOppState);

    // End Bot Turn and return to player
    setTimeout(() => {
      setTurn(t => t + 1);
      setTurnTimeLeft(25);

      // Player start of turn
      setPlayerState(p => {
        const nextMaxMana = Math.min(10, p.maxMana + 1);
        let newHand = [...p.hand];
        let newDeck = [...p.deck];
        if (newDeck.length > 0 && newHand.length < 7) {
          newHand.push(newDeck[0]);
          newDeck = newDeck.slice(1);
        }
        return {
          ...p,
          maxMana: nextMaxMana,
          currentMana: nextMaxMana,
          board: p.board.map(u => ({ ...u, canAttack: true })),
          hand: newHand,
          deck: newDeck,
        };
      });

      setPhase('player_turn');
      addLog(`⚔️ Turn ${turn + 1}: Your turn! Mana refreshed.`, 'turn', 'player');
    }, 1500);
  };

  const hasOpponentGuards = opponentState.board.some(u => u.hasGuard && u.currentHp > 0);
  const canAttackEnemyHero = !!selectedUnitInstanceId && !hasOpponentGuards;

  return (
    <View style={styles.arenaContainer}>
      {/* Top Header: Opponent Hero & Turn Timer */}
      <View style={styles.topSection}>
        <HeroView
          name={opponentState.name}
          hp={opponentState.hp}
          maxHp={opponentState.maxHp}
          isPlayer={false}
          isCurrentTurn={phase === 'opponent_turn'}
          canTarget={canAttackEnemyHero}
          onPress={() => handleAttackTarget()}
        />

        <View style={styles.turnClockBox}>
          <Text style={styles.turnClockNumber}>{turnTimeLeft}s</Text>
          <Text style={styles.turnClockLabel}>Turn {turn}</Text>
        </View>

        <TouchableOpacity style={styles.surrenderBtn} onPress={onSurrender}>
          <Text style={styles.surrenderText}>🏳️</Text>
        </TouchableOpacity>
      </View>

      {/* Opponent Battlefield */}
      <View style={styles.boardZone}>
        <View style={styles.boardRow}>
          {[0, 1, 2, 3].map(idx => {
            const unit = opponentState.board[idx];
            return (
              <BoardSlot
                key={'opp_' + idx}
                unit={unit}
                isPlayerUnit={false}
                highlighted={!!selectedUnitInstanceId && !!unit}
                onPress={() => unit && handleAttackTarget(unit)}
              />
            );
          })}
        </View>
      </View>

      {/* Action Ticker / Combat Log */}
      <View style={styles.tickerBar}>
        <Text numberOfLines={1} style={styles.tickerText}>
          {combatLogs.length > 0 ? combatLogs[0].text : '⚔️ The duel begins! Draw cards & strike!'}
        </Text>
      </View>

      {/* Player Battlefield */}
      <View style={styles.boardZone}>
        <View style={styles.boardRow}>
          {[0, 1, 2, 3].map(idx => {
            const unit = playerState.board[idx];
            return (
              <BoardSlot
                key={'player_' + idx}
                unit={unit}
                isPlayerUnit={true}
                selected={unit && unit.instanceId === selectedUnitInstanceId}
                onPress={() => unit && handleSelectAttacker(unit)}
              />
            );
          })}
        </View>
      </View>

      {/* Player Hero Bar & Mana Bar */}
      <View style={styles.playerMetaRow}>
        <HeroView
          name={playerState.name}
          hp={playerState.hp}
          maxHp={playerState.maxHp}
          isPlayer={true}
          isCurrentTurn={phase === 'player_turn'}
        />

        <View style={styles.manaAndTurnBox}>
          <ManaBar
            currentMana={playerState.currentMana}
            maxMana={playerState.maxMana}
            label="Player Mana"
          />

          <TouchableOpacity
            disabled={phase !== 'player_turn'}
            style={[styles.endTurnBtn, phase !== 'player_turn' && styles.endTurnDisabled]}
            onPress={endPlayerTurn}
          >
            <Text style={styles.endTurnText}>
              {phase === 'player_turn' ? 'END TURN' : 'OPPONENT...'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Player Hand Area */}
      <View style={styles.handArea}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.handScroll}
        >
          {playerState.hand.map((card, idx) => (
            <CardView
              key={'hand_' + idx}
              card={card}
              disabled={phase !== 'player_turn' || card.cost > playerState.currentMana}
              selected={selectedHandIndex === idx}
              onPress={() => handlePlayCard(idx)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  arenaContainer: {
    flex: 1,
    backgroundColor: '#0A0E17',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  turnClockBox: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  turnClockNumber: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '900',
  },
  turnClockLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
  },
  surrenderBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  surrenderText: {
    fontSize: 16,
  },
  boardZone: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  boardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  tickerBar: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
  },
  tickerText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
  playerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  manaAndTurnBox: {
    flex: 1,
    marginLeft: 8,
    gap: 4,
  },
  endTurnBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#60A5FA',
  },
  endTurnDisabled: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  endTurnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  handArea: {
    height: 148,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderTopWidth: 1.5,
    borderTopColor: '#334155',
    paddingVertical: 6,
  },
  handScroll: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
});
