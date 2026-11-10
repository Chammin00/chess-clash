import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { GwentCard, GwentRow } from '../types/gwent';

interface Props {
  card: GwentCard;
  size?: 'compact' | 'normal' | 'large';
  onPress?: () => void;
  onLongPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

export const GwentCardView: React.FC<Props> = ({
  card,
  size = 'normal',
  onPress,
  onLongPress,
  selected = false,
  disabled = false,
}) => {
  const isCompact = size === 'compact';
  const isLarge = size === 'large';

  const effectivePower = card.currentPower !== undefined ? card.currentPower : card.power;
  const isPowerBoosted = effectivePower > card.power;
  const isPowerWeakened = effectivePower < card.power;

  const getRowSymbol = (row: GwentRow | 'agile' | 'special' | 'weather') => {
    switch (row) {
      case 'melee':
        return '⚔️';
      case 'ranged':
        return '🏹';
      case 'siege':
        return '🎯';
      case 'agile':
        return '🔁';
      case 'weather':
        return '❄️';
      default:
        return '✨';
    }
  };

  const getAbilityBadge = (ability: string) => {
    switch (ability) {
      case 'hero':
        return { icon: '👑', label: 'HERO', color: '#F59E0B' };
      case 'spy':
        return { icon: '👁️', label: 'SPY', color: '#A855F7' };
      case 'medic':
        return { icon: '🌿', label: 'MEDIC', color: '#EC4899' };
      case 'tight_bond':
        return { icon: '🔗', label: 'BOND', color: '#EF4444' };
      case 'morale_boost':
        return { icon: '📯', label: 'BOOST', color: '#10B981' };
      case 'muster':
        return { icon: '🌀', label: 'MUSTER', color: '#6366F1' };
      case 'scorch_unit':
      case 'scorch_special':
        return { icon: '🔥', label: 'SCORCH', color: '#DC2626' };
      case 'commanders_horn':
        return { icon: '🎺', label: 'HORN', color: '#F59E0B' };
      case 'decoy':
        return { icon: '🎭', label: 'DECOY', color: '#8B5CF6' };
      case 'weather_frost':
        return { icon: '❄️', label: 'FROST', color: '#38BDF8' };
      case 'weather_fog':
        return { icon: '🌫️', label: 'FOG', color: '#94A3B8' };
      case 'weather_rain':
        return { icon: '🌧️', label: 'RAIN', color: '#0284C7' };
      case 'weather_clear':
        return { icon: '☀️', label: 'CLEAR', color: '#FACC15' };
      default:
        return null;
    }
  };

  const abilityBadge = getAbilityBadge(card.ability);

  // Dimensions
  const width = isCompact ? 58 : isLarge ? 110 : 76;
  const height = isCompact ? 84 : isLarge ? 156 : 108;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled || !onPress}
      style={[
        styles.cardContainer,
        { width, height },
        card.isHero && styles.heroContainer,
        selected && styles.selectedContainer,
        disabled && styles.disabledContainer,
      ]}
    >
      {/* High-Resolution Artwork */}
      {Platform.OS === 'web' && (
        <Image
          source={{ uri: card.artUrl }}
          style={styles.cardArtImage}
          resizeMode="cover"
        />
      )}

      {/* Hero Golden Sunburst Border Accent */}
      {card.isHero && <View style={styles.heroGlowOverlay} />}

      {/* Top Left: Strength Badge / Power Crest */}
      {card.row !== 'special' && card.row !== 'weather' && (
        <View
          style={[
            styles.powerBadge,
            isCompact && styles.powerBadgeCompact,
            card.isHero && styles.heroPowerBadge,
          ]}
        >
          <Text
            style={[
              styles.powerText,
              isCompact && styles.powerTextCompact,
              isPowerBoosted && styles.powerBoosted,
              isPowerWeakened && styles.powerWeakened,
              card.isHero && styles.heroPowerText,
            ]}
          >
            {effectivePower}
          </Text>
        </View>
      )}

      {/* Top Right: Row Combat Classification Icon */}
      <View
        style={[
          styles.rowBadge,
          isCompact && styles.rowBadgeCompact,
          card.isHero && styles.heroRowBadge,
        ]}
      >
        <Text style={[styles.rowSymbolText, isCompact && { fontSize: 10 }]}>
          {getRowSymbol(card.activeRow || card.row)}
        </Text>
      </View>

      {/* Center-Left: Ability Icon Pill */}
      {abilityBadge && (
        <View
          style={[
            styles.abilityPill,
            isCompact && styles.abilityPillCompact,
            { backgroundColor: `${abilityBadge.color}EE` },
          ]}
        >
          <Text style={[styles.abilityIcon, isCompact && { fontSize: 9 }]}>
            {abilityBadge.icon}
          </Text>
        </View>
      )}

      {/* Bottom Name & Title Ribbon */}
      <View style={styles.bottomRibbon}>
        <Text
          numberOfLines={1}
          style={[
            styles.cardNameText,
            isCompact && styles.cardNameTextCompact,
            card.isHero && styles.heroCardName,
          ]}
        >
          {card.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#1E1B18',
    borderWidth: 1.5,
    borderColor: '#785A3C',
    position: 'relative',
    marginHorizontal: 3,
    marginVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 4,
  },
  heroContainer: {
    borderColor: '#F59E0B',
    borderWidth: 2,
    shadowColor: '#F59E0B',
    shadowOpacity: 0.7,
    shadowRadius: 8,
  },
  selectedContainer: {
    borderColor: '#38BDF8',
    borderWidth: 2.5,
    transform: [{ translateY: -6 }],
    shadowColor: '#38BDF8',
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  cardArtImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  heroGlowOverlay: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 4,
    opacity: 0.6,
  },
  powerBadge: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  powerBadgeCompact: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
  },
  heroPowerBadge: {
    backgroundColor: '#78350F',
    borderColor: '#FDE68A',
    borderWidth: 1.5,
  },
  powerText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  powerTextCompact: {
    fontSize: 9,
  },
  heroPowerText: {
    color: '#FEF08A',
  },
  powerBoosted: {
    color: '#4ADE80', // Green
  },
  powerWeakened: {
    color: '#F87171', // Red
  },
  rowBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0F172ACC',
    borderWidth: 1,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  rowBadgeCompact: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  heroRowBadge: {
    borderColor: '#F59E0B',
  },
  rowSymbolText: {
    fontSize: 11,
  },
  abilityPill: {
    position: 'absolute',
    top: 30,
    left: 3,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  abilityPillCompact: {
    top: 23,
    width: 15,
    height: 15,
    borderRadius: 7.5,
  },
  abilityIcon: {
    fontSize: 10,
  },
  bottomRibbon: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#09090BE8',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: '#3F3F46',
  },
  cardNameText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#E4E4E7',
    textAlign: 'center',
  },
  cardNameTextCompact: {
    fontSize: 7,
  },
  heroCardName: {
    color: '#FCD34D',
  },
});
