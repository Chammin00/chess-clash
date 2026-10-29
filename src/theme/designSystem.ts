/**
 * Design System Refinements
 * 
 * Implements refined mobile UI principles:
 * 1. Solid-backed surface tints with 1px subtle inner strokes (avoiding legibility failure of 70% opacity glassmorphism).
 * 2. Calibrated semi-transparent modal scrim (rgba(0, 0, 0, 0.65)) establishing clear elevation & depth cues.
 * 3. Soft, ambient shadows (12px blur, 10-12% opacity) avoiding harsh dated drop-shadows.
 * 4. Proportional radius nesting (Inner Radius = Outer Radius - Padding; 20px modals, 12px cards, 6px inner chips).
 * 5. Crisp, consistent functional glyphs for navigation and utility actions, reserving rich 3D visuals for reward reveals.
 */

export const DesignTokens = {
  colors: {
    // Solid Backings (Opaque, high-contrast, WCAG AAA compliant)
    background: '#09090B',
    surface: '#18181B',
    surfaceElevated: '#27272A',
    surfaceCard: '#1C1917',
    surfaceCardInner: '#292524',
    surfaceModal: '#121214',
    surfaceGlassNav: 'rgba(24, 24, 27, 0.95)', // Solid backing for fixed navigation

    // Subtle 1px strokes & inner borders
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    borderMedium: 'rgba(255, 255, 255, 0.15)',
    borderSolid: '#334155',
    borderHighlight: 'rgba(245, 158, 11, 0.35)',

    // Modal Scrim (Proper dimming layer for depth & focus)
    scrim: 'rgba(0, 0, 0, 0.65)',
    scrimHeavy: 'rgba(0, 0, 0, 0.80)',

    // Typography
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',

    // Accents
    gold: '#F59E0B',
    goldMuted: '#B45309',
    cyan: '#38BDF8',
    emerald: '#10B981',
    rose: '#F43F5E',
  },

  // Proportional Corner Radius Nesting: Inner = Outer - Padding
  radii: {
    modal: 20,       // Large modal containers & bottom sheets (20–24px)
    card: 12,        // Cards, panels, dialog content containers (8–12px)
    button: 10,      // Primary & secondary buttons, inputs (8–12px)
    inner: 6,        // Nested elements inside cards (Inner = Outer (12) - Padding (6))
    chip: 6,         // Small tags, chips, status pills (proportional, avoids squashed pills)
    badge: 4,        // Small tags & count indicators
  },

  // Ambient Soft Shadows (12px blur, ~10% opacity)
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.10,
      shadowRadius: 12,
      elevation: 3,
    },
    contact: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 1,
    },
    modal: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 20,
      elevation: 8,
    },
    glow: (color: string) => ({
      shadowColor: color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.28,
      shadowRadius: 10,
      elevation: 4,
    }),
  },
};
