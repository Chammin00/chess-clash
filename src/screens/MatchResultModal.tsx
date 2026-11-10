import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { RankBadge } from '../components/RankBadge';
import { MatchResultData } from '../types/game';

interface Props {
  visible: boolean;
  result: MatchResultData | null;
  onWatchAdForDoubleRewards: () => void;
  onContinue: () => void;
  rewardDoubled?: boolean;
}

export const MatchResultModal: React.FC<Props> = ({
  visible,
  result,
  onWatchAdForDoubleRewards,
  onContinue,
  rewardDoubled = false,
}) => {
  if (!result) return null;

  const isWin = result.winner === 'player';
  const finalGold = rewardDoubled ? result.goldEarned * 2 : result.goldEarned;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, isWin ? styles.winBorder : styles.lossBorder]}>
          {/* Result Banner */}
          <View style={[styles.banner, isWin ? styles.winBanner : styles.lossBanner]}>
            <Text style={styles.bannerText}>
              {isWin ? '🏆 VICTORY! 🏆' : '💀 DEFEAT 💀'}
            </Text>
          </View>

          {/* MMR Display Section */}
          <View style={styles.mmrSection}>
            <Text style={styles.sectionTitle}>SPIRE MATCHMAKING RATING (MMR)</Text>
            
            {/* Rating Row */}
            <View style={styles.mmrRow}>
              <Text style={styles.oldMmr}>{result.oldMmr}</Text>
              <Text style={styles.arrow}>➔</Text>
              <Text style={[styles.newMmr, isWin ? styles.gainText : styles.lossText]}>
                {result.newMmr}
              </Text>
              <View style={[styles.deltaPill, isWin ? styles.gainPill : styles.lossPill]}>
                <Text style={styles.deltaText}>
                  {result.mmrDelta > 0 ? `+${result.mmrDelta}` : result.mmrDelta}
                </Text>
              </View>
            </View>

            {/* Decay Notice */}
            {typeof result.decayApplied === 'number' && result.decayApplied > 0 && (
              <Text style={styles.decayNoticeText}>
                ⚠️ Includes -{result.decayApplied} Rust Decay
              </Text>
            )}

            {/* Rank Change Indicator */}
            {result.rankChange && result.rankChange !== 'none' ? (
              <View style={[
                styles.rankChangeBadge,
                result.rankChange === 'promoted' ? styles.promotionBadge : styles.demotionBadge
              ]}>
                <Text style={styles.rankChangeText}>
                  {result.rankChange === 'promoted'
                    ? `🎉 RANK CHANGE: +${result.tierStepDelta || 1} (PROMOTED TO ${result.newTier?.toUpperCase()}!)`
                    : `⚠️ RANK CHANGE: ${result.tierStepDelta || -1} (DEMOTED TO ${result.newTier?.toUpperCase()})`}
                </Text>
              </View>
            ) : (
              <View style={styles.rankChangeNeutralBadge}>
                <Text style={styles.rankChangeNeutralText}>
                  Rank Change: 0 (Maintained Tier)
                </Text>
              </View>
            )}

            {result.streakBonus && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakBadgeText}>🔥 WIN STREAK BONUS (+30% DIFFERENTIAL)</Text>
              </View>
            )}

            {/* Current Tier Badge */}
            <View style={styles.badgeWrapper}>
              <RankBadge mmr={result.newMmr} size="medium" />
            </View>
          </View>

          {/* Rewards Section */}
          <View style={styles.rewardsSection}>
            <Text style={styles.sectionTitle}>BATTLE REWARDS</Text>
            <View style={styles.rewardPillsRow}>
              <View style={styles.rewardPill}>
                <Text style={styles.rewardIcon}>🪙</Text>
                <Text style={styles.rewardAmount}>+{finalGold} Gold</Text>
              </View>
              <View style={styles.rewardPill}>
                <Text style={styles.rewardIcon}>⭐</Text>
                <Text style={styles.rewardAmount}>+{result.xpEarned} XP</Text>
              </View>
            </View>
          </View>

          {/* Tactical Mastery Bonus Option */}
          {!rewardDoubled && isWin && (
            <TouchableOpacity style={styles.adRewardBtn} onPress={onWatchAdForDoubleRewards}>
              <Text style={styles.adRewardIcon}>⚡</Text>
              <View style={styles.adRewardTextCol}>
                <Text style={styles.adRewardTitle}>CLAIM VICTORY OVERDRIVE BONUS</Text>
                <Text style={styles.adRewardSub}>Extract +{result.goldEarned} Bonus Credits from the Rift Core</Text>
              </View>
            </TouchableOpacity>
          )}

          {rewardDoubled && (
            <View style={styles.rewardDoubledBanner}>
              <Text style={styles.doubledText}>🎉 2X GOLD CLAIMED!</Text>
            </View>
          )}

          {/* Continue CTA */}
          <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
            <Text style={styles.continueText}>CONTINUE TO LOBBY ➔</Text>
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
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 20,
  },
  winBorder: {
    borderColor: '#38BDF8',
  },
  lossBorder: {
    borderColor: '#EF4444',
  },
  banner: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  winBanner: {
    backgroundColor: '#059669',
  },
  lossBanner: {
    backgroundColor: '#DC2626',
  },
  bannerText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  mmrSection: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  mmrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  oldMmr: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: '700',
  },
  arrow: {
    color: '#64748B',
    fontSize: 16,
  },
  newMmr: {
    fontSize: 24,
    fontWeight: '900',
  },
  gainText: {
    color: '#34D399',
  },
  lossText: {
    color: '#F87171',
  },
  deltaPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gainPill: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
  },
  lossPill: {
    backgroundColor: 'rgba(248, 113, 113, 0.2)',
  },
  deltaText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  streakBadge: {
    backgroundColor: 'rgba(234, 88, 12, 0.2)',
    borderColor: '#EA580C',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  streakBadgeText: {
    color: '#FB923C',
    fontSize: 10,
    fontWeight: '800',
  },
  decayNoticeText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 6,
  },
  rankChangeBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 8,
    borderWidth: 1,
  },
  promotionBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  demotionBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444',
  },
  rankChangeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  rankChangeNeutralBadge: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    borderColor: '#475569',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  rankChangeNeutralText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  badgeWrapper: {
    marginTop: 10,
  },
  rewardsSection: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  rewardPillsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  rewardIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  rewardAmount: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
  },
  adRewardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  adRewardIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  adRewardTextCol: {
    flex: 1,
  },
  adRewardTitle: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '900',
  },
  adRewardSub: {
    color: '#FCD34D',
    fontSize: 9,
  },
  rewardDoubledBanner: {
    backgroundColor: 'rgba(5, 150, 105, 0.2)',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
  },
  doubledText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800',
  },
  continueBtn: {
    backgroundColor: '#2563EB',
    width: '90%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
