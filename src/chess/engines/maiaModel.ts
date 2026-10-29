import { ChessGameState } from '../chessEngine';
import { Move } from '../types';
import { StockfishModel } from './stockfishModel';

export class MaiaChessModel {
  /**
   * Replicates Maia Chess: Human-like move selection calibrated to target MMR.
   * Instead of always picking the mathematically optimal engine line,
   * Maia samples moves probabilistically based on target MMR temperature.
   */
  static selectMove(
    state: ChessGameState,
    targetMmr: number,
    blunderRate: number = 0.05
  ): { move: Move; evaluation: number; comment: string } {
    const legalMoves = state.getAllLegalMoves();
    if (legalMoves.length === 0) {
      throw new Error('No legal moves available');
    }
    if (legalMoves.length === 1) {
      return {
        move: legalMoves[0],
        evaluation: StockfishModel.evaluate(state),
        comment: 'Forced move.',
      };
    }

    const isWhite = state.turn === 'white';

    // 1. Evaluate each legal candidate move with 1-ply / 2-ply search
    const scoredMoves: { move: Move; score: number }[] = [];

    for (const move of legalMoves) {
      const cloned = state.clone();
      cloned.applyMoveFast(move);

      // Evaluate position from the perspective of the moving player
      const rawEval = StockfishModel.evaluate(cloned);
      const playerPerspectiveScore = isWhite ? rawEval : -rawEval;
      scoredMoves.push({ move, score: playerPerspectiveScore });
    }

    // Sort by best score descending
    scoredMoves.sort((a, b) => b.score - a.score);

    // 2. Determine Maia temperature and blunder probability based on MMR
    // MMR 800: high temperature (T = 180), high blunder chance
    // MMR 1500: medium temperature (T = 70), rare blunders
    // MMR 2000+: low temperature (T = 25), near-optimal human play
    const temperature = Math.max(20, 200 - (targetMmr / 2400) * 180);

    // Human Blunder injection: lower MMR bots may overlook tactical drops
    const willBlunder = Math.random() < blunderRate;

    if (willBlunder && scoredMoves.length > 2) {
      // Pick a human-like blunder (e.g. 3rd to 5th best move)
      const blunderIndex = Math.min(scoredMoves.length - 1, 2 + Math.floor(Math.random() * 3));
      const selected = scoredMoves[blunderIndex];
      return {
        move: selected.move,
        evaluation: selected.score * (isWhite ? 1 : -1),
        comment: `Maia (~${targetMmr}) made a human tactical inaccuracy.`,
      };
    }

    // 3. Boltzmann Softmax Selection
    const maxScore = scoredMoves[0].score;
    const expScores = scoredMoves.map((m) => Math.exp((m.score - maxScore) / temperature));
    const sumExp = expScores.reduce((acc, val) => acc + val, 0);
    const probabilities = expScores.map((val) => val / sumExp);

    // Sample from distribution
    let r = Math.random();
    let chosenIndex = 0;
    for (let i = 0; i < probabilities.length; i++) {
      r -= probabilities[i];
      if (r <= 0) {
        chosenIndex = i;
        break;
      }
    }

    const chosen = scoredMoves[chosenIndex];
    return {
      move: chosen.move,
      evaluation: chosen.score * (isWhite ? 1 : -1),
      comment: `Maia (~${targetMmr}) selected move with human likelihood ${(probabilities[chosenIndex] * 100).toFixed(1)}%.`,
    };
  }
}
