import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BoardUnit } from '../types/card';

interface Props {
  unit?: BoardUnit;
  isPlayerUnit: boolean;
  onPress?: () => void;
  selected?: boolean;
  highlighted?: boolean;
}

export const BoardSlot: React.FC<Props> = ({
  unit,
  isPlayerUnit,
  onPress,
  selected = false,
  highlighted = false,
}) => {
  if (!unit) {
    return (
      <View style={[styles.emptySlot, highlighted && styles.slotHighlighted]}>
        <Text style={styles.emptyText}>Empty</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.slotFilled,
        isPlayerUnit ? styles.playerBorder : styles.opponentBorder,
        selected && styles.slotSelected,
        highlighted && styles.targetGlow,
        unit.canAttack && isPlayerUnit && styles.readyGlow,
      ]}
    >
      {/* Guard Badge */}
      {unit.hasGuard && (
        <View style={styles.guardBadge}>
          <Text style={styles.guardText}>🛡️ GUARD</Text>
        </View>
      )}

      {/* Unit Icon */}
      <Text style={styles.unitIcon}>{unit.icon}</Text>
      <Text numberOfLines={1} style={styles.unitName}>{unit.name}</Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.attackPill}>
          <Text style={styles.statVal}>{unit.currentAttack}</Text>
        </View>
        <View style={styles.hpPill}>
          <Text style={styles.statVal}>{unit.currentHp}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  emptySlot: {
    width: 76,
    height: 94,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#2D3748',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
    backgroundColor: 'rgba(23, 25, 35, 0.4)',
  },
  slotHighlighted: {
    borderColor: '#48BB78',
    backgroundColor: 'rgba(72, 187, 120, 0.1)',
  },
  emptyText: {
    color: '#4A5568',
    fontSize: 10,
    fontWeight: '600',
  },
  slotFilled: {
    width: 76,
    height: 94,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#1A202C',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginHorizontal: 3,
  },
  playerBorder: {
    borderColor: '#3182CE',
  },
  opponentBorder: {
    borderColor: '#E53E3E',
  },
  slotSelected: {
    borderColor: '#48BB78',
    transform: [{ scale: 1.05 }],
  },
  targetGlow: {
    borderColor: '#F56565',
    borderWidth: 2.5,
  },
  readyGlow: {
    borderColor: '#48BB78',
    borderWidth: 2,
  },
  guardBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#D69E2E',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    zIndex: 10,
  },
  guardText: {
    color: '#FFF',
    fontSize: 7.5,
    fontWeight: '800',
  },
  unitIcon: {
    fontSize: 26,
    marginTop: 6,
  },
  unitName: {
    color: '#CBD5E0',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  attackPill: {
    backgroundColor: '#9B2C2C',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  hpPill: {
    backgroundColor: '#22543D',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  statVal: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
