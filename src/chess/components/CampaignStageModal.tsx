import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { CampaignStage } from '../campaign/types';
import { CAMPAIGN_ITEMS } from '../campaign/campaignData';

interface CampaignStageModalProps {
  stage: CampaignStage | null;
  starsEarned: number;
  onStartStage: (stage: CampaignStage) => void;
  onClose: () => void;
}

export const CampaignStageModal: React.FC<CampaignStageModalProps> = ({
  stage,
  starsEarned,
  onStartStage,
  onClose,
}) => {
  if (!stage) return null;

  return (
    <Modal visible={stage !== null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.stageNumberLabel}>
                STAGE {stage.stageNumber} • {stage.type.toUpperCase()}
              </Text>
              <Text style={styles.stageTitle}>{stage.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Lore */}
          <Text style={styles.loreText}>{stage.lore}</Text>

          {/* Opponent Card */}
          <View style={styles.opponentCard}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarEmoji}>{stage.opponent.avatar}</Text>
            </View>
            <View style={styles.opponentInfo}>
              <View style={styles.opponentNameRow}>
                <Text style={styles.opponentName}>{stage.opponent.name}</Text>
                <View style={styles.engineBadge}>
                  <Text style={styles.engineBadgeText}>
                    {stage.opponent.engine.toUpperCase()} AI
                  </Text>
                </View>
              </View>
              <Text style={styles.opponentSub}>
                MMR {stage.opponent.mmr} • Style: {stage.opponent.playstyle}
              </Text>
              <Text style={styles.opponentQuote}>"{stage.opponent.quote}"</Text>
            </View>
          </View>

          {/* 3 Star Challenges */}
          <Text style={styles.sectionHeader}>STAR CHALLENGES</Text>
          <View style={styles.starConditionsBox}>
            {stage.starConditions.map((cond, idx) => {
              const isAchieved = idx < starsEarned;
              return (
                <View key={cond.id} style={styles.starRow}>
                  <Text style={[styles.starIcon, { opacity: isAchieved ? 1 : 0.3 }]}>⭐</Text>
                  <Text style={[styles.starDesc, isAchieved && styles.starDescAchieved]}>
                    {cond.description}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Rewards */}
          <View style={styles.rewardsRow}>
            <View style={styles.rewardPill}>
              <Text style={styles.rewardText}>🪙 +{stage.rewards.gold} Gold</Text>
            </View>
            {stage.rewards.items?.map((item) => (
              <View key={item.itemId} style={styles.rewardPill}>
                <Text style={styles.rewardText}>
                  {CAMPAIGN_ITEMS[item.itemId].icon} +{item.count}{' '}
                  {CAMPAIGN_ITEMS[item.itemId].name.split(' ')[0]}
                </Text>
              </View>
            ))}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => {
              onClose();
              onStartStage(stage);
            }}
          >
            <Text style={styles.startBtnText}>⚔️ COMMENCE STAGE BATTLE</Text>
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
    borderWidth: 1.5,
    borderColor: '#475569',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stageNumberLabel: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  stageTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: '800',
  },
  loreText: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 14,
  },
  opponentCard: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 26,
  },
  opponentInfo: {
    flex: 1,
  },
  opponentNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opponentName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  engineBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  engineBadgeText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '800',
  },
  opponentSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  opponentQuote: {
    color: '#CBD5E1',
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 2,
  },
  sectionHeader: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  starConditionsBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    gap: 6,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starIcon: {
    fontSize: 14,
  },
  starDesc: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  starDescAchieved: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  rewardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  rewardPill: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  rewardText: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '700',
  },
  startBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
