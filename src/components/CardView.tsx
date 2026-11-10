import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../types/card';

interface Props {
  card: Card;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

export const CardView: React.FC<Props> = ({
  card,
  onPress,
  selected = false,
  disabled = false,
  compact = false,
}) => {
  const getRarityColor = () => {
    switch (card.rarity) {
      case 'legendary': return '#F6AD55';
      case 'epic': return '#B794F4';
      case 'rare': return '#63B3ED';
      default: return '#CBD5E0';
    }
  };

  const isSpell = card.type === 'spell';

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.75}
      onPress={disabled ? undefined : onPress}
      style={[
        styles.cardContainer,
        compact ? styles.cardCompact : styles.cardStandard,
        { borderColor: selected ? '#68D391' : getRarityColor() },
        selected && styles.selectedGlow,
        disabled && styles.disabledCard,
      ]}
    >
      {/* Mana Cost Gem */}
      <View style={styles.manaBadge}>
        <Text style={styles.manaText}>{card.cost}</Text>
      </View>

      {/* Card Icon / Artwork */}
      <View style={[styles.iconArea, { backgroundColor: card.color + '22' }]}>
        <Text style={compact ? styles.cardEmojiSmall : styles.cardEmoji}>{card.icon}</Text>
      </View>

      {/* Card Header & Description */}
      <View style={styles.cardDetails}>
        <Text numberOfLines={1} style={styles.cardName}>{card.name}</Text>
        {!compact && (
          <Text numberOfLines={2} style={styles.cardDesc}>
            {card.description}
          </Text>
        )}
      </View>

      {/* Stats footer (for Units) */}
      {!isSpell && (
        <View style={styles.statsRow}>
          <View style={styles.statAttack}>
            <Text style={styles.statIcon}>⚔️</Text>
            <Text style={styles.statVal}>{card.attack}</Text>
          </View>
          <View style={styles.statHp}>
            <Text style={styles.statIcon}>❤️</Text>
            <Text style={styles.statVal}>{card.hp}</Text>
          </View>
        </View>
      )}

      {isSpell && (
        <View style={styles.spellBadge}>
          <Text style={styles.spellBadgeText}>SPELL</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1A202C',
    borderRadius: 8,
    borderWidth: 2,
    padding: 4,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
  },
  cardStandard: {
    width: 96,
    height: 136,
    marginHorizontal: 3,
  },
  cardCompact: {
    width: 78,
    height: 108,
    marginHorizontal: 2,
  },
  selectedGlow: {
    borderColor: '#48BB78',
    borderWidth: 2.5,
    transform: [{ translateY: -6 }],
  },
  disabledCard: {
    opacity: 0.55,
  },
  manaBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3182CE',
    borderWidth: 1.5,
    borderColor: '#63B3ED',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  manaText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  iconArea: {
    flex: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardEmojiSmall: {
    fontSize: 20,
  },
  cardDetails: {
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  cardName: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardDesc: {
    color: '#A0AEC0',
    fontSize: 7.5,
    textAlign: 'center',
    marginTop: 1,
    lineHeight: 9,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    paddingHorizontal: 2,
  },
  statAttack: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 62, 62, 0.25)',
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  statHp: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 161, 105, 0.25)',
    borderRadius: 4,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  statIcon: {
    fontSize: 8,
    marginRight: 1,
  },
  statVal: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  spellBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(128, 90, 213, 0.4)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  spellBadgeText: {
    color: '#D6BCFA',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
