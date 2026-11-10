import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { CardView } from '../components/CardView';
import { CARD_COLLECTION, getCardById } from '../config/cards';
import { Card } from '../types/card';
import { SoundService } from '../services/soundService';

interface Props {
  currentDeckIds: string[];
  onSaveDeck: (newDeckIds: string[]) => void;
  onBack: () => void;
}

export const DeckBuilderScreen: React.FC<Props> = ({
  currentDeckIds,
  onSaveDeck,
  onBack,
}) => {
  const [deckIds, setDeckIds] = useState<string[]>([...currentDeckIds]);
  const [filterType, setFilterType] = useState<'all' | 'unit' | 'spell'>('all');

  const deckCards = deckIds.map(id => getCardById(id)).filter((c): c is Card => !!c);

  const availableCards = CARD_COLLECTION.filter(card => {
    if (filterType !== 'all' && card.type !== filterType) return false;
    return true;
  });

  const handleRemoveFromDeck = (index: number) => {
    if (deckIds.length <= 10) {
      Alert.alert('Deck Minimum', 'Your deck must contain at least 10 cards.');
      return;
    }
    SoundService.playButtonClick();
    const updated = [...deckIds];
    updated.splice(index, 1);
    setDeckIds(updated);
  };

  const handleAddToDeck = (cardId: string) => {
    if (deckIds.length >= 15) {
      Alert.alert('Deck Limit', 'Maximum deck size is 15 cards.');
      return;
    }
    const count = deckIds.filter(id => id === cardId).length;
    if (count >= 2) {
      Alert.alert('Duplicate Limit', 'You can only have up to 2 copies of the same card in your deck.');
      return;
    }
    SoundService.playCardDrop();
    setDeckIds(prev => [...prev, cardId]);
  };

  const handleSave = () => {
    onSaveDeck(deckIds);
    Alert.alert('Deck Saved', 'Your battle deck has been updated!');
    onBack();
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>‹ BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>DECK BUILDER ({deckIds.length}/15)</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>SAVE</Text>
        </TouchableOpacity>
      </View>

      {/* Active Deck Strip */}
      <View style={styles.deckSection}>
        <Text style={styles.sectionHeader}>ACTIVE BATTLE DECK (Tap card to remove)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deckScroll}>
          {deckCards.map((card, idx) => (
            <CardView
              key={'deck_' + idx}
              card={card}
              compact
              onPress={() => handleRemoveFromDeck(idx)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'unit', 'spell'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filterType === tab && styles.filterTabActive]}
            onPress={() => setFilterType(tab)}
          >
            <Text style={[styles.filterTabText, filterType === tab && styles.filterTabTextActive]}>
              {tab.toUpperCase()}S
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Collection Catalog */}
      <Text style={styles.collectionHeader}>CARD COLLECTION (Tap to add to deck)</Text>
      <ScrollView contentContainerStyle={styles.catalogGrid} showsVerticalScrollIndicator={false}>
        {availableCards.map(card => {
          const inDeckCount = deckIds.filter(id => id === card.id).length;
          return (
            <View key={card.id} style={styles.cardWrapper}>
              <CardView card={card} onPress={() => handleAddToDeck(card.id)} />
              <View style={styles.inDeckBadge}>
                <Text style={styles.inDeckText}>{inDeckCount}/2 in deck</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: 8,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backBtn: {
    padding: 6,
  },
  backText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '900',
  },
  saveBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  deckSection: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  sectionHeader: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  deckScroll: {
    paddingHorizontal: 12,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterTabActive: {
    backgroundColor: '#2563EB',
    borderColor: '#60A5FA',
  },
  filterTabText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  filterTabTextActive: {
    color: '#FFF',
  },
  collectionHeader: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  catalogGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 24,
    gap: 8,
  },
  cardWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  inDeckBadge: {
    backgroundColor: '#1E293B',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inDeckText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
  },
});
