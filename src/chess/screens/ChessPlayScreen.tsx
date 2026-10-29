import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import {
  ChessBotProfile,
  GameThemeId,
  Move,
  PieceType,
  PlayerColor,
  Position,
} from '../types';
import { THEME_CONFIGS } from '../themes';
import { ChessGameState } from '../chessEngine';
import { StockfishModel } from '../engines/stockfishModel';
import { MaiaChessModel } from '../engines/maiaModel';
import { AlphaZeroModel } from '../engines/alphazeroModel';
import { ChessBoardView } from '../components/ChessBoardView';
import { ChessGameHeader } from '../components/ChessGameHeader';
import { ChessMoveLog } from '../components/ChessMoveLog';
import { ChessMMRService, getTierColor, getTierIcon } from '../services/chessMMRService';

interface ChessPlayScreenProps {
  themeId: GameThemeId;
  opponent: ChessBotProfile;
  isPassAndPlay?: boolean;
  onGameEnd: () => void;
  onExit: () => void;
}

export const ChessPlayScreen: React.FC<ChessPlayScreenProps> = ({
  themeId,
  opponent,
  isPassAndPlay = false,
  onGameEnd,
  onExit,
}) => {
  const theme = THEME_CONFIGS[themeId];
  const [gameState, setGameState] = useState<ChessGameState>(() => new ChessGameState());
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [evaluation, setEvaluation] = useState(0);

  // Promotion Modal
  const [pendingPromotionMove, setPendingPromotionMove] = useState<Move | null>(null);

  // Post Game Result Modal
  const [gameOverResult, setGameOverResult] = useState<{
    result: 'win' | 'loss' | 'draw';
    title: string;
    description: string;
    mmrDelta: number;
    newMmr: number;
  } | null>(null);

  const playerColor: PlayerColor = 'white';
  const isHumanTurn = isPassAndPlay || gameState.turn === playerColor;

  // AI Turn Execution
  useEffect(() => {
    if (isPassAndPlay) return;
    if (gameState.status !== 'ongoing' && gameState.status !== 'check') return;
    if (gameState.turn === playerColor) return;

    setIsAiThinking(true);

    const timer = setTimeout(() => {
      let selectedMove: Move | null = null;

      try {
        if (opponent.engine === 'maia') {
          const res = MaiaChessModel.selectMove(gameState, opponent.mmr, opponent.blunderRate);
          selectedMove = res.move;
        } else if (opponent.engine === 'alphazero') {
          const res = AlphaZeroModel.searchBestMove(gameState, 60, 1000);
          selectedMove = res.bestMove;
        } else {
          // Stockfish
          const res = StockfishModel.searchBestMove(gameState, opponent.targetDepth, 1000);
          selectedMove = res.bestMove;
        }
      } catch (err) {
        console.warn('AI Engine search error:', err);
      }

      if (!selectedMove) {
        // Fallback to random legal move
        const allMoves = gameState.getAllLegalMoves();
        if (allMoves.length > 0) {
          selectedMove = allMoves[Math.floor(Math.random() * allMoves.length)];
        }
      }

      if (selectedMove) {
        const nextState = gameState.clone();
        nextState.makeMove(selectedMove);
        setGameState(nextState);
        setLastMove(selectedMove);
        setSelectedPos(null);
        setValidMoves([]);

        const newEval = StockfishModel.evaluate(nextState);
        setEvaluation(newEval);

        checkGameOver(nextState);
      }

      setIsAiThinking(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [gameState.turn, gameState.status]);

  const checkGameOver = async (state: ChessGameState) => {
    if (state.status === 'ongoing' || state.status === 'check') return;

    let result: 'win' | 'loss' | 'draw' = 'draw';
    let title = 'Game Drawn';
    let desc = 'The battle ended in a tactical stalemate.';

    if (state.status === 'checkmate') {
      const winner = state.turn === 'white' ? 'black' : 'white';
      if (winner === playerColor) {
        result = 'win';
        title = 'VICTORY!';
        desc = `Checkmate! You conquered ${opponent.name}'s realm.`;
      } else {
        result = 'loss';
        title = 'DEFEAT';
        desc = `${opponent.name} conquered your citadel in checkmate.`;
      }
    } else if (state.status === 'stalemate') {
      title = 'STALEMATE';
      desc = 'No legal moves remaining. Honors are shared.';
    } else if (state.status === 'draw_material') {
      title = 'INSUFFICIENT MATERIAL';
      desc = 'Neither kingdom possesses enough forces to checkmate.';
    } else if (state.status === 'draw_repetition') {
      title = 'THREEFOLD REPETITION';
      desc = 'The same position occurred three times.';
    }

    if (!isPassAndPlay) {
      const record = await ChessMMRService.recordMatchResult(
        themeId,
        opponent,
        result,
        state.moveHistory.length
      );
      setGameOverResult({
        result,
        title,
        description: desc,
        mmrDelta: record.mmrDelta,
        newMmr: record.newMmr,
      });
    } else {
      setGameOverResult({
        result,
        title,
        description: desc,
        mmrDelta: 0,
        newMmr: 1000,
      });
    }
  };

  const handleSquarePress = (pos: Position) => {
    if (!isHumanTurn || isAiThinking) return;

    const clickedPiece = gameState.getPiece(pos);

    // If clicking a target destination of an active selected piece
    if (selectedPos) {
      const matchedMove = validMoves.find((m) => m.to.row === pos.row && m.to.col === pos.col);

      if (matchedMove) {
        // Check for pawn promotion
        const movingPiece = gameState.getPiece(selectedPos);
        const promoRow = gameState.turn === 'white' ? 0 : 7;
        if (movingPiece && movingPiece.type === 'pawn' && pos.row === promoRow) {
          setPendingPromotionMove(matchedMove);
          return;
        }

        executeMove(matchedMove);
        return;
      }
    }

    // Otherwise select piece on square if it belongs to current player
    if (clickedPiece && clickedPiece.color === gameState.turn) {
      setSelectedPos(pos);
      const moves = gameState.getLegalMovesForSquare(pos);
      setValidMoves(moves);
    } else {
      setSelectedPos(null);
      setValidMoves([]);
    }
  };

  const executeMove = (move: Move) => {
    const nextState = gameState.clone();
    nextState.makeMove(move);
    setGameState(nextState);
    setLastMove(move);
    setSelectedPos(null);
    setValidMoves([]);

    const newEval = StockfishModel.evaluate(nextState);
    setEvaluation(newEval);

    checkGameOver(nextState);
  };

  const handleSelectPromotion = (promoType: PieceType) => {
    if (!pendingPromotionMove) return;
    const moveWithPromo: Move = {
      ...pendingPromotionMove,
      promotion: promoType,
    };
    setPendingPromotionMove(null);
    executeMove(moveWithPromo);
  };

  const handleSurrender = () => {
    Alert.alert('Surrender Match?', 'Are you sure you want to concede this ranked battle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Concede',
        style: 'destructive',
        onPress: async () => {
          if (!isPassAndPlay) {
            const record = await ChessMMRService.recordMatchResult(
              themeId,
              opponent,
              'loss',
              gameState.moveHistory.length
            );
            setGameOverResult({
              result: 'loss',
              title: 'CONCEDED',
              description: 'You surrendered the battlefield.',
              mmrDelta: record.mmrDelta,
              newMmr: record.newMmr,
            });
          } else {
            onExit();
          }
        },
      },
    ]);
  };

  const capturedPieces = gameState.getCapturedPieces();

  return (
    <View style={styles.container}>
      {/* Top Bar Navigation */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.exitBtn} onPress={onExit}>
          <Text style={styles.exitBtnText}>‹ Leave</Text>
        </TouchableOpacity>
        <View style={styles.topTitleBox}>
          <Text style={styles.topTitleText}>
            {theme.factionBanner} {theme.name}
          </Text>
        </View>
        <TouchableOpacity style={styles.surrenderBtn} onPress={handleSurrender}>
          <Text style={styles.surrenderBtnText}>🏳️ Resign</Text>
        </TouchableOpacity>
      </View>

      {/* Game Header (Players, Stockfish Eval Bar, Captured pieces) */}
      <ChessGameHeader
        theme={theme}
        playerName="Commander"
        playerMmr={1000}
        playerAvatar="👑"
        opponentName={isPassAndPlay ? 'Player 2 (Black)' : opponent.name}
        opponentMmr={opponent.mmr}
        opponentAvatar={isPassAndPlay ? '⚔️' : opponent.avatar}
        opponentEngineName={
          isPassAndPlay
            ? 'Local 2P'
            : `${opponent.engine.toUpperCase()}`
        }
        turn={gameState.turn}
        playerColor={playerColor}
        capturedWhite={capturedPieces.white}
        capturedBlack={capturedPieces.black}
        evaluationCentipawns={evaluation}
        isAiThinking={isAiThinking}
      />

      {/* Themed Interactive Chessboard */}
      <ChessBoardView
        board={gameState.board}
        theme={theme}
        selectedPos={selectedPos}
        validMoves={validMoves}
        lastMove={lastMove}
        isCheck={gameState.status === 'check'}
        playerColor={playerColor}
        turn={gameState.turn}
        disabled={!isHumanTurn || isAiThinking}
        onSquarePress={handleSquarePress}
      />

      {/* Horizontal Move History Log */}
      <ChessMoveLog moves={gameState.moveHistory} />

      {/* Bottom Info Bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.statusLabel}>STATUS:</Text>
        <Text
          style={[
            styles.statusValue,
            gameState.status === 'check' && { color: '#EF4444' },
          ]}
        >
          {gameState.status.toUpperCase().replace('_', ' ')}
        </Text>
        {isAiThinking && (
          <Text style={styles.aiCalculatingText}>
            • {opponent.engine.toUpperCase()} calculating moves...
          </Text>
        )}
      </View>

      {/* Pawn Promotion Modal */}
      <Modal
        visible={pendingPromotionMove !== null}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.promoModalContent}>
            <Text style={styles.promoModalTitle}>CHOOSE ASCENSION</Text>
            <Text style={styles.promoModalSubtitle}>
              Your scout reached the enemy sanctum!
            </Text>

            <View style={styles.promoOptionsRow}>
              {(['queen', 'rook', 'bishop', 'knight'] as PieceType[]).map((pType) => {
                const lore = theme.pieces[pType];
                return (
                  <TouchableOpacity
                    key={pType}
                    style={styles.promoOptionBtn}
                    onPress={() => handleSelectPromotion(pType)}
                  >
                    <Text style={styles.promoOptionEmoji}>{lore.icon}</Text>
                    <Text style={styles.promoOptionTitle}>{lore.title}</Text>
                    <Text style={styles.promoOptionType}>{pType.toUpperCase()}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Post Match Result Modal */}
      <Modal
        visible={gameOverResult !== null}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.resultModalContent}>
            {gameOverResult && (
              <>
                <Text
                  style={[
                    styles.resultTitle,
                    {
                      color:
                        gameOverResult.result === 'win'
                          ? '#10B981'
                          : gameOverResult.result === 'loss'
                          ? '#EF4444'
                          : '#F59E0B',
                    },
                  ]}
                >
                  {gameOverResult.title}
                </Text>
                <Text style={styles.resultDesc}>{gameOverResult.description}</Text>

                {/* MMR Change Box */}
                {!isPassAndPlay && (
                  <View style={styles.mmrResultBox}>
                    <Text style={styles.mmrResultLabel}>RANKED MMR RATING</Text>
                    <Text
                      style={[
                        styles.mmrDeltaText,
                        {
                          color:
                            gameOverResult.mmrDelta > 0
                              ? '#10B981'
                              : gameOverResult.mmrDelta < 0
                              ? '#EF4444'
                              : '#94A3B8',
                        },
                      ]}
                    >
                      {gameOverResult.mmrDelta > 0
                        ? `+${gameOverResult.mmrDelta}`
                        : gameOverResult.mmrDelta}
                    </Text>
                    <Text style={styles.newMmrText}>New MMR: {gameOverResult.newMmr}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.resultContinueBtn, { backgroundColor: theme.primaryColor }]}
                  onPress={() => {
                    setGameOverResult(null);
                    onGameEnd();
                  }}
                >
                  <Text style={styles.resultContinueBtnText}>Return to Kingdom Arena</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  exitBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  exitBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  topTitleBox: {
    alignItems: 'center',
  },
  topTitleText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '900',
  },
  surrenderBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  surrenderBtnText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    marginTop: 'auto',
  },
  statusLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    marginRight: 6,
  },
  statusValue: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  aiCalculatingText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  promoModalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    width: '92%',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  promoModalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  promoModalSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  promoOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  promoOptionBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  promoOptionEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  promoOptionTitle: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  promoOptionType: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  resultModalContent: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '90%',
    borderWidth: 2,
    borderColor: '#334155',
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  resultDesc: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 18,
  },
  mmrResultBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  mmrResultLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  mmrDeltaText: {
    fontSize: 32,
    fontWeight: '900',
  },
  newMmrText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  resultContinueBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  resultContinueBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
