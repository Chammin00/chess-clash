import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SpireHero, SpireCard } from '../types/spire';
import { upgradeCard } from '../data/spireCards';
import { SpireCardView } from '../components/SpireCardView';

interface Props {
  hero: SpireHero;
  onRestChosen: (healedAmount: number) => void;
  onSmithChosen: (upgradedCardId: string) => void;
}

export const SpireRestScreen: React.FC<Props> = ({
  hero,
  onRestChosen,
  onSmithChosen,
}) => {
  const [showSmithPicker, setShowSmithPicker] = useState<boolean>(false);
  const healAmount = Math.round(hero.maxHp * 0.3);

  const upgradeableCards = hero.deck.filter(c => !c.isUpgraded);

  const handleSelectUpgrade = (card: SpireCard) => {
    onSmithChosen(card.id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.forgeIcon}>💠</Text>
        <Text style={styles.title}>THE AETHER FORGE</Text>
        <Text style={styles.subTitle}>
          Plasma energy radiates from the chamber conduits. Select protocol.
        </Text>
        <Text style={styles.heroHp}>
          Current Vitality: {hero.hp} / {hero.maxHp} HP
        </Text>
      </View>

      {!showSmithPicker ? (
        <View style={styles.choicesContainer}>
          {/* Rejuvenate Option */}
          <TouchableOpacity
            style={styles.choiceCard}
            onPress={() => onRestChosen(healAmount)}
          >
            <Text style={styles.choiceEmoji}>🧪</Text>
            <View style={styles.choiceTextCol}>
              <Text style={styles.choiceTitle}>NANITE REJUVENATION</Text>
              <Text style={styles.choiceDesc}>
                Repair 30% of maximum Vitality (+{healAmount} HP).
              </Text>
            </View>
          </TouchableOpacity>

          {/* Overclock Option */}
          <TouchableOpacity
            disabled={upgradeableCards.length === 0}
            style={[styles.choiceCard, styles.smithCard, upgradeableCards.length === 0 && styles.choiceDisabled]}
            onPress={() => setShowSmithPicker(true)}
          >
            <Text style={styles.choiceEmoji}>⚡</Text>
            <View style={styles.choiceTextCol}>
              <Text style={styles.choiceTitle}>OVERCLOCK FORGE</Text>
              <Text style={styles.choiceDesc}>
                {upgradeableCards.length > 0
                  ? 'Overclock a subroutine card to its enhanced + version.'
                  : 'All deck protocols currently at maximum tune!'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        /* Overclock Selector */
        <View style={styles.smithPickerView}>
          <Text style={styles.smithPickerTitle}>SELECT PROTOCOL TO OVERCLOCK</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsScroll}
          >
            {upgradeableCards.map(card => {
              const preview = upgradeCard(card);
              return (
                <View key={card.id} style={styles.smithPair}>
                  <Text style={styles.pairLabel}>STANDARD ➔ OVERCLOCKED</Text>
                  <SpireCardView
                    card={preview}
                    onPress={() => handleSelectUpgrade(card)}
                  />
                  <TouchableOpacity
                    style={styles.selectUpgradeBtn}
                    onPress={() => handleSelectUpgrade(card)}
                  >
                    <Text style={styles.selectUpgradeText}>OVERCLOCK THIS ➔</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => setShowSmithPicker(false)}
          >
            <Text style={styles.backText}>‹ RETURN TO FORGE OPTIONS</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A13',
    padding: 16,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  forgeIcon: {
    fontSize: 50,
    marginBottom: 8,
  },
  title: {
    color: '#00F0FF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subTitle: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  heroHp: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
  },
  choicesContainer: {
    gap: 16,
  },
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 3,
  },
  smithCard: {
    borderColor: '#00F0FF',
  },
  choiceDisabled: {
    opacity: 0.4,
  },
  choiceEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  choiceTextCol: {
    flex: 1,
  },
  choiceTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  choiceDesc: {
    color: '#94A3B8',
    fontSize: 10.5,
    marginTop: 2,
  },
  smithPickerView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smithPickerTitle: {
    color: '#00F0FF',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 12,
  },
  cardsScroll: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  smithPair: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  pairLabel: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 6,
  },
  selectUpgradeBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  selectUpgradeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  backBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 16,
  },
  backText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
  },
});
