import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { PlayerProfile } from '../types/mmr';
import { BattlePassState } from '../types/monetization';
import { BATTLE_PASS_TIERS, BATTLE_PASS_SEASON } from '../config/monetization';
import { BattlePassService } from '../services/battlePassService';

interface Props {
  profile: PlayerProfile;
  battlePassState: BattlePassState;
  onProfileUpdate: (updated: PlayerProfile) => void;
  onPassStateUpdate: (updated: BattlePassState) => void;
  onBack: () => void;
}

export const BattlePassScreen: React.FC<Props> = ({
  profile,
  battlePassState,
  onProfileUpdate,
  onPassStateUpdate,
  onBack,
}) => {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentTierConfig =
    BATTLE_PASS_TIERS.find((t) => t.tier === battlePassState.currentTier) || BATTLE_PASS_TIERS[0];
  const nextTierXp = currentTierConfig ? currentTierConfig.xpRequired : 300;
  const currentTierXp = battlePassState.currentXp % BATTLE_PASS_SEASON.xpPerTier;
  const progressPct = Math.min(100, Math.round((currentTierXp / BATTLE_PASS_SEASON.xpPerTier) * 100));

  const handleClaim = async (tier: number, track: 'free' | 'premium') => {
    setIsProcessing(true);
    const res = await BattlePassService.claimTierReward(tier, track, profile);
    setIsProcessing(false);

    if (res.success) {
      onProfileUpdate(res.updatedProfile);
      onPassStateUpdate(res.state);
      Alert.alert('Reward Claimed! 🎉', 'Your inventory has been updated.');
    } else {
      Alert.alert('Cannot Claim', res.error || 'Reward not available yet.');
    }
  };

  const handleUnlockPremium = async (isBundle: boolean) => {
    setIsProcessing(true);
    const res = await BattlePassService.unlockPremium(profile, isBundle);
    setIsProcessing(false);

    if (res.success) {
      onProfileUpdate(res.updatedProfile);
      onPassStateUpdate(res.state);
      setShowUnlockModal(false);
      Alert.alert(
        'Premium Unlocked! 👑',
        isBundle
          ? 'Unlocked Premium Track + 10 Bonus Levels & Mythic Card Back!'
          : 'Unlocked all Premium Track rewards!'
      );
    } else {
      Alert.alert('Gems Required', res.error || 'Not enough gems to unlock.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>‹ BACK</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>ASCENDANT BATTLE PASS</Text>
        <View style={styles.currencyPill}>
          <Text style={styles.curIcon}>💎</Text>
          <Text style={styles.curAmount}>{profile.gems}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Season Banner Header */}
        <View style={styles.seasonBanner}>
          <View style={styles.seasonTag}>
            <Text style={styles.seasonTagText}>SEASON 1</Text>
          </View>
          <Text style={styles.seasonTitle}>{BATTLE_PASS_SEASON.seasonName}</Text>
          <Text style={styles.seasonSubtitle}>
            Climb the Spire & win PvP Duels to earn XP and claim 50+ exclusive rewards!
          </Text>

          {/* XP Progress Bar */}
          <View style={styles.xpCard}>
            <View style={styles.xpHeaderRow}>
              <Text style={styles.tierBadge}>LEVEL {battlePassState.currentTier}</Text>
              <Text style={styles.xpText}>
                {currentTierXp} / {BATTLE_PASS_SEASON.xpPerTier} XP
              </Text>
            </View>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${progressPct}%` }]} />
            </View>
          </View>

          {/* Premium Status / CTA */}
          {battlePassState.isPremiumUnlocked ? (
            <View style={styles.premiumActivePill}>
              <Text style={styles.premiumActiveText}>👑 PREMIUM PASS ACTIVE</Text>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.unlockPremiumBtn}
              onPress={() => setShowUnlockModal(true)}
            >
              <Text style={styles.unlockPremiumBtnText}>
                👑 UNLOCK PREMIUM PASS ({BATTLE_PASS_SEASON.premiumPriceGems} 💎 / {BATTLE_PASS_SEASON.premiumPriceUsd})
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Rewards Ladder */}
        <Text style={styles.ladderTitle}>TIER PROGRESSION</Text>

        {BATTLE_PASS_TIERS.map((tier) => {
          const isUnlocked = battlePassState.currentTier >= tier.tier;
          const isFreeClaimed = battlePassState.claimedFreeTiers.includes(tier.tier);
          const isPremClaimed = battlePassState.claimedPremiumTiers.includes(tier.tier);

          return (
            <View
              key={tier.tier}
              style={[
                styles.tierRow,
                isUnlocked && styles.tierRowUnlocked,
              ]}
            >
              {/* Tier Number Pill */}
              <View style={styles.tierNumCol}>
                <View
                  style={[
                    styles.tierCircle,
                    isUnlocked && styles.tierCircleActive,
                  ]}
                >
                  <Text style={styles.tierNumberText}>{tier.tier}</Text>
                </View>
              </View>

              {/* Free Track Reward */}
              <View style={styles.trackCard}>
                <Text style={styles.trackLabel}>FREE</Text>
                <Text style={styles.rewardIcon}>{tier.freeReward.icon}</Text>
                <Text style={styles.rewardName} numberOfLines={1}>
                  {tier.freeReward.label}
                </Text>
                {isFreeClaimed ? (
                  <View style={styles.claimedPill}>
                    <Text style={styles.claimedText}>✓ CLAIMED</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    disabled={!isUnlocked || isProcessing}
                    style={[
                      styles.claimBtn,
                      !isUnlocked && styles.claimBtnDisabled,
                    ]}
                    onPress={() => handleClaim(tier.tier, 'free')}
                  >
                    <Text style={styles.claimBtnText}>
                      {isUnlocked ? 'CLAIM' : 'LOCKED'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Premium Track Reward */}
              <View
                style={[
                  styles.trackCard,
                  styles.premiumTrackCard,
                  battlePassState.isPremiumUnlocked && styles.premiumTrackCardActive,
                ]}
              >
                <Text style={styles.trackLabelPremium}>👑 VIP</Text>
                <Text style={styles.rewardIcon}>{tier.premiumReward.icon}</Text>
                <Text style={styles.rewardName} numberOfLines={1}>
                  {tier.premiumReward.label}
                </Text>
                {isPremClaimed ? (
                  <View style={styles.claimedPill}>
                    <Text style={styles.claimedText}>✓ CLAIMED</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    disabled={
                      !isUnlocked || !battlePassState.isPremiumUnlocked || isProcessing
                    }
                    style={[
                      styles.claimBtnPremium,
                      (!isUnlocked || !battlePassState.isPremiumUnlocked) &&
                        styles.claimBtnDisabled,
                    ]}
                    onPress={() => handleClaim(tier.tier, 'premium')}
                  >
                    <Text style={styles.claimBtnText}>
                      {!battlePassState.isPremiumUnlocked
                        ? 'LOCKED 👑'
                        : isUnlocked
                        ? 'CLAIM'
                        : 'LOCKED'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Unlock Premium Modal */}
      <Modal visible={showUnlockModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>👑 UNLOCK PREMIUM PASS</Text>
            <Text style={styles.modalDesc}>
              Unlock all 10 Premium VIP tiers, legendary skins, rare relics, and 1,000+ bonus gems!
            </Text>

            {/* Standard Pass */}
            <TouchableOpacity
              style={styles.modalOptionCard}
              onPress={() => handleUnlockPremium(false)}
            >
              <View style={styles.modalOptionHeader}>
                <Text style={styles.modalOptionTitle}>Standard Pass</Text>
                <Text style={styles.modalPrice}>
                  {BATTLE_PASS_SEASON.premiumPriceGems} 💎 / {BATTLE_PASS_SEASON.premiumPriceUsd}
                </Text>
              </View>
              <Text style={styles.modalOptionSub}>
                Unlocks the VIP track and all tier rewards immediately.
              </Text>
            </TouchableOpacity>

            {/* Pass Bundle */}
            <TouchableOpacity
              style={[styles.modalOptionCard, styles.bundleCard]}
              onPress={() => handleUnlockPremium(true)}
            >
              <View style={styles.bundleTag}>
                <Text style={styles.bundleTagText}>BEST VALUE - 10 TIERS INSTANT</Text>
              </View>
              <View style={styles.modalOptionHeader}>
                <Text style={styles.modalOptionTitle}>Ascendant Bundle</Text>
                <Text style={styles.modalPrice}>
                  {BATTLE_PASS_SEASON.bundlePriceGems} 💎 / {BATTLE_PASS_SEASON.bundlePriceUsd}
                </Text>
              </View>
              <Text style={styles.modalOptionSub}>
                Includes Standard Pass + 10 Instant Tiers + Mythic Avatar Border!
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setShowUnlockModal(false)}
            >
              <Text style={styles.closeModalText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  screenTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  currencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  curIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  curAmount: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  seasonBanner: {
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#6366F1',
    alignItems: 'center',
  },
  seasonTag: {
    backgroundColor: '#6366F1',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 8,
  },
  seasonTagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  seasonTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  seasonSubtitle: {
    color: '#C7D2FE',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 16,
  },
  xpCard: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  xpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tierBadge: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '900',
  },
  xpText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  xpTrack: {
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
  },
  premiumActivePill: {
    backgroundColor: '#854D0E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  premiumActiveText: {
    color: '#FEF08A',
    fontSize: 11,
    fontWeight: '900',
  },
  unlockPremiumBtn: {
    backgroundColor: '#EAB308',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#EAB308',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  unlockPremiumBtnText: {
    color: '#0F172A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  ladderTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    opacity: 0.75,
  },
  tierRowUnlocked: {
    opacity: 1,
  },
  tierNumCol: {
    alignItems: 'center',
    width: 36,
  },
  tierCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  tierCircleActive: {
    borderColor: '#38BDF8',
    backgroundColor: '#0369A1',
  },
  tierNumberText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  trackCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  premiumTrackCard: {
    borderColor: '#713F12',
    backgroundColor: '#1C1917',
  },
  premiumTrackCardActive: {
    borderColor: '#EAB308',
    backgroundColor: '#262214',
  },
  trackLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 4,
  },
  trackLabelPremium: {
    color: '#EAB308',
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 4,
  },
  rewardIcon: {
    fontSize: 22,
    marginVertical: 4,
  },
  rewardName: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  claimBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    width: '100%',
    alignItems: 'center',
  },
  claimBtnPremium: {
    backgroundColor: '#EAB308',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    width: '100%',
    alignItems: 'center',
  },
  claimBtnDisabled: {
    backgroundColor: '#334155',
  },
  claimBtnText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
  claimedPill: {
    backgroundColor: '#064E3B',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  claimedText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#18181B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#EAB308',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  modalTitle: {
    color: '#FEF08A',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6,
  },
  modalDesc: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 16,
  },
  modalOptionCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    marginBottom: 12,
  },
  bundleCard: {
    borderColor: '#EAB308',
    backgroundColor: '#262214',
  },
  bundleTag: {
    backgroundColor: '#EAB308',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  bundleTagText: {
    color: '#0F172A',
    fontSize: 8,
    fontWeight: '900',
  },
  modalOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalOptionTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  modalPrice: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '900',
  },
  modalOptionSub: {
    color: '#94A3B8',
    fontSize: 10,
    lineHeight: 14,
  },
  closeModalBtn: {
    paddingVertical: 8,
    marginTop: 4,
  },
  closeModalText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
  },
});
