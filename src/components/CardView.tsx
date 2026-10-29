import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, CombatRow } from '../types/card';

interface Props {
  card: Card;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
  displayPower?: number; // Overrides base power if buffed or weather-debuffed
  showRowBadge?: boolean;
}

export const CardView: React.FC<Props> = ({
  card,
  onPress,
  selected = false,
  disabled = false,
  compact = false,
  displayPower,
  showRowBadge = true,
}) => {
  const getRarityBorder = () => {
    if (card.isHero) return '#F59E0B'; // Golden Hero
    switch (card.rarity) {
      case 'legendary': return '#EC4899';
      case 'epic': return '#8B5CF6';
      case 'rare': return '#3B82F6';
      default: return '#78716C';
    }
  };

  const getRowSymbol = (row: CombatRow) => {
    switch (row) {
      case 'melee': return '⚔️';
      case 'ranged': return '🏹';
      case 'siege': return '🏯';
      case 'agile': return '🔄';
      default: return '⚡';
    }
  };

  const getAbilitySymbol = () => {
    switch (card.ability) {
      case 'spy': return '🕵️';
      case 'tight_bond': return '🔗';
      case 'muster': return '👥';
      case 'medic': return '💉';
      case 'scorch':
      case 'scorch_melee': return '🔥';
      case 'horn': return '🥁';
      case 'decoy': return '🪵';
      case 'weather_frost': return '❄️';
      case 'weather_fog': return '🌫️';
      case 'weather_rain': return '🌧️';
      case 'clear_weather': return '☀️';
      case 'morale_boost': return '🚩';
      default: return null;
    }
  };

  const currentPower = displayPower !== undefined ? displayPower : card.power;
  const isBuffed = displayPower !== undefined && displayPower > card.power;
  const isDebuffed = displayPower !== undefined && displayPower < card.power;

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.75}
      onPress={disabled ? undefined : onPress}
      style={[
        styles.cardContainer,
        compact ? styles.cardCompact : styles.cardStandard,
        { borderColor: selected ? '#10B981' : getRarityBorder() },
        card.isHero && styles.heroCardGlow,
        selected && styles.selectedGlow,
        disabled && styles.disabledCard,
      ]}
    >
      {/* Top Banner: Power & Row indicator */}
      {card.type !== 'special' && card.type !== 'weather' && (
        <View style={[
          styles.powerBadge,
          card.isHero ? styles.heroPowerBadge : styles.standardPowerBadge,
          isBuffed && styles.buffedPowerBadge,
          isDebuffed && styles.debuffedPowerBadge,
        ]}>
          <Text style={[
            styles.powerText,
            compact && styles.powerTextSmall,
            card.isHero && styles.heroPowerText
          ]}>
            {currentPower}
          </Text>
        </View>
      )}

      {/* Row Indicator Badge */}
      {showRowBadge && card.row !== 'special' && (
        <View style={styles.rowBadge}>
          <Text style={styles.rowBadgeText}>{getRowSymbol(card.row)}</Text>
        </View>
      )}

      {/* Ability Icon Badge if applicable */}
      {getAbilitySymbol() && (
        <View style={styles.abilityBadge}>
          <Text style={styles.abilityBadgeText}>{getAbilitySymbol()}</Text>
        </View>
      )}

      {/* Hero Crown Indicator */}
      {card.isHero && (
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>👑</Text>
        </View>
      )}

      {/* Card Icon / Artwork */}
      <View style={[styles.iconArea, { backgroundColor: card.color + '22' }]}>
        <Text style={compact ? styles.cardEmojiSmall : styles.cardEmoji}>{card.icon}</Text>
      </View>

      {/* Details (Full size only) */}
      {!compact && (
        <View style={styles.cardDetails}>
          <Text numberOfLines={1} style={[styles.cardName, card.isHero && styles.heroName]}>
            {card.name}
          </Text>
          <Text numberOfLines={2} style={styles.cardDesc}>
            {card.description}
          </Text>
        </View>
      )}

      {/* Compact Name Caption */}
      {compact && (
        <View style={styles.compactLabelArea}>
          <Text numberOfLines={1} style={styles.compactNameText}>
            {card.name}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#18181B',
    borderRadius: 8,
    borderWidth: 1.5,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  cardStandard: {
    width: 108,
    height: 154,
    marginRight: 8,
    padding: 4,
  },
  cardCompact: {
    width: 58,
    height: 78,
    marginHorizontal: 2,
    padding: 2,
  },
  heroCardGlow: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
    backgroundColor: '#27272A',
  },
  selectedGlow: {
    borderColor: '#34D399',
    transform: [{ translateY: -6 }],
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  disabledCard: {
    opacity: 0.45,
  },
  powerBadge: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  standardPowerBadge: {
    backgroundColor: '#44403C',
  },
  heroPowerBadge: {
    backgroundColor: '#D97706',
    borderColor: '#FDE047',
  },
  buffedPowerBadge: {
    backgroundColor: '#059669',
  },
  debuffedPowerBadge: {
    backgroundColor: '#DC2626',
  },
  powerText: {
    color: '#F9FAFB',
    fontSize: 12,
    fontWeight: '900',
  },
  powerTextSmall: {
    fontSize: 10,
  },
  heroPowerText: {
    color: '#FEF08A',
  },
  rowBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 4,
    paddingHorizontal: 2,
    zIndex: 10,
  },
  rowBadgeText: {
    fontSize: 10,
  },
  abilityBadge: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
    paddingHorizontal: 2,
    zIndex: 10,
  },
  abilityBadgeText: {
    fontSize: 10,
  },
  heroBadge: {
    position: 'absolute',
    top: 2,
    left: 26,
    zIndex: 10,
  },
  heroBadgeText: {
    fontSize: 10,
  },
  iconArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginVertical: 2,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardEmojiSmall: {
    fontSize: 20,
  },
  cardDetails: {
    paddingHorizontal: 2,
    paddingBottom: 2,
  },
  cardName: {
    color: '#F3F4F6',
    fontSize: 11,
    fontWeight: '800',
  },
  heroName: {
    color: '#FDE047',
  },
  cardDesc: {
    color: '#9CA3AF',
    fontSize: 9,
    lineHeight: 11,
    marginTop: 1,
  },
  compactLabelArea: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 2,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  compactNameText: {
    color: '#E5E7EB',
    fontSize: 8,
    fontWeight: '700',
  },
});
