import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { SpireEnemy, SpireHero, FloatingText, StatusEffect } from '../types/spire';
import { SpireCombatEngine } from '../services/spireCombatEngine';
import { SpireEnemyVectorArt } from './SpireVectorArt';

interface Props {
  enemy: SpireEnemy;
  hero?: SpireHero;
  isTargeted?: boolean;
  floatingTexts?: FloatingText[];
  onInspectStatus?: (name: string, desc: string) => void;
}

export function getStatusMetadata(s: StatusEffect): { emoji: string; name: string; desc: string } {
  switch (s.type) {
    case 'strength':
      return { emoji: '🗡️', name: 'Strength', desc: `Increases attack damage by ${s.amount}.` };
    case 'dexterity':
      return { emoji: '🛡️', name: 'Dexterity', desc: `Increases Barrier gained from cards by ${s.amount}.` };
    case 'vulnerable':
      return { emoji: '💥', name: 'Vulnerable', desc: `Takes 50% more attack damage for ${s.amount} turn(s).` };
    case 'weak':
      return { emoji: '🕸️', name: 'Weak', desc: `Deals 25% less attack damage for ${s.amount} turn(s).` };
    case 'frail':
      return { emoji: '🦴', name: 'Frail', desc: `Gains 25% less Barrier from cards for ${s.amount} turn(s).` };
    case 'metallicize':
      return { emoji: '🟩', name: 'Nanite Plating (Metallicize)', desc: `Gains ${s.amount} Barrier at the end of each turn.` };
    case 'demon_form':
      return { emoji: '👑', name: 'Void Overdrive (Demon Form)', desc: `Gains +${s.amount} Strength at the start of each turn.` };
    case 'barricade':
      return { emoji: '🏰', name: 'Perpetual Aegis (Barricade)', desc: `Barrier does not expire at the start of each turn.` };
    case 'berserk':
      return { emoji: '⚡', name: 'Core Accelerator (Berserk)', desc: `Gains +${s.amount} bonus Energy at the start of each turn.` };
    case 'thorns':
      return { emoji: '🔥', name: 'Plasma Shield (Thorns)', desc: `Reflects ${s.amount} damage back when struck.` };
    case 'feel_no_pain':
      return { emoji: '🛡️', name: 'Tactical Absorption (Feel No Pain)', desc: `Gains ${s.amount} Barrier whenever a card is Exhausted.` };
    case 'dark_embrace':
      return { emoji: '🌌', name: 'Void Conduit (Dark Embrace)', desc: `Draws ${s.amount} card(s) whenever a card is Exhausted.` };
    case 'evolve':
      return { emoji: '🧬', name: 'Adaptive Subroutines (Evolve)', desc: `Draws ${s.amount} card(s) whenever a Status card is drawn.` };
    case 'fire_breathing':
      return { emoji: '🔥', name: 'Thermal Venting (Fire Breathing)', desc: `Deals ${s.amount} damage whenever a Status or Curse card is drawn.` };
    case 'rupture':
      return { emoji: '💢', name: 'Pain Feedback (Rupture)', desc: `Gains +${s.amount} Strength whenever HP is sacrificed from a card.` };
    case 'combust':
      return { emoji: '☄️', name: 'Core Bleed (Combust)', desc: `At end of turn, loses 1 HP and deals ${s.amount} damage to hostile.` };
    case 'juggernaut':
      return { emoji: '🚜', name: 'Kinetic Juggernaut', desc: `Deals ${s.amount} damage whenever Barrier is gained.` };
    case 'brutality':
      return { emoji: '🧠', name: 'Neural Overclock (Brutality)', desc: `At start of turn, loses 1 HP and draws +${s.amount} card.` };
    case 'double_tap':
      return { emoji: '⚔️', name: 'Dual Execution (Double Tap)', desc: `Your next ${s.amount} Attack(s) this turn execute twice.` };
    case 'temp_strength_down':
      return { emoji: '⏳', name: 'Adrenaline Decay', desc: `Loses ${s.amount} temporary Strength at the end of this turn.` };
    case 'curl_up':
      return { emoji: '🕷️', name: 'Curl Up', desc: `On first hit taken, immediately deploys ${s.amount} Barrier.` };
    case 'spore_cloud':
      return { emoji: '🍄', name: 'Spore Cloud', desc: `On death, inflicts ${s.amount} Vulnerable on the player.` };
    case 'enrage':
      return { emoji: '💢', name: 'Hyper-Enrage', desc: `Whenever you play a Skill, gains +${s.amount} Strength.` };
    case 'mode_shift':
      return { emoji: '🤖', name: 'Mode Shift', desc: `After taking ${s.amount} more damage, shifts into Defensive Mode (+20 Barrier & Thorns).` };
    case 'artifact':
      return { emoji: '💠', name: 'Artifact', desc: `Negates the next ${s.amount} debuff application(s).` };
    default:
      return { emoji: '✨', name: s.type.toUpperCase(), desc: `Active effect (${s.amount}).` };
  }
}

export const EnemyView: React.FC<Props> = ({
  enemy,
  hero,
  isTargeted = false,
  floatingTexts = [],
  onInspectStatus,
}) => {
  const hpPercent = Math.min(100, Math.max(0, Math.round((enemy.hp / enemy.maxHp) * 100)));

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const prevHp = useRef(enemy.hp);

  useEffect(() => {
    if (enemy.hp < prevHp.current) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -4, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
    prevHp.current = enemy.hp;
  }, [enemy.hp]);

  const isAttackIntent =
    enemy.intent.type === 'attack' ||
    enemy.intent.type === 'attack_defend' ||
    enemy.intent.type === 'attack_debuff';

  const attackPreview =
    isAttackIntent && hero
      ? SpireCombatEngine.computeEnemyAttackPreview(hero, enemy)
      : { perHit: enemy.intent.value, hits: enemy.intent.hits || 1, isModified: false };

  const intentNumberDisplay = isAttackIntent
    ? attackPreview.hits > 1
      ? `${attackPreview.perHit}x${attackPreview.hits}`
      : `${attackPreview.perHit}`
    : '';

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: shakeAnim }] },
        isTargeted && styles.containerTargeted,
      ]}
    >
      {/* Floating Combat Damage Numbers */}
      <View style={styles.floatingContainer} pointerEvents="none">
        {floatingTexts.slice(-3).map(f => (
          <View key={f.id} style={styles.floatingBubble}>
            <Text style={[styles.floatingText, { color: f.color }]}>{f.text}</Text>
          </View>
        ))}
      </View>

      {/* Holographic Telegraphed Intent Projector */}
      <View style={[styles.intentBubble, { borderColor: enemy.themeColor }]}>
        <Text style={styles.intentIcon}>{enemy.intent.icon}</Text>
        {intentNumberDisplay !== '' && (
          <Text
            style={[
              styles.intentValue,
              { color: attackPreview.isModified ? '#FBBF24' : enemy.themeColor },
            ]}
          >
            {intentNumberDisplay}
          </Text>
        )}
      </View>
      <Text numberOfLines={1} style={styles.intentSub}>
        {enemy.intent.description}
      </Text>

      {/* Handcrafted SVG Vector Enemy Silhouette & Holo Ring */}
      <View style={[styles.spriteBox, { borderColor: enemy.themeColor }]}>
        <SpireEnemyVectorArt
          enemyId={enemy.id}
          size={68}
          isBoss={enemy.title.includes('Boss')}
          isElite={enemy.title.includes('Elite')}
        />
        {enemy.block > 0 && (
          <View style={styles.blockShield}>
            <Text style={styles.shieldIcon}>🛡️</Text>
            <Text style={styles.shieldText}>{enemy.block}</Text>
          </View>
        )}
      </View>

      {/* Enemy Name & Class Title */}
      <Text numberOfLines={1} style={styles.name}>
        {enemy.name}
      </Text>
      <Text numberOfLines={1} style={styles.titleSub}>
        {enemy.title}
      </Text>

      {/* Health Bar Track */}
      <View style={styles.hpTrack}>
        <View style={[styles.hpFill, { width: `${hpPercent}%`, backgroundColor: enemy.themeColor }]} />
        <Text style={styles.hpText}>
          {enemy.hp} / {enemy.maxHp} HP
        </Text>
      </View>

      {/* Interactive Status Badges */}
      {enemy.statuses.length > 0 && (
        <View style={styles.statusRow}>
          {enemy.statuses.map((s, idx) => {
            const meta = getStatusMetadata(s);
            return (
              <TouchableOpacity
                key={idx}
                style={styles.statusBadge}
                onPress={() => onInspectStatus && onInspectStatus(meta.name, meta.desc)}
              >
                <Text style={styles.statusEmoji}>{meta.emoji}</Text>
                <Text style={styles.statusAmount}>{s.amount}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
  },
  containerTargeted: {
    transform: [{ scale: 1.05 }],
  },
  floatingContainer: {
    position: 'absolute',
    top: -18,
    zIndex: 99,
    alignItems: 'center',
  },
  floatingBubble: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginVertical: 2,
  },
  floatingText: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  intentBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 4,
    elevation: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  intentIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  intentValue: {
    fontSize: 14,
    fontWeight: '900',
  },
  intentSub: {
    color: '#94A3B8',
    fontSize: 9.5,
    fontWeight: '600',
    marginBottom: 6,
    maxWidth: 260,
    textAlign: 'center',
  },
  spriteBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  sprite: {
    fontSize: 48,
  },
  blockShield: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0369A1',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    elevation: 6,
  },
  shieldIcon: {
    fontSize: 10,
    marginRight: 2,
  },
  shieldText: {
    color: '#E0F2FE',
    fontSize: 11,
    fontWeight: '900',
  },
  name: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
  },
  titleSub: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 5,
  },
  hpTrack: {
    width: 156,
    height: 16,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hpFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
  },
  hpText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowRadius: 2,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 6,
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusEmoji: {
    fontSize: 10,
    marginRight: 2,
  },
  statusAmount: {
    color: '#F8FAFC',
    fontSize: 9.5,
    fontWeight: '900',
  },
});
