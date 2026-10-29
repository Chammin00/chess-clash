import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { CardView } from '../components/CardView';
import { CARD_COLLECTION, getCardById, getCardsByFaction } from '../config/cards';
import { Card, CombatRow, FactionId } from '../types/card';
import { FACTION_CONFIGS } from '../config/factions';
import { SoundService } from '../services/soundService';

interface Props {
  currentFaction: FactionId;
  currentDeckIds: string[];
  onSaveDeck: (newDeckIds: string[]) => void;
  onBack: () => void;
}

export const DeckBuilderScreen: React.FC<Props> = ({
  currentFaction,
  currentDeckIds,
  onSaveDeck,
  onBack,
}) => {
  const [deckIds, setDeckIds] = useState<string[]>([...currentDeckIds]);
  const [filterRow, setFilterRow] = useState<'all' | 'melee' | 'ranged' | 'siege' | 'special'>('all');

  const factionConfig = FACTION_CONFIGS[currentFaction as Exclude<FactionId, 'neutral'>];
  const deckCards = deckIds.map(id => getCardById(id)).filter((c): c is Card => !!c);

  // Total Deck Strength calculation
  const totalDeckPower = deckCards.reduce((acc, c) => acc + c.power, 0);
  const totalUnitCount = deckCards.filter(c => c.type === 'unit').length;
  const totalSpecialCount = deckCards.filter(c => c.type === 'special' || c.type === 'weather').length;

  const factionCards = getCardsByFaction(currentFaction);
  const filteredAvailable = factionCards.filter(card => {
    if (filterRow === 'all') return true;
    if (filterRow === 'special') return card.type === 'special' || card.type === 'weather';
    return card.row === filterRow || card.row === 'agile';
  });

  const handleRemoveFromDeck = (index: number) => {
    if (deckIds.length <= 10) {
      Alert.alert('Minimum Deck Size', 'Your battle deck must contain at least 10 cards.');
      return;
    }
    SoundService.playButtonClick();
    const updated = [...deckIds];
    updated.splice(index, 1);
    setDeckIds(updated);
  };

  const handleAddToDeck = (cardId: string) => {
    if (deckIds.length >= 25) {
      Alert.alert('Deck Limit', 'Maximum deck size is 25 cards.');
      return;
    }
    const count = deckIds.filter(id => id === cardId).length;
    if (count >= 3) {
      Alert.alert('Card Limit', 'Maximum 3 copies of any non-special card permitted.');
      return;
    }
    SoundService.playCardDrop();
    setDeckIds(prev => [...prev, cardId]);
  };

  const handleSave = () => {
    onSaveDeck(deckIds);
    Alert.alert('Clan Deck Saved', `Your ${factionConfig.name} deck has been updated!`);
    onBack();
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: factionConfig.accentColor }]}>
            {factionConfig.emblem} {factionConfig.name} Deck
          </Text>
          <Text style={styles.headerStats}>
            {deckIds.length} Cards • ⚔️ {totalDeckPower} Power • 🛡️ {totalUnitCount} Units • ⚡ {totalSpecialCount} Specials
          </Text>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Active Deck Tray */}
      <View style={styles.deckSection}>
        <Text style={styles.sectionTitle}>
          ACTIVE DECK CARDS (Tap card to remove):
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.deckScroll}
        >
          {deckCards.map((card, idx) => (
            <CardView
              key={`${card.id}_${idx}`}
              card={card}
              onPress={() => handleRemoveFromDeck(idx)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Filter Row Tabs */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterTab, filterRow === 'all' && styles.filterTabActive]}
          onPress={() => setFilterRow('all')}
        >
          <Text style={[styles.filterText, filterRow === 'all' && styles.filterTextActive]}>ALL</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filterRow === 'melee' && styles.filterTabActive]}
          onPress={() => setFilterRow('melee')}
        >
          <Text style={[styles.filterText, filterRow === 'melee' && styles.filterTextActive]}>⚔️ MELEE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filterRow === 'ranged' && styles.filterTabActive]}
          onPress={() => setFilterRow('ranged')}
        >
          <Text style={[styles.filterText, filterRow === 'ranged' && styles.filterTextActive]}>🏹 RANGED</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filterRow === 'siege' && styles.filterTabActive]}
          onPress={() => setFilterRow('siege')}
        >
          <Text style={[styles.filterText, filterRow === 'siege' && styles.filterTextActive]}>🏯 SIEGE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filterRow === 'special' && styles.filterTabActive]}
          onPress={() => setFilterRow('special')}
        >
          <Text style={[styles.filterText, filterRow === 'special' && styles.filterTextActive]}>⚡ SPECIAL</Text>
        </TouchableOpacity>
      </View>

      {/* Available Faction Collection */}
      <View style={styles.collectionSection}>
        <Text style={styles.sectionTitle}>
          FACTION VAULT (Tap card to add to deck):
        </Text>
        <ScrollView
          contentContainerStyle={styles.collectionGrid}
          showsVerticalScrollIndicator={false}
        >
          {filteredAvailable.map(card => {
            const countInDeck = deckIds.filter(id => id === card.id).length;
            return (
              <View key={card.id} style={styles.vaultCardWrapper}>
                <CardView
                  card={card}
                  onPress={() => handleAddToDeck(card.id)}
                />
                {countInDeck > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{countInDeck} in deck</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0C0A09',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#44403C',
    backgroundColor: '#1C1917',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#292524',
    borderRadius: 6,
  },
  backButtonText: {
    color: '#D6D3D1',
    fontSize: 12,
    fontWeight: '800',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  headerStats: {
    color: '#A8A29E',
    fontSize: 10,
    marginTop: 2,
  },
  saveButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#059669',
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  deckSection: {
    height: 200,
    backgroundColor: '#141210',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#292524',
  },
  sectionTitle: {
    color: '#A8A29E',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 14,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  deckScroll: {
    paddingHorizontal: 12,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: '#1C1917',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#44403C',
  },
  filterTab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    backgroundColor: '#27272A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterTabActive: {
    backgroundColor: '#D97706',
  },
  filterText: {
    color: '#A8A29E',
    fontSize: 10,
    fontWeight: '800',
  },
  filterTextActive: {
    color: '#FFF',
  },
  collectionSection: {
    flex: 1,
    paddingTop: 8,
  },
  collectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  vaultCardWrapper: {
    alignItems: 'center',
    marginBottom: 14,
  },
  countBadge: {
    backgroundColor: '#382F2D',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#78716C',
  },
  countBadgeText: {
    color: '#FEF08A',
    fontSize: 9,
    fontWeight: '800',
  },
});
