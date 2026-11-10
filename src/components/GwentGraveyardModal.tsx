import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { GwentCard, GwentRow } from '../types/gwent';
import { GwentCardView } from './GwentCardView';
import { GameStudioEngine } from '../services/gameStudioEngine';

interface Props {
  visible: boolean;
  cards: GwentCard[];
  title: string;
  isMedicSelection?: boolean;
  onSelectCard?: (cardId: string, chosenRow?: GwentRow) => void;
  onClose: () => void;
}

export const GwentGraveyardModal: React.FC<Props> = ({
  visible,
  cards,
  title,
  isMedicSelection = false,
  onSelectCard,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.headerBar}>
            <View>
              <Text style={styles.headerTag}>
                {isMedicSelection ? '🌿 MEDIC REVIVAL RITUAL' : '⚰️ CRYPT & GRAVEYARD'}
              </Text>
              <Text style={styles.titleText}>{title}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                GameStudioEngine.playSfx('button_click');
                onClose();
              }}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subText}>
            {isMedicSelection
              ? 'Tap a non-hero unit card below to immediately resurrect them onto the active battle lines:'
              : `${cards.length} card(s) resting in the graveyard:`}
          </Text>

          <ScrollView contentContainerStyle={styles.cardGrid}>
            {cards.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>The crypt is currently empty.</Text>
              </View>
            ) : (
              cards.map((card) => {
                const isSelectable =
                  isMedicSelection && !card.isHero && card.row !== 'special' && card.row !== 'weather';

                return (
                  <View key={card.id} style={styles.cardWrapper}>
                    <GwentCardView
                      card={card}
                      size="normal"
                      disabled={isMedicSelection && !isSelectable}
                      onPress={() => {
                        if (isSelectable && onSelectCard) {
                          GameStudioEngine.playSfx('power_surge');
                          onSelectCard(card.id, card.row === 'agile' ? 'melee' : undefined);
                        }
                      }}
                    />
                    {isMedicSelection && isSelectable && (
                      <TouchableOpacity
                        style={styles.revivePill}
                        onPress={() => {
                          GameStudioEngine.playSfx('power_surge');
                          onSelectCard?.(card.id, card.row === 'agile' ? 'melee' : undefined);
                        }}
                      >
                        <Text style={styles.revivePillText}>REVIVE</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>

          <View style={styles.footerBar}>
            <TouchableOpacity
              style={styles.dismissBtn}
              onPress={() => {
                GameStudioEngine.playSfx('button_click');
                onClose();
              }}
            >
              <Text style={styles.dismissBtnText}>
                {isMedicSelection ? 'SKIP REVIVAL' : 'CLOSE'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#000000BF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '85%',
    backgroundColor: '#181411',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#785A3C',
    overflow: 'hidden',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#27201C',
    padding: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#453528',
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EC4899',
    letterSpacing: 1,
    marginBottom: 2,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F5E6D3',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B3028',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#E4E4E7',
    fontSize: 14,
    fontWeight: '700',
  },
  subText: {
    fontSize: 12,
    color: '#A89F91',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 14,
    justifyContent: 'center',
  },
  cardWrapper: {
    alignItems: 'center',
    margin: 6,
  },
  revivePill: {
    marginTop: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
  },
  revivePillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#71717A',
    fontSize: 14,
    fontStyle: 'italic',
  },
  footerBar: {
    padding: 12,
    backgroundColor: '#201A15',
    borderTopWidth: 1,
    borderTopColor: '#382D23',
  },
  dismissBtn: {
    backgroundColor: '#3B3028',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  dismissBtnText: {
    color: '#D4C8B8',
    fontSize: 12,
    fontWeight: '800',
  },
});
