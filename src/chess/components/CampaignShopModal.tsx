import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { CAMPAIGN_ITEMS } from '../campaign/campaignData';
import { CampaignProgress, PowerupItemId } from '../campaign/types';
import { CampaignService } from '../campaign/campaignService';
import { ChessAudio } from '../services/chessAudioService';

interface CampaignShopModalProps {
  visible: boolean;
  progress: CampaignProgress;
  onUpdateProgress: (progress: CampaignProgress) => void;
  onClose: () => void;
}

export const CampaignShopModal: React.FC<CampaignShopModalProps> = ({
  visible,
  progress,
  onUpdateProgress,
  onClose,
}) => {
  const items = Object.values(CAMPAIGN_ITEMS);

  const handleBuy = async (itemId: PowerupItemId) => {
    const item = CAMPAIGN_ITEMS[itemId];
    if (progress.coins < item.cost) {
      Alert.alert('Insufficient Gold', `You need ${item.cost} Gold to purchase ${item.name}. Clear more stages to earn coins!`);
      return;
    }

    const res = await CampaignService.buyItem(itemId);
    if (res.success) {
      ChessAudio.playCoin();
      onUpdateProgress(res.progress);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>TRAVELING MERCHANT</Text>
              <Text style={styles.sub}>Stock up on tactical rewinds & artifacts</Text>
            </View>
            <View style={styles.coinsBadge}>
              <Text style={styles.coinsText}>🪙 {progress.coins} Gold</Text>
            </View>
          </View>

          {/* Item Catalog */}
          <ScrollView style={styles.itemList} showsVerticalScrollIndicator={false}>
            {items.map((item) => {
              const currentCount = progress.inventory[item.id] || 0;
              const canAfford = progress.coins >= item.cost;

              return (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={styles.itemIcon}>{item.icon}</Text>
                  <View style={styles.itemDetails}>
                    <View style={styles.nameRow}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.ownedText}>Owned: x{currentCount}</Text>
                    </View>
                    <Text style={styles.itemDesc}>{item.description}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.buyBtn, !canAfford && styles.buyBtnDisabled]}
                    disabled={!canAfford}
                    onPress={() => handleBuy(item.id)}
                  >
                    <Text style={styles.buyBtnText}>🪙 {item.cost}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Return to World Map</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    width: '94%',
    maxHeight: '85%',
    borderWidth: 1.5,
    borderColor: '#475569',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  title: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  coinsBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  coinsText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '800',
  },
  itemList: {
    marginVertical: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  itemIcon: {
    fontSize: 30,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  itemName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  ownedText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
  itemDesc: {
    color: '#94A3B8',
    fontSize: 10,
    lineHeight: 14,
  },
  buyBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  buyBtnDisabled: {
    backgroundColor: '#334155',
    opacity: 0.6,
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  closeBtn: {
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
