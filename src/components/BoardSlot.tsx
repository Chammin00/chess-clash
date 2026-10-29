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
      ]}
    >
      {/* Unit Icon */}
      <Text style={styles.unitIcon}>{unit.icon}</Text>
      <Text numberOfLines={1} style={styles.unitName}>{unit.name}</Text>

      {/* Power Stat */}
      <View style={styles.powerPill}>
        <Text style={styles.powerVal}>{unit.currentPower}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  emptySlot: {
    width: 68,
    height: 84,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#44403C',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 3,
    backgroundColor: 'rgba(28, 25, 23, 0.4)',
  },
  slotHighlighted: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  emptyText: {
    color: '#78716C',
    fontSize: 10,
    fontWeight: '600',
  },
  slotFilled: {
    width: 68,
    height: 84,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: '#1C1917',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginHorizontal: 3,
  },
  playerBorder: {
    borderColor: '#D97706',
  },
  opponentBorder: {
    borderColor: '#DC2626',
  },
  slotSelected: {
    borderColor: '#10B981',
    transform: [{ scale: 1.05 }],
  },
  targetGlow: {
    borderColor: '#EF4444',
    borderWidth: 2.5,
  },
  unitIcon: {
    fontSize: 24,
    marginTop: 4,
  },
  unitName: {
    color: '#E5E7EB',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  powerPill: {
    backgroundColor: '#78350F',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  powerVal: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
  },
});
