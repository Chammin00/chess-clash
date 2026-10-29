import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { CrateOpeningResult } from '../types/monetization';

interface Props {
  visible: boolean;
  result: CrateOpeningResult | null;
  onClose: () => void;
}

const RARITY_COLORS = {
  common: '#94A3B8',
  rare: '#38BDF8',
  epic: '#C084FC',
  legendary: '#FBBF24',
};

export const CrateOpeningModal: React.FC<Props> = ({ visible, result, onClose }) => {
  if (!result) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <Text style={styles.crateTitle}>🎉 {result.crateTitle.toUpperCase()}</Text>
          {result.isPityTriggered && (
            <View style={styles.pityTag}>
              <Text style={styles.pityText}>✨ PITY TIMER TRIGGERED: GUARANTEED LEGENDARY!</Text>
            </View>
          )}

          {/* Currency Bonus */}
          <View style={styles.currencyBonusRow}>
            <View style={styles.bonusPill}>
              <Text style={styles.bonusIcon}>🪙</Text>
              <Text style={styles.bonusText}>+{result.goldEarned} Gold</Text>
            </View>
            {result.gemsEarned > 0 && (
              <View style={styles.bonusPill}>
                <Text style={styles.bonusIcon}>💎</Text>
                <Text style={styles.bonusText}>+{result.gemsEarned} Gems</Text>
              </View>
            )}
          </View>

          {/* Cards Unlocked */}
          <Text style={styles.cardsUnlockedHeader}>CARDS UNLOCKED</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsRow}
          >
            {result.cardsUnlocked.map((card, idx) => {
              const rarityColor = RARITY_COLORS[card.rarity] || '#94A3B8';
              return (
                <View
                  key={idx}
                  style={[
                    styles.cardSlot,
                    { borderColor: rarityColor },
                    card.rarity === 'legendary' && styles.legendaryGlow,
                  ]}
                >
                  <View style={[styles.rarityPill, { backgroundColor: rarityColor }]}>
                    <Text style={styles.rarityText}>{card.rarity.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.cardTypeIcon}>
                    {card.type === 'unit' ? '⚔️' : '✨'}
                  </Text>
                  <Text style={styles.cardName} numberOfLines={2}>
                    {card.name}
                  </Text>
                  <Text style={styles.cardCost}>Cost: {card.cost} ⚡</Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Continue CTA */}
          <TouchableOpacity style={styles.continueBtn} onPress={onClose}>
            <Text style={styles.continueBtnText}>CLAIM & COLLECT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#18181B',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  crateTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  pityTag: {
    backgroundColor: '#854D0E',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  pityText: {
    color: '#FEF08A',
    fontSize: 9,
    fontWeight: '900',
  },
  currencyBonusRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  bonusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  bonusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  bonusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  cardsUnlockedHeader: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  cardsRow: {
    gap: 10,
    paddingVertical: 4,
    marginBottom: 16,
  },
  cardSlot: {
    width: 105,
    height: 145,
    backgroundColor: '#27272A',
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  legendaryGlow: {
    backgroundColor: '#2D1B00',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  rarityPill: {
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  rarityText: {
    color: '#0F172A',
    fontSize: 8,
    fontWeight: '900',
  },
  cardTypeIcon: {
    fontSize: 24,
    marginVertical: 4,
  },
  cardName: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  cardCost: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
  },
  continueBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  continueBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
