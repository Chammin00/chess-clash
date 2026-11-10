import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Circle,
  Polygon,
  Rect,
  G,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { SpireCard, NodeType } from '../types/spire';

interface CardVectorProps {
  cardId: string;
  type: SpireCard['type'];
  size?: number;
  isUpgraded?: boolean;
}

/**
 * Handcrafted Dual-Tone SVG Vector Emblem for Cards
 * Follows GitHub Primer Anti-Slop UI & Anti-Slop Craftsman Rule 1 (No raw emoji asset flips).
 */
export const SpireCardVectorArt: React.FC<CardVectorProps> = ({
  cardId,
  type,
  size = 34,
  isUpgraded = false,
}) => {
  const idLower = cardId.toLowerCase();

  // Select accent palette by card type & upgrade status
  const primaryColor = isUpgraded
    ? '#3FB950'
    : type === 'attack'
    ? '#FF7B72'
    : type === 'skill'
    ? '#58A6FF'
    : type === 'power'
    ? '#D2A8FF'
    : '#8B949E';

  const secondaryColor = isUpgraded
    ? '#238636'
    : type === 'attack'
    ? '#DA3633'
    : type === 'skill'
    ? '#1F6FEB'
    : type === 'power'
    ? '#8957E5'
    : '#484F58';

  const renderGlyph = () => {
    if (type === 'attack') {
      if (idLower.includes('whirlwind') || idLower.includes('cleave') || idLower.includes('cyclone')) {
        // Multi-target crescent vortex blades
        return (
          <G>
            <Path
              d="M6 18 C10 6, 26 6, 30 18 C24 12, 12 12, 6 18 Z"
              fill={primaryColor}
              opacity={0.9}
            />
            <Path
              d="M6 26 C12 20, 24 20, 30 26 C26 34, 10 34, 6 26 Z"
              fill={secondaryColor}
              opacity={0.85}
            />
            <Circle cx="18" cy="20" r="3.5" fill="#F0F6FC" />
          </G>
        );
      }
      if (idLower.includes('crush') || idLower.includes('bludgeon') || idLower.includes('slam')) {
        // Gravity War-Hammer / Kinetic Impact
        return (
          <G>
            <Polygon points="8,8 28,8 25,18 11,18" fill={primaryColor} stroke="#F0F6FC" strokeWidth="1" />
            <Rect x="16" y="18" width="4" height="14" fill={secondaryColor} />
            <Path d="M4 22 L10 20 M32 22 L26 20" stroke={primaryColor} strokeWidth="2" />
          </G>
        );
      }
      // Default High-Velocity Plasma Blade
      return (
        <G>
          <Polygon
            points="28,6 14,24 10,20 28,6"
            fill={primaryColor}
          />
          <Polygon
            points="28,6 20,26 14,24 28,6"
            fill={secondaryColor}
          />
          <Path d="M8 28 L15 21 M6 22 L14 30" stroke="#F0F6FC" strokeWidth="2" strokeLinecap="round" />
        </G>
      );
    }

    if (type === 'skill') {
      if (idLower.includes('draw') || idLower.includes('trance') || idLower.includes('offering')) {
        // Neural Uplink / Tactical Telemetry Prism
        return (
          <G>
            <Polygon
              points="18,5 30,18 18,31 6,18"
              fill={secondaryColor}
              opacity={0.35}
              stroke={primaryColor}
              strokeWidth="1.8"
            />
            <Circle cx="18" cy="18" r="5" fill={primaryColor} />
            <Circle cx="18" cy="18" r="2" fill="#F0F6FC" />
          </G>
        );
      }
      // Hexagonal Aegis Barrier Crest
      return (
        <G>
          <Path
            d="M18 5 L29 10 L29 20 C29 26.5 18 31.5 18 31.5 C18 31.5 7 26.5 7 20 L7 10 Z"
            fill={secondaryColor}
            opacity={0.45}
            stroke={primaryColor}
            strokeWidth="2"
          />
          <Path
            d="M18 9 L25 12.5 L25 19.5 C25 23.8 18 27.5 18 27.5"
            fill="none"
            stroke="#F0F6FC"
            strokeWidth="1.5"
            opacity={0.85}
          />
        </G>
      );
    }

    if (type === 'power') {
      // Singularity Reactor Core
      return (
        <G>
          <Polygon
            points="18,4 22,13 32,14 24,21 26,31 18,26 10,31 12,21 4,14 14,13"
            fill={secondaryColor}
            opacity={0.45}
            stroke={primaryColor}
            strokeWidth="1.6"
          />
          <Circle cx="18" cy="18" r="5.5" fill={primaryColor} />
          <Circle cx="18" cy="18" r="2.5" fill="#F0F6FC" />
        </G>
      );
    }

    // Status / Curse Hazard Vector
    return (
      <G>
        <Polygon
          points="18,6 31,29 5,29"
          fill={secondaryColor}
          opacity={0.5}
          stroke={primaryColor}
          strokeWidth="1.8"
        />
        <Rect x="16.8" y="13" width="2.4" height="8" fill="#F0F6FC" />
        <Circle cx="18" cy="24.5" r="1.5" fill="#F0F6FC" />
      </G>
    );
  };

  return (
    <View style={[styles.vectorBox, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 36 36">
        <Defs>
          <LinearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={primaryColor} stopOpacity="0.22" />
            <Stop offset="1" stopColor="#090D16" stopOpacity="0.9" />
          </LinearGradient>
        </Defs>
        <Circle
          cx="18"
          cy="18"
          r="16.5"
          fill="url(#bgGrad)"
          stroke={primaryColor}
          strokeWidth="1"
          strokeOpacity="0.55"
        />
        {renderGlyph()}
      </Svg>
    </View>
  );
};

interface EnemyVectorProps {
  enemyId: string;
  size?: number;
  isBoss?: boolean;
  isElite?: boolean;
}

/**
 * Handcrafted Multi-Layer Vector Silhouette for all 13 Exordium Enemies, Elites & Bosses
 */
export const SpireEnemyVectorArt: React.FC<EnemyVectorProps> = ({
  enemyId,
  size = 58,
  isBoss = false,
  isElite = false,
}) => {
  const id = enemyId.toLowerCase();
  const primary = isBoss ? '#FF7B72' : isElite ? '#D29922' : '#58A6FF';
  const accent = isBoss ? '#FFA657' : isElite ? '#F85149' : '#3FB950';

  const renderMonster = () => {
    if (id.includes('hexa') || id.includes('ghost')) {
      // Void Hexa-Core: Six orbiting plasma nodes around a central singularity
      return (
        <G>
          <Polygon
            points="32,8 52,20 52,44 32,56 12,44 12,20"
            fill="#161B22"
            stroke={primary}
            strokeWidth="2.2"
          />
          <Circle cx="32" cy="32" r="10" fill={primary} opacity={0.85} />
          <Circle cx="32" cy="32" r="5" fill="#F0F6FC" />
          <Circle cx="32" cy="8" r="3.5" fill={accent} />
          <Circle cx="52" cy="20" r="3.5" fill={accent} />
          <Circle cx="52" cy="44" r="3.5" fill={accent} />
          <Circle cx="32" cy="56" r="3.5" fill={accent} />
          <Circle cx="12" cy="44" r="3.5" fill={accent} />
          <Circle cx="12" cy="20" r="3.5" fill={accent} />
        </G>
      );
    }

    if (id.includes('guardian') || id.includes('aegis_construct')) {
      // Aegis Construct Omega: Shifting Fortress Dreadnought
      return (
        <G>
          <Polygon
            points="16,10 48,10 56,28 46,54 18,54 8,28"
            fill="#161B22"
            stroke="#58A6FF"
            strokeWidth="2.5"
          />
          <Polygon points="22,18 42,18 48,32 32,46 16,32" fill="#1F6FEB" opacity={0.65} />
          <Rect x="22" y="25" width="20" height="5" fill="#FF7B72" />
          <Circle cx="32" cy="27.5" r="2.5" fill="#F0F6FC" />
        </G>
      );
    }

    if (id.includes('slime') || id.includes('singularity') || id.includes('amalgam')) {
      // The Singularity Overlord / Corrosive Amalgam
      return (
        <G>
          <Circle cx="32" cy="34" r="21" fill="#161B22" stroke={accent} strokeWidth="2.4" />
          <Circle cx="32" cy="34" r="15" fill={primary} opacity={0.4} />
          <Circle cx="24" cy="29" r="3.5" fill="#F0F6FC" />
          <Circle cx="40" cy="29" r="3.5" fill="#F0F6FC" />
          <Path d="M22 41 Q32 47 42 41" stroke="#F0F6FC" strokeWidth="2.5" fill="none" />
        </G>
      );
    }

    if (id.includes('nob') || id.includes('gorgon')) {
      // Cyber-Gorgon Prime (Elite)
      return (
        <G>
          <Polygon points="12,18 22,6 28,18" fill={primary} />
          <Polygon points="52,18 42,6 36,18" fill={primary} />
          <Polygon
            points="14,18 50,18 54,42 32,56 10,42"
            fill="#161B22"
            stroke={primary}
            strokeWidth="2.2"
          />
          <Polygon points="20,28 29,32 20,35" fill="#FF7B72" />
          <Polygon points="44,28 35,32 44,35" fill="#FF7B72" />
          <Path d="M22 45 L27 41 L32 45 L37 41 L42 45" stroke="#F0F6FC" strokeWidth="2" fill="none" />
        </G>
      );
    }

    if (id.includes('sentry') || id.includes('sentinel')) {
      // Tri-Optic Sentinel (Artifact Obelisk)
      return (
        <G>
          <Polygon
            points="32,6 48,32 32,58 16,32"
            fill="#161B22"
            stroke="#D2A8FF"
            strokeWidth="2.2"
          />
          <Circle cx="32" cy="32" r="7" fill="#58A6FF" />
          <Circle cx="32" cy="32" r="3" fill="#F0F6FC" />
        </G>
      );
    }

    // Default Cyber-Enforcer / Rift Stalker Silhouette
    return (
      <G>
        <Polygon
          points="32,8 52,22 46,50 18,50 12,22"
          fill="#161B22"
          stroke={primary}
          strokeWidth="2"
        />
        <Path d="M18 26 L30 30 L18 33 Z" fill={accent} />
        <Path d="M46 26 L34 30 L46 33 Z" fill={accent} />
        <Rect x="24" y="40" width="16" height="3" fill={primary} />
      </G>
    );
  };

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        {renderMonster()}
      </Svg>
    </View>
  );
};

/**
 * Handcrafted Vector Crest for the Player Hero (Riftblade Vanguard)
 */
export const SpireHeroVectorCrest: React.FC<{ size?: number }> = ({ size = 54 }) => {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Polygon
          points="32,6 54,18 50,46 32,58 14,46 10,18"
          fill="#161B22"
          stroke="#58A6FF"
          strokeWidth="2.2"
        />
        <Polygon points="32,12 46,22 42,42 32,50 22,42 18,22" fill="#1F6FEB" opacity={0.45} />
        {/* Visor Slit */}
        <Polygon points="20,27 32,32 44,27 42,34 32,38 22,34" fill="#00F0FF" />
        <Path d="M32 12 L32 26" stroke="#F0F6FC" strokeWidth="2" />
      </Svg>
    </View>
  );
};

/**
 * Handcrafted Tactical Map Node Vector Icon
 */
export const SpireMapNodeVector: React.FC<{
  type: NodeType;
  size?: number;
  active?: boolean;
}> = ({ type, size = 24, active = false }) => {
  const stroke = active ? '#F0F6FC' : '#C9D1D9';
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28">
      {type === 'monster' && (
        <G>
          <Path d="M6 22 L22 6 M16 6 L22 6 L22 12" stroke="#58A6FF" strokeWidth="2.2" fill="none" />
          <Path d="M22 22 L6 6 M12 6 L6 6 L6 12" stroke={stroke} strokeWidth="2" fill="none" />
        </G>
      )}
      {type === 'elite' && (
        <G>
          <Polygon points="14,3 24,10 20,23 8,23 4,10" fill="none" stroke="#F85149" strokeWidth="2.2" />
          <Circle cx="10.5" cy="13" r="1.8" fill="#F85149" />
          <Circle cx="17.5" cy="13" r="1.8" fill="#F85149" />
        </G>
      )}
      {type === 'rest' && (
        <G>
          <Path d="M14 5 C19 11, 21 15, 14 23 C7 15, 9 11, 14 5 Z" fill="#3FB950" opacity={0.85} />
          <Circle cx="14" cy="17" r="3" fill="#F0F6FC" />
        </G>
      )}
      {type === 'shop' && (
        <G>
          <Polygon points="14,4 24,14 14,24 4,14" fill="none" stroke="#D29922" strokeWidth="2.2" />
          <Circle cx="14" cy="14" r="3.5" fill="#D29922" />
        </G>
      )}
      {type === 'event' && (
        <G>
          <Circle cx="14" cy="14" r="10" fill="none" stroke="#D2A8FF" strokeWidth="2" />
          <Path d="M11 10 C11 7.5, 17 7.5, 17 11 C17 13.5, 14 14, 14 16.5" stroke="#F0F6FC" strokeWidth="2.2" fill="none" />
          <Circle cx="14" cy="20.5" r="1.4" fill="#F0F6FC" />
        </G>
      )}
      {type === 'boss' && (
        <G>
          <Polygon points="4,19 7,8 14,14 21,8 24,19" fill="#FF7B72" stroke="#F0F6FC" strokeWidth="1.5" />
          <Rect x="5" y="20" width="18" height="3" fill="#FFA657" />
        </G>
      )}
    </Svg>
  );
};

const styles = StyleSheet.create({
  vectorBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
