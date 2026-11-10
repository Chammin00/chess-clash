import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Image,
  Platform,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Polygon,
  Rect,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Line,
} from 'react-native-svg';
import { SpireEnemy, SpireHero, FloatingText, StatusEffect } from '../types/spire';
import { SpireCombatEngine } from '../services/spireCombatEngine';
import { getStatusMetadata } from './EnemyView';

export type MotionActionType =
  | 'idle'
  | 'single_hit'
  | 'multi_hit'
  | 'close_quarters'
  | 'ward_stance'
  | 'spirit_surge'
  | 'enemy_strike';

export interface ActiveMotionCue {
  id: string;
  type: MotionActionType;
  techniqueName: string;
  hits?: number;
  accentColor?: string;
}

interface Props {
  warriorId: string;
  warriorName: string;
  warriorTitle: string;
  weaponName: string;
  portraitUri?: string;
  hero: SpireHero;
  enemy: SpireEnemy;
  motionCue: ActiveMotionCue | null;
  floatingTexts: FloatingText[];
  isTargeted?: boolean;
  onInspectStatus?: (name: string, desc: string) => void;
}

/**
 * Handcrafted Cartoon/Anime Afro-Asian Articulated Fighter Vector Rig
 * Renders distinct hair (Afro/Locs/Puffs/Kanzashi), armor, and animated weapons:
 * - Demon Odachi (Great-Katana)
 * - Twin Viper Kodachi (Dual Ninja Short-Blades)
 * - Thunder-Coil Nunchaku
 * - Blood-Moon Kusarigama (Chain-Sickle)
 */
export const AfroAsianFighterRigSvg: React.FC<{
  warriorId: string;
  motionType: MotionActionType;
  size?: number;
}> = ({ warriorId, motionType, size = 148 }) => {
  const isAttacking =
    motionType === 'single_hit' ||
    motionType === 'multi_hit' ||
    motionType === 'close_quarters';

  const renderHairAndHead = () => {
    if (warriorId === 'kodachi_phantom') {
      // Zuri: Warm bronze skin, stylized silver-violet Afro Puffs + Shinobi mask & headband
      return (
        <G>
          {/* Twin Afro Puffs */}
          <Circle cx="36" cy="22" r="12" fill="#A855F7" stroke="#1E1B4B" strokeWidth="2" />
          <Circle cx="68" cy="22" r="12" fill="#A855F7" stroke="#1E1B4B" strokeWidth="2" />
          <Circle cx="34" cy="20" r="9" fill="#C084FC" opacity={0.6} />
          <Circle cx="66" cy="20" r="9" fill="#C084FC" opacity={0.6} />
          {/* Head */}
          <Circle cx="52" cy="30" r="11" fill="#8D5524" stroke="#090D16" strokeWidth="1.5" />
          {/* Shinobi Mask & Glowing Eyes */}
          <Path d="M41 31 Q52 36 63 31 L61 41 Q52 44 43 41 Z" fill="#1E1B4B" />
          <Path d="M45 27 L50 28.5" stroke="#F0ABFC" strokeWidth="2.2" strokeLinecap="round" />
          <Path d="M59 27 L54 28.5" stroke="#F0ABFC" strokeWidth="2.2" strokeLinecap="round" />
          {/* Flowing Kunoichi Scarf */}
          <Path
            d="M42 38 Q20 34 8 46 Q24 44 40 42 Z"
            fill="#9333EA"
            opacity={0.9}
          />
        </G>
      );
    }

    if (warriorId === 'nunchaku_dragon') {
      // Tarik: Athletic mahogany skin, sharp high-top dreadlock twists + crimson headband
      return (
        <G>
          {/* Sculpted Dreadlock Twists Crown */}
          <Path
            d="M40 24 L36 11 L43 16 L46 9 L52 15 L57 9 L60 16 L67 11 L64 24 Z"
            fill="#111827"
            stroke="#F59E0B"
            strokeWidth="1"
          />
          {/* Head */}
          <Circle cx="52" cy="30" r="11" fill="#6F3E18" stroke="#090D16" strokeWidth="1.5" />
          {/* Crimson Martial Headband */}
          <Rect x="41" y="21" width="22" height="4" rx="2" fill="#EF4444" />
          <Path d="M41 23 Q22 18 14 28" stroke="#EF4444" strokeWidth="3.5" fill="none" />
          {/* Fierce Eyes */}
          <Path d="M46 28 L50 29" stroke="#FBBF24" strokeWidth="2.2" />
          <Path d="M59 28 L54 29" stroke="#FBBF24" strokeWidth="2.2" />
        </G>
      );
    }

    if (warriorId === 'kusarigama_mystic') {
      // Amara: Deep ebony skin, flowing locs with golden Kanzashi hairpins & Blood Crown
      return (
        <G>
          {/* Flowing Locs */}
          <Path
            d="M38 22 Q24 38 26 58 L38 52 L42 28 Z"
            fill="#0F172A"
            stroke="#E11D48"
            strokeWidth="1"
          />
          {/* Gold Kanzashi Hairpins */}
          <Line x1="30" y1="12" x2="68" y2="24" stroke="#FBBF24" strokeWidth="2.2" />
          <Line x1="32" y1="24" x2="70" y2="12" stroke="#FBBF24" strokeWidth="2.2" />
          <Circle cx="52" cy="18" r="11" fill="#1E293B" />
          {/* Head */}
          <Circle cx="52" cy="30" r="11" fill="#4A2511" stroke="#090D16" strokeWidth="1.5" />
          {/* Glowing Crimson Eyes */}
          <Circle cx="48" cy="29" r="1.8" fill="#FB7185" />
          <Circle cx="56" cy="29" r="1.8" fill="#FB7185" />
        </G>
      );
    }

    // Default: Kofi (Odachi Vanguard) — Afro-Samurai wild dreadlock halo + Oni Horned Crest
    return (
      <G>
        {/* Dramatic Afro-Samurai Locs Halo */}
        <Path
          d="M36 28 C18 22, 16 8, 36 14 C38 2, 54 2, 56 12 C70 4, 80 18, 64 26 Z"
          fill="#18181B"
          stroke="#DC2626"
          strokeWidth="1.2"
        />
        {/* Gold Oni Forehead Crest */}
        <Polygon points="44,18 52,8 60,18" fill="#F59E0B" />
        {/* Head */}
        <Circle cx="52" cy="30" r="11" fill="#5C3317" stroke="#090D16" strokeWidth="1.5" />
        {/* Glowing Crimson Eyes */}
        <Path d="M46 28 L51 29.5" stroke="#FF4444" strokeWidth="2.2" />
        <Path d="M59 28 L54 29.5" stroke="#FF4444" strokeWidth="2.2" />
      </G>
    );
  };

  const renderBodyAndWeapon = () => {
    if (warriorId === 'kodachi_phantom') {
      // Twin Viper Kodachi (Dual Reverse-Grip Glowing Violet Blades)
      return (
        <G>
          {/* Agile Shinobi Torso & Gold Sash */}
          <Polygon points="42,41 62,41 58,72 46,72" fill="#1E1B4B" stroke="#C084FC" strokeWidth="1.5" />
          <Rect x="44" y="64" width="16" height="5" fill="#F59E0B" />
          {/* Legs in dynamic martial stance */}
          <Path d="M48 72 L36 104 L30 108" stroke="#1E1B4B" strokeWidth="7" strokeLinecap="round" />
          <Path d="M56 72 L68 104 L74 108" stroke="#1E1B4B" strokeWidth="7" strokeLinecap="round" />
          {/* Left & Right Kodachi Blades */}
          <Path
            d={isAttacking ? 'M60 48 L118 22 L96 42 Z' : 'M38 52 L10 68 L28 50 Z'}
            fill="#D8B4FE"
            stroke="#A855F7"
            strokeWidth="2"
          />
          <Path
            d={isAttacking ? 'M62 56 L124 58 L98 66 Z' : 'M64 50 L104 34 L90 48 Z'}
            fill="#F0ABFC"
            stroke="#9333EA"
            strokeWidth="2"
          />
        </G>
      );
    }

    if (warriorId === 'nunchaku_dragon') {
      // Tarik: Muscular Dragon-Tattooed Torso + Twin Golden Lightning Nunchaku
      return (
        <G>
          {/* Muscular Torso with Golden Dragon Crest */}
          <Polygon points="39,41 65,41 60,73 44,73" fill="#6F3E18" stroke="#F59E0B" strokeWidth="1.5" />
          <Path d="M47 47 Q52 56 57 47 Q52 63 48 60" stroke="#FBBF24" strokeWidth="2.2" fill="none" />
          {/* Black & Crimson Martial Gi Pants */}
          <Rect x="43" y="68" width="18" height="6" fill="#DC2626" />
          <Path d="M47 74 L35 105" stroke="#111827" strokeWidth="8" strokeLinecap="round" />
          <Path d="M57 74 L72 98" stroke="#111827" strokeWidth="8" strokeLinecap="round" />
          {/* Nunchaku Handles & Chain */}
          <Rect
            x={isAttacking ? '72' : '64'}
            y={isAttacking ? '34' : '44'}
            width="22"
            height="5"
            rx="2"
            fill="#F59E0B"
            stroke="#FEF08A"
            strokeWidth="1.2"
          />
          <Path
            d={isAttacking ? 'M94 36 Q108 24 114 42' : 'M86 46 Q96 54 90 66'}
            stroke="#38BDF8"
            strokeWidth="2.5"
            strokeDasharray="3,2"
            fill="none"
          />
          <Rect
            x={isAttacking ? '106' : '84'}
            y={isAttacking ? '42' : '64'}
            width="22"
            height="5"
            rx="2"
            fill="#F59E0B"
            stroke="#FEF08A"
            strokeWidth="1.2"
          />
        </G>
      );
    }

    if (warriorId === 'kusarigama_mystic') {
      // Amara: Black & Crimson Haori Kimono + Blood-Moon Kusarigama Chain-Sickle & Lantern
      return (
        <G>
          {/* Haori Robe */}
          <Polygon points="40,41 64,41 70,96 34,96" fill="#18181B" stroke="#E11D48" strokeWidth="1.8" />
          <Polygon points="46,41 58,41 60,96 44,96" fill="#881337" />
          {/* Kusarigama Crescent Sickle */}
          <Path
            d={
              isAttacking
                ? 'M64 46 L104 28 C118 22, 122 46, 98 48 Z'
                : 'M62 50 L88 32 C98 26, 104 44, 84 48 Z'
            }
            fill="#FDA4AF"
            stroke="#E11D48"
            strokeWidth="2"
          />
          {/* Whirling Blood Chain & Iron Meteor Weight */}
          <Path
            d={
              isAttacking
                ? 'M64 48 Q96 78 122 52'
                : 'M40 52 Q18 70 28 88'
            }
            stroke="#F43F5E"
            strokeWidth="2"
            strokeDasharray="4,2"
            fill="none"
          />
          <Circle
            cx={isAttacking ? '122' : '28'}
            cy={isAttacking ? '52' : '88'}
            r="6"
            fill="#E11D48"
            stroke="#FFE4E6"
            strokeWidth="1.5"
          />
        </G>
      );
    }

    // Default: Kofi (Odachi Vanguard) — Oni Shoulder Armor + Cursed Dragon Arm + Massive Demon Odachi
    return (
      <G>
        {/* Samurai Armor Cuirass & Gold Tassets */}
        <Polygon points="38,41 66,41 62,74 42,74" fill="#18181B" stroke="#F59E0B" strokeWidth="1.8" />
        {/* Layered Oni Shoulder Pauldron (Left) */}
        <Polygon points="26,38 44,36 40,54 22,50" fill="#7F1D1D" stroke="#F59E0B" strokeWidth="1.5" />
        {/* Cursed Crimson Dragon Right Arm */}
        <Path d="M62 44 L80 52" stroke="#DC2626" strokeWidth="7" strokeLinecap="round" />
        <Path d="M62 44 L80 52" stroke="#FCA5A5" strokeWidth="2" strokeDasharray="3,3" />
        {/* Armored Hakama Greaves */}
        <Path d="M46 74 L36 106" stroke="#18181B" strokeWidth="9" strokeLinecap="round" />
        <Path d="M58 74 L70 106" stroke="#18181B" strokeWidth="9" strokeLinecap="round" />
        {/* Massive Demon Odachi Blade */}
        <Path
          d={
            isAttacking
              ? 'M74 48 L128 14 L124 24 L76 54 Z'
              : 'M74 52 L118 12 L114 20 L72 56 Z'
          }
          fill="#FEE2E2"
          stroke="#EF4444"
          strokeWidth="2"
        />
        {/* Gold Tsuba Guard */}
        <Circle cx="74" cy="52" r="4.5" fill="#F59E0B" />
      </G>
    );
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 132 120">
      <Defs>
        <RadialGradient id="auraGlow" cx="50%" cy="55%" r="48%">
          <Stop offset="0%" stopColor="#EF4444" stopOpacity={isAttacking ? '0.55' : '0.22'} />
          <Stop offset="100%" stopColor="#090D16" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      {/* Dynamic Under-Foot Shadow & Chi Aura */}
      <Circle cx="54" cy="64" r="46" fill="url(#auraGlow)" />
      <Polygon points="24,108 84,108 94,115 14,115" fill="rgba(0,0,0,0.65)" />
      {renderBodyAndWeapon()}
      {renderHairAndHead()}
    </Svg>
  );
};

/**
 * Handcrafted Dark Yokai / Corrupted Shogunate Enemy Vector Rig
 */
const YokaiEnemyRigSvg: React.FC<{
  enemy: SpireEnemy;
  isBoss: boolean;
  isElite: boolean;
}> = ({ enemy, isBoss, isElite }) => {
  const color = enemy.themeColor || (isBoss ? '#EF4444' : isElite ? '#F59E0B' : '#A855F7');
  return (
    <Svg width={136} height={124} viewBox="0 0 136 124">
      <Defs>
        <RadialGradient id="yokaiAura" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <Stop offset="100%" stopColor="#090D16" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="68" cy="64" r="52" fill="url(#yokaiAura)" />
      {/* Oni Horns */}
      <Polygon points="44,28 30,6 54,22" fill={color} />
      <Polygon points="92,28 106,6 82,22" fill={color} />
      {/* Armored Yokai Torso & Shoulder Spikes */}
      <Polygon
        points="32,34 104,34 114,68 92,106 44,106 22,68"
        fill="#111827"
        stroke={color}
        strokeWidth="2.5"
      />
      <Polygon points="16,44 38,34 32,60" fill={color} opacity={0.85} />
      <Polygon points="120,44 98,34 104,60" fill={color} opacity={0.85} />
      {/* Glowing Demon Visor Eyes & Fangs */}
      <Polygon points="46,48 62,54 46,57" fill="#FEF08A" />
      <Polygon points="90,48 74,54 90,57" fill="#FEF08A" />
      <Path
        d="M48 74 L55 66 L62 74 L68 66 L74 74 L81 66 L88 74"
        stroke="#F8FAFC"
        strokeWidth="2.5"
        fill="none"
      />
      {/* Cursed Odachi / Kanabo Club */}
      <Polygon points="12,24 26,20 38,94 22,98" fill="#1F2937" stroke={color} strokeWidth="2" />
    </Svg>
  );
};

export const AfroAsianMotionStage: React.FC<Props> = ({
  warriorId,
  warriorName,
  warriorTitle,
  weaponName,
  portraitUri,
  hero,
  enemy,
  motionCue,
  floatingTexts,
  isTargeted = false,
  onInspectStatus,
}) => {
  // Motion animation values for 60fps dash, leap, weapon slash & camera zoom
  const heroDashX = useRef(new Animated.Value(0)).current;
  const heroLeapY = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(1)).current;
  const enemyShakeX = useRef(new Animated.Value(0)).current;
  const enemyHitScale = useRef(new Animated.Value(1)).current;
  const slashOpacity = useRef(new Animated.Value(0)).current;
  const slashScale = useRef(new Animated.Value(0.4)).current;
  const stageZoom = useRef(new Animated.Value(1)).current;

  const [activeMotionType, setActiveMotionType] = useState<MotionActionType>('idle');
  const [comboBanner, setComboBanner] = useState<string | null>(null);
  const [hitCountBadge, setHitCountBadge] = useState<number>(0);

  // Trigger full choreography whenever motionCue changes
  useEffect(() => {
    if (!motionCue || motionCue.type === 'idle') return;

    setActiveMotionType(motionCue.type);
    setComboBanner(motionCue.techniqueName);

    if (motionCue.type === 'single_hit') {
      // SINGLE-HIT HEAVY CLEAVE: Dramatic camera zoom + high leap + across-stage dash + 360° slash arc + heavy knockback
      setHitCountBadge(1);
      Animated.parallel([
        Animated.sequence([
          Animated.timing(stageZoom, {
            toValue: 1.12,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.timing(stageZoom, {
            toValue: 1,
            duration: 320,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.parallel([
            Animated.timing(heroDashX, {
              toValue: 135,
              duration: 170,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(heroLeapY, {
              toValue: -34,
              duration: 110,
              useNativeDriver: true,
            }),
            Animated.timing(heroScale, {
              toValue: 1.22,
              duration: 170,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(heroLeapY, {
            toValue: 0,
            duration: 90,
            useNativeDriver: true,
          }),
          Animated.delay(140),
          Animated.parallel([
            Animated.spring(heroDashX, {
              toValue: 0,
              friction: 6,
              useNativeDriver: true,
            }),
            Animated.spring(heroScale, {
              toValue: 1,
              friction: 6,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.sequence([
          Animated.delay(140),
          Animated.parallel([
            Animated.timing(slashOpacity, { toValue: 1, duration: 50, useNativeDriver: true }),
            Animated.spring(slashScale, { toValue: 1.35, friction: 5, useNativeDriver: true }),
            Animated.sequence([
              Animated.timing(enemyShakeX, { toValue: 18, duration: 45, useNativeDriver: true }),
              Animated.timing(enemyShakeX, { toValue: -14, duration: 45, useNativeDriver: true }),
              Animated.timing(enemyShakeX, { toValue: 10, duration: 45, useNativeDriver: true }),
              Animated.timing(enemyShakeX, { toValue: 0, duration: 45, useNativeDriver: true }),
            ]),
          ]),
          Animated.timing(slashOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
        ]),
      ]).start(() => {
        setActiveMotionType('idle');
        setTimeout(() => setComboBanner(null), 500);
      });
    } else if (motionCue.type === 'multi_hit') {
      // MULTI-HIT BLADE DANCE / NUNCHAKU FLURRY: Rapid zig-zag teleports + multi-hit counter + criss-cross slashes
      const totalHits = Math.max(2, motionCue.hits || 4);
      let currentHit = 1;
      setHitCountBadge(1);
      const hitInterval = setInterval(() => {
        currentHit++;
        if (currentHit <= totalHits) {
          setHitCountBadge(currentHit);
        } else {
          clearInterval(hitInterval);
        }
      }, 85);

      Animated.sequence([
        Animated.parallel([
          Animated.timing(stageZoom, { toValue: 1.09, duration: 140, useNativeDriver: true }),
          Animated.timing(heroDashX, { toValue: 145, duration: 130, useNativeDriver: true }),
          Animated.timing(slashOpacity, { toValue: 1, duration: 60, useNativeDriver: true }),
          Animated.timing(slashScale, { toValue: 1.45, duration: 180, useNativeDriver: true }),
        ]),
        // Rapid multi-angle zig-zag strikes around target
        Animated.sequence([
          Animated.parallel([
            Animated.timing(heroLeapY, { toValue: -26, duration: 75, useNativeDriver: true }),
            Animated.timing(enemyShakeX, { toValue: 14, duration: 75, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(heroLeapY, { toValue: 12, duration: 75, useNativeDriver: true }),
            Animated.timing(enemyShakeX, { toValue: -14, duration: 75, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(heroLeapY, { toValue: -18, duration: 75, useNativeDriver: true }),
            Animated.timing(enemyShakeX, { toValue: 16, duration: 75, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(heroLeapY, { toValue: 0, duration: 75, useNativeDriver: true }),
            Animated.timing(enemyShakeX, { toValue: 0, duration: 75, useNativeDriver: true }),
          ]),
        ]),
        Animated.parallel([
          Animated.spring(heroDashX, { toValue: 0, friction: 6, useNativeDriver: true }),
          Animated.timing(stageZoom, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(slashOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        ]),
      ]).start(() => {
        clearInterval(hitInterval);
        setActiveMotionType('idle');
        setTimeout(() => setComboBanner(null), 500);
      });
    } else if (motionCue.type === 'close_quarters') {
      // CLOSE-QUARTERS MARTIAL COMBO: Point-blank sprint inside enemy guard + shockwave pulse + heavy knockback
      setHitCountBadge(2);
      Animated.sequence([
        Animated.parallel([
          Animated.timing(stageZoom, { toValue: 1.15, duration: 120, useNativeDriver: true }),
          Animated.timing(heroDashX, {
            toValue: 162,
            duration: 110,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.timing(heroScale, { toValue: 1.28, duration: 110, useNativeDriver: true }),
          Animated.timing(slashOpacity, { toValue: 1, duration: 60, useNativeDriver: true }),
          Animated.timing(slashScale, { toValue: 1.5, duration: 140, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(enemyHitScale, { toValue: 0.84, duration: 65, useNativeDriver: true }),
            Animated.spring(enemyHitScale, { toValue: 1, friction: 4, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(enemyShakeX, { toValue: 26, duration: 60, useNativeDriver: true }),
            Animated.timing(enemyShakeX, { toValue: -12, duration: 60, useNativeDriver: true }),
            Animated.timing(enemyShakeX, { toValue: 0, duration: 60, useNativeDriver: true }),
          ]),
        ]),
        Animated.parallel([
          Animated.spring(heroDashX, { toValue: 0, friction: 6, useNativeDriver: true }),
          Animated.spring(heroScale, { toValue: 1, friction: 6, useNativeDriver: true }),
          Animated.timing(stageZoom, { toValue: 1, duration: 220, useNativeDriver: true }),
          Animated.timing(slashOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        ]),
      ]).start(() => {
        setActiveMotionType('idle');
        setTimeout(() => setComboBanner(null), 500);
      });
    } else {
      // Ward Stance / Spirit Surge / Enemy Strike
      Animated.sequence([
        Animated.timing(heroScale, { toValue: 1.12, duration: 140, useNativeDriver: true }),
        Animated.spring(heroScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]).start(() => {
        setActiveMotionType('idle');
        setTimeout(() => setComboBanner(null), 450);
      });
    }
  }, [motionCue]);

  const enemyHpPct = Math.min(100, Math.max(0, Math.round((enemy.hp / enemy.maxHp) * 100)));
  const heroHpPct = Math.min(100, Math.max(0, Math.round((hero.hp / hero.maxHp) * 100)));

  const isAttackIntent =
    enemy.intent.type === 'attack' ||
    enemy.intent.type === 'attack_defend' ||
    enemy.intent.type === 'attack_debuff';

  const attackPreview = isAttackIntent
    ? SpireCombatEngine.computeEnemyAttackPreview(hero, enemy)
    : { perHit: enemy.intent.value, hits: enemy.intent.hits || 1, isModified: false };

  const intentDisplay = isAttackIntent
    ? attackPreview.hits > 1
      ? `${attackPreview.perHit}x${attackPreview.hits}`
      : `${attackPreview.perHit}`
    : '';

  return (
    <Animated.View style={[styles.stageWrapper, { transform: [{ scale: stageZoom }] }]}>
      {/* Dark Eclipse Pagoda World Backdrop */}
      <View style={styles.backdropLayer} pointerEvents="none">
        {Platform.OS === 'web' && (
          <Image
            source={{ uri: '/assets/warriors/dark_pagoda_arena.png' }}
            style={styles.backdropImage}
            resizeMode="cover"
          />
        )}
        <Svg width="100%" height="100%" viewBox="0 0 800 320" preserveAspectRatio="xMidYMid slice">
          <Defs>
            <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#07040A" stopOpacity="0.88" />
              <Stop offset="55%" stopColor="#1A0812" stopOpacity="0.78" />
              <Stop offset="100%" stopColor="#090D16" stopOpacity="0.96" />
            </LinearGradient>
            <RadialGradient id="bloodMoon" cx="50%" cy="34%" r="22%">
              <Stop offset="0%" stopColor="#F43F5E" stopOpacity="0.9" />
              <Stop offset="55%" stopColor="#9F1239" stopOpacity="0.55" />
              <Stop offset="100%" stopColor="#1A0812" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="800" height="320" fill="url(#skyGrad)" />
          {/* Giant Blood-Eclipse Moon */}
          <Circle cx="400" cy="98" r="68" fill="url(#bloodMoon)" />
          <Circle cx="400" cy="98" r="44" fill="#18040C" stroke="#F43F5E" strokeWidth="2" />
          {/* Distant Obsidian Pagoda Silhouette */}
          <Polygon points="350,82 450,82 435,98 365,98" fill="#090D16" />
          <Polygon points="335,112 465,112 448,132 352,132" fill="#090D16" />
          <Polygon points="315,148 485,148 465,176 335,176" fill="#090D16" />
          {/* Reflective Obsidian Temple Floor */}
          <Rect x="0" y="220" width="800" height="100" fill="#06080F" opacity="0.9" />
          <Line x1="0" y1="220" x2="800" y2="220" stroke="#9F1239" strokeWidth="1.5" opacity="0.7" />
        </Svg>
      </View>

      {/* Dynamic Technique Callout Banner (Single-Hit / Multi-Hit / Close-Quarters) */}
      {comboBanner && (
        <View style={styles.comboCalloutBanner}>
          <Text style={styles.comboTypeTag}>
            {activeMotionType === 'single_hit'
              ? '⚡ SINGLE-HIT HEAVY CLEAVE'
              : activeMotionType === 'multi_hit'
              ? `🌪️ MULTI-HIT BLADE FLURRY (${hitCountBadge} HIT!)`
              : activeMotionType === 'close_quarters'
              ? '🥊 CLOSE-QUARTERS MARTIAL STRIKE'
              : '🔥 SPIRIT INVOCATION'}
          </Text>
          <Text style={styles.comboTechniqueText}>{comboBanner.toUpperCase()}</Text>
        </View>
      )}

      {/* Main 3D-Perspective Combat Arena Row */}
      <View style={styles.fightersRow}>
        {/* LEFT: PLAYABLE AFRO-ASIAN WARRIOR */}
        <View style={styles.heroColumn}>
          <Animated.View
            style={[
              styles.fighterSpriteContainer,
              {
                transform: [
                  { translateX: heroDashX },
                  { translateY: heroLeapY },
                  { scale: heroScale },
                ],
              },
            ]}
          >
            {/* Optional High-Res Portrait Vignette Badge + Full Articulated Rig */}
            {portraitUri && Platform.OS === 'web' ? (
              <View style={styles.portraitAvatarBadge}>
                <Image source={{ uri: portraitUri }} style={styles.portraitAvatarImg} />
              </View>
            ) : null}
            <AfroAsianFighterRigSvg
              warriorId={warriorId}
              motionType={activeMotionType}
              size={142}
            />
          </Animated.View>

          {/* Hero Name, Weapon & Vitality Bar */}
          <View style={styles.unitHudPlate}>
            <View style={styles.unitTitleRow}>
              <Text numberOfLines={1} style={styles.unitNameText}>
                {warriorName}
              </Text>
              {hero.block > 0 && (
                <View style={styles.wardPill}>
                  <Text style={styles.wardPillText}>🛡️ {hero.block}</Text>
                </View>
              )}
            </View>
            <Text numberOfLines={1} style={styles.weaponSubText}>
              {weaponName} • {warriorTitle}
            </Text>
            <View style={styles.hpBarTrack}>
              <View
                style={[
                  styles.hpBarFill,
                  { width: `${heroHpPct}%`, backgroundColor: '#10B981' },
                ]}
              />
              <Text style={styles.hpBarLabel}>
                {hero.hp} / {hero.maxHp} VIT
              </Text>
            </View>
          </View>
        </View>

        {/* RIGHT: YOKAI / CORRUPTED SHOGUNATE BOSS */}
        <View style={styles.enemyColumn}>
          {/* Telegraphed Intent Pill */}
          <View style={[styles.intentBanner, { borderColor: enemy.themeColor }]}>
            <Text style={styles.intentIcon}>{enemy.intent.icon}</Text>
            {intentDisplay !== '' && (
              <Text
                style={[
                  styles.intentNumber,
                  { color: attackPreview.isModified ? '#FBBF24' : '#FDA4AF' },
                ]}
              >
                {intentDisplay}
              </Text>
            )}
            <Text numberOfLines={1} style={styles.intentDescText}>
              {enemy.intent.description}
            </Text>
          </View>

          {/* Floating Damage Numbers */}
          <View style={styles.floatingOverlay} pointerEvents="none">
            {floatingTexts.slice(-4).map(ft => (
              <View key={ft.id} style={styles.floatingPill}>
                <Text style={[styles.floatingVal, { color: ft.color }]}>{ft.text}</Text>
              </View>
            ))}
          </View>

          {/* Enemy Articulated Rig + Weapon Slash Impact VFX */}
          <Animated.View
            style={[
              styles.enemyRigBox,
              isTargeted && styles.enemyTargetedGlow,
              {
                transform: [{ translateX: enemyShakeX }, { scale: enemyHitScale }],
              },
            ]}
          >
            <YokaiEnemyRigSvg
              enemy={enemy}
              isBoss={enemy.title.includes('Boss')}
              isElite={enemy.title.includes('Elite')}
            />

            {/* Animated Weapon Slash Arcs Overlay (Single-Hit / Multi-Hit / Close-Quarters) */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.slashOverlay,
                {
                  opacity: slashOpacity,
                  transform: [{ scale: slashScale }],
                },
              ]}
            >
              <Svg width={150} height={150} viewBox="0 0 150 150">
                {activeMotionType === 'single_hit' && (
                  <Path
                    d="M15 125 C45 25, 115 15, 140 120 C105 45, 50 55, 15 125 Z"
                    fill="#F43F5E"
                    stroke="#FEF08A"
                    strokeWidth="2.5"
                  />
                )}
                {activeMotionType === 'multi_hit' && (
                  <G>
                    <Line x1="12" y1="20" x2="138" y2="130" stroke="#C084FC" strokeWidth="5" />
                    <Line x1="138" y1="22" x2="14" y2="128" stroke="#38BDF8" strokeWidth="5" />
                    <Line x1="8" y1="75" x2="142" y2="75" stroke="#FEF08A" strokeWidth="4" />
                    <Circle cx="75" cy="75" r="38" fill="none" stroke="#F43F5E" strokeWidth="3" />
                  </G>
                )}
                {activeMotionType === 'close_quarters' && (
                  <G>
                    <Circle cx="75" cy="75" r="46" fill="none" stroke="#F59E0B" strokeWidth="5" />
                    <Circle cx="75" cy="75" r="24" fill="#FEF08A" opacity="0.85" />
                    <Polygon points="75,12 88,58 136,75 88,92 75,138 62,92 14,75 62,58" fill="#EF4444" opacity="0.75" />
                  </G>
                )}
              </Svg>
            </Animated.View>
          </Animated.View>

          {/* Enemy HUD Plate */}
          <View style={styles.unitHudPlate}>
            <View style={styles.unitTitleRow}>
              <Text numberOfLines={1} style={styles.unitNameText}>
                {enemy.name}
              </Text>
              {enemy.block > 0 && (
                <View style={styles.wardPill}>
                  <Text style={styles.wardPillText}>🛡️ {enemy.block}</Text>
                </View>
              )}
            </View>
            <Text numberOfLines={1} style={styles.weaponSubText}>
              {enemy.title}
            </Text>
            <View style={styles.hpBarTrack}>
              <View
                style={[
                  styles.hpBarFill,
                  { width: `${enemyHpPct}%`, backgroundColor: enemy.themeColor },
                ]}
              />
              <Text style={styles.hpBarLabel}>
                {enemy.hp} / {enemy.maxHp} HP
              </Text>
            </View>

            {/* Enemy Status Badges */}
            {enemy.statuses.length > 0 && (
              <View style={styles.statusRow}>
                {enemy.statuses.map((s: StatusEffect, idx: number) => {
                  const meta = getStatusMetadata(s);
                  return (
                    <View
                      key={idx}
                      style={styles.statusBadge}
                      onTouchEnd={() => onInspectStatus && onInspectStatus(meta.name, meta.desc)}
                    >
                      <Text style={styles.statusEmoji}>{meta.emoji}</Text>
                      <Text style={styles.statusAmt}>{s.amount}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  stageWrapper: {
    flex: 1,
    minHeight: 245,
    backgroundColor: '#09060E',
    borderBottomWidth: 1.5,
    borderBottomColor: '#881337',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  backdropLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdropImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.48,
  },
  comboCalloutBanner: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 5, 18, 0.92)',
    borderWidth: 1.5,
    borderColor: '#F43F5E',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    zIndex: 80,
  },
  comboTypeTag: {
    color: '#FBBF24',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  comboTechniqueText: {
    color: '#FFF1F2',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 1,
  },
  fightersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  heroColumn: {
    width: '46%',
    alignItems: 'center',
  },
  enemyColumn: {
    width: '48%',
    alignItems: 'center',
  },
  fighterSpriteContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  portraitAvatarBadge: {
    position: 'absolute',
    top: 4,
    left: -8,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#F59E0B',
    overflow: 'hidden',
    backgroundColor: '#090D16',
    zIndex: 40,
  },
  portraitAvatarImg: {
    width: '100%',
    height: '100%',
  },
  enemyRigBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  enemyTargetedGlow: {
    transform: [{ scale: 1.05 }],
  },
  slashOverlay: {
    position: 'absolute',
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 60,
  },
  intentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 10, 22, 0.92)',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 4,
    gap: 5,
  },
  intentIcon: {
    fontSize: 14,
  },
  intentNumber: {
    fontSize: 13,
    fontWeight: '900',
  },
  intentDescText: {
    color: '#E2E8F0',
    fontSize: 9,
    fontWeight: '700',
    maxWidth: 120,
  },
  floatingOverlay: {
    position: 'absolute',
    top: 24,
    zIndex: 90,
    alignItems: 'center',
  },
  floatingPill: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginVertical: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  floatingVal: {
    fontSize: 14,
    fontWeight: '900',
  },
  unitHudPlate: {
    width: '100%',
    backgroundColor: 'rgba(13, 17, 23, 0.92)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  unitTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitNameText: {
    color: '#F0F6FC',
    fontSize: 11.5,
    fontWeight: '900',
    flex: 1,
  },
  wardPill: {
    backgroundColor: '#1E3A8A',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  wardPillText: {
    color: '#E0F2FE',
    fontSize: 8.5,
    fontWeight: '900',
  },
  weaponSubText: {
    color: '#F59E0B',
    fontSize: 8.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  hpBarTrack: {
    height: 13,
    backgroundColor: '#090D16',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#30363D',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hpBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  hpBarLabel: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B22',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  statusEmoji: {
    fontSize: 9,
    marginRight: 2,
  },
  statusAmt: {
    color: '#F0F6FC',
    fontSize: 8.5,
    fontWeight: '900',
  },
});
