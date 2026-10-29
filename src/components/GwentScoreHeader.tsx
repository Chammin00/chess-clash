import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WeatherState } from '../types/game';
import { Card, FactionId } from '../types/card';

interface Props {
  playerName: string;
  playerFaction: FactionId;
  playerLives: number;
  playerTotalScore: number;
  playerHandCount: number;
  playerPassed: boolean;
  playerLeader: Card;
  playerLeaderUsed: boolean;
  onUsePlayerLeader: () => void;

  opponentName: string;
  opponentFaction: FactionId;
  opponentLives: number;
  opponentTotalScore: number;
  opponentHandCount: number;
  opponentPassed: boolean;
  opponentLeader: Card;
  opponentLeaderUsed: boolean;

  weather: WeatherState;
  roundNumber: number;
  turnTimeLeft: number;
  isPlayerTurn: boolean;
  onPassRound: () => void;
}

export const GwentScoreHeader: React.FC<Props> = ({
  playerName,
  playerFaction,
  playerLives,
  playerTotalScore,
  playerHandCount,
  playerPassed,
  playerLeader,
  playerLeaderUsed,
  onUsePlayerLeader,

  opponentName,
  opponentFaction,
  opponentLives,
  opponentTotalScore,
  opponentHandCount,
  opponentPassed,
  opponentLeader,
  opponentLeaderUsed,

  weather,
  roundNumber,
  turnTimeLeft,
  isPlayerTurn,
  onPassRound,
}) => {
  const renderGems = (lives: number) => {
    return (
      <View style={styles.gemRow}>
        <Text style={[styles.gem, lives >= 1 ? styles.gemActive : styles.gemDead]}>
          {lives >= 1 ? '💎' : '🔘'}
        </Text>
        <Text style={[styles.gem, lives >= 2 ? styles.gemActive : styles.gemDead]}>
          {lives >= 2 ? '💎' : '🔘'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.headerContainer}>
      {/* Opponent Stat Bar */}
      <View style={[styles.playerBar, styles.opponentBar]}>
        <View style={styles.avatarMeta}>
          <Text style={styles.factionEmblem}>
            {opponentFaction === 'shinobi' ? '🥷' :
             opponentFaction === 'bushido' ? '⚔️' :
             opponentFaction === 'yokai' ? '👹' :
             opponentFaction === 'onmyo' ? '⛩️' : '🏯'}
          </Text>
          <View>
            <Text style={styles.playerNameText} numberOfLines={1}>{opponentName}</Text>
            <Text style={styles.handCountText}>🃏 {opponentHandCount} cards</Text>
          </View>
        </View>

        {renderGems(opponentLives)}

        {opponentPassed ? (
          <View style={styles.passedPill}>
            <Text style={styles.passedText}>PASSED</Text>
          </View>
        ) : (
          <View style={[styles.totalScoreBadge, styles.opponentScoreBadge]}>
            <Text style={styles.totalScoreNumber}>{opponentTotalScore}</Text>
          </View>
        )}
      </View>

      {/* Middle Battle Bar: Active Weather, Round Indicator, Turn Timer, Pass Button */}
      <View style={styles.middleMetaBar}>
        <View style={styles.weatherTray}>
          <Text style={[styles.weatherPill, weather.frost && styles.weatherActive]}>❄️ Frost</Text>
          <Text style={[styles.weatherPill, weather.fog && styles.weatherActive]}>🌫️ Fog</Text>
          <Text style={[styles.weatherPill, weather.rain && styles.weatherActive]}>🌧️ Rain</Text>
        </View>

        <View style={styles.roundCenterPill}>
          <Text style={styles.roundText}>ROUND {roundNumber}</Text>
          <Text style={[styles.timerText, isPlayerTurn ? styles.timerPlayer : styles.timerOpponent]}>
            ⏱️ {turnTimeLeft}s
          </Text>
        </View>

        {/* Pass Button */}
        {!playerPassed && (
          <TouchableOpacity
            style={[styles.passButton, !isPlayerTurn && styles.passButtonDisabled]}
            disabled={!isPlayerTurn}
            onPress={onPassRound}
          >
            <Text style={styles.passButtonText}>PASS ROUND</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Player Stat Bar */}
      <View style={[styles.playerBar, styles.playerMainBar]}>
        <View style={styles.avatarMeta}>
          <Text style={styles.factionEmblem}>
            {playerFaction === 'shinobi' ? '🥷' :
             playerFaction === 'bushido' ? '⚔️' :
             playerFaction === 'yokai' ? '👹' :
             playerFaction === 'onmyo' ? '⛩️' : '🏯'}
          </Text>
          <View>
            <Text style={styles.playerNameText} numberOfLines={1}>{playerName}</Text>
            <Text style={styles.handCountText}>🃏 {playerHandCount} cards</Text>
          </View>
        </View>

        {renderGems(playerLives)}

        {/* Player Leader Card Action */}
        <TouchableOpacity
          disabled={playerLeaderUsed || !isPlayerTurn || playerPassed}
          onPress={onUsePlayerLeader}
          style={[
            styles.leaderButton,
            playerLeaderUsed && styles.leaderButtonUsed,
            (!isPlayerTurn || playerPassed) && styles.leaderButtonDisabled,
          ]}
        >
          <Text style={styles.leaderIcon}>{playerLeader.icon}</Text>
          <Text style={styles.leaderText}>{playerLeaderUsed ? 'USED' : 'LEADER'}</Text>
        </TouchableOpacity>

        {playerPassed ? (
          <View style={styles.passedPill}>
            <Text style={styles.passedText}>PASSED</Text>
          </View>
        ) : (
          <View style={[styles.totalScoreBadge, styles.playerScoreBadge]}>
            <Text style={styles.totalScoreNumber}>{playerTotalScore}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#0C0A09',
    borderBottomWidth: 1.5,
    borderBottomColor: '#44403C',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  playerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginVertical: 1,
  },
  opponentBar: {
    backgroundColor: '#1E1B24',
  },
  playerMainBar: {
    backgroundColor: '#1C1917',
  },
  avatarMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 130,
  },
  factionEmblem: {
    fontSize: 22,
    marginRight: 6,
  },
  playerNameText: {
    color: '#F9FAFB',
    fontSize: 12,
    fontWeight: '800',
  },
  handCountText: {
    color: '#A8A29E',
    fontSize: 10,
    marginTop: 1,
  },
  gemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gem: {
    fontSize: 14,
    marginHorizontal: 1,
  },
  gemActive: {
    opacity: 1,
  },
  gemDead: {
    opacity: 0.3,
  },
  totalScoreBadge: {
    width: 44,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  opponentScoreBadge: {
    backgroundColor: '#3730A3',
    borderColor: '#818CF8',
  },
  playerScoreBadge: {
    backgroundColor: '#991B1B',
    borderColor: '#EF4444',
  },
  totalScoreNumber: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  passedPill: {
    backgroundColor: '#44403C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  passedText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '900',
  },
  middleMetaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
    marginVertical: 1,
  },
  weatherTray: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherPill: {
    fontSize: 9,
    color: '#57534E',
    backgroundColor: '#1C1917',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 3,
    borderWidth: 1,
    borderColor: '#292524',
  },
  weatherActive: {
    color: '#38BDF8',
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    fontWeight: '800',
  },
  roundCenterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#292524',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roundText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '900',
    marginRight: 6,
  },
  timerText: {
    fontSize: 10,
    fontWeight: '800',
  },
  timerPlayer: {
    color: '#10B981',
  },
  timerOpponent: {
    color: '#EF4444',
  },
  passButton: {
    backgroundColor: '#78350F',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  passButtonDisabled: {
    opacity: 0.5,
  },
  passButtonText: {
    color: '#FEF3C7',
    fontSize: 10,
    fontWeight: '900',
  },
  leaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C2D12',
    borderWidth: 1,
    borderColor: '#EA580C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  leaderButtonUsed: {
    backgroundColor: '#292524',
    borderColor: '#44403C',
    opacity: 0.5,
  },
  leaderButtonDisabled: {
    opacity: 0.5,
  },
  leaderIcon: {
    fontSize: 12,
    marginRight: 3,
  },
  leaderText: {
    color: '#FFEDD5',
    fontSize: 9,
    fontWeight: '800',
  },
});
