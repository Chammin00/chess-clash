import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { SpireCard } from '../types/spire';
import { SpireCardView } from '../components/SpireCardView';

interface Props {
  visible: boolean;
  deck: SpireCard[];
  onClose: () => void;
}

export const SpireDeckViewModal: React.FC<Props> = ({ visible, deck, onClose }) => {
  const attacks = deck.filter(c => c.type === 'attack');
  const skills = deck.filter(c => c.type === 'skill');
  const powers = deck.filter(c => c.type === 'power');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>ACTIVE SPIRE DECK ({deck.length} CARDS)</Text>
              <Text style={styles.breakdown}>
                {attacks.length} Attacks • {skills.length} Skills • {powers.length} Powers
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Cards Grid */}
          <ScrollView contentContainerStyle={styles.cardsGrid} showsVerticalScrollIndicator={false}>
            {deck.map((card, idx) => (
              <View key={card.id + '_' + idx} style={styles.cardWrapper}>
                <SpireCardView card={card} />
              </View>
            ))}
          </ScrollView>

          {/* Done CTA */}
          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <Text style={styles.doneText}>CLOSE DECK ➔</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#38BDF8',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  breakdown: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: '900',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  cardWrapper: {
    marginVertical: 4,
  },
  doneBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  doneText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
