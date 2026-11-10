import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SpireHero } from '../types/spire';
import { getStatusMetadata } from './EnemyView';
import { SpireHeroVectorCrest } from './SpireVectorArt';

interface Props {
  hero: SpireHero;
  onUsePotion?: (index: number) => void;
  onInspectRelic?: (name: string, desc: string) => void;
}

export const SpireHeroView: React.FC<Props> = ({ hero, onUsePotion, onInspectRelic }) => {
  const hpPercent = Math.min(100, Math.max(0, Math.round((hero.hp / hero.maxHp) * 100)));

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Bar: Artifacts and Stimulants */}
      <View style={styles.topMeta}>
        {/* Artifacts Row */}
        <View style={styles.relicsContainer}>
          <Text style={styles.metaLabel}>ARTIFACTS:</Text>
          <View style={styles.relicIconsRow}>
            {hero.relics.map((relic, idx) => {
              const isArmed =
                (relic.id === 'quantum_edge' && relic.counter === 9) ||
                (relic.id === 'resonance_capacitor' && relic.counter === 1) ||
                (relic.id === 'crimson_overdrive' && hero.hp <= hero.maxHp / 2);

              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.relicBadge, isArmed && styles.relicBadgeArmed]}
                  onPress={() => onInspectRelic && onInspectRelic(relic.name, relic.description)}
                >
                  <Text style={styles.relicIcon}>{relic.icon}</Text>
                  {relic.counter !== undefined && (
                    <View style={styles.relicCounterPill}>
                      <Text style={styles.relicCounterText}>{relic.counter}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Combat Stimulants (Potions) Belt */}
        <View style={styles.potionsContainer}>
          <Text style={styles.metaLabel}>STIMULANTS:</Text>
          <View style={styles.potionSlotsRow}>
            {hero.potions.map((potion, idx) => (
              <TouchableOpacity
                key={idx}
                disabled={!potion}
                onPress={() => onUsePotion && onUsePotion(idx)}
                style={[styles.potionSlot, !potion && styles.potionSlotEmpty]}
              >
                <Text style={styles.potionIcon}>{potion ? potion.icon : '🫙'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Main Hero HUD: Vector Crest + Energy Core + Vitality + Barrier */}
      <View style={styles.heroMainRow}>
        {/* Handcrafted Vanguard Vector Crest */}
        <View style={{ marginRight: 8 }}>
          <SpireHeroVectorCrest size={48} />
        </View>

        {/* Pulsing Aether Energy Core */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View style={styles.energyOrb}>
            <Text style={styles.energyNumber}>
              {hero.energy} / {hero.maxEnergy}
            </Text>
            <Text style={styles.energyLabel}>ENERGY</Text>
          </View>
        </Animated.View>

        {/* Hero Details */}
        <View style={styles.heroDetails}>
          <View style={styles.nameAndBlockRow}>
            <Text style={styles.heroName}>⚡ {hero.name} (Rift Vanguard)</Text>
            {hero.block > 0 && (
              <View style={styles.blockShield}>
                <Text style={styles.shieldEmoji}>🛡️</Text>
                <Text style={styles.shieldText}>{hero.block} WARD</Text>
              </View>
            )}
          </View>

          {/* Health Bar Track */}
          <View style={styles.hpTrack}>
            <View style={[styles.hpFill, { width: `${hpPercent}%` }]} />
            <Text style={styles.hpText}>
              {hero.hp} / {hero.maxHp} VITALITY
            </Text>
          </View>

          {/* Interactive Status Badges */}
          {hero.statuses.length > 0 && (
            <View style={styles.statusRow}>
              {hero.statuses.map((s, idx) => {
                const meta = getStatusMetadata(s);
                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.statusBadge}
                    onPress={() => onInspectRelic && onInspectRelic(meta.name, meta.desc)}
                  >
                    <Text style={styles.statusEmoji}>{meta.emoji}</Text>
                    <Text style={styles.statusAmount}>{s.amount}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderTopWidth: 1.5,
    borderTopColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  topMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  relicsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaLabel: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '800',
    marginRight: 6,
    letterSpacing: 0.5,
  },
  relicIconsRow: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
  },
  relicBadge: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  relicBadgeArmed: {
    borderColor: '#F59E0B',
    borderWidth: 1.5,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  relicIcon: {
    fontSize: 13,
  },
  relicCounterPill: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#0F172A',
    borderRadius: 6,
    paddingHorizontal: 3,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  relicCounterText: {
    color: '#FBBF24',
    fontSize: 7,
    fontWeight: '900',
  },
  potionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  potionSlotsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  potionSlot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#A855F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  potionSlotEmpty: {
    borderColor: '#334155',
    opacity: 0.5,
  },
  potionIcon: {
    fontSize: 14,
  },
  heroMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  energyOrb: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#0F172A',
    borderWidth: 2.5,
    borderColor: '#00F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 8,
    shadowColor: '#00F0FF',
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  energyNumber: {
    color: '#00F0FF',
    fontSize: 14,
    fontWeight: '900',
  },
  energyLabel: {
    color: '#BAE6FD',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroDetails: {
    flex: 1,
  },
  nameAndBlockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  heroName: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
  },
  blockShield: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0369A1',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    elevation: 4,
  },
  shieldEmoji: {
    fontSize: 10,
    marginRight: 3,
  },
  shieldText: {
    color: '#E0F2FE',
    fontSize: 10,
    fontWeight: '900',
  },
  hpTrack: {
    height: 16,
    backgroundColor: '#1E293B',
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
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  hpText: {
    color: '#FFF',
    fontSize: 9.5,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowRadius: 2,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 6,
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
