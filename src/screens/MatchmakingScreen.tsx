import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RankBadge } from '../components/RankBadge';
import { PlayerProfile } from '../types/mmr';
import { MatchmakerService, OpponentMatchCandidate } from '../services/matchmakerService';

interface Props {
  playerProfile: PlayerProfile;
  onMatchFound: (opponent: OpponentMatchCandidate) => void;
  onCancel: () => void;
}

export const MatchmakingScreen: React.FC<Props> = ({
  playerProfile,
  onMatchFound,
  onCancel,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [matchCandidate, setMatchCandidate] = useState<OpponentMatchCandidate | null>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Search queue timer
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Trigger match discovery after simulated queue wait (3 to 6 seconds)
    if (seconds >= 3 && !matchCandidate) {
      const opp = MatchmakerService.findOpponent(playerProfile.mmr, playerProfile.selectedFaction || 'shinobi', seconds);
      setMatchCandidate(opp);
    }
  }, [seconds, matchCandidate, playerProfile.mmr, playerProfile.selectedFaction]);

  useEffect(() => {
    if (!matchCandidate) return;

    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(timer);
          onMatchFound(matchCandidate);
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [matchCandidate, onMatchFound]);

  const searchTolerance = 40 + Math.min(250, seconds * 20);

  const getFactionEmblem = (faction?: string) => {
    switch (faction) {
      case 'shinobi': return '🥷';
      case 'bushido': return '⚔️';
      case 'yokai': return '👹';
      case 'onmyo': return '⛩️';
      case 'shogunate': return '🏯';
      default: return '🥷';
    }
  };

  return (
    <View style={styles.container}>
      {!matchCandidate ? (
        /* Searching State */
        <View style={styles.searchingBox}>
          <View style={styles.radarRing}>
            <ActivityIndicator size="large" color="#F59E0B" />
          </View>

          <Text style={styles.searchingTitle}>SEEKING CLAN RIVAL...</Text>
          <Text style={styles.queueTimer}>
            Searching the provinces: 00:{seconds < 10 ? `0${seconds}` : seconds}
          </Text>

          <View style={styles.criteriaBox}>
            <Text style={styles.criteriaText}>
              Target MMR: {playerProfile.mmr} (±{searchTolerance})
            </Text>
            <Text style={styles.criteriaSub}>Matching compatible Gwent warlord</Text>
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>CANCEL QUEUE</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Match Found Splash */
        <View style={styles.matchFoundBox}>
          <View style={styles.matchFoundBanner}>
            <Text style={styles.matchFoundText}>⚔️ CLAN SHOWDOWN FOUND! ⚔️</Text>
          </View>

          <View style={styles.versusRow}>
            {/* Player Side */}
            <View style={styles.sideCard}>
              <View style={[styles.avatarCircle, { backgroundColor: '#78350F' }]}>
                <Text style={styles.avatarEmoji}>{getFactionEmblem(playerProfile.selectedFaction)}</Text>
              </View>
              <Text numberOfLines={1} style={styles.sideName}>{playerProfile.name}</Text>
              <Text style={styles.factionLabelText}>{playerProfile.selectedFaction?.toUpperCase() || 'SHINOBI'}</Text>
              <RankBadge mmr={playerProfile.mmr} size="small" />
            </View>

            <View style={styles.vsBadge}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            {/* Opponent Side */}
            <View style={styles.sideCard}>
              <View style={[styles.avatarCircle, { backgroundColor: '#991B1B' }]}>
                <Text style={styles.avatarEmoji}>{getFactionEmblem(matchCandidate.faction)}</Text>
              </View>
              <Text numberOfLines={1} style={styles.sideName}>{matchCandidate.name}</Text>
              <Text style={styles.factionLabelText}>{matchCandidate.faction.toUpperCase()}</Text>
              <RankBadge mmr={matchCandidate.mmr} size="small" />
            </View>
          </View>

          <View style={styles.countdownPill}>
            <Text style={styles.countdownText}>
              Duelling in {countdown}s...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  searchingBox: {
    alignItems: 'center',
    width: '100%',
  },
  radarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  searchingTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },
  queueTimer: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 20,
  },
  criteriaBox: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 3,
  },
  criteriaText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  criteriaSub: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 4,
  },
  cancelButton: {
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  cancelText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  matchFoundBox: {
    width: '100%',
    alignItems: 'center',
  },
  matchFoundBanner: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 32,
  },
  matchFoundText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  versusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 36,
  },
  sideCard: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: 130,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  sideName: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  factionLabelText: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  vsBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D97706',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vsText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  countdownPill: {
    backgroundColor: '#18181B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  countdownText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
  },
});
