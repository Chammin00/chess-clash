import { ChessPiece, Move, PieceType, PlayerColor, Position, GameStatus } from './types';

export class ChessGameState {
  board: (ChessPiece | null)[][];
  turn: PlayerColor;
  castlingRights: {
    whiteKingside: boolean;
    whiteQueenside: boolean;
    blackKingside: boolean;
    blackQueenside: boolean;
  };
  enPassantTarget: Position | null;
  halfmoveClock: number;
  fullmoveNumber: number;
  moveHistory: Move[];
  positionHistory: string[];
  status: GameStatus;

  constructor() {
    this.board = this.createInitialBoard();
    this.turn = 'white';
    this.castlingRights = {
      whiteKingside: true,
      whiteQueenside: true,
      blackKingside: true,
      blackQueenside: true,
    };
    this.enPassantTarget = null;
    this.halfmoveClock = 0;
    this.fullmoveNumber = 1;
    this.moveHistory = [];
    this.positionHistory = [];
    this.status = 'ongoing';
    this.recordPosition();
  }

  createInitialBoard(): (ChessPiece | null)[][] {
    const board: (ChessPiece | null)[][] = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Place Black Pieces (Row 0: Backrank, Row 1: Pawns)
    const backRowOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

    for (let c = 0; c < 8; c++) {
      board[0][c] = { id: `b_${backRowOrder[c]}_${c}`, type: backRowOrder[c], color: 'black' };
      board[1][c] = { id: `b_pawn_${c}`, type: 'pawn', color: 'black' };
    }

    // Place White Pieces (Row 7: Backrank, Row 6: Pawns)
    for (let c = 0; c < 8; c++) {
      board[6][c] = { id: `w_pawn_${c}`, type: 'pawn', color: 'white' };
      board[7][c] = { id: `w_${backRowOrder[c]}_${c}`, type: backRowOrder[c], color: 'white' };
    }

    return board;
  }

  clone(): ChessGameState {
    const next = new ChessGameState();
    next.board = this.board.map((row) =>
      row.map((piece) => (piece ? { ...piece } : null))
    );
    next.turn = this.turn;
    next.castlingRights = { ...this.castlingRights };
    next.enPassantTarget = this.enPassantTarget ? { ...this.enPassantTarget } : null;
    next.halfmoveClock = this.halfmoveClock;
    next.fullmoveNumber = this.fullmoveNumber;
    next.moveHistory = [...this.moveHistory];
    next.positionHistory = [...this.positionHistory];
    next.status = this.status;
    return next;
  }

  getPiece(pos: Position): ChessPiece | null {
    if (pos.row < 0 || pos.row > 7 || pos.col < 0 || pos.col > 7) return null;
    return this.board[pos.row][pos.col];
  }

  findKing(color: PlayerColor): Position | null {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.type === 'king' && piece.color === color) {
          return { row: r, col: c };
        }
      }
    }
    return null;
  }

  isSquareAttackedBy(pos: Position, attackerColor: PlayerColor): boolean {
    // 1. Knight attacks
    const knightOffsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];
    for (const [dr, dc] of knightOffsets) {
      const nr = pos.row + dr;
      const nc = pos.col + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const p = this.board[nr][nc];
        if (p && p.color === attackerColor && p.type === 'knight') return true;
      }
    }

    // 2. Pawn attacks
    const pawnRowOffset = attackerColor === 'white' ? 1 : -1;
    for (const dc of [-1, 1]) {
      const pr = pos.row + pawnRowOffset;
      const pc = pos.col + dc;
      if (pr >= 0 && pr < 8 && pc >= 0 && pc < 8) {
        const p = this.board[pr][pc];
        if (p && p.color === attackerColor && p.type === 'pawn') return true;
      }
    }

    // 3. King attacks (1 square around)
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const kr = pos.row + dr;
        const kc = pos.col + dc;
        if (kr >= 0 && kr < 8 && kc >= 0 && kc < 8) {
          const p = this.board[kr][kc];
          if (p && p.color === attackerColor && p.type === 'king') return true;
        }
      }
    }

    // 4. Straight line attacks (Rook, Queen)
    const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of straightDirs) {
      let r = pos.row + dr;
      let c = pos.col + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const p = this.board[r][c];
        if (p) {
          if (p.color === attackerColor && (p.type === 'rook' || p.type === 'queen')) {
            return true;
          }
          break; // blocked by piece
        }
        r += dr;
        c += dc;
      }
    }

    // 5. Diagonal attacks (Bishop, Queen)
    const diagonalDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of diagonalDirs) {
      let r = pos.row + dr;
      let c = pos.col + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const p = this.board[r][c];
        if (p) {
          if (p.color === attackerColor && (p.type === 'bishop' || p.type === 'queen')) {
            return true;
          }
          break; // blocked
        }
        r += dr;
        c += dc;
      }
    }

    return false;
  }

  isKingInCheck(color: PlayerColor): boolean {
    const kingPos = this.findKing(color);
    if (!kingPos) return false;
    const opponentColor = color === 'white' ? 'black' : 'white';
    return this.isSquareAttackedBy(kingPos, opponentColor);
  }

  generatePseudoLegalMoves(pos: Position): Move[] {
    const piece = this.getPiece(pos);
    if (!piece || piece.color !== this.turn) return [];

    const moves: Move[] = [];
    const { row, col } = pos;
    const opponent = this.turn === 'white' ? 'black' : 'white';

    switch (piece.type) {
      case 'pawn': {
        const dir = this.turn === 'white' ? -1 : 1;
        const startRow = this.turn === 'white' ? 6 : 1;
        const promoRow = this.turn === 'white' ? 0 : 7;

        // 1 step forward
        const oneFwd = { row: row + dir, col };
        if (oneFwd.row >= 0 && oneFwd.row < 8 && !this.board[oneFwd.row][col]) {
          if (oneFwd.row === promoRow) {
            ['queen', 'rook', 'bishop', 'knight'].forEach((promo) => {
              moves.push({
                from: pos,
                to: oneFwd,
                piece,
                promotion: promo as PieceType,
                san: '',
              });
            });
          } else {
            moves.push({ from: pos, to: oneFwd, piece, san: '' });
          }

          // 2 steps forward from starting row
          const twoFwd = { row: row + 2 * dir, col };
          if (row === startRow && !this.board[twoFwd.row][col]) {
            moves.push({ from: pos, to: twoFwd, piece, san: '' });
          }
        }

        // Diagonal captures
        for (const dc of [-1, 1]) {
          const capPos = { row: row + dir, col: col + dc };
          if (capPos.row >= 0 && capPos.row < 8 && capPos.col >= 0 && capPos.col < 8) {
            const target = this.board[capPos.row][capPos.col];
            if (target && target.color === opponent) {
              if (capPos.row === promoRow) {
                ['queen', 'rook', 'bishop', 'knight'].forEach((promo) => {
                  moves.push({
                    from: pos,
                    to: capPos,
                    piece,
                    captured: target,
                    promotion: promo as PieceType,
                    san: '',
                  });
                });
              } else {
                moves.push({ from: pos, to: capPos, piece, captured: target, san: '' });
              }
            } else if (
              this.enPassantTarget &&
              this.enPassantTarget.row === capPos.row &&
              this.enPassantTarget.col === capPos.col
            ) {
              // En Passant capture
              const capturedPawn = this.board[row][capPos.col];
              if (capturedPawn && capturedPawn.color === opponent) {
                moves.push({
                  from: pos,
                  to: capPos,
                  piece,
                  captured: capturedPawn,
                  isEnPassant: true,
                  san: '',
                });
              }
            }
          }
        }
        break;
      }

      case 'knight': {
        const offsets = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1],
        ];
        for (const [dr, dc] of offsets) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const destPiece = this.board[nr][nc];
            if (!destPiece) {
              moves.push({ from: pos, to: { row: nr, col: nc }, piece, san: '' });
            } else if (destPiece.color === opponent) {
              moves.push({ from: pos, to: { row: nr, col: nc }, piece, captured: destPiece, san: '' });
            }
          }
        }
        break;
      }

      case 'bishop':
      case 'rook':
      case 'queen': {
        const directions: number[][] = [];
        if (piece.type === 'rook' || piece.type === 'queen') {
          directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
        }
        if (piece.type === 'bishop' || piece.type === 'queen') {
          directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
        }

        for (const [dr, dc] of directions) {
          let r = row + dr;
          let c = col + dc;
          while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const destPiece = this.board[r][c];
            if (!destPiece) {
              moves.push({ from: pos, to: { row: r, col: c }, piece, san: '' });
            } else {
              if (destPiece.color === opponent) {
                moves.push({ from: pos, to: { row: r, col: c }, piece, captured: destPiece, san: '' });
              }
              break; // blocked
            }
            r += dr;
            c += dc;
          }
        }
        break;
      }

      case 'king': {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
              const destPiece = this.board[nr][nc];
              if (!destPiece) {
                moves.push({ from: pos, to: { row: nr, col: nc }, piece, san: '' });
              } else if (destPiece.color === opponent) {
                moves.push({ from: pos, to: { row: nr, col: nc }, piece, captured: destPiece, san: '' });
              }
            }
          }
        }

        // Castling
        if (!piece.hasMoved && !this.isKingInCheck(this.turn)) {
          const r = row;
          // Kingside
          const canKingside =
            this.turn === 'white' ? this.castlingRights.whiteKingside : this.castlingRights.blackKingside;
          if (
            canKingside &&
            !this.board[r][5] &&
            !this.board[r][6] &&
            !this.isSquareAttackedBy({ row: r, col: 5 }, opponent) &&
            !this.isSquareAttackedBy({ row: r, col: 6 }, opponent)
          ) {
            const rook = this.board[r][7];
            if (rook && rook.type === 'rook' && !rook.hasMoved) {
              moves.push({
                from: pos,
                to: { row: r, col: 6 },
                piece,
                isCastling: 'kingside',
                san: 'O-O',
              });
            }
          }

          // Queenside
          const canQueenside =
            this.turn === 'white' ? this.castlingRights.whiteQueenside : this.castlingRights.blackQueenside;
          if (
            canQueenside &&
            !this.board[r][1] &&
            !this.board[r][2] &&
            !this.board[r][3] &&
            !this.isSquareAttackedBy({ row: r, col: 2 }, opponent) &&
            !this.isSquareAttackedBy({ row: r, col: 3 }, opponent)
          ) {
            const rook = this.board[r][0];
            if (rook && rook.type === 'rook' && !rook.hasMoved) {
              moves.push({
                from: pos,
                to: { row: r, col: 2 },
                piece,
                isCastling: 'queenside',
                san: 'O-O-O',
              });
            }
          }
        }
        break;
      }
    }

    return moves;
  }

  getLegalMovesForSquare(pos: Position): Move[] {
    const pseudoMoves = this.generatePseudoLegalMoves(pos);
    return pseudoMoves.filter((move) => {
      const cloned = this.clone();
      cloned.applyMoveFast(move);
      return !cloned.isKingInCheck(this.turn);
    });
  }

  getAllLegalMoves(): Move[] {
    const legalMoves: Move[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.color === this.turn) {
          const moves = this.getLegalMovesForSquare({ row: r, col: c });
          legalMoves.push(...moves);
        }
      }
    }
    return legalMoves;
  }

  // Fast move application without full validation (for engine search and clone checking)
  applyMoveFast(move: Move): void {
    const { from, to, piece, captured, isEnPassant, isCastling, promotion } = move;

    // Remove moving piece from origin
    this.board[from.row][from.col] = null;

    // Handle en passant capture removal
    if (isEnPassant && captured) {
      this.board[from.row][to.col] = null;
    }

    // Handle castling rook movement
    if (isCastling === 'kingside') {
      const rook = this.board[from.row][7];
      this.board[from.row][7] = null;
      this.board[from.row][5] = rook ? { ...rook, hasMoved: true } : null;
    } else if (isCastling === 'queenside') {
      const rook = this.board[from.row][0];
      this.board[from.row][0] = null;
      this.board[from.row][3] = rook ? { ...rook, hasMoved: true } : null;
    }

    // Place piece on destination
    const updatedPiece: ChessPiece = {
      ...piece,
      type: promotion || piece.type,
      hasMoved: true,
    };
    this.board[to.row][to.col] = updatedPiece;

    // Update En Passant target
    if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
      this.enPassantTarget = {
        row: (from.row + to.row) / 2,
        col: from.col,
      };
    } else {
      this.enPassantTarget = null;
    }

    // Invalidate castling rights
    if (piece.type === 'king') {
      if (piece.color === 'white') {
        this.castlingRights.whiteKingside = false;
        this.castlingRights.whiteQueenside = false;
      } else {
        this.castlingRights.blackKingside = false;
        this.castlingRights.blackQueenside = false;
      }
    } else if (piece.type === 'rook') {
      if (from.row === 7 && from.col === 0) this.castlingRights.whiteQueenside = false;
      if (from.row === 7 && from.col === 7) this.castlingRights.whiteKingside = false;
      if (from.row === 0 && from.col === 0) this.castlingRights.blackQueenside = false;
      if (from.row === 0 && from.col === 7) this.castlingRights.blackKingside = false;
    }

    // Switch turns
    this.turn = this.turn === 'white' ? 'black' : 'white';
  }

  makeMove(move: Move): boolean {
    const formattedSan = this.formatSAN(move);
    move.san = formattedSan;

    this.applyMoveFast(move);

    if (move.piece.type === 'pawn' || move.captured) {
      this.halfmoveClock = 0;
    } else {
      this.halfmoveClock++;
    }

    if (this.turn === 'white') {
      this.fullmoveNumber++;
    }

    this.moveHistory.push(move);
    this.recordPosition();
    this.updateGameStatus();

    return true;
  }

  formatSAN(move: Move): string {
    if (move.isCastling === 'kingside') return 'O-O';
    if (move.isCastling === 'queenside') return 'O-O-O';

    const colNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const rowNames = ['8', '7', '6', '5', '4', '3', '2', '1'];

    let piecePrefix = '';
    switch (move.piece.type) {
      case 'king': piecePrefix = 'K'; break;
      case 'queen': piecePrefix = 'Q'; break;
      case 'rook': piecePrefix = 'R'; break;
      case 'bishop': piecePrefix = 'B'; break;
      case 'knight': piecePrefix = 'N'; break;
      case 'pawn': piecePrefix = move.captured ? colNames[move.from.col] : ''; break;
    }

    const captureSymbol = move.captured ? 'x' : '';
    const dest = `${colNames[move.to.col]}${rowNames[move.to.row]}`;
    const promo = move.promotion ? `=${move.promotion[0].toUpperCase()}` : '';

    return `${piecePrefix}${captureSymbol}${dest}${promo}`;
  }

  recordPosition(): void {
    const key = this.getPositionFenKey();
    this.positionHistory.push(key);
  }

  getPositionFenKey(): string {
    let s = '';
    for (let r = 0; r < 8; r++) {
      let emptyCount = 0;
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (!piece) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            s += emptyCount;
            emptyCount = 0;
          }
          const char = piece.type === 'knight' ? 'n' : piece.type[0];
          s += piece.color === 'white' ? char.toUpperCase() : char.toLowerCase();
        }
      }
      if (emptyCount > 0) s += emptyCount;
      if (r < 7) s += '/';
    }
    s += ` ${this.turn}`;
    s += ` ${this.castlingRights.whiteKingside ? 'K' : ''}${this.castlingRights.whiteQueenside ? 'Q' : ''}${this.castlingRights.blackKingside ? 'k' : ''}${this.castlingRights.blackQueenside ? 'q' : ''}`;
    return s;
  }

  updateGameStatus(): void {
    const moves = this.getAllLegalMoves();
    const inCheck = this.isKingInCheck(this.turn);

    if (moves.length === 0) {
      if (inCheck) {
        this.status = 'checkmate';
      } else {
        this.status = 'stalemate';
      }
      return;
    }

    if (inCheck) {
      this.status = 'check';
      return;
    }

    if (this.halfmoveClock >= 100) {
      this.status = 'draw_agreement';
      return;
    }

    // Check threefold repetition
    const currentKey = this.getPositionFenKey();
    const occurrences = this.positionHistory.filter((k) => k === currentKey).length;
    if (occurrences >= 3) {
      this.status = 'draw_repetition';
      return;
    }

    // Check insufficient material
    if (this.isInsufficientMaterial()) {
      this.status = 'draw_material';
      return;
    }

    this.status = 'ongoing';
  }

  isInsufficientMaterial(): boolean {
    const pieces: ChessPiece[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.board[r][c];
        if (p) pieces.push(p);
      }
    }

    // King vs King
    if (pieces.length === 2) return true;

    // King + Bishop vs King OR King + Knight vs King
    if (pieces.length === 3) {
      const nonKings = pieces.filter((p) => p.type !== 'king');
      if (nonKings.length === 1 && (nonKings[0].type === 'bishop' || nonKings[0].type === 'knight')) {
        return true;
      }
    }

    return false;
  }

  getCapturedPieces(): { white: ChessPiece[]; black: ChessPiece[] } {
    const captured = { white: [] as ChessPiece[], black: [] as ChessPiece[] };
    for (const move of this.moveHistory) {
      if (move.captured) {
        if (move.captured.color === 'white') {
          captured.white.push(move.captured);
        } else {
          captured.black.push(move.captured);
        }
      }
    }
    return captured;
  }
}
