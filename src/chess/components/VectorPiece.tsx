import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { PieceType, PlayerColor, GameThemeId } from '../types';

interface VectorPieceProps {
  type: PieceType;
  color: PlayerColor;
  size: number;
  themeId?: GameThemeId;
  isLifted?: boolean;
}

// Canonical Heraldic SVG Path Definitions for Chess Silhouettes (100x100 viewBox)
const PIECE_PATHS: Record<PieceType, { body: string; detail?: string; crown?: string }> = {
  king: {
    // Regal crown with cross finial and arched base
    body: 'M25 82 L75 82 L72 74 L28 74 Z M30 70 L70 70 L66 52 L34 52 Z M34 50 L66 50 L68 36 L58 42 L50 32 L42 42 L32 36 Z M47 22 L53 22 L53 26 L57 26 L57 30 L53 30 L53 36 L47 36 L47 30 L43 30 L43 26 L47 26 Z M20 86 L80 86 L80 90 L20 90 Z',
    detail: 'M36 60 L64 60 M40 66 L60 66 M50 38 L50 48',
  },
  queen: {
    // 5-point radiant coronet with jeweled orbs and fluted robe
    body: 'M25 82 L75 82 L72 74 L28 74 Z M30 70 L70 70 L65 54 L35 54 Z M32 50 L68 50 L75 32 L60 40 L50 28 L40 40 L25 32 Z M23 28 A3 3 0 1 1 23 27 Z M39 24 A3 3 0 1 1 39 23 Z M50 22 A3 3 0 1 1 50 21 Z M61 24 A3 3 0 1 1 61 23 Z M77 28 A3 3 0 1 1 77 27 Z M20 86 L80 86 L80 90 L20 90 Z',
    detail: 'M35 62 L65 62 M38 68 L62 68',
  },
  rook: {
    // Fortified tower with crenellated battlements and central arrow port
    body: 'M25 82 L75 82 L72 74 L28 74 Z M32 70 L68 70 L66 42 L34 42 Z M30 40 L70 40 L70 24 L62 24 L62 30 L54 30 L54 24 L46 24 L46 30 L38 30 L38 24 L30 24 Z M20 86 L80 86 L80 90 L20 90 Z',
    detail: 'M46 50 L54 50 L54 62 L46 62 Z M35 70 L65 70',
  },
  bishop: {
    // High arched ceremonial miter with cleft apex and pectoral cross
    body: 'M25 82 L75 82 L72 74 L28 74 Z M32 70 L68 70 C68 56 64 42 50 24 C36 42 32 56 32 70 Z M50 20 A3 3 0 1 1 50 19 Z M20 86 L80 86 L80 90 L20 90 Z',
    detail: 'M46 38 L54 38 M50 34 L50 46 M42 46 L58 46 L52 52 L58 58 L42 58',
  },
  knight: {
    // Sculpted warhorse profile with flowing mane, alert muzzle and armored collar
    body: 'M25 82 L75 82 L72 74 L28 74 Z M28 74 C28 66 32 58 35 52 C30 46 28 38 32 30 C34 26 40 22 45 22 C48 22 52 24 55 28 C60 25 66 26 70 32 C74 40 70 54 72 74 Z M35 34 C33 37 34 42 38 45 L42 45 C45 42 48 38 46 34 C44 32 38 31 35 34 Z M20 86 L80 86 L80 90 L20 90 Z',
    detail: 'M40 36 A2 2 0 1 1 40 35 M48 48 C55 52 58 60 62 70 M58 34 C64 40 65 48 68 58',
  },
  pawn: {
    // Vanguard rounded sphere cap with tapered bell collar and wide base
    body: 'M28 82 L72 82 L68 74 L32 74 Z M35 70 L65 70 C63 56 59 48 56 46 C62 42 64 36 62 30 C60 24 54 20 48 20 C42 20 36 24 34 30 C32 36 34 42 40 46 C37 48 33 56 31 70 Z M22 86 L78 86 L78 90 L22 90 Z',
    detail: 'M38 58 L62 58 M42 66 L58 66',
  },
};

export const VectorPiece: React.FC<VectorPieceProps> = ({
  type,
  color,
  size,
  isLifted = false,
}) => {
  const isWhite = color === 'white';
  const pathConfig = PIECE_PATHS[type];

  // High-contrast production values:
  // White piece: High-luminance Ivory (#F8FAFC) with Dark Navy (#0F172A) stroke -> contrast > 10:1
  // Black piece: Rich Obsidian (#1E293B) with Silver-Plated (#E2E8F0) stroke -> contrast > 7:1
  const fillColor = isWhite ? '#F8FAFC' : '#1E293B';
  const strokeColor = isWhite ? '#0F172A' : '#E2E8F0';
  const detailColor = isWhite ? '#334155' : '#CBD5E1';
  const strokeWidth = 2.4;

  if (Platform.OS === 'web') {
    // Crisp SVG Vector rendering on Web / Modern hybrid engines
    return (
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            transform: isLifted ? [{ translateY: -10 }, { scale: 1.12 }] : [{ scale: 1.0 }],
          },
          isLifted && styles.liftedShadow,
        ]}
      >
        <svg
          viewBox="0 0 100 100"
          width={size * 0.88}
          height={size * 0.88}
          style={{ overflow: 'visible', filter: isLifted ? 'drop-shadow(0px 8px 12px rgba(0,0,0,0.5))' : 'drop-shadow(0px 2px 4px rgba(0,0,0,0.25))' }}
        >
          {/* Base Silhouettes with Outer Outline */}
          <path
            d={pathConfig.body}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Internal Heraldic Engravings */}
          {pathConfig.detail && (
            <path
              d={pathConfig.detail}
              fill="none"
              stroke={detailColor}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </View>
    );
  }

  // React Native Native Fallback using stylized geometric icon container
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: isLifted ? [{ translateY: -10 }, { scale: 1.12 }] : [{ scale: 1.0 }],
        },
        isLifted && styles.liftedShadow,
      ]}
    >
      <View
        style={[
          styles.nativePieceBackdrop,
          {
            backgroundColor: fillColor,
            borderColor: strokeColor,
            width: size * 0.76,
            height: size * 0.76,
            borderRadius: type === 'pawn' ? size * 0.38 : 6,
          },
        ]}
      >
        <View style={[styles.innerBadge, { borderColor: detailColor }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  } as any,
  liftedShadow: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 12,
    zIndex: 999,
  },
  nativePieceBackdrop: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  innerBadge: {
    width: '60%',
    height: '60%',
    borderWidth: 1.5,
    borderRadius: 4,
  },
});
