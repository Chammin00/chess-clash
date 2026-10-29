import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SpireCard, SpireHero, SpireEnemy } from '../types/spire';
import { SpireCombatEngine } from '../services/spireCombatEngine';

interface Props {
  card: SpireCard;
  hero?: SpireHero;
  enemy?: SpireEnemy;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
}

export const SpireCardView: React.FC<Props> = ({
  card,
  hero,
  enemy,
  onPress,
  disabled = false,
  selected = false,
}) => {
  const isAttack = card.type === 'attack';
  const isPower = card.type === 'power';
  const isSkill = card.type === 'skill';
  const isStatus = card.type === 'status' || card.type === 'curse';

  const preview = SpireCombatEngine.computeCardPreview(card, hero, enemy);

  // Animation values for tactile bounce and glow
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(translateYAnim, {
      toValue: selected ? -16 : 0,
      friction: 6,
      tension: 60,
      useNativeDriver: true,
    }).start();

    Animated.spring(scaleAnim, {
      toValue: selected ? 1.06 : 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [selected]);

  const cardBorderColor = selected
    ? '#FBBF24'
    : isStatus
    ? '#64748B'
    : isPower
    ? '#C084FC'
    : isSkill
    ? '#38BDF8'
    : '#F87171';

  const cardBgColor = isStatus
    ? '#1E293B'
    : isPower
    ? '#1E1233'
    : isSkill
    ? '#0C2340'
    : '#2E1117';

  const glowShadowColor = isStatus
    ? '#475569'
    : isPower
    ? '#A855F7'
    : isSkill
    ? '#0284C7'
    : '#DC2626';

  return (
    <Animated.View
      style={{
        transform: [{ translateY: translateYAnim }, { scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={disabled || card.unplayable}
        onPress={onPress}
        style={[
          styles.card,
          {
            borderColor: cardBorderColor,
            backgroundColor: cardBgColor,
            shadowColor: selected ? '#FBBF24' : glowShadowColor,
          },
          selected && styles.cardSelected,
          (disabled || card.unplayable) && styles.cardDisabled,
        ]}
      >
        {/* Holographic Top Energy Core */}
        <View style={[styles.energyOrb, card.unplayable && styles.energyOrbUnplayable]}>
          <Text style={[styles.energyText, card.unplayable && styles.energyTextUnplayable]}>
            {card.unplayable ? '✕' : card.cost}
          </Text>
        </View>

        {/* Upgraded Pill Banner */}
        {card.isUpgraded && (
          <View style={styles.upgradedBadge}>
            <Text style={styles.upgradedText}>OVERCLOCKED +</Text>
          </View>
        )}

        {/* Live Dynamic Damage / Block Preview Pill */}
        {!card.isUpgraded && (preview.effectiveDamage !== undefined || preview.effectiveBlock !== undefined) && (
          <View style={styles.liveStatBadge}>
            {preview.effectiveDamage !== undefined && (
              <Text
                style={[
                  styles.liveStatText,
                  preview.isDamageBoosted && styles.statBoosted,
                  preview.isDamageReduced && styles.statReduced,
                ]}
              >
                ⚔️{preview.effectiveDamage}
              </Text>
            )}
            {preview.effectiveBlock !== undefined && (
              <Text
                style={[
                  styles.liveStatText,
                  preview.isBlockBoosted && styles.statBoosted,
                  preview.isBlockReduced && styles.statReduced,
                ]}
              >
                🛡️{preview.effectiveBlock}
              </Text>
            )}
          </View>
        )}

        {/* Card Header */}
        <View style={styles.header}>
          <Text numberOfLines={1} style={[styles.cardName, card.isUpgraded && styles.upgradedName]}>
            {card.name}
          </Text>
        </View>

        {/* Card Art Area */}
        <View style={styles.artContainer}>
          <Text style={styles.artEmoji}>
            {card.artEmoji || (isAttack ? '🗡️' : isSkill ? '🛡️' : isPower ? '🔮' : '⚠️')}
          </Text>
          <Text style={styles.typeBanner}>{card.type.toUpperCase()}</Text>
        </View>

        {/* Card Effect Description (with live calculated numbers) */}
        <View style={styles.descContainer}>
          <Text
            style={[
              styles.descText,
              (preview.isDamageBoosted || preview.isBlockBoosted) && styles.descBoosted,
            ]}
          >
            {preview.dynamicDescription}
          </Text>
        </View>

        {/* Card Footer */}
        <View style={styles.footer}>
          <Text style={styles.rarityText}>{card.rarity.toUpperCase()}</Text>
          {card.unplayable && <Text style={styles.unplayableText}>LOCKED</Text>}
          {card.exhaust && <Text style={styles.exhaustText}>EXHAUST</Text>}
          {card.ethereal && <Text style={styles.etherealText}>ETHEREAL</Text>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 122,
    height: 172,
    borderRadius: 12,
    borderWidth: 2,
    padding: 6,
    marginHorizontal: 4,
    justifyContent: 'space-between',
    elevation: 3,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  cardSelected: {
    borderWidth: 2.5,
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  cardDisabled: {
    opacity: 0.45,
  },
  energyOrb: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 3,
    shadowColor: '#38BDF8',
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  energyOrbUnplayable: {
    borderColor: '#64748B',
    backgroundColor: '#1E293B',
  },
  energyText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '900',
  },
  energyTextUnplayable: {
    color: '#94A3B8',
    fontSize: 11,
  },
  upgradedBadge: {
    position: 'absolute',
    top: -7,
    right: 6,
    backgroundColor: '#059669',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#34D399',
    zIndex: 10,
  },
  upgradedText: {
    color: '#FFF',
    fontSize: 6.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  liveStatBadge: {
    position: 'absolute',
    top: -7,
    right: 6,
    flexDirection: 'row',
    gap: 3,
    backgroundColor: '#0F172A',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#334155',
    zIndex: 10,
  },
  liveStatText: {
    color: '#E2E8F0',
    fontSize: 7.5,
    fontWeight: '900',
  },
  statBoosted: {
    color: '#34D399',
  },
  statReduced: {
    color: '#FBBF24',
  },
  header: {
    alignItems: 'center',
    paddingLeft: 12,
    marginTop: 2,
  },
  cardName: {
    color: '#F8FAFC',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  upgradedName: {
    color: '#34D399',
  },
  artContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 8,
    paddingVertical: 4,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  artEmoji: {
    fontSize: 22,
  },
  typeBanner: {
    color: '#94A3B8',
    fontSize: 7.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  descContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 8,
    padding: 5,
    minHeight: 54,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  descText: {
    color: '#EDF2F7',
    fontSize: 8.8,
    lineHeight: 11.5,
    textAlign: 'center',
    fontWeight: '600',
  },
  descBoosted: {
    color: '#A7F3D0',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  rarityText: {
    color: '#94A3B8',
    fontSize: 7,
    fontWeight: '700',
  },
  unplayableText: {
    color: '#94A3B8',
    fontSize: 7,
    fontWeight: '800',
  },
  exhaustText: {
    color: '#F87171',
    fontSize: 7,
    fontWeight: '800',
  },
  etherealText: {
    color: '#C084FC',
    fontSize: 7,
    fontWeight: '800',
  },
});
