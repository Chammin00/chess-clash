import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ChessBotProfile, GameThemeId, PlayerChessProfile } from '../types';
import { THEME_CONFIGS } from '../themes';
import { ChessMMRService, getTierColor, getTierIcon } from '../services/chessMMRService';

interface ChessMatchmakingScreenProps {
  themeId: GameThemeId;
  profile: PlayerChessProfile;
  onOpponentFound: (opponent: ChessBotProfile) => void;
  onCancel: () => void;
}

export const ChessMatchmakingScreen: React.FC<ChessMatchmakingScreenProps> = ({
  themeId,
  profile,
  onOpponentFound,
  onCancel,
}) => {
  const theme = THEME_CONFIGS[themeId];
  const themeStat = profile.themeStats[themeId] || { mmr: 1000, tier: 'Bronze' };

  const [matchedOpponent, setMatchedOpponent] = useState<ChessBotProfile | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    // Simulate matchmaking search time (1.2 to 2.2 seconds)
    const matchTimer = setTimeout(() => {
      const opp = ChessMMRService.findMatchmakingOpponent(themeStat.mmr);
      setMatchedOpponent(opp);
      setCountdown(3);
    }, 1600);

    return () => clearTimeout(matchTimer);
  }, [themeStat.mmr]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 800);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && matchedOpponent) {
      onOpponentFound(matchedOpponent);
    }
  }, [countdown, matchedOpponent]);

  return (
    <View style={styles.container}>
      {/* Kingdom Header */}
      <View style={styles.kingdomHeader}>
        <Text style={styles.kingdomBannerEmoji}>{theme.factionBanner}</Text>
        <Text style={styles.kingdomName}>{theme.name.toUpperCase()}</Text>
        <Text style={styles.matchmakingTitle}>RANKED MMR MATCHMAKING</Text>
      </View>

      <View style={styles.matchupContainer}>
        {/* Player Profile Card */}
        <View style={[styles.playerCard, { borderColor: theme.primaryColor }]}>
          <Text style={styles.avatarEmoji}>👑</Text>
          <Text style={styles.playerName}>Commander</Text>
          <View style={styles.tierRow}>
            <Text style={styles.tierIcon}>{getTierIcon(themeStat.tier)}</Text>
            <Text style={[styles.tierText, { color: getTierColor(themeStat.tier) }]}>
              {themeStat.tier}
            </Text>
          </View>
          <Text style={styles.mmrText}>MMR {themeStat.mmr}</Text>
        </View>

        {/* VS / Status Area */}
        <View style={styles.vsContainer}>
          {!matchedOpponent ? (
            <View style={styles.searchingBox}>
              <ActivityIndicator size="large" color={theme.accentColor || '#38BDF8'} />
              <Text style={styles.searchingText}>SEARCHING ARENA...</Text>
              <Text style={styles.rangeText}>MMR Range: ±150</Text>
            </View>
          ) : (
            <View style={styles.foundBox}>
              <Text style={styles.vsText}>VS</Text>
              {countdown !== null && (
                <View style={styles.countdownBadge}>
                  <Text style={styles.countdownText}>Starts in {countdown}s</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Opponent Profile Card */}
        <View
          style={[
            styles.playerCard,
            matchedOpponent
              ? { borderColor: '#EF4444' }
              : { borderColor: '#334155', borderStyle: 'dashed' },
          ]}
        >
          {matchedOpponent ? (
            <>
              <Text style={styles.avatarEmoji}>{matchedOpponent.avatar}</Text>
              <Text style={styles.playerName}>{matchedOpponent.name}</Text>
              <View style={styles.engineBadge}>
                <Text style={styles.engineBadgeText}>
                  {matchedOpponent.engine.toUpperCase()} AI
                </Text>
              </View>
              <Text style={styles.mmrText}>MMR {matchedOpponent.mmr}</Text>
              <Text style={styles.quoteText}>"{matchedOpponent.quote}"</Text>
            </>
          ) : (
            <View style={styles.opponentPlaceholder}>
              <Text style={styles.placeholderIcon}>❓</Text>
              <Text style={styles.placeholderText}>Locating Challenger...</Text>
            </View>
          )}
        </View>
      </View>

      {/* Cancel Button */}
      {!matchedOpponent && (
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  kingdomHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  kingdomBannerEmoji: {
    fontSize: 40,
    marginBottom: 6,
  },
  kingdomName: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  matchmakingTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 4,
  },
  matchupContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  playerCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarEmoji: {
    fontSize: 42,
    marginBottom: 4,
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  tierIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '800',
  },
  mmrText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  quoteText: {
    color: '#94A3B8',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 6,
    textAlign: 'center',
  },
  engineBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  engineBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },
  opponentPlaceholder: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
    color: '#475569',
    marginBottom: 6,
  },
  placeholderText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  vsContainer: {
    alignItems: 'center',
  },
  searchingBox: {
    alignItems: 'center',
    gap: 6,
  },
  searchingText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  rangeText: {
    color: '#64748B',
    fontSize: 11,
  },
  foundBox: {
    alignItems: 'center',
  },
  vsText: {
    color: '#F59E0B',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  countdownBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  countdownText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  cancelButton: {
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  cancelButtonText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
});
