import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { RankBadge } from '../components/RankBadge';
import { LeaderboardEntry, PlayerProfile } from '../types/mmr';
import { StorageService } from '../services/storageService';

interface Props {
  playerProfile: PlayerProfile;
  onBack: () => void;
}

export const LeaderboardScreen: React.FC<Props> = ({ playerProfile, onBack }) => {
  const leaderboard = StorageService.generateLeaderboard(playerProfile);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>‹ BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>GLOBAL MMR LEADERBOARD</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {leaderboard.map(entry => (
          <View
            key={entry.rank}
            style={[styles.rowCard, entry.isPlayer && styles.playerHighlight]}
          >
            <View style={styles.rankCol}>
              <Text style={[styles.rankNumber, entry.rank <= 3 && styles.topThreeRank]}>
                #{entry.rank}
              </Text>
            </View>

            <View style={styles.nameCol}>
              <Text numberOfLines={1} style={[styles.playerName, entry.isPlayer && styles.playerNameHighlight]}>
                {entry.name}
              </Text>
              <Text style={styles.winRateText}>{entry.winRate}% Win Rate</Text>
            </View>

            <RankBadge mmr={entry.mmr} size="small" />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: 8,
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
  title: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '900',
  },
  list: {
    padding: 16,
    gap: 8,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  playerHighlight: {
    borderColor: '#38BDF8',
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
  },
  rankCol: {
    width: 36,
  },
  rankNumber: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '900',
  },
  topThreeRank: {
    color: '#F59E0B',
    fontSize: 15,
  },
  nameCol: {
    flex: 1,
    paddingHorizontal: 8,
  },
  playerName: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  playerNameHighlight: {
    color: '#38BDF8',
  },
  winRateText: {
    color: '#64748B',
    fontSize: 9,
    marginTop: 2,
  },
});
