import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { SpireRunState } from '../types/spire';
import { RankBadge } from '../components/RankBadge';

interface Props {
  visible: boolean;
  runState: SpireRunState | null;
  mmrChange: number;
  newMmr: number;
  oldMmr: number;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const SpireRunOverModal: React.FC<Props> = ({
  visible,
  runState,
  mmrChange,
  newMmr,
  oldMmr,
  onPlayAgain,
  onReturnToLobby,
}) => {
  if (!runState) return null;

  const isVictory = runState.victory;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.card, isVictory ? styles.winBorder : styles.lossBorder]}>
          {/* Header Banner */}
          <View style={[styles.banner, isVictory ? styles.winBanner : styles.lossBanner]}>
            <Text style={styles.bannerText}>
              {isVictory ? '👑 NEXUS CITADEL PURGED! 👑' : '💀 VITALITY ZERO: RIFT COLLAPSE 💀'}
            </Text>
          </View>

          {/* Chronicle Debrief */}
          <View style={styles.statsContainer}>
            <Text style={styles.statsHeader}>EXPEDITION CHRONICLE</Text>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Highest Waypoint:</Text>
              <Text style={styles.statValue}>Waypoint Level {runState.floor} / 15</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Hostiles Neutralized:</Text>
              <Text style={styles.statValue}>{runState.monstersDefeated} 👾</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Dreadnoughts Slain:</Text>
              <Text style={styles.statValue}>{runState.elitesDefeated} ⚡</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Credits Secured:</Text>
              <Text style={styles.statValue}>{runState.hero.gold} 🪙</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Artifacts Siphoned:</Text>
              <Text style={styles.statValue}>{runState.hero.relics.length} 🔮</Text>
            </View>
          </View>

          {/* MMR Rating Change */}
          <View style={styles.mmrBox}>
            <Text style={styles.mmrTitle}>ASCENSION MMR RATING</Text>
            <View style={styles.mmrValuesRow}>
              <Text style={styles.oldMmr}>{oldMmr}</Text>
              <Text style={styles.arrow}>➔</Text>
              <Text style={[styles.newMmr, isVictory ? styles.gainText : styles.lossText]}>
                {newMmr}
              </Text>
              <View style={[styles.deltaPill, isVictory ? styles.gainPill : styles.lossPill]}>
                <Text style={styles.deltaText}>
                  {mmrChange > 0 ? `+${mmrChange}` : mmrChange} MMR
                </Text>
              </View>
            </View>

            <View style={styles.badgeWrapper}>
              <RankBadge mmr={newMmr} size="small" />
            </View>
          </View>

          {/* CTAs */}
          <TouchableOpacity style={styles.playAgainBtn} onPress={onPlayAgain}>
            <Text style={styles.playAgainText}>⚡ LAUNCH NEW RIFT EXPEDITION</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.lobbyBtn} onPress={onReturnToLobby}>
            <Text style={styles.lobbyText}>RETURN TO CITADEL COMM-HUB</Text>
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
    borderWidth: 1.5,
    alignItems: 'center',
    overflow: 'hidden',
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  winBorder: {
    borderColor: '#00F0FF',
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
    backgroundColor: '#0284C7',
  },
  lossBanner: {
    backgroundColor: '#DC2626',
  },
  bannerText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statsContainer: {
    width: '90%',
    backgroundColor: '#070A13',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 8,
    marginBottom: 16,
  },
  statsHeader: {
    color: '#00F0FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11.5,
    fontWeight: '600',
  },
  statValue: {
    color: '#F8FAFC',
    fontSize: 11.5,
    fontWeight: '800',
  },
  mmrBox: {
    alignItems: 'center',
    width: '90%',
    marginBottom: 20,
  },
  mmrTitle: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  mmrValuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  oldMmr: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '700',
  },
  arrow: {
    color: '#64748B',
    fontSize: 14,
  },
  newMmr: {
    fontSize: 22,
    fontWeight: '900',
  },
  gainText: {
    color: '#00F0FF',
  },
  lossText: {
    color: '#F87171',
  },
  deltaPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gainPill: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
  },
  lossPill: {
    backgroundColor: 'rgba(248, 113, 113, 0.2)',
  },
  deltaText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  badgeWrapper: {
    marginTop: 8,
  },
  playAgainBtn: {
    backgroundColor: '#0284C7',
    width: '90%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  playAgainText: {
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  lobbyBtn: {
    backgroundColor: '#27272A',
    width: '90%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  lobbyText: {
    color: '#94A3B8',
    fontSize: 11.5,
    fontWeight: '800',
  },
});
