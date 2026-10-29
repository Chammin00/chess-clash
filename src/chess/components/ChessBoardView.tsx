import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { ChessPiece, Move, PlayerColor, Position, ThemeConfig } from '../types';

interface ChessBoardViewProps {
  board: (ChessPiece | null)[][];
  theme: ThemeConfig;
  selectedPos: Position | null;
  validMoves: Move[];
  lastMove: Move | null;
  isCheck: boolean;
  playerColor: PlayerColor;
  turn: PlayerColor;
  disabled?: boolean;
  onSquarePress: (pos: Position) => void;
}

export const ChessBoardView: React.FC<ChessBoardViewProps> = ({
  board,
  theme,
  selectedPos,
  validMoves,
  lastMove,
  isCheck,
  playerColor,
  turn,
  disabled = false,
  onSquarePress,
}) => {
  const { width } = useWindowDimensions();
  const boardSize = Math.min(width - 24, 400);
  const squareSize = Math.floor(boardSize / 8);

  const isFlipped = playerColor === 'black';

  // Find King in check position to highlight
  let checkKingPos: Position | null = null;
  if (isCheck) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'king' && piece.color === turn) {
          checkKingPos = { row: r, col: c };
          break;
        }
      }
      if (checkKingPos) break;
    }
  }

  const renderSquare = (displayRow: number, displayCol: number) => {
    // If board is flipped for black perspective
    const row = isFlipped ? 7 - displayRow : displayRow;
    const col = isFlipped ? 7 - displayCol : displayCol;

    const piece = board[row][col];
    const isLight = (row + col) % 2 === 0;

    const isSelected = selectedPos?.row === row && selectedPos?.col === col;
    const isLastMoveSource = lastMove?.from.row === row && lastMove?.from.col === col;
    const isLastMoveDest = lastMove?.to.row === row && lastMove?.to.col === col;
    const isInCheckKing = checkKingPos?.row === row && checkKingPos?.col === col;

    // Check if this square is a valid target move
    const targetMove = validMoves.find((m) => m.to.row === row && m.to.col === col);
    const isValidTarget = targetMove !== undefined;
    const isCapture = isValidTarget && targetMove.captured !== undefined;

    // Base square background
    let bg = isLight ? theme.lightSquareColor : theme.darkSquareColor;
    if (isLastMoveSource || isLastMoveDest) {
      bg = theme.highlightColor + '77';
    }
    if (isSelected) {
      bg = theme.primaryColor + 'AA';
    }
    if (isInCheckKing) {
      bg = '#EF4444DD';
    }

    const pieceLore = piece ? theme.pieces[piece.type] : null;

    return (
      <TouchableOpacity
        key={`sq_${row}_${col}`}
        activeOpacity={0.8}
        disabled={disabled}
        onPress={() => onSquarePress({ row, col })}
        style={[
          styles.square,
          {
            width: squareSize,
            height: squareSize,
            backgroundColor: bg,
          },
        ]}
      >
        {/* Coordinate labels on borders */}
        {displayCol === 0 && (
          <Text style={[styles.coordRank, { color: isLight ? '#4B5563' : '#9CA3AF' }]}>
            {8 - row}
          </Text>
        )}
        {displayRow === 7 && (
          <Text style={[styles.coordFile, { color: isLight ? '#4B5563' : '#9CA3AF' }]}>
            {String.fromCharCode(97 + col)}
          </Text>
        )}

        {/* Piece Icon & Color Badge */}
        {piece && pieceLore && (
          <View style={styles.pieceContainer}>
            <Text
              style={[
                styles.pieceEmoji,
                {
                  fontSize: squareSize * 0.52,
                  transform: [{ scale: piece.color === 'white' ? 1.0 : 0.95 }],
                },
              ]}
            >
              {pieceLore.icon}
            </Text>
            {/* Color alignment indicator ring */}
            <View
              style={[
                styles.colorDot,
                {
                  backgroundColor: piece.color === 'white' ? '#FFFFFF' : '#111827',
                  borderColor: piece.color === 'white' ? '#9CA3AF' : '#E5E7EB',
                },
              ]}
            />
          </View>
        )}

        {/* Move Target Indicator */}
        {isValidTarget && !isCapture && (
          <View
            style={[
              styles.moveDot,
              { backgroundColor: theme.accentColor || '#38BDF8' },
            ]}
          />
        )}

        {/* Capture Target Ring */}
        {isCapture && (
          <View
            style={[
              styles.captureRing,
              {
                width: squareSize * 0.88,
                height: squareSize * 0.88,
                borderColor: theme.attackHighlightColor || '#EF4444',
              },
            ]}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.boardWrapper, { width: boardSize, height: boardSize }]}>
      <View style={styles.boardBorder}>
        {Array.from({ length: 8 }).map((_, r) => (
          <View key={`row_${r}`} style={styles.boardRow}>
            {Array.from({ length: 8 }).map((_, c) => renderSquare(r, c))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  boardWrapper: {
    alignSelf: 'center',
    marginVertical: 8,
    borderRadius: 8,
    padding: 3,
    backgroundColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  boardBorder: {
    flex: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  boardRow: {
    flexDirection: 'row',
  },
  square: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pieceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieceEmoji: {
    textAlign: 'center',
  },
  colorDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    borderWidth: 1.5,
  },
  moveDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.85,
  },
  captureRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 3,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  coordRank: {
    position: 'absolute',
    top: 2,
    left: 2,
    fontSize: 9,
    fontWeight: '700',
  },
  coordFile: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    fontSize: 9,
    fontWeight: '700',
  },
});
