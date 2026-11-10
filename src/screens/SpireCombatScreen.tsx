import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { SpireHero, SpireEnemy, SpireCard, FloatingText } from '../types/spire';
import { EnemyView } from '../components/EnemyView';
import { SpireHeroView } from '../components/SpireHeroView';
import { SpireCardView } from '../components/SpireCardView';
import { SpireCombatEngine } from '../services/spireCombatEngine';
import { SpireReviveModal } from '../components/SpireReviveModal';
import { GameStudioEngine } from '../services/gameStudioEngine';
import {
  AfroAsianMotionStage,
  ActiveMotionCue,
} from '../components/AfroAsianMotionStage';
import {
  WarriorProfile,
  AFRO_ASIAN_WARRIORS,
  getCardChoreography,
} from '../data/afroAsianWarriors';

interface Props {
  initialHero: SpireHero;
  initialEnemy: SpireEnemy;
  warriorProfile?: WarriorProfile;
  customWarriorName?: string;
  isVip?: boolean;
  onWatchAdForRevive?: (onSuccess: () => void) => void;
  onVictory: (updatedHero: SpireHero, enemy: SpireEnemy) => void;
  onDefeat: (finalHero: SpireHero) => void;
}

export const SpireCombatScreen: React.FC<Props> = ({
  initialHero,
  initialEnemy,
  warriorProfile = AFRO_ASIAN_WARRIORS[0],
  customWarriorName,
  isVip = false,
  onWatchAdForRevive,
  onVictory,
  onDefeat,
}) => {
  const [hero, setHero] = useState<SpireHero>(initialHero);
  const [enemy, setEnemy] = useState<SpireEnemy>(initialEnemy);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isEnemyTurn, setIsEnemyTurn] = useState<boolean>(false);
  const [showReviveModal, setShowReviveModal] = useState<boolean>(false);
  const [hasUsedRevive, setHasUsedRevive] = useState<boolean>(false);
  const [pendingDefeatHero, setPendingDefeatHero] = useState<SpireHero | null>(null);

  // Inspection Modals
  const [inspectedRelic, setInspectedRelic] = useState<{ name: string; desc: string } | null>(null);
  const [inspectedPile, setInspectedPile] = useState<{ title: string; cards: SpireCard[] } | null>(null);
  const [showFullLog, setShowFullLog] = useState<boolean>(false);
  const [hitStopActive, setHitStopActive] = useState<boolean>(false);
  const [jukeboxActive, setJukeboxActive] = useState<boolean>(GameStudioEngine.isJukeboxPlaying());
  const [motionCue, setMotionCue] = useState<ActiveMotionCue | null>(null);

  useEffect(() => {
    const init = SpireCombatEngine.startCombat(initialHero, initialEnemy);
    setHero(init.hero);
    setEnemy(init.enemy);
    setCombatLogs(init.logs.reverse());
    setFloatingTexts(init.floatingTexts);
  }, []);

  const handleCardPress = (index: number) => {
    if (isEnemyTurn) return;

    const card = hero.hand[index];
    if (card.unplayable) {
      Alert.alert('Protocol Locked', `${card.name} is an unplayable Status/Curse card.`);
      return;
    }
    if (hero.energy < card.cost) {
      Alert.alert('Energy Depleted', `This action requires ${card.cost} Energy.`);
      return;
    }

    if (selectedCardIndex === index) {
      executePlayCard(index);
    } else {
      GameStudioEngine.playSfx('card_lift');
      setSelectedCardIndex(index);
    }
  };

  const executePlayCard = (index: number) => {
    const playedCard = hero.hand[index];
    if (playedCard) {
      const choreography = getCardChoreography(playedCard, warriorProfile);
      setMotionCue({
        id: Math.random().toString(),
        type: choreography.type,
        techniqueName: `${choreography.name} (${playedCard.name})`,
        hits: choreography.hitCount || playedCard.magicNumber || 1,
        accentColor: choreography.slashTrailColor,
      });

      if (playedCard.type === 'attack') {
        const isHeavy =
          choreography.type === 'single_hit' ||
          choreography.type === 'close_quarters' ||
          (playedCard.damage || 0) >= 12;
        GameStudioEngine.playSfx(isHeavy ? 'heavy_strike' : 'card_strike');
        if (isHeavy) {
          setHitStopActive(true);
          setTimeout(() => setHitStopActive(false), choreography.hitStopMs || 68);
        }
      } else if (playedCard.type === 'skill') {
        GameStudioEngine.playSfx('shield_up');
      } else if (playedCard.type === 'power') {
        GameStudioEngine.playSfx('power_surge');
      } else {
        GameStudioEngine.playSfx('status_inflict');
      }
    }

    const res = SpireCombatEngine.playCard(hero, enemy, index);
    setHero(res.hero);
    setEnemy(res.enemy);
    setSelectedCardIndex(null);
    setCombatLogs(prev => [...res.logs.reverse(), ...prev.slice(0, 25)]);
    setFloatingTexts(prev => [...prev, ...res.floatingTexts]);

    if (res.isVictory) {
      GameStudioEngine.playSfx('victory');
      setTimeout(() => {
        onVictory(res.hero, res.enemy);
      }, 900);
    }
  };

  const handleEndTurn = () => {
    if (isEnemyTurn) return;
    GameStudioEngine.playSfx('button_click');
    setIsEnemyTurn(true);
    setSelectedCardIndex(null);

    setTimeout(() => {
      GameStudioEngine.playSfx('enemy_attack');
      const res = SpireCombatEngine.endTurn(hero, enemy);
      setHero(res.hero);
      setEnemy(res.enemy);
      setIsEnemyTurn(false);
      setCombatLogs(prev => [...res.logs.reverse(), ...prev.slice(0, 25)]);
      setFloatingTexts(prev => [...prev, ...res.floatingTexts]);

      if (res.isVictory) {
        GameStudioEngine.playSfx('victory');
        setTimeout(() => {
          onVictory(res.hero, res.enemy);
        }, 900);
      } else if (res.isDefeat) {
        GameStudioEngine.playSfx('defeat');
        if (!hasUsedRevive) {
          setPendingDefeatHero(res.hero);
          setShowReviveModal(true);
        } else {
          setTimeout(() => {
            onDefeat(res.hero);
          }, 900);
        }
      }
    }, 1000);
  };

  const handleExecuteRevive = () => {
    setHasUsedRevive(true);
    setShowReviveModal(false);
    const reviveAmount = Math.max(1, Math.round(hero.maxHp * 0.35));
    const revivedHero: SpireHero = {
      ...hero,
      hp: reviveAmount,
      block: hero.block + 10,
      energy: hero.maxEnergy,
    };
    setHero(revivedHero);
    setCombatLogs(prev => ['⚡ SECOND WIND ACTIVATED! Resurrected with 35% HP & 10 Block!', ...prev]);
    setFloatingTexts(prev => [
      ...prev,
      { id: Math.random().toString(), text: `+${reviveAmount} HP`, color: '#22C55E', type: 'heal' },
      { id: Math.random().toString(), text: '+10 WARD', color: '#38BDF8', type: 'block' },
    ]);
  };

  const handleReviveWithAd = () => {
    if (onWatchAdForRevive) {
      onWatchAdForRevive(handleExecuteRevive);
    } else {
      handleExecuteRevive();
    }
  };

  const handleInstantVipRevive = () => {
    handleExecuteRevive();
  };

  const handleAcceptDefeat = () => {
    setShowReviveModal(false);
    if (pendingDefeatHero) {
      onDefeat(pendingDefeatHero);
    } else {
      onDefeat(hero);
    }
  };

  const handleUsePotion = (index: number) => {
    const potion = hero.potions[index];
    if (!potion || isEnemyTurn) return;

    const updatedHero: SpireHero = {
      ...hero,
      hand: [...hero.hand],
      drawPile: [...hero.drawPile],
      discardPile: [...hero.discardPile],
      statuses: hero.statuses.map(s => ({ ...s })),
      potions: [...hero.potions],
    };
    const updatedEnemy: SpireEnemy = {
      ...enemy,
      statuses: enemy.statuses.map(s => ({ ...s })),
    };

    updatedHero.potions[index] = null;

    let log = '';
    const newFloats: FloatingText[] = [];

    if (potion.id === 'plasma_grenade') {
      updatedEnemy.hp = Math.max(0, updatedEnemy.hp - 20);
      log = `💣 Plasma Grenade detonated for 20 damage on ${enemy.name}!`;
      newFloats.push({ id: Math.random().toString(), text: '-20', color: '#EF4444', type: 'damage' });
    } else if (potion.id === 'barrier_injector') {
      updatedHero.block += 12;
      log = `🛡️ Barrier Injector deployed 12 Barrier!`;
      newFloats.push({ id: Math.random().toString(), text: '+12 WARD', color: '#38BDF8', type: 'block' });
    } else if (potion.id === 'adrenaline_booster') {
      const existing = updatedHero.statuses.find(s => s.type === 'strength');
      if (existing) existing.amount += 2;
      else updatedHero.statuses.push({ type: 'strength', amount: 2 });
      log = `⚡ Adrenaline Booster granted +2 Strength!`;
      newFloats.push({ id: Math.random().toString(), text: '+2 STR', color: '#F59E0B', type: 'buff' });
    } else if (potion.id === 'tachyon_cell') {
      updatedHero.energy += 2;
      log = `🔋 Tachyon Cell surged +2 operational Energy!`;
      newFloats.push({ id: Math.random().toString(), text: '+2⚡', color: '#38BDF8', type: 'buff' });
    } else if (potion.id === 'neural_accelerator') {
      for (let i = 0; i < 3; i++) {
        if (updatedHero.drawPile.length === 0 && updatedHero.discardPile.length > 0) {
          updatedHero.drawPile = [...updatedHero.discardPile].sort(() => Math.random() - 0.5);
          updatedHero.discardPile = [];
        }
        const drawn = updatedHero.drawPile.pop();
        if (drawn) updatedHero.hand.push(drawn);
      }
      log = `🧠 Neural Accelerator drew 3 cards!`;
      newFloats.push({ id: Math.random().toString(), text: '+3 CARDS', color: '#A855F7', type: 'buff' });
    } else if (potion.id === 'suppression_vial') {
      const existing = updatedEnemy.statuses.find(s => s.type === 'weak');
      if (existing) existing.amount += 3;
      else updatedEnemy.statuses.push({ type: 'weak', amount: 3 });
      log = `🧪 Suppression Vial inflicted 3 Weak on ${enemy.name}!`;
      newFloats.push({ id: Math.random().toString(), text: '+3 WEAK', color: '#38BDF8', type: 'buff' });
    } else if (potion.id === 'gravity_vial') {
      const existing = updatedEnemy.statuses.find(s => s.type === 'vulnerable');
      if (existing) existing.amount += 3;
      else updatedEnemy.statuses.push({ type: 'vulnerable', amount: 3 });
      log = `🌌 Gravity Vial inflicted 3 Vulnerable on ${enemy.name}!`;
      newFloats.push({ id: Math.random().toString(), text: '+3 VULN', color: '#F59E0B', type: 'buff' });
    } else if (potion.id === 'bio_mender') {
      const heal = Math.min(15, updatedHero.maxHp - updatedHero.hp);
      updatedHero.hp += heal;
      log = `❤️‍🩹 Bio-Mender restored ${heal} Vitality!`;
      newFloats.push({ id: Math.random().toString(), text: `+${heal} HP`, color: '#10B981', type: 'heal' });
    }

    setHero(updatedHero);
    setEnemy(updatedEnemy);
    setCombatLogs(prev => [log, ...prev.slice(0, 25)]);
    setFloatingTexts(prev => [...prev, ...newFloats]);

    if (updatedEnemy.hp <= 0) {
      setTimeout(() => {
        onVictory(updatedHero, updatedEnemy);
      }, 900);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top HUD: Interactive Draw, Discard, and Exhaust Matrices */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.pileBadge}
          onPress={() => setInspectedPile({ title: 'DRAW MATRIX (UNORDERED)', cards: hero.drawPile })}
        >
          <Text style={styles.pileIcon}>🃏</Text>
          <Text style={styles.pileText}>DRAW: {hero.drawPile.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pileBadge}
          onPress={() => setInspectedPile({ title: 'DISCARD MATRIX', cards: hero.discardPile })}
        >
          <Text style={styles.pileIcon}>🗑️</Text>
          <Text style={styles.pileText}>DISCARD: {hero.discardPile.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pileBadge, hero.exhaustPile.length > 0 && styles.exhaustBadgeActive]}
          onPress={() => setInspectedPile({ title: 'EXHAUSTED PROTOCOLS', cards: hero.exhaustPile })}
        >
          <Text style={styles.pileIcon}>🔥</Text>
          <Text style={styles.pileText}>EXHAUST: {hero.exhaustPile.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pileBadge, jukeboxActive && { borderColor: '#3FB950' }]}
          onPress={() => setJukeboxActive(GameStudioEngine.toggleJukebox())}
        >
          <Text style={styles.pileText}>{jukeboxActive ? '🎵 SYNTH' : '🔇 SYNTH'}</Text>
        </TouchableOpacity>
      </View>

      {/* 66ms Kinesthetic Hit-Stop Impact Flash */}
      {hitStopActive && <View style={styles.hitStopFlash} pointerEvents="none" />}

      {/* Full-Motion Afro-Asian Dark Pagoda Stage (Single-Hit, Multi-Hit, Close-Quarters) */}
      <AfroAsianMotionStage
        warriorId={warriorProfile.id}
        warriorName={customWarriorName || warriorProfile.name}
        warriorTitle={warriorProfile.title}
        weaponName={warriorProfile.weaponName}
        portraitUri={
          warriorProfile.id === 'kodachi_phantom'
            ? '/assets/warriors/warrior_kodachi.png'
            : warriorProfile.id === 'nunchaku_dragon'
            ? '/assets/warriors/warrior_nunchaku.png'
            : warriorProfile.id === 'kusarigama_mystic'
            ? '/assets/warriors/warrior_kusarigama.png'
            : '/assets/warriors/warrior_odachi.png'
        }
        hero={hero}
        enemy={enemy}
        motionCue={motionCue}
        floatingTexts={floatingTexts}
        isTargeted={selectedCardIndex !== null}
        onInspectStatus={(name, desc) => setInspectedRelic({ name, desc })}
      />

      {/* Combat Activity Ticker (Tap to view full combat history) */}
      <TouchableOpacity style={styles.actionTicker} onPress={() => setShowFullLog(true)}>
        <Text numberOfLines={1} style={styles.tickerText}>
          {combatLogs.length > 0 ? combatLogs[0] : 'Operational: Tap card to preview, tap again to execute.'}
        </Text>
        <Text style={styles.tickerExpandHint}>📜 LOG</Text>
      </TouchableOpacity>

      {/* Confirmation Pill when Card is Selected */}
      {selectedCardIndex !== null && hero.hand[selectedCardIndex] && (
        <TouchableOpacity
          style={styles.playConfirmBtn}
          onPress={() => executePlayCard(selectedCardIndex)}
        >
          <Text style={styles.playConfirmText}>
            ⚡ CONFIRM: EXECUTE {hero.hand[selectedCardIndex].name.toUpperCase()} (
            {hero.hand[selectedCardIndex].cost} ENERGY)
          </Text>
        </TouchableOpacity>
      )}

      {/* Hand Carousel with Live Dynamic Stat Preview */}
      <View style={styles.handArea}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.handScroll}
        >
          {hero.hand.map((card, idx) => (
            <SpireCardView
              key={card.id + '_' + idx}
              card={card}
              hero={hero}
              enemy={enemy}
              disabled={isEnemyTurn || hero.energy < card.cost || card.unplayable}
              selected={selectedCardIndex === idx}
              onPress={() => handleCardPress(idx)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Hero Stats HUD */}
      <SpireHeroView
        hero={hero}
        onUsePotion={handleUsePotion}
        onInspectRelic={(name, desc) => setInspectedRelic({ name, desc })}
      />

      {/* End Turn Button */}
      <TouchableOpacity
        disabled={isEnemyTurn}
        style={[styles.endTurnBtn, isEnemyTurn && styles.endTurnDisabled]}
        onPress={handleEndTurn}
      >
        <Text style={styles.endTurnText}>
          {isEnemyTurn ? 'HOSTILE PHASE...' : 'END TURN ➔'}
        </Text>
      </TouchableOpacity>

      {/* Relic & Status Tooltip Modal */}
      {inspectedRelic && (
        <Modal transparent animationType="fade">
          <View style={styles.relicModalOverlay}>
            <View style={styles.relicModalCard}>
              <Text style={styles.relicModalTitle}>🔍 {inspectedRelic.name}</Text>
              <Text style={styles.relicModalDesc}>{inspectedRelic.desc}</Text>
              <TouchableOpacity
                style={styles.relicModalClose}
                onPress={() => setInspectedRelic(null)}
              >
                <Text style={styles.relicModalCloseText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Pile Inspector Modal (Draw / Discard / Exhaust) */}
      {inspectedPile && (
        <Modal transparent animationType="slide">
          <View style={styles.pileModalOverlay}>
            <View style={styles.pileModalContent}>
              <View style={styles.pileModalHeader}>
                <Text style={styles.pileModalTitle}>
                  {inspectedPile.title} ({inspectedPile.cards.length})
                </Text>
                <TouchableOpacity
                  style={styles.relicModalClose}
                  onPress={() => setInspectedPile(null)}
                >
                  <Text style={styles.relicModalCloseText}>CLOSE</Text>
                </TouchableOpacity>
              </View>
              {inspectedPile.cards.length === 0 ? (
                <View style={styles.emptyPileBox}>
                  <Text style={styles.emptyPileText}>No cards currently in this matrix.</Text>
                </View>
              ) : (
                <ScrollView contentContainerStyle={styles.pileGrid}>
                  {inspectedPile.cards.map((c, idx) => (
                    <View key={c.id + '_' + idx} style={styles.pileCardWrapper}>
                      <SpireCardView card={c} />
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      )}

      {/* Full Combat Log Modal */}
      {showFullLog && (
        <Modal transparent animationType="fade">
          <View style={styles.relicModalOverlay}>
            <View style={[styles.relicModalCard, { maxHeight: '75%', width: '90%' }]}>
              <Text style={styles.relicModalTitle}>📜 TACTICAL COMBAT LOG</Text>
              <ScrollView style={{ width: '100%', marginVertical: 10 }}>
                {combatLogs.map((l, idx) => (
                  <Text key={idx} style={styles.logLineText}>
                    • {l}
                  </Text>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.relicModalClose}
                onPress={() => setShowFullLog(false)}
              >
                <Text style={styles.relicModalCloseText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Second Wind Revive Modal */}
      <SpireReviveModal
        visible={showReviveModal}
        isVip={isVip}
        onReviveWithAd={handleReviveWithAd}
        onInstantVipRevive={handleInstantVipRevive}
        onAcceptDefeat={handleAcceptDefeat}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A13',
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
  },
  pileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  exhaustBadgeActive: {
    borderColor: '#F87171',
  },
  hitStopFlash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 123, 114, 0.14)',
    zIndex: 90,
  },
  pileIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  pileText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
  },
  enemyStage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1E293B',
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  tickerText: {
    color: '#00F0FF',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  tickerExpandHint: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 8,
  },
  playConfirmBtn: {
    backgroundColor: '#00F0FF',
    marginHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#00F0FF',
    shadowOpacity: 0.5,
    shadowRadius: 6,
    marginVertical: 4,
  },
  playConfirmText: {
    color: '#070A13',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  handArea: {
    height: 184,
    backgroundColor: 'rgba(7, 10, 19, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingVertical: 4,
  },
  handScroll: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  endTurnBtn: {
    position: 'absolute',
    right: 12,
    bottom: 84,
    backgroundColor: '#DC2626',
    borderWidth: 1.5,
    borderColor: '#F87171',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 8,
    shadowColor: '#DC2626',
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  endTurnDisabled: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  endTurnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  relicModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  relicModalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    width: '85%',
    alignItems: 'center',
  },
  relicModalTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 8,
  },
  relicModalDesc: {
    color: '#CBD5E1',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  relicModalClose: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  relicModalCloseText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
  },
  pileModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 10, 19, 0.96)',
    paddingTop: 40,
    paddingHorizontal: 12,
  },
  pileModalContent: {
    flex: 1,
  },
  pileModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    marginBottom: 12,
  },
  pileModalTitle: {
    color: '#00F0FF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  pileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    paddingBottom: 30,
  },
  pileCardWrapper: {
    marginVertical: 4,
  },
  emptyPileBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPileText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  logLineText: {
    color: '#E2E8F0',
    fontSize: 11,
    marginVertical: 3,
    lineHeight: 16,
  },
});
