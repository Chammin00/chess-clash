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
import { VectorPiece } from '../components/VectorPiece';
import { ChessMMRService } from '../services/chessMMRService';
import { CampaignStage, PowerupItemId } from '../campaign/types';
import { CampaignService } from '../campaign/campaignService';
import { CampaignInventoryBar } from '../components/CampaignInventoryBar';

interface ChessPlayScreenProps {
  themeId: GameThemeId;
  opponent: ChessBotProfile;
  isPassAndPlay?: boolean;
  campaignStage?: CampaignStage;
  onGameEnd: () => void;
  onExit: () => void;
}

export const ChessPlayScreen: React.FC<ChessPlayScreenProps> = ({
  themeId,
  opponent,
  isPassAndPlay = false,
  campaignStage,
  onGameEnd,
  onExit,
}) => {
  const theme = THEME_CONFIGS[themeId];
  const [gameState, setGameState] = useState<ChessGameState>(() => new ChessGameState(themeId));
  const [stateHistory, setStateHistory] = useState<ChessGameState[]>([]);
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [evaluation, setEvaluation] = useState(0);

  // Campaign Powerups & State
  const [campaignInventory, setCampaignInventory] = useState<Record<PowerupItemId, number>>({
    undo_one: 0,
    revert_ten: 0,
    engine_hint: 0,
    king_shield: 0,
    pawn_strike: 0,
  });
  const [itemsUsedCount, setItemsUsedCount] = useState(0);
  const [hintBanner, setHintBanner] = useState<string | null>(null);
  const [campaignClearInfo, setCampaignClearInfo] = useState<{
    starsEarned: number;
    newWorldUnlocked?: string;
    goldEarned: number;
  } | null>(null);

  useEffect(() => {
    if (campaignStage) {
      CampaignService.loadProgress().then((p) => {
        setCampaignInventory(p.inventory);
      });
    }
  }, [campaignStage]);

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
        setStateHistory((prev) => [...prev, gameState.clone()]);
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

    if (campaignStage) {
      const isWin = result === 'win';
      let stars = 0;
      if (isWin) {
        stars = 1;
        const maxMovesCond = campaignStage.starConditions.find((c) => c.type === 'max_moves');
        if (maxMovesCond && state.moveHistory.length <= (maxMovesCond.targetValue || 35)) {
          stars++;
        } else if (!maxMovesCond) {
          stars++;
        }
        if (itemsUsedCount === 0) {
          stars++;
        }
      }

      const goldAwarded = isWin ? campaignStage.rewards.gold : 25;
      const clearRes = await CampaignService.recordStageClear(
        campaignStage.id,
        stars,
        goldAwarded,
        campaignStage.rewards.items
      );

      setCampaignClearInfo({
        starsEarned: stars,
        newWorldUnlocked: clearRes.newWorldUnlocked,
        goldEarned: goldAwarded,
      });

      setGameOverResult({
        result,
        title: isWin ? 'STAGE CLEARED!' : 'STAGE DEFEAT',
        description: isWin
          ? `You conquered ${campaignStage.title}! Earned ${stars} ⭐ Star${stars > 1 ? 's' : ''}.`
          : `${campaignStage.opponent.name} defended the citadel. Use your Hourglasses or Rewinds to try again!`,
        mmrDelta: 0,
        newMmr: 1000,
      });
      return;
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
    setHintBanner(null);
    setStateHistory((prev) => [...prev, gameState.clone()]);
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

  const handleUsePowerup = async (itemId: PowerupItemId) => {
    if (isAiThinking) return;

    if (itemId === 'undo_one') {
      if (stateHistory.length === 0) {
        Alert.alert('No Moves to Undo', 'No moves have been made yet.');
        return;
      }
      const canUse = await CampaignService.useItem('undo_one');
      if (!canUse) return;

      setCampaignInventory((prev) => ({ ...prev, undo_one: Math.max(0, prev.undo_one - 1) }));
      setItemsUsedCount((c) => c + 1);

      const revertSteps = gameState.turn === playerColor && stateHistory.length >= 2 ? 2 : 1;
      const targetIndex = Math.max(0, stateHistory.length - revertSteps);
      const restored = stateHistory[targetIndex].clone();

      setStateHistory((prev) => prev.slice(0, targetIndex));
      setGameState(restored);
      setSelectedPos(null);
      setValidMoves([]);
      setLastMove(restored.moveHistory[restored.moveHistory.length - 1] || null);
      setEvaluation(StockfishModel.evaluate(restored));
      Alert.alert('⌛ Hourglass of Time', 'Time reversed! Your last move was redone.');
      return;
    }

    if (itemId === 'revert_ten') {
      if (stateHistory.length === 0) {
        Alert.alert('No Moves to Revert', 'No moves recorded yet.');
        return;
      }
      const canUse = await CampaignService.useItem('revert_ten');
      if (!canUse) return;

      setCampaignInventory((prev) => ({ ...prev, revert_ten: Math.max(0, prev.revert_ten - 1) }));
      setItemsUsedCount((c) => c + 1);

      // Revert up to 10 half moves (5 full turns)
      const targetIndex = Math.max(0, stateHistory.length - 10);
      const restored = stateHistory[targetIndex].clone();

      setStateHistory((prev) => prev.slice(0, targetIndex));
      setGameState(restored);
      setSelectedPos(null);
      setValidMoves([]);
      setLastMove(restored.moveHistory[restored.moveHistory.length - 1] || null);
      setEvaluation(StockfishModel.evaluate(restored));
      Alert.alert('🌀 Chronos Rewind', `Time leaped backward ${stateHistory.length - targetIndex} half-moves!`);
      return;
    }

    if (itemId === 'engine_hint') {
      const canUse = await CampaignService.useItem('engine_hint');
      if (!canUse) return;

      setCampaignInventory((prev) => ({ ...prev, engine_hint: Math.max(0, prev.engine_hint - 1) }));
      setItemsUsedCount((c) => c + 1);

      const sf = StockfishModel.searchBestMove(gameState, 4, 800);
      if (sf.bestMove) {
        const san = gameState.formatSAN(sf.bestMove);
        setHintBanner(`Stockfish recommends: ${san} (Score: ${sf.score > 0 ? '+' : ''}${(sf.score / 100).toFixed(1)})`);
        setSelectedPos(sf.bestMove.from);
        setValidMoves([sf.bestMove]);
      }
      return;
    }

    if (itemId === 'pawn_strike') {
      let enemyPawnPos: Position | null = null;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = gameState.board[r][c];
          if (p && p.color === 'black' && p.type === 'pawn') {
            enemyPawnPos = { row: r, col: c };
            break;
          }
        }
        if (enemyPawnPos) break;
      }

      if (!enemyPawnPos) {
        Alert.alert('No Enemy Pawns', 'The opponent has no pawns left to smite.');
        return;
      }

      const canUse = await CampaignService.useItem('pawn_strike');
      if (!canUse) return;

      setCampaignInventory((prev) => ({ ...prev, pawn_strike: Math.max(0, prev.pawn_strike - 1) }));
      setItemsUsedCount((c) => c + 1);

      const next = gameState.clone();
      next.board[enemyPawnPos.row][enemyPawnPos.col] = null;
      setGameState(next);
      setEvaluation(StockfishModel.evaluate(next));
      Alert.alert('⚡ Thunderbolt Smite', 'An opposing pawn was struck by divine lightning and vanished!');
      return;
    }

    if (itemId === 'king_shield') {
      const canUse = await CampaignService.useItem('king_shield');
      if (!canUse) return;

      setCampaignInventory((prev) => ({ ...prev, king_shield: Math.max(0, prev.king_shield - 1) }));
      setItemsUsedCount((c) => c + 1);
      Alert.alert('🛡️ Aegis Barrier', 'Your King is granted celestial protection!');
      return;
    }
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

      {/* Tactical Hint Banner */}
      {hintBanner && (
        <View style={styles.hintBannerBox}>
          <Text style={styles.hintBannerText}>{hintBanner}</Text>
        </View>
      )}

      {/* Horizontal Move History Log */}
      <ChessMoveLog moves={gameState.moveHistory} />

      {/* Campaign Powerup Items Bar (Undo 1, Revert 10, Hint, Smite) */}
      {campaignStage && (
        <CampaignInventoryBar
          inventory={campaignInventory}
          onUseItem={handleUsePowerup}
          disabled={!isHumanTurn || isAiThinking}
        />
      )}

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
                    <View style={{ marginBottom: 6 }}>
                      <VectorPiece type={pType} color={playerColor} size={36} />
                    </View>
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

                {/* Campaign Star Crowns Fanfare */}
                {campaignStage && campaignClearInfo && (
                  <View style={styles.campaignStarCrownsRow}>
                    {[1, 2, 3].map((sIdx) => (
                      <Text
                        key={sIdx}
                        style={[
                          styles.bigStarCrown,
                          { opacity: sIdx <= campaignClearInfo.starsEarned ? 1 : 0.25 },
                        ]}
                      >
                        ⭐
                      </Text>
                    ))}
                  </View>
                )}

                <Text style={styles.resultDesc}>{gameOverResult.description}</Text>

                {/* Campaign Unlocks & Gold Banner */}
                {campaignStage && campaignClearInfo && (
                  <View style={styles.campaignRewardSummary}>
                    <Text style={styles.rewardSummaryGold}>
                      🪙 +{campaignClearInfo.goldEarned} Gold Collected
                    </Text>
                    {campaignClearInfo.newWorldUnlocked && (
                      <View style={styles.worldUnlockedBanner}>
                        <Text style={styles.worldUnlockedTitle}>
                          🌟 NEW KINGDOM UNLOCKED!
                        </Text>
                        <Text style={styles.worldUnlockedSub}>
                          The gate to World {campaignClearInfo.newWorldUnlocked.toUpperCase()} has opened!
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* MMR Change Box (For Ranked Mode) */}
                {!campaignStage && !isPassAndPlay && (
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
                  <Text style={styles.resultContinueBtnText}>
                    {campaignStage ? 'Return to World Map' : 'Return to Kingdom Arena'}
                  </Text>
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
  hintBannerBox: {
    backgroundColor: '#064E3B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    marginBottom: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  hintBannerText: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  campaignStarCrownsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 10,
  },
  bigStarCrown: {
    fontSize: 34,
  },
  campaignRewardSummary: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  rewardSummaryGold: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '800',
  },
  worldUnlockedBanner: {
    backgroundColor: '#3B0764',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A855F7',
    marginTop: 8,
    alignItems: 'center',
    width: '100%',
  },
  worldUnlockedTitle: {
    color: '#F0ABFC',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  worldUnlockedSub: {
    color: '#E9D5FF',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
});
