import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { GwentCard } from '../types/gwent';
import { GameStudioEngine } from '../services/gameStudioEngine';

interface Props {
  card: GwentCard | null;
  visible: boolean;
  onClose: () => void;
}

export const GwentCardInspectModal: React.FC<Props> = ({ card, visible, onClose }) => {
  if (!card) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTag}>
                {card.isHero ? '👑 LEGENDARY HERO CARD' : 'TACTICAL CCG UNIT'}
              </Text>
              <Text style={styles.cardMainTitle}>{card.name}</Text>
              <Text style={styles.cardSubTitle}>{card.title}</Text>
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

          {/* Body Content */}
          <ScrollView contentContainerStyle={styles.scrollBody}>
            <View style={styles.artFrameContainer}>
              {Platform.OS === 'web' && (
                <Image
                  source={{ uri: card.artUrl }}
                  style={styles.largeArtImage}
                  resizeMode="cover"
                />
              )}
              {card.isHero && <View style={styles.heroGoldenBorder} />}

              {/* Power Banner */}
              {card.row !== 'special' && card.row !== 'weather' && (
                <View style={[styles.largePowerBadge, card.isHero && styles.heroPowerBadge]}>
                  <Text style={[styles.largePowerText, card.isHero && styles.heroPowerText]}>
                    {card.currentPower !== undefined ? card.currentPower : card.power}
                  </Text>
                  <Text style={styles.powerLabel}>STR</Text>
                </View>
              )}

              {/* Combat Row Tag */}
              <View style={styles.rowTagBadge}>
                <Text style={styles.rowTagText}>
                  {card.row.toUpperCase()} ROW
                </Text>
              </View>
            </View>

            {/* Quote Plate */}
            {card.quote && (
              <View style={styles.quoteBox}>
                <Text style={styles.quoteText}>“{card.quote}”</Text>
              </View>
            )}

            {/* Character Model Foundation */}
            {card.characterFoundation && (
              <View style={styles.foundationBox}>
                <Text style={styles.foundationLabel}>NINJA GAIDEN FOUNDATION ARCHETYPE:</Text>
                <Text style={styles.foundationValue}>{card.characterFoundation}</Text>
              </View>
            )}

            {/* Ability Breakdown */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionHeader}>TACTICAL ABILITY</Text>
              <Text style={styles.abilityTitle}>
                {card.ability.toUpperCase().replace('_', ' ')}
              </Text>
              <Text style={styles.loreText}>{card.flavorLore}</Text>
            </View>

            {/* Combat Specs */}
            <View style={styles.statGrid}>
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>BASE POWER</Text>
                <Text style={styles.statCellVal}>{card.power}</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>FACTION</Text>
                <Text style={styles.statCellVal}>
                  {card.faction.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statCellLabel}>HERO STATUS</Text>
                <Text style={[styles.statCellVal, card.isHero && { color: '#F59E0B' }]}>
                  {card.isHero ? 'IMMUNE (GOLD)' : 'STANDARD UNIT'}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footerBar}>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => {
                GameStudioEngine.playSfx('button_click');
                onClose();
              }}
            >
              <Text style={styles.doneBtnText}>CLOSE INSPECTION</Text>
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
    backgroundColor: '#000000B3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    backgroundColor: '#181411',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#785A3C',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#27201C',
    padding: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#453528',
  },
  headerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardMainTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F5E6D3',
  },
  cardSubTitle: {
    fontSize: 12,
    color: '#A89F91',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B3028',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#5A4638',
  },
  closeBtnText: {
    color: '#E4E4E7',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollBody: {
    padding: 16,
    alignItems: 'center',
  },
  artFrameContainer: {
    width: 220,
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#544133',
    position: 'relative',
    backgroundColor: '#0F0E0C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  largeArtImage: {
    width: '100%',
    height: '100%',
  },
  heroGoldenBorder: {
    ...StyleSheet.absoluteFill,
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: 6,
  },
  largePowerBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F172AE6',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPowerBadge: {
    backgroundColor: '#78350FE6',
    borderColor: '#FDE68A',
  },
  largePowerText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F8FAFC',
    lineHeight: 22,
  },
  heroPowerText: {
    color: '#FEF08A',
  },
  powerLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
  },
  rowTagBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#000000CC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#52525B',
  },
  rowTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
  quoteBox: {
    width: '100%',
    marginVertical: 12,
    padding: 10,
    backgroundColor: '#241E19',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  quoteText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#E2D9CC',
    lineHeight: 18,
    textAlign: 'center',
  },
  foundationBox: {
    width: '100%',
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#1E1924',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#7E22CE',
  },
  foundationLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#C084FC',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  foundationValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F3E8FF',
  },
  sectionBox: {
    width: '100%',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#201A15',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#423326',
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9E8D7B',
    letterSpacing: 1,
    marginBottom: 4,
  },
  abilityTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FCD34D',
    marginBottom: 6,
  },
  loreText: {
    fontSize: 12,
    color: '#D4C8B8',
    lineHeight: 18,
  },
  statGrid: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  statCell: {
    flex: 1,
    backgroundColor: '#201A15',
    padding: 8,
    marginHorizontal: 3,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#382D23',
  },
  statCellLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#8A7A6B',
    marginBottom: 2,
  },
  statCellVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#E4E4E7',
    textAlign: 'center',
  },
  footerBar: {
    padding: 12,
    backgroundColor: '#201A15',
    borderTopWidth: 1,
    borderTopColor: '#382D23',
  },
  doneBtn: {
    backgroundColor: '#78350F',
    borderWidth: 1.5,
    borderColor: '#D97706',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#FEF3C7',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
