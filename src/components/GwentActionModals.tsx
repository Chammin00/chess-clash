import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from '../types/card';
import { CardView } from './CardView';

interface MulliganModalProps {
  visible: boolean;
  hand: Card[];
  redrawsLeft: number;
  onRedrawCard: (index: number) => void;
  onConfirmHand: () => void;
}

export const MulliganModal: React.FC<MulliganModalProps> = ({
  visible,
  hand,
  redrawsLeft,
  onRedrawCard,
  onConfirmHand,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>🎴 OPENING MULLIGAN</Text>
          <Text style={styles.modalSubtitle}>
            Redraws remaining: <Text style={styles.goldHighlight}>{redrawsLeft}</Text>
          </Text>
          <Text style={styles.instructionText}>
            Tap any card you wish to return to your deck in exchange for a new draw.
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mulliganScroll}
          >
            {hand.map((card, idx) => (
              <View key={`${card.id}_${idx}`} style={styles.mulliganCardWrapper}>
                <CardView
                  card={card}
                  onPress={() => redrawsLeft > 0 && onRedrawCard(idx)}
                />
                {redrawsLeft > 0 && (
                  <TouchableOpacity
                    style={styles.redrawButton}
                    onPress={() => onRedrawCard(idx)}
                  >
                    <Text style={styles.redrawButtonText}>Swap 🔄</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={onConfirmHand}
          >
            <Text style={styles.confirmButtonText}>KEEP HAND & COMMENCE DUEL ⚔️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

interface MedicReviveModalProps {
  visible: boolean;
  graveyard: Card[];
  onSelectRevive: (card: Card) => void;
  onCancel: () => void;
}

export const MedicReviveModal: React.FC<MedicReviveModalProps> = ({
  visible,
  graveyard,
  onSelectRevive,
  onCancel,
}) => {
  const eligibleUnits = graveyard.filter(c => c.type === 'unit' && !c.isHero);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>💉 MEDIC RESURRECTION</Text>
          <Text style={styles.modalSubtitle}>
            Select 1 non-hero unit from your Graveyard to revive immediately onto the battlefield.
          </Text>

          {eligibleUnits.length === 0 ? (
            <View style={styles.emptyGraveyard}>
              <Text style={styles.emptyGraveyardText}>No eligible units in Graveyard.</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mulliganScroll}
            >
              {eligibleUnits.map((card, idx) => (
                <View key={`${card.id}_${idx}`} style={styles.mulliganCardWrapper}>
                  <CardView
                    card={card}
                    onPress={() => onSelectRevive(card)}
                  />
                  <TouchableOpacity
                    style={styles.reviveButton}
                    onPress={() => onSelectRevive(card)}
                  >
                    <Text style={styles.reviveButtonText}>Resurrect ⚡</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#18181B',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    width: '100%',
    maxHeight: '85%',
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTitle: {
    color: '#F59E0B',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#D6D3D1',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  goldHighlight: {
    color: '#FBBF24',
    fontSize: 15,
    fontWeight: '900',
  },
  instructionText: {
    color: '#A8A29E',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 12,
  },
  mulliganScroll: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  mulliganCardWrapper: {
    alignItems: 'center',
    marginRight: 8,
  },
  redrawButton: {
    backgroundColor: '#27272A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  redrawButtonText: {
    color: '#F9FAFB',
    fontSize: 10,
    fontWeight: '800',
  },
  confirmButton: {
    backgroundColor: '#991B1B',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  confirmButtonText: {
    color: '#FEF2F2',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  emptyGraveyard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyGraveyardText: {
    color: '#78716C',
    fontSize: 13,
    fontStyle: 'italic',
  },
  reviveButton: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  reviveButtonText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    color: '#A8A29E',
    fontSize: 12,
    fontWeight: '700',
  },
});
