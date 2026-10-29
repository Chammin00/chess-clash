import { ChessGameState } from '../chessEngine';
import { Move } from '../types';
import { StockfishModel } from './stockfishModel';

interface MCTSNode {
  state: ChessGameState;
  move: Move | null;
  parent: MCTSNode | null;
  children: MCTSNode[];
  visits: number;
  totalValue: number; // accumulated value from White's perspective
  prior: number;
}

export class AlphaZeroModel {
  static readonly C_PUCT = 1.414; // Exploration constant

  /**
   * Replicates AlphaZero / Leela Chess Zero (Lc0) MCTS search:
   * Uses Monte Carlo Tree Search with UCB1 exploration and policy-value evaluations.
   */
  static searchBestMove(
    rootState: ChessGameState,
    simulations: number = 80,
    maxTimeMs: number = 1000
  ): { bestMove: Move | null; winRate: number; simulationsRun: number } {
    const rootLegalMoves = rootState.getAllLegalMoves();
    if (rootLegalMoves.length === 0) {
      return { bestMove: null, winRate: 0.5, simulationsRun: 0 };
    }
    if (rootLegalMoves.length === 1) {
      return { bestMove: rootLegalMoves[0], winRate: 0.5, simulationsRun: 1 };
    }

    const rootNode: MCTSNode = {
      state: rootState.clone(),
      move: null,
      parent: null,
      children: [],
      visits: 0,
      totalValue: 0,
      prior: 1.0,
    };

    // Expand root node
    this.expand(rootNode);

    const startTime = Date.now();
    let simCount = 0;

    while (simCount < simulations && Date.now() - startTime < maxTimeMs) {
      // 1. Selection
      let current = rootNode;
      while (current.children.length > 0) {
        current = this.selectBestChild(current);
      }

      // 2. Expansion
      if (current.visits > 0 && current.state.status === 'ongoing') {
        this.expand(current);
        if (current.children.length > 0) {
          current = current.children[0];
        }
      }

      // 3. Evaluation (Value Network replication scaled -1.0 to 1.0)
      const rawEval = StockfishModel.evaluate(current.state);
      // Squash centipawns to [-1, 1] using tanh sigmoid
      const leafValue = Math.tanh(rawEval / 600);

      // 4. Backpropagation
      let node: MCTSNode | null = current;
      while (node !== null) {
        node.visits += 1;
        node.totalValue += leafValue;
        node = node.parent;
      }

      simCount++;
    }

    // Select child with highest visit count (most robust move)
    let bestChild = rootNode.children[0];
    let maxVisits = -1;

    for (const child of rootNode.children) {
      if (child.visits > maxVisits) {
        maxVisits = child.visits;
        bestChild = child;
      }
    }

    const averageValue = bestChild.visits > 0 ? bestChild.totalValue / bestChild.visits : 0;
    // Map [-1, 1] to win probability [0, 1]
    const winRate = (averageValue + 1) / 2;

    return {
      bestMove: bestChild.move,
      winRate,
      simulationsRun: simCount,
    };
  }

  private static selectBestChild(node: MCTSNode): MCTSNode {
    const isWhite = node.state.turn === 'white';
    let bestChild = node.children[0];
    let bestScore = -Infinity;

    const parentVisitsSqrt = Math.sqrt(Math.max(1, node.visits));

    for (const child of node.children) {
      // Q(s, a): average value from perspective of moving player
      const qValue = child.visits > 0 ? (child.totalValue / child.visits) * (isWhite ? 1 : -1) : 0;
      // U(s, a): exploration bonus
      const uValue = this.C_PUCT * child.prior * (parentVisitsSqrt / (1 + child.visits));
      const score = qValue + uValue;

      if (score > bestScore) {
        bestScore = score;
        bestChild = child;
      }
    }

    return bestChild;
  }

  private static expand(node: MCTSNode): void {
    const moves = node.state.getAllLegalMoves();
    if (moves.length === 0) return;

    // Prior computation (captures and center moves get higher prior)
    const scored = moves.map((m) => {
      let prior = 1.0;
      if (m.captured) prior += 2.0;
      if (m.isCastling) prior += 1.5;
      if (m.to.row >= 3 && m.to.row <= 4 && m.to.col >= 3 && m.to.col <= 4) prior += 1.0;
      return { move: m, prior };
    });

    const sumPrior = scored.reduce((sum, item) => sum + item.prior, 0);

    node.children = scored.map(({ move, prior }) => {
      const nextState = node.state.clone();
      nextState.applyMoveFast(move);
      return {
        state: nextState,
        move,
        parent: node,
        children: [],
        visits: 0,
        totalValue: 0,
        prior: prior / sumPrior,
      };
    });
  }
}
