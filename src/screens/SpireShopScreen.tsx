import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SpireHero, SpireCard, SpireRelic, SpirePotion } from '../types/spire';
import { SPIRE_CARD_CATALOG } from '../data/spireCards';
import { ALL_SPIRE_RELICS, ALL_SPIRE_POTIONS } from '../data/spireRelics';
import { SpireCardView } from '../components/SpireCardView';

interface Props {
  hero: SpireHero;
  onBuyCard: (card: SpireCard, cost: number) => void;
  onBuyRelic: (relic: SpireRelic, cost: number) => void;
  onBuyPotion: (potion: SpirePotion, cost: number) => void;
  onPurgeCard: (cardId: string, cost: number) => void;
  onLeaveShop: () => void;
}

export const SpireShopScreen: React.FC<Props> = ({
  hero,
  onBuyCard,
  onBuyRelic,
  onBuyPotion,
  onPurgeCard,
  onLeaveShop,
}) => {
  const [showPurgeModal, setShowPurgeModal] = useState<boolean>(false);
  const purgeCost = 75;

  const [shopCards] = useState<Array<{ card: SpireCard; cost: number }>>(() => {
    const shuffled = [...SPIRE_CARD_CATALOG].sort(() => Math.random() - 0.5).slice(0, 4);
    return shuffled.map(c => ({
      card: { ...c, id: `${c.id}_market_${Math.random().toString(36).substring(2, 6)}` },
      cost: c.rarity === 'rare' ? 140 : c.rarity === 'uncommon' ? 95 : 55,
    }));
  });

  const [shopRelic] = useState<{ relic: SpireRelic; cost: number }>(() => {
    const r = ALL_SPIRE_RELICS.filter(x => !hero.relics.some(hr => hr.id === x.id))[0] || ALL_SPIRE_RELICS[1];
    return { relic: r, cost: 160 };
  });

  const [shopPotion] = useState<{ potion: SpirePotion; cost: number }>(() => {
    return { potion: ALL_SPIRE_POTIONS[0], cost: 50 };
  });

  const [boughtCardIds, setBoughtCardIds] = useState<string[]>([]);
  const [boughtRelic, setBoughtRelic] = useState<boolean>(false);
  const [boughtPotion, setBoughtPotion] = useState<boolean>(false);

  const handlePurchaseCard = (item: { card: SpireCard; cost: number }) => {
    if (hero.gold < item.cost) {
      Alert.alert('Credits Insufficient', `Requires ${item.cost} Credits.`);
      return;
    }
    setBoughtCardIds(prev => [...prev, item.card.id]);
    onBuyCard(item.card, item.cost);
  };

  const handlePurchaseRelic = () => {
    if (hero.gold < shopRelic.cost) {
      Alert.alert('Credits Insufficient', `Requires ${shopRelic.cost} Credits.`);
      return;
    }
    setBoughtRelic(true);
    onBuyRelic(shopRelic.relic, shopRelic.cost);
  };

  const handlePurchasePotion = () => {
    if (hero.gold < shopPotion.cost) {
      Alert.alert('Credits Insufficient', `Requires ${shopPotion.cost} Credits.`);
      return;
    }
    setBoughtPotion(true);
    onBuyPotion(shopPotion.potion, shopPotion.cost);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatar}>🛸</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.shopTitle}>THE BLACK MARKET SYNDICATE</Text>
          <Text style={styles.quote}>"Keep your sensors peeled. Everything is off-the-books..."</Text>
          <View style={styles.goldPill}>
            <Text style={styles.goldIcon}>🪙</Text>
            <Text style={styles.goldAmount}>{hero.gold} Credits</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Subroutine Cards */}
        <Text style={styles.sectionTitle}>CONTRABAND SUBROUTINES</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
          {shopCards.map(item => {
            const isBought = boughtCardIds.includes(item.card.id);
            return (
              <View key={item.card.id} style={styles.cardCol}>
                <SpireCardView card={item.card} disabled={isBought} />
                <TouchableOpacity
                  disabled={isBought || hero.gold < item.cost}
                  style={[styles.buyBtn, isBought && styles.boughtBtn]}
                  onPress={() => handlePurchaseCard(item)}
                >
                  <Text style={styles.buyText}>
                    {isBought ? 'DEPLETED' : `🪙 ${item.cost}`}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>

        {/* Tech Artifacts & Stimulants */}
        <Text style={styles.sectionTitle}>DARK TECH ARTIFACTS & STIMULANTS</Text>
        <View style={styles.curiosRow}>
          {/* Relic */}
          <View style={styles.curioCard}>
            <Text style={styles.curioEmoji}>{shopRelic.relic.icon}</Text>
            <Text style={styles.curioName}>{shopRelic.relic.name}</Text>
            <Text style={styles.curioDesc}>{shopRelic.relic.description}</Text>
            <TouchableOpacity
              disabled={boughtRelic || hero.gold < shopRelic.cost}
              style={[styles.buyBtn, boughtRelic && styles.boughtBtn]}
              onPress={handlePurchaseRelic}
            >
              <Text style={styles.buyText}>{boughtRelic ? 'DEPLETED' : `🪙 ${shopRelic.cost}`}</Text>
            </TouchableOpacity>
          </View>

          {/* Potion */}
          <View style={styles.curioCard}>
            <Text style={styles.curioEmoji}>{shopPotion.potion.icon}</Text>
            <Text style={styles.curioName}>{shopPotion.potion.name}</Text>
            <Text style={styles.curioDesc}>{shopPotion.potion.description}</Text>
            <TouchableOpacity
              disabled={boughtPotion || hero.gold < shopPotion.cost}
              style={[styles.buyBtn, boughtPotion && styles.boughtBtn]}
              onPress={handlePurchasePotion}
            >
              <Text style={styles.buyText}>{boughtPotion ? 'DEPLETED' : `🪙 ${shopPotion.cost}`}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Deletion */}
        <Text style={styles.sectionTitle}>DATA MEMORY PURGE</Text>
        <TouchableOpacity
          disabled={hero.gold < purgeCost}
          style={[styles.purgeCard, hero.gold < purgeCost && styles.purgeCardDisabled]}
          onPress={() => setShowPurgeModal(true)}
        >
          <Text style={styles.purgeEmoji}>🗑️</Text>
          <View style={styles.purgeTextCol}>
            <Text style={styles.purgeTitle}>Protocol Decommission Service</Text>
            <Text style={styles.purgeDesc}>Erase an unwanted card permanently to optimize draw velocity.</Text>
          </View>
          <View style={styles.purgePrice}>
            <Text style={styles.purgePriceText}>🪙 {purgeCost}</Text>
          </View>
        </TouchableOpacity>

        {/* Leave */}
        <TouchableOpacity style={styles.leaveBtn} onPress={onLeaveShop}>
          <Text style={styles.leaveText}>RETURN TO NAVIGATION MATRIX ➔</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Decommission Modal */}
      {showPurgeModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>SELECT CARD TO DECOMMISSION</Text>
            <Text style={styles.modalSub}>Cost: {purgeCost} Credits</Text>

            <ScrollView horizontal contentContainerStyle={styles.purgeCardsScroll}>
              {hero.deck.map(c => (
                <View key={c.id} style={styles.purgeItem}>
                  <SpireCardView card={c} />
                  <TouchableOpacity
                    style={styles.confirmPurgeBtn}
                    onPress={() => {
                      onPurgeCard(c.id, purgeCost);
                      setShowPurgeModal(false);
                    }}
                  >
                    <Text style={styles.confirmPurgeText}>ERASE ❌</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowPurgeModal(false)}>
              <Text style={styles.closeModalText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A13',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#00F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatar: {
    fontSize: 32,
  },
  headerText: {
    flex: 1,
  },
  shopTitle: {
    color: '#00F0FF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  quote: {
    color: '#94A3B8',
    fontSize: 10,
    fontStyle: 'italic',
    marginVertical: 2,
  },
  goldPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#070A13',
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  goldIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  goldAmount: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 12,
  },
  cardsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  cardCol: {
    alignItems: 'center',
  },
  buyBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#38BDF8',
    width: 100,
    alignItems: 'center',
  },
  boughtBtn: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  buyText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
  },
  curiosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  curioCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    justifyContent: 'space-between',
  },
  curioEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  curioName: {
    color: '#F8FAFC',
    fontSize: 11.5,
    fontWeight: '800',
    textAlign: 'center',
  },
  curioDesc: {
    color: '#94A3B8',
    fontSize: 9,
    textAlign: 'center',
    marginVertical: 6,
    minHeight: 28,
  },
  purgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  purgeCardDisabled: {
    opacity: 0.5,
  },
  purgeEmoji: {
    fontSize: 26,
    marginRight: 12,
  },
  purgeTextCol: {
    flex: 1,
  },
  purgeTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  purgeDesc: {
    color: '#94A3B8',
    fontSize: 9.5,
    marginTop: 2,
  },
  purgePrice: {
    backgroundColor: '#070A13',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  purgePriceText: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: '800',
  },
  leaveBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
    elevation: 4,
  },
  leaveText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '900',
  },
  modalSub: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 12,
  },
  purgeCardsScroll: {
    paddingVertical: 8,
    gap: 8,
  },
  purgeItem: {
    alignItems: 'center',
  },
  confirmPurgeBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  confirmPurgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  closeModalBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 12,
  },
  closeModalText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
  },
});
