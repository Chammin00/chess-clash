import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  currentMana: number;
  maxMana: number;
  label?: string;
}

export const ManaBar: React.FC<Props> = ({ currentMana, maxMana, label }) => {
  const crystals = [];
  for (let i = 0; i < maxMana; i++) {
    crystals.push(i < currentMana);
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {label && <Text style={styles.labelText}>{label}</Text>}
        <View style={styles.manaCountBadge}>
          <Text style={styles.gemIcon}>💎</Text>
          <Text style={styles.manaText}>
            {currentMana} / {maxMana}
          </Text>
        </View>
      </View>
      <View style={styles.crystalsRow}>
        {crystals.map((filled, idx) => (
          <View
            key={idx}
            style={[styles.crystal, filled ? styles.crystalFilled : styles.crystalEmpty]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(23, 25, 35, 0.75)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  labelText: {
    color: '#A0AEC0',
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  manaCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gemIcon: {
    fontSize: 10,
    marginRight: 3,
  },
  manaText: {
    color: '#63B3ED',
    fontSize: 10,
    fontWeight: '800',
  },
  crystalsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  crystal: {
    width: 12,
    height: 7,
    borderRadius: 2,
  },
  crystalFilled: {
    backgroundColor: '#3182CE',
    borderWidth: 1,
    borderColor: '#63B3ED',
  },
  crystalEmpty: {
    backgroundColor: '#1A202C',
    borderWidth: 1,
    borderColor: '#4A5568',
  },
});
