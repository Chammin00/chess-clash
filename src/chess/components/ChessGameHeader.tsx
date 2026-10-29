import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ChessPiece, PlayerColor, ThemeConfig } from '../types';
import { getTierColor, getTierIcon } from '../services/chessMMRService';

interface ChessGameHeaderProps {
  theme: ThemeConfig;
  playerName: string;
  playerMmr: number;
  playerAvatar: string;
  opponentName: string;
  opponentMmr: number;
  opponentAvatar: string;
  opponentEngineName: string;
  turn: PlayerColor;
  playerColor: PlayerColor;
  capturedWhite: ChessPiece[];
  capturedBlack: ChessPiece[];
  evaluationCentipawns: number;
  isAiThinking: boolean;
}

export const ChessGameHeader: React.FC<ChessGameHeaderProps> = ({
  theme,
  playerName,
  playerMmr,
  playerAvatar,
  opponentName,
  opponentMmr,
  opponentAvatar,
  opponentEngineName,
  turn,
  playerColor,
  capturedWhite,
  capturedBlack,
  evaluationCentipawns,
  isAiThinking,
}) => {
  // Calculate material difference
  const pieceWeights = { pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0 };
  const whiteMat = capturedBlack.reduce((sum, p) => sum + (pieceWeights[p.type] || 0), 0);
  const blackMat = capturedWhite.reduce((sum, p) => sum + (pieceWeights[p.type] || 0), 0);
  const materialAdvantage = whiteMat - blackMat;

  // Evaluation bar: map centipawns (-1000 to +1000) to percentage (0% to 100%)
  const clampedEval = Math.max(-1000, Math.min(1000, evaluationCentipawns));
  const whitePercent = Math.round(50 + (clampedEval / 1000) * 45);

  const isPlayerTurn = turn === playerColor;

  return (
    <View style={styles.container}>
      {/* Opponent Card (Top) */}
      <View
        style={[
          styles.playerRow,
          !isPlayerTurn && styles.activePlayerRow,
          { borderColor: !isPlayerTurn ? theme.accentColor : '#334155' },
        ]}
      >
        <View style={styles.avatarBox}>
          <Text style={styles.avatarEmoji}>{opponentAvatar}</Text>
        </View>
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.playerNameText}>{opponentName}</Text>
            <View style={styles.engineBadge}>
              <Text style={styles.engineBadgeText}>{opponentEngineName}</Text>
            </View>
          </View>
          <View style={styles.subRow}>
            <Text style={styles.mmrText}>MMR {opponentMmr}</Text>
            {/* Captured Pieces by Opponent */}
            <View style={styles.capturedRack}>
              {capturedWhite.slice(-6).map((p, idx) => (
                <Text key={`cap_w_${idx}`} style={styles.capturedPieceEmoji}>
                  {theme.pieces[p.type].icon}
                </Text>
              ))}
              {materialAdvantage < 0 && (
                <Text style={styles.advText}>+{-materialAdvantage}</Text>
              )}
            </View>
          </View>
        </View>
        {!isPlayerTurn && isAiThinking && (
          <View style={styles.thinkingBadge}>
            <Text style={styles.thinkingText}>Thinking...</Text>
          </View>
        )}
      </View>

      {/* Stockfish Centipawn Evaluation Bar */}
      <View style={styles.evalBarContainer}>
        <View style={[styles.evalBarWhite, { width: `${whitePercent}%` }]} />
        <View style={[styles.evalBarBlack, { width: `${100 - whitePercent}%` }]} />
        <View style={styles.evalTextOverlay}>
          <Text style={styles.evalScoreText}>
            {evaluationCentipawns > 0 ? `+${(evaluationCentipawns / 100).toFixed(1)}` : (evaluationCentipawns / 100).toFixed(1)}
          </Text>
        </View>
      </View>

      {/* Player Card (Bottom) */}
      <View
        style={[
          styles.playerRow,
          isPlayerTurn && styles.activePlayerRow,
          { borderColor: isPlayerTurn ? theme.accentColor : '#334155' },
        ]}
      >
        <View style={styles.avatarBox}>
          <Text style={styles.avatarEmoji}>{playerAvatar}</Text>
        </View>
        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.playerNameText}>{playerName}</Text>
            <View style={styles.turnBadge}>
              <Text style={styles.turnBadgeText}>
                {isPlayerTurn ? 'YOUR TURN' : 'WAITING'}
              </Text>
            </View>
          </View>
          <View style={styles.subRow}>
            <Text style={styles.mmrText}>MMR {playerMmr}</Text>
            {/* Captured Pieces by Player */}
            <View style={styles.capturedRack}>
              {capturedBlack.slice(-6).map((p, idx) => (
                <Text key={`cap_b_${idx}`} style={styles.capturedPieceEmoji}>
                  {theme.pieces[p.type].icon}
                </Text>
              ))}
              {materialAdvantage > 0 && (
                <Text style={styles.advText}>+{materialAdvantage}</Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1.5,
  },
  activePlayerRow: {
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playerNameText: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 14,
  },
  engineBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  engineBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
  turnBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  turnBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  mmrText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  capturedRack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capturedPieceEmoji: {
    fontSize: 12,
    marginHorizontal: 1,
  },
  advText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  thinkingBadge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  thinkingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  evalBarContainer: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 4,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  evalBarWhite: {
    backgroundColor: '#FFFFFF',
  },
  evalBarBlack: {
    backgroundColor: '#0F172A',
  },
  evalTextOverlay: {
    position: 'absolute',
    right: 4,
    top: -10,
  },
  evalScoreText: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
  },
});
