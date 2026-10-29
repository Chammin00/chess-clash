import { ChessGameState } from '../chessEngine';
import { ChessPiece, Move, PieceType, PlayerColor } from '../types';

// Stockfish PeSTO Piece-Square Tables (White perspective; flipped for Black)
const PAWN_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_PST = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const BISHOP_PST = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const ROOK_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
];

const QUEEN_PST = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

const KING_MIDGAME_PST = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

export class StockfishModel {
  static getPieceValue(type: PieceType): number {
    return PIECE_VALUES[type] || 0;
  }

  static getPSTValue(piece: ChessPiece, row: number, col: number): number {
    const tableRow = piece.color === 'white' ? row : 7 - row;
    const tableCol = piece.color === 'white' ? col : col;

    switch (piece.type) {
      case 'pawn': return PAWN_PST[tableRow][tableCol];
      case 'knight': return KNIGHT_PST[tableRow][tableCol];
      case 'bishop': return BISHOP_PST[tableRow][tableCol];
      case 'rook': return ROOK_PST[tableRow][tableCol];
      case 'queen': return QUEEN_PST[tableRow][tableCol];
      case 'king': return KING_MIDGAME_PST[tableRow][tableCol];
      default: return 0;
    }
  }

  /**
   * Static Evaluation Function in centipawns from White's perspective (+ = White advantage, - = Black advantage)
   */
  static evaluate(state: ChessGameState): number {
    if (state.status === 'checkmate') {
      return state.turn === 'white' ? -99999 : 99999;
    }
    if (state.status === 'stalemate' || state.status.startsWith('draw')) {
      return 0;
    }

    let whiteMaterial = 0;
    let blackMaterial = 0;
    let whitePST = 0;
    let blackPST = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = state.board[r][c];
        if (!piece) continue;

        const val = this.getPieceValue(piece.type);
        const pst = this.getPSTValue(piece, r, c);

        if (piece.color === 'white') {
          whiteMaterial += val;
          whitePST += pst;
        } else {
          blackMaterial += val;
          blackPST += pst;
        }
      }
    }

    const materialScore = whiteMaterial - blackMaterial;
    const pstScore = whitePST - blackPST;

    // Small mobility encouragement (5 centipawns per available move)
    const activeMoves = state.getAllLegalMoves();
    const mobilityBonus = (state.turn === 'white' ? 1 : -1) * (activeMoves.length * 4);

    return materialScore + pstScore + mobilityBonus;
  }

  /**
   * MVV-LVA (Most Valuable Victim - Least Valuable Attacker) move sorting
   */
  static orderMoves(moves: Move[]): Move[] {
    return [...moves].sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (a.captured) {
        scoreA = this.getPieceValue(a.captured.type) * 10 - this.getPieceValue(a.piece.type);
      }
      if (a.promotion) {
        scoreA += this.getPieceValue(a.promotion);
      }
      if (a.isCastling) {
        scoreA += 60;
      }

      if (b.captured) {
        scoreB = this.getPieceValue(b.captured.type) * 10 - this.getPieceValue(b.piece.type);
      }
      if (b.promotion) {
        scoreB += this.getPieceValue(b.promotion);
      }
      if (b.isCastling) {
        scoreB += 60;
      }

      return scoreB - scoreA;
    });
  }

  /**
   * Quiescence Search: Tactical captures extension to avoid the Horizon Effect
   */
  static quiescence(
    state: ChessGameState,
    alpha: number,
    beta: number,
    colorSign: number,
    depthLeft: number = 3
  ): number {
    const standPat = colorSign * this.evaluate(state);

    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;
    if (depthLeft <= 0) return standPat;

    // Only examine capture moves
    const allMoves = state.getAllLegalMoves();
    const captureMoves = this.orderMoves(allMoves.filter((m) => m.captured !== undefined));

    for (const move of captureMoves) {
      const clone = state.clone();
      clone.applyMoveFast(move);
      const score = -this.quiescence(clone, -beta, -alpha, -colorSign, depthLeft - 1);

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  }

  /**
   * Minimax with Alpha-Beta Pruning
   */
  static alphaBeta(
    state: ChessGameState,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    startTime: number,
    maxTimeMs: number
  ): number {
    if (Date.now() - startTime > maxTimeMs) {
      return this.evaluate(state);
    }

    if (depth <= 0) {
      return this.quiescence(state, alpha, beta, isMaximizing ? 1 : -1, 3);
    }

    const moves = this.orderMoves(state.getAllLegalMoves());
    if (moves.length === 0) {
      if (state.isKingInCheck(state.turn)) {
        return isMaximizing ? -90000 - depth : 90000 + depth;
      }
      return 0; // Stalemate
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const nextState = state.clone();
        nextState.applyMoveFast(move);
        const evalScore = this.alphaBeta(nextState, depth - 1, alpha, beta, false, startTime, maxTimeMs);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break; // Beta cutoff
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const nextState = state.clone();
        nextState.applyMoveFast(move);
        const evalScore = this.alphaBeta(nextState, depth - 1, alpha, beta, true, startTime, maxTimeMs);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break; // Alpha cutoff
      }
      return minEval;
    }
  }

  /**
   * Search for Best Move using Iterative Deepening
   */
  static searchBestMove(
    state: ChessGameState,
    targetDepth: number = 3,
    maxTimeMs: number = 1000
  ): { bestMove: Move | null; score: number; depthReached: number } {
    const legalMoves = this.orderMoves(state.getAllLegalMoves());
    if (legalMoves.length === 0) {
      return { bestMove: null, score: 0, depthReached: 0 };
    }

    if (legalMoves.length === 1) {
      return { bestMove: legalMoves[0], score: this.evaluate(state), depthReached: 1 };
    }

    const isWhite = state.turn === 'white';
    const startTime = Date.now();
    let overallBestMove = legalMoves[0];
    let overallScore = 0;
    let depthCompleted = 1;

    // Iterative deepening from depth 1 to targetDepth
    for (let currentDepth = 1; currentDepth <= targetDepth; currentDepth++) {
      let currentBestMove = legalMoves[0];
      let bestScore = isWhite ? -Infinity : Infinity;
      let alpha = -Infinity;
      let beta = Infinity;

      for (const move of legalMoves) {
        const nextState = state.clone();
        nextState.applyMoveFast(move);

        const score = this.alphaBeta(
          nextState,
          currentDepth - 1,
          alpha,
          beta,
          !isWhite,
          startTime,
          maxTimeMs
        );

        if (isWhite) {
          if (score > bestScore) {
            bestScore = score;
            currentBestMove = move;
          }
          alpha = Math.max(alpha, score);
        } else {
          if (score < bestScore) {
            bestScore = score;
            currentBestMove = move;
          }
          beta = Math.min(beta, score);
        }

        if (Date.now() - startTime > maxTimeMs) break;
      }

      overallBestMove = currentBestMove;
      overallScore = bestScore;
      depthCompleted = currentDepth;

      if (Date.now() - startTime > maxTimeMs) break;
    }

    return {
      bestMove: overallBestMove,
      score: overallScore,
      depthReached: depthCompleted,
    };
  }
}
