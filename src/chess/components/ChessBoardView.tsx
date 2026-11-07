import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChessPiece, Move, PlayerColor, Position, ThemeConfig } from '../types';
import { VectorPiece } from './VectorPiece';

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

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
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

  // Screen shake animation on capture / check
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const [particles, setParticles] = useState<Particle[]>([]);

  // Subtle ambient pulse for valid move pathing
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 650,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 650,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Trigger transient hit-stop and micro screen shake (4px with 120ms decay) on capture
  useEffect(() => {
    if (lastMove && lastMove.captured) {
      // 1. Transient Heavy Haptic punch (35ms feel)
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch (_) {}

      // 2. Micro screen shake
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 4, duration: 30, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -4, duration: 30, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 2, duration: 30, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 30, useNativeDriver: true }),
      ]).start();

      // 3. Capture Particle Burst
      const targetCol = isFlipped ? 7 - lastMove.to.col : lastMove.to.col;
      const targetRow = isFlipped ? 7 - lastMove.to.row : lastMove.to.row;
      const originX = targetCol * squareSize + squareSize / 2;
      const originY = targetRow * squareSize + squareSize / 2;

      const newParticles: Particle[] = Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const speed = 12 + Math.random() * 8;
        return {
          id: Date.now() + i,
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: theme.attackHighlightColor || '#EF4444',
        };
      });
      setParticles(newParticles);
      const timer = setTimeout(() => setParticles([]), 280);
      return () => clearTimeout(timer);
    }
  }, [lastMove]);

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

  const handleSquarePress = (pos: Position) => {
    // Kinesthetic touch-down feedback: 12ms ultra-light haptic tap
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (_) {}

    // Check if target move is a capture for hit-stop pause
    const isTargetCapture = validMoves.some(
      (m) => m.to.row === pos.row && m.to.col === pos.col && m.captured !== undefined
    );

    if (isTargetCapture) {
      // 4-frame (66ms) hit-stop freeze delay before state commit
      setTimeout(() => {
        onSquarePress(pos);
      }, 66);
    } else {
      onSquarePress(pos);
    }
  };

  const renderSquare = (displayRow: number, displayCol: number) => {
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

    // High-contrast tactile square backgrounds
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

    return (
      <TouchableOpacity
        key={`sq_${row}_${col}`}
        activeOpacity={0.88}
        disabled={disabled}
        onPress={() => handleSquarePress({ row, col })}
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

        {/* Handcrafted Vector Piece Renderer (Zero Emojis) */}
        {piece && (
          <VectorPiece
            type={piece.type}
            color={piece.color}
            size={squareSize * 0.86}
            themeId={theme.id}
            isLifted={isSelected}
          />
        )}

        {/* Tactical Valid Move Indicator (Pulsing Dot) */}
        {isValidTarget && !isCapture && (
          <Animated.View
            style={[
              styles.moveDot,
              {
                backgroundColor: theme.accentColor || '#38BDF8',
                opacity: pulseAnim,
              },
            ]}
          />
        )}

        {/* High-Contrast Capture Reticle with Occlusion Offset */}
        {isCapture && (
          <View
            style={[
              styles.captureRing,
              {
                width: squareSize * 0.90,
                height: squareSize * 0.90,
                borderColor: theme.attackHighlightColor || '#EF4444',
              },
            ]}
          >
            <View
              style={[
                styles.captureCornerMarker,
                { borderColor: theme.attackHighlightColor || '#EF4444' },
              ]}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View
      style={[
        styles.boardWrapper,
        {
          width: boardSize,
          height: boardSize,
          transform: [{ translateX: shakeAnim }],
        },
      ]}
    >
      <View style={styles.boardBorder}>
        {Array.from({ length: 8 }).map((_, r) => (
          <View key={`row_${r}`} style={styles.boardRow}>
            {Array.from({ length: 8 }).map((_, c) => renderSquare(r, c))}
          </View>
        ))}
      </View>

      {/* Capture Particle FX Layer */}
      {particles.map((p) => (
        <View
          key={p.id}
          style={[
            styles.particle,
            {
              left: p.x + p.vx,
              top: p.y + p.vy,
              backgroundColor: p.color,
            },
          ]}
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  boardWrapper: {
    alignSelf: 'center',
    marginVertical: 8,
    borderRadius: 10,
    padding: 4,
    backgroundColor: '#090D16',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.65,
    shadowRadius: 14,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
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
  moveDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  captureRing: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 2.5,
    backgroundColor: 'rgba(239, 68, 68, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureCornerMarker: {
    width: '60%',
    height: '60%',
    borderWidth: 1.5,
    borderRadius: 4,
    borderStyle: 'dashed',
  },
  coordRank: {
    position: 'absolute',
    top: 2,
    left: 3,
    fontSize: 10,
    fontWeight: '800',
    opacity: 0.85,
  },
  coordFile: {
    position: 'absolute',
    bottom: 2,
    right: 3,
    fontSize: 10,
    fontWeight: '800',
    opacity: 0.85,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.85,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
});
