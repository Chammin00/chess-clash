import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SpireCard, SpireRelic, SpirePotion } from '../types/spire';
import { SpireCardView } from '../components/SpireCardView';

interface Props {
  goldEarned: number;
  cardChoices: SpireCard[];
  relicEarned?: SpireRelic;
  potionEarned?: SpirePotion;
  onClaimRewards: (selectedCard?: SpireCard) => void;
}

export const SpireRewardScreen: React.FC<Props> = ({
  goldEarned,
  cardChoices,
  relicEarned,
  potionEarned,
  onClaimRewards,
}) => {
  const [showCardPicker, setShowCardPicker] = useState<boolean>(false);
  const [selectedCard, setSelectedCard] = useState<SpireCard | undefined>(undefined);
  const [goldClaimed, setGoldClaimed] = useState<boolean>(false);
  const [relicClaimed, setRelicClaimed] = useState<boolean>(false);
  const [potionClaimed, setPotionClaimed] = useState<boolean>(false);
  const [cardRewardResolved, setCardRewardResolved] = useState<boolean>(false);

  const handlePickCard = (card: SpireCard) => {
    setSelectedCard(card);
    setCardRewardResolved(true);
    setShowCardPicker(false);
  };

  const handleSkipCard = () => {
    setSelectedCard(undefined);
    setCardRewardResolved(true);
    setShowCardPicker(false);
  };

  return (
    <View style={styles.container}>
      {/* Salvage Banner */}
      <View style={styles.header}>
        <Text style={styles.victoryTitle}>⚡ SECTOR PURGED! ⚡</Text>
        <Text style={styles.subTitle}>Tactical Salvage & Subroutines Available</Text>
      </View>

      {!showCardPicker ? (
        <ScrollView contentContainerStyle={styles.rewardsList}>
          {/* Gold / Credits */}
          <TouchableOpacity
            disabled={goldClaimed}
            style={[styles.rewardItem, goldClaimed && styles.claimedItem]}
            onPress={() => setGoldClaimed(true)}
          >
            <Text style={styles.itemEmoji}>🪙</Text>
            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle}>{goldEarned} Credits</Text>
              <Text style={styles.itemSub}>{goldClaimed ? 'Transferred to inventory' : 'Tap to siphon credits'}</Text>
            </View>
            <Text style={styles.claimStatus}>{goldClaimed ? '✓' : '➔'}</Text>
          </TouchableOpacity>

          {/* Artifact Relic */}
          {relicEarned && (
            <TouchableOpacity
              disabled={relicClaimed}
              style={[styles.rewardItem, relicClaimed && styles.claimedItem]}
              onPress={() => setRelicClaimed(true)}
            >
              <Text style={styles.itemEmoji}>{relicEarned.icon}</Text>
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>{relicEarned.name}</Text>
                <Text style={styles.itemSub}>{relicEarned.description}</Text>
              </View>
              <Text style={styles.claimStatus}>{relicClaimed ? '✓' : '➔'}</Text>
            </TouchableOpacity>
          )}

          {/* Stimulant Potion */}
          {potionEarned && (
            <TouchableOpacity
              disabled={potionClaimed}
              style={[styles.rewardItem, potionClaimed && styles.claimedItem]}
              onPress={() => setPotionClaimed(true)}
            >
              <Text style={styles.itemEmoji}>{potionEarned.icon}</Text>
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>{potionEarned.name}</Text>
                <Text style={styles.itemSub}>{potionEarned.description}</Text>
              </View>
              <Text style={styles.claimStatus}>{potionClaimed ? '✓' : '➔'}</Text>
            </TouchableOpacity>
          )}

          {/* Subroutine Card Draft */}
          <TouchableOpacity
            disabled={cardRewardResolved}
            style={[styles.rewardItem, cardRewardResolved && styles.claimedItem]}
            onPress={() => setShowCardPicker(true)}
          >
            <Text style={styles.itemEmoji}>🃏</Text>
            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle}>
                {selectedCard ? `Equipped: ${selectedCard.name}` : 'Acquire New Subroutine Protocol'}
              </Text>
              <Text style={styles.itemSub}>
                {cardRewardResolved
                  ? selectedCard ? 'Card synchronized' : 'Requisition bypassed'
                  : 'Select 1 of 3 protocols (or Skip)'}
              </Text>
            </View>
            <Text style={styles.claimStatus}>{cardRewardResolved ? '✓' : '➔'}</Text>
          </TouchableOpacity>

          {/* Proceed Button */}
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => onClaimRewards(selectedCard)}
          >
            <Text style={styles.continueText}>PROCEED TO NEXT WAYPOINT ➔</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* Protocol Requisition Selector */
        <View style={styles.cardPickerView}>
          <Text style={styles.cardPickerTitle}>SYNCHRONIZE PROTOCOL</Text>
          <Text style={styles.cardPickerSub}>Streamlined decks maximize combat efficiency.</Text>

          <View style={styles.cardsRow}>
            {cardChoices.map(c => (
              <SpireCardView
                key={c.id}
                card={c}
                onPress={() => handlePickCard(c)}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.skipBtn} onPress={handleSkipCard}>
            <Text style={styles.skipText}>BYPASS PROTOCOL REQUISITION ➔</Text>
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
    marginBottom: 20,
    marginTop: 20,
  },
  victoryTitle: {
    color: '#00F0FF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  rewardsList: {
    gap: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#00F0FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  claimedItem: {
    borderColor: '#10B981',
    backgroundColor: '#1A2E26',
  },
  itemEmoji: {
    fontSize: 26,
    marginRight: 14,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  itemSub: {
    color: '#94A3B8',
    fontSize: 9.5,
    marginTop: 2,
  },
  claimStatus: {
    color: '#00F0FF',
    fontSize: 18,
    fontWeight: '900',
  },
  continueBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  continueText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cardPickerView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPickerTitle: {
    color: '#00F0FF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cardPickerSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginBottom: 16,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
  skipBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#475569',
  },
  skipText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
