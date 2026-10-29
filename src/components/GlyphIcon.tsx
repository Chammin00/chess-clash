import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

export type GlyphName =
  | 'deck'
  | 'leaderboard'
  | 'shop'
  | 'pass'
  | 'duel'
  | 'gold'
  | 'gem'
  | 'back'
  | 'close'
  | 'refresh'
  | 'surrender'
  | 'check'
  | 'arrow'
  | 'star';

interface Props {
  name: GlyphName;
  size?: number;
  color?: string;
  style?: TextStyle;
}

const GLYPH_MAP: Record<GlyphName, string> = {
  deck: '🎴',
  leaderboard: '🏆',
  shop: '🛍️',
  pass: '📜',
  duel: '⚔️',
  gold: '🪙',
  gem: '💎',
  back: '‹',
  close: '✕',
  refresh: '⟳',
  surrender: '⚐',
  check: '✓',
  arrow: '➔',
  star: '★',
};

/**
 * GlyphIcon
 * Provides crisp, consistent glyphs for navigation and utility actions,
 * avoiding heavy 3D icon clutter in functional interfaces.
 */
export const GlyphIcon: React.FC<Props> = ({
  name,
  size = 16,
  color = '#F8FAFC',
  style,
}) => {
  return (
    <Text
      style={[
        styles.glyph,
        {
          fontSize: size,
          color,
          lineHeight: size * 1.15,
        },
        style,
      ]}
      accessibilityRole="image"
    >
      {GLYPH_MAP[name] || '•'}
    </Text>
  );
};

const styles = StyleSheet.create({
  glyph: {
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});
