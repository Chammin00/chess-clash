import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { RankBadge } from '../components/RankBadge';
import { MatchResultData } from '../types/game';
import { FACTION_CONFIGS } from '../config/factions';
import { FactionId } from '../types/card';
import { GlyphIcon } from '../components/GlyphIcon';
import { DesignTokens } from '../theme/designSystem';

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
  const isTie = result.winner === 'tie';
  const finalGold = rewardDoubled ? result.goldEarned * 2 : result.goldEarned;

  const playerConfig = FACTION_CONFIGS[result.playerFaction as Exclude<FactionId, 'neutral'>];
  const oppConfig = FACTION_CONFIGS[result.opponentFaction as Exclude<FactionId, 'neutral'>];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, isWin ? styles.winBorder : (isTie ? styles.tieBorder : styles.lossBorder)]}>
          {/* Result Banner */}
          <View style={[styles.banner, isWin ? styles.winBanner : (isTie ? styles.tieBanner : styles.lossBanner)]}>
            <Text style={styles.bannerText}>
              {isWin ? '🏆 GWENT VICTORY! 🏆' : (isTie ? '⚖️ HONORABLE DRAW ⚖️' : '💀 DEFEAT 💀')}
            </Text>
            <Text style={styles.bannerSubtext}>
              {playerConfig?.emblem} {playerConfig?.name} vs {oppConfig?.emblem} {oppConfig?.name}
            </Text>
          </View>

          {/* Round-by-Round Breakdown */}
          {result.roundScores && result.roundScores.length > 0 && (
            <View style={styles.roundsBreakdownBox}>
              <Text style={styles.sectionTitle}>ROUND BREAKDOWN (BEST 2-OF-3)</Text>
              <View style={styles.roundsList}>
                {result.roundScores.map(r => (
                  <View key={r.round} style={styles.roundRow}>
                    <Text style={styles.roundLabel}>Round {r.round}:</Text>
                    <Text style={styles.roundScoreText}>
                      <Text style={styles.playerScoreCol}>{r.playerScore}</Text>
                      {'  vs  '}
                      <Text style={styles.oppScoreCol}>{r.opponentScore}</Text>
                    </Text>
                    <View style={[
                      styles.roundOutcomePill,
                      r.winner === 'player' ? styles.roundWon : (r.winner === 'tie' ? styles.roundTied : styles.roundLost)
                    ]}>
                      <Text style={styles.roundOutcomeText}>
                        {r.winner === 'player' ? 'WON' : (r.winner === 'tie' ? 'TIE' : 'LOST')}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* MMR Delta Area */}
          <View style={styles.mmrSection}>
            <Text style={styles.sectionTitle}>MATCHMAKING RATING (ELO)</Text>
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

            {result.streakBonus && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakBadgeText}>🔥 WIN STREAK BONUS (+20% ELO)</Text>
              </View>
            )}

            <View style={styles.badgeWrapper}>
              <RankBadge mmr={result.newMmr} size="small" />
            </View>
          </View>

          {/* Rewards Section */}
          <View style={styles.rewardsSection}>
            <Text style={styles.sectionTitle}>BATTLE REWARDS</Text>
            <View style={styles.rewardPillsRow}>
              <View style={styles.rewardPill}>
                <GlyphIcon name="gold" size={14} style={styles.rewardIcon} />
                <Text style={styles.rewardAmount}>+{finalGold} Gold</Text>
              </View>
              <View style={styles.rewardPill}>
                <GlyphIcon name="star" size={14} color="#FBBF24" style={styles.rewardIcon} />
                <Text style={styles.rewardAmount}>+{result.xpEarned} XP</Text>
              </View>
            </View>
          </View>

          {/* Rewarded Ad Option */}
          {!rewardDoubled && isWin && (
            <TouchableOpacity style={styles.adRewardBtn} onPress={onWatchAdForDoubleRewards}>
              <Text style={styles.adRewardIcon}>📺</Text>
              <View style={styles.adRewardTextCol}>
                <Text style={styles.adRewardTitle}>DOUBLE GOLD BONUS</Text>
                <Text style={styles.adRewardSub}>Watch a quick video to claim +{result.goldEarned} Gold</Text>
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
            <Text style={styles.continueText}>RETURN TO CLAN SANCTUARY ➔</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#18181B',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  winBorder: {
    borderColor: '#F59E0B',
  },
  lossBorder: {
    borderColor: '#EF4444',
  },
  tieBorder: {
    borderColor: '#A8A29E',
  },
  banner: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  winBanner: {
    backgroundColor: '#92400E',
  },
  lossBanner: {
    backgroundColor: '#991B1B',
  },
  tieBanner: {
    backgroundColor: '#44403C',
  },
  bannerText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  bannerSubtext: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  roundsBreakdownBox: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
    backgroundColor: '#141416',
  },
  roundsList: {
    marginTop: 6,
  },
  roundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  roundLabel: {
    color: '#D6D3D1',
    fontSize: 12,
    fontWeight: '700',
    width: 65,
  },
  roundScoreText: {
    color: '#F9FAFB',
    fontSize: 13,
    fontWeight: '900',
  },
  playerScoreCol: {
    color: '#34D399',
  },
  oppScoreCol: {
    color: '#F87171',
  },
  roundOutcomePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roundWon: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  roundLost: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  roundTied: {
    backgroundColor: 'rgba(168, 162, 158, 0.2)',
  },
  roundOutcomeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFF',
  },
  mmrSection: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  sectionTitle: {
    color: '#A8A29E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  mmrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  oldMmr: {
    color: '#A8A29E',
    fontSize: 18,
    fontWeight: '700',
  },
  arrow: {
    color: '#78716C',
    fontSize: 14,
    marginHorizontal: 8,
  },
  newMmr: {
    fontSize: 22,
    fontWeight: '900',
    marginRight: 8,
  },
  gainText: {
    color: '#34D399',
  },
  lossText: {
    color: '#F87171',
  },
  deltaPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gainPill: {
    backgroundColor: '#059669',
  },
  lossPill: {
    backgroundColor: '#DC2626',
  },
  deltaText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  streakBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
    marginBottom: 8,
  },
  streakBadgeText: {
    color: '#FCA5A5',
    fontSize: 10,
    fontWeight: '800',
  },
  badgeWrapper: {
    marginTop: 4,
  },
  rewardsSection: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  rewardPillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardIcon: {
    marginRight: 6,
  },
  rewardAmount: {
    color: '#F9FAFB',
    fontSize: 13,
    fontWeight: '800',
  },
  adRewardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1B24',
    margin: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7C3AED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 3,
  },
  adRewardIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  adRewardTextCol: {
    flex: 1,
  },
  adRewardTitle: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '900',
  },
  adRewardSub: {
    color: '#A8A29E',
    fontSize: 10,
    marginTop: 2,
  },
  rewardDoubledBanner: {
    backgroundColor: '#065F46',
    paddingVertical: 8,
    alignItems: 'center',
  },
  doubledText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '900',
  },
  continueBtn: {
    backgroundColor: '#92400E',
    paddingVertical: 14,
    alignItems: 'center',
    margin: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F59E0B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  continueText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
