import { SpireCard, SpireRelic } from '../types/spire';

export type WarriorArchetypeId =
  | 'odachi_vanguard'
  | 'kodachi_phantom'
  | 'nunchaku_dragon'
  | 'kusarigama_mystic';

export type CardMotionType =
  | 'single_hit'
  | 'multi_hit'
  | 'close_quarters'
  | 'ward_stance'
  | 'spirit_surge';

export interface MotionAnimationSpec {
  type: CardMotionType;
  name: string;
  description: string;
  hitCount: number;
  cameraZoom: number;
  hitStopMs: number;
  dashSpeedMs: number;
  durationMs: number;
  slashTrailColor: string;
  secondaryTrailColor: string;
  slashAngleDeg: number;
  vfxType:
    | 'crescent_arc'
    | 'cross_flurry'
    | 'seismic_grapple'
    | 'shadow_pierce'
    | 'petal_vortex'
    | 'sweep_strike'
    | 'dragon_shockwave'
    | 'nunchaku_octa_flurry'
    | 'chain_parry_uppercut'
    | 'meteor_guillotine'
    | 'sickle_whirlwind'
    | 'talisman_detonation'
    | 'ward_barrier'
    | 'spirit_awakening';
  callout: string;
}

export interface WarriorProfile {
  id: WarriorArchetypeId;
  name: string;
  defaultName: string;
  title: string;
  epithet: string;
  heritage: string;
  lore: string;
  hp: number;
  maxHp: number;
  energy: number;
  chi: number;
  weapon: string;
  weaponName: string;
  weaponDescription: string;
  fightingStyle: string;
  primaryColor: string;
  accentColor: string;
  slashTrailColor: string;
  auraColor: string;
  hairStyle: string;
  silhouetteTag: 'odachi' | 'kodachi' | 'nunchaku' | 'kusarigama';
  starterRelic: SpireRelic;
  animations: {
    single_hit: MotionAnimationSpec;
    multi_hit: MotionAnimationSpec;
    close_quarters: MotionAnimationSpec;
    ward_stance: MotionAnimationSpec;
    spirit_surge: MotionAnimationSpec;
  };
  motions: {
    single_hit: MotionAnimationSpec;
    multi_hit: MotionAnimationSpec;
    close_quarters: MotionAnimationSpec;
    ward_stance: MotionAnimationSpec;
    spirit_surge: MotionAnimationSpec;
  };
}

// ============================================================================
// AUTHENTIC AFRO-ASIAN FUSION NAME POOLS
// Combines Yoruba, Igbo, Swahili, Akan, and Hausa warrior given names with
// Japanese, Wu-Xia, and Ryukyu martial clan names.
// ============================================================================
const AFRICAN_GIVEN_NAMES_BY_ARCHETYPE: Record<string, string[]> = {
  odachi_vanguard: [
    'Kofi',
    'Kwame',
    'Jabari',
    'Oba',
    'Chike',
    'Zuberi',
    'Bamidele',
    'Akin',
    'Sundiata',
    'Azizi',
  ],
  kodachi_phantom: [
    'Zuri',
    'Nia',
    'Imani',
    'Ayodele',
    'Sade',
    'Amina',
    'Kioni',
    'Nneka',
    'Zalika',
    'Thandiwe',
  ],
  nunchaku_dragon: [
    'Tarik',
    'Jelani',
    'Idris',
    'Kenshin-Obi',
    'Kayode',
    'Tendai',
    'Femi',
    'Dakarai',
    'Sekou',
    'Omari',
  ],
  kusarigama_mystic: [
    'Amara',
    'Yaa',
    'Eshe',
    'Adanna',
    'Makena',
    'Chioma',
    'Zahara',
    'Ifeya',
    'Ashanti',
    'Subira',
  ],
};

const EAST_ASIAN_CLAN_NAMES: string[] = [
  'Kurogane',
  'Hayabusa',
  'Tachibana',
  'Kazama',
  'Tsukuyomi',
  'Higanbana',
  'Musashi',
  'Shinobi',
  'Yagyu',
  'Kagutsuchi',
  'Longwei',
  'Ryukyu',
  'Amaterasu',
  'Muramasa',
  'Bishamonten',
  'Hattori',
];

const ARCHETYPE_TITLES: Record<string, string[]> = {
  odachi_vanguard: [
    'The Cursed Odachi Vanguard',
    'Ashura of the Obsidian Pagoda',
    'Blood-Moon Greatblade Ronin',
    'Sovereign of the Severing Eclipse',
  ],
  kodachi_phantom: [
    'The Twin-Kodachi Kunoichi',
    'Shadow-Lotus Viper Assassin',
    'Phantom of the Violet Mist',
    'Nightingale of theSilent Spire',
  ],
  nunchaku_dragon: [
    'The Thunder Nunchaku Grandmaster',
    'Fist of the Nine Golden Dragons',
    'Raijin Storm-Temper Martialist',
    'Heaven-Shaking Iron Greaves',
  ],
  kusarigama_mystic: [
    'The Blood-Lantern Kusarigama Mystic',
    'Oracle of the Crimson Spider-Lily',
    'Soul-Chain Exorcist of the Eclipse',
    'Shrine Maiden of the Iron Meteor',
  ],
};

/**
 * Generates an authentic Afro-Asian warrior name and title for the given archetype.
 */
export function generateRandomWarriorName(archetypeId: string = 'odachi_vanguard'): {
  givenName: string;
  clanName: string;
  fullName: string;
  fullTitle: string;
} {
  const givenPool =
    AFRICAN_GIVEN_NAMES_BY_ARCHETYPE[archetypeId] ||
    AFRICAN_GIVEN_NAMES_BY_ARCHETYPE.odachi_vanguard;
  const titlePool =
    ARCHETYPE_TITLES[archetypeId] || ARCHETYPE_TITLES.odachi_vanguard;

  const givenName = givenPool[Math.floor(Math.random() * givenPool.length)];
  const clanName =
    EAST_ASIAN_CLAN_NAMES[Math.floor(Math.random() * EAST_ASIAN_CLAN_NAMES.length)];
  const chosenTitle = titlePool[Math.floor(Math.random() * titlePool.length)];
  const fullName = `${givenName} ${clanName}`;

  return {
    givenName,
    clanName,
    fullName,
    fullTitle: `${fullName} — ${chosenTitle}`,
  };
}

// ============================================================================
// 4 PLAYABLE AFRO-ASIAN WARRIORS
// ============================================================================
const ODACHI_MOTIONS: WarriorProfile['motions'] = {
  single_hit: {
    type: 'single_hit',
    name: 'Severing Eclipse Cleave',
    description:
      'Heavy overhead 360° crimson crescent slash that rends armor in a single devastating arc.',
    hitCount: 1,
    cameraZoom: 1.35,
    hitStopMs: 75,
    dashSpeedMs: 185,
    durationMs: 640,
    slashTrailColor: '#EF4444',
    secondaryTrailColor: '#F97316',
    slashAngleDeg: -32,
    vfxType: 'crescent_arc',
    callout: 'SEVERING ECLIPSE!',
  },
  multi_hit: {
    type: 'multi_hit',
    name: 'Ashura Cross-Tempest',
    description:
      '4x rapid diagonal blade vortex slashes carving a blazing crimson cross across the target.',
    hitCount: 4,
    cameraZoom: 1.24,
    hitStopMs: 45,
    dashSpeedMs: 150,
    durationMs: 720,
    slashTrailColor: '#F43F5E',
    secondaryTrailColor: '#FBBF24',
    slashAngleDeg: 45,
    vfxType: 'cross_flurry',
    callout: 'ASHURA TEMPEST!',
  },
  close_quarters: {
    type: 'close_quarters',
    name: 'Cursed Dragon-Arm Grapple & Pommel Crush',
    description:
      'Dashes point-blank, grabs enemy with glowing crimson gauntlet, delivers seismic knee + pommel slam.',
    hitCount: 2,
    cameraZoom: 1.42,
    hitStopMs: 90,
    dashSpeedMs: 130,
    durationMs: 680,
    slashTrailColor: '#F59E0B',
    secondaryTrailColor: '#DC2626',
    slashAngleDeg: 0,
    vfxType: 'seismic_grapple',
    callout: 'CRUSH THEIR BONES!',
  },
  ward_stance: {
    type: 'ward_stance',
    name: 'Iron Tsuba Deflection Stance',
    description:
      'Plants the massive Odachi into the stone floor, raising an impenetrable crimson-gold pagoda ward.',
    hitCount: 0,
    cameraZoom: 1.08,
    hitStopMs: 25,
    dashSpeedMs: 120,
    durationMs: 420,
    slashTrailColor: '#38BDF8',
    secondaryTrailColor: '#F59E0B',
    slashAngleDeg: 90,
    vfxType: 'ward_barrier',
    callout: 'UNYIELDING IRON!',
  },
  spirit_surge: {
    type: 'spirit_surge',
    name: 'Kagutsuchi Blood Awakening',
    description:
      'Unseals the cursed dragon gauntlet, erupting with black-and-crimson spiritual pressure.',
    hitCount: 0,
    cameraZoom: 1.28,
    hitStopMs: 60,
    dashSpeedMs: 100,
    durationMs: 560,
    slashTrailColor: '#DC2626',
    secondaryTrailColor: '#A855F7',
    slashAngleDeg: 0,
    vfxType: 'spirit_awakening',
    callout: 'AWAKEN, BLOOD SEAL!',
  },
};

const KODACHI_MOTIONS: WarriorProfile['motions'] = {
  single_hit: {
    type: 'single_hit',
    name: 'Moonlight Throat-Piercer',
    description:
      'Shadow-step teleport behind enemy followed by a lethal violet reverse-grip thrust.',
    hitCount: 1,
    cameraZoom: 1.32,
    hitStopMs: 65,
    dashSpeedMs: 115,
    durationMs: 520,
    slashTrailColor: '#A855F7',
    secondaryTrailColor: '#EC4899',
    slashAngleDeg: -18,
    vfxType: 'shadow_pierce',
    callout: 'SHADOW FANG!',
  },
  multi_hit: {
    type: 'multi_hit',
    name: 'Thousand Petal Blade Dance',
    description:
      'Mid-air somersault unleashing 6x rapid violet kodachi slashes & a fan of shadow kunai.',
    hitCount: 6,
    cameraZoom: 1.26,
    hitStopMs: 35,
    dashSpeedMs: 110,
    durationMs: 740,
    slashTrailColor: '#C084FC',
    secondaryTrailColor: '#38BDF8',
    slashAngleDeg: 60,
    vfxType: 'petal_vortex',
    callout: 'THOUSAND PETALS!',
  },
  close_quarters: {
    type: 'close_quarters',
    name: 'Shinobi Heel-Hook & Tanto Sweep',
    description:
      'Point-blank low sweep kick transitioning into a twin-hilt chakra palm strike.',
    hitCount: 2,
    cameraZoom: 1.38,
    hitStopMs: 70,
    dashSpeedMs: 105,
    durationMs: 590,
    slashTrailColor: '#E879F9',
    secondaryTrailColor: '#6366F1',
    slashAngleDeg: -45,
    vfxType: 'sweep_strike',
    callout: 'KNEEL IN SHADOW!',
  },
  ward_stance: {
    type: 'ward_stance',
    name: 'Kage-Bunshin Smoke Veil',
    description:
      'Crosses twin kodachi in a reverse-guard, dissolving into violet lotus smoke to deflect blows.',
    hitCount: 0,
    cameraZoom: 1.08,
    hitStopMs: 20,
    dashSpeedMs: 100,
    durationMs: 390,
    slashTrailColor: '#818CF8',
    secondaryTrailColor: '#C084FC',
    slashAngleDeg: 90,
    vfxType: 'ward_barrier',
    callout: 'MIST DISPERSION!',
  },
  spirit_surge: {
    type: 'spirit_surge',
    name: 'Forbidden Ninpo: Violet Lotus Mudra',
    description:
      'Weaves lightning-fast hand seals, igniting twin blades with phantom starlight.',
    hitCount: 0,
    cameraZoom: 1.25,
    hitStopMs: 50,
    dashSpeedMs: 95,
    durationMs: 520,
    slashTrailColor: '#A855F7',
    secondaryTrailColor: '#2DD4BF',
    slashAngleDeg: 0,
    vfxType: 'spirit_awakening',
    callout: 'NINPO: LOTUS ECLIPSE!',
  },
};

const NUNCHAKU_MOTIONS: WarriorProfile['motions'] = {
  single_hit: {
    type: 'single_hit',
    name: 'One-Inch Dragon Cannon',
    description:
      'Explosive forward shockwave strike channeling a roaring golden dragon aura through the target.',
    hitCount: 1,
    cameraZoom: 1.36,
    hitStopMs: 80,
    dashSpeedMs: 135,
    durationMs: 600,
    slashTrailColor: '#F59E0B',
    secondaryTrailColor: '#FEF08A',
    slashAngleDeg: -10,
    vfxType: 'dragon_shockwave',
    callout: 'DRAGON CANNON!',
  },
  multi_hit: {
    type: 'multi_hit',
    name: 'Fury of the Nine Dragons',
    description:
      'Blazing 8-hit figure-eight thunder nunchaku combo culminating in a flying somersault Flash Kick.',
    hitCount: 8,
    cameraZoom: 1.28,
    hitStopMs: 38,
    dashSpeedMs: 120,
    durationMs: 780,
    slashTrailColor: '#FBBF24',
    secondaryTrailColor: '#38BDF8',
    slashAngleDeg: 35,
    vfxType: 'nunchaku_octa_flurry',
    callout: 'NINE DRAGONS ROAR!',
  },
  close_quarters: {
    type: 'close_quarters',
    name: 'Wing-Chun Chain Trap & Rising Elbow',
    description:
      'Point-blank nunchaku chain parry, rapid trapping punches, and a bone-crushing Tekken-style rising elbow.',
    hitCount: 3,
    cameraZoom: 1.4,
    hitStopMs: 85,
    dashSpeedMs: 115,
    durationMs: 650,
    slashTrailColor: '#F97316',
    secondaryTrailColor: '#FACC15',
    slashAngleDeg: -75,
    vfxType: 'chain_parry_uppercut',
    callout: 'SHATTER THEIR GUARD!',
  },
  ward_stance: {
    type: 'ward_stance',
    name: 'Raijin Coiled-Dragon Guard',
    description:
      'Spins electrified nunchaku in a high-velocity figure-eight shield while grounding iron greaves.',
    hitCount: 0,
    cameraZoom: 1.08,
    hitStopMs: 25,
    dashSpeedMs: 110,
    durationMs: 410,
    slashTrailColor: '#FBBF24',
    secondaryTrailColor: '#38BDF8',
    slashAngleDeg: 90,
    vfxType: 'ward_barrier',
    callout: 'THUNDER COIL!',
  },
  spirit_surge: {
    type: 'spirit_surge',
    name: 'Eight Gates of Golden Lightning',
    description:
      'Stomps the pagoda tiles, cracking the ground as golden bio-lightning arcs across braided locs.',
    hitCount: 0,
    cameraZoom: 1.28,
    hitStopMs: 55,
    dashSpeedMs: 100,
    durationMs: 540,
    slashTrailColor: '#F59E0B',
    secondaryTrailColor: '#60A5FA',
    slashAngleDeg: 0,
    vfxType: 'spirit_awakening',
    callout: 'HEAVENLY THUNDER GATE!',
  },
};

const KUSARIGAMA_MOTIONS: WarriorProfile['motions'] = {
  single_hit: {
    type: 'single_hit',
    name: 'Guillotine Meteor Drop',
    description:
      'Swings the heavy iron chain-meteor overhead in a wide arc to crush the target from above.',
    hitCount: 1,
    cameraZoom: 1.34,
    hitStopMs: 78,
    dashSpeedMs: 165,
    durationMs: 630,
    slashTrailColor: '#E11D48',
    secondaryTrailColor: '#2DD4BF',
    slashAngleDeg: -65,
    vfxType: 'meteor_guillotine',
    callout: 'METEOR GUILLOTINE!',
  },
  multi_hit: {
    type: 'multi_hit',
    name: 'Spider-Lily Whirling Sickle Storm',
    description:
      'Wide spinning chain-sickle vortex slicing 5x with spectral crimson Higanbana petals.',
    hitCount: 5,
    cameraZoom: 1.25,
    hitStopMs: 42,
    dashSpeedMs: 140,
    durationMs: 750,
    slashTrailColor: '#FB7185',
    secondaryTrailColor: '#14B8A6',
    slashAngleDeg: 25,
    vfxType: 'sickle_whirlwind',
    callout: 'BLOOM IN BLOOD!',
  },
  close_quarters: {
    type: 'close_quarters',
    name: 'Blood-Talisman Palm Detonation',
    description:
      'Dashes inside the enemy guard, slaps a burning ofuda seal onto their chest, and triggers a point-blank spirit blast.',
    hitCount: 2,
    cameraZoom: 1.42,
    hitStopMs: 88,
    dashSpeedMs: 120,
    durationMs: 660,
    slashTrailColor: '#10B981',
    secondaryTrailColor: '#F43F5E',
    slashAngleDeg: 0,
    vfxType: 'talisman_detonation',
    callout: 'SEAL & DETONATE!',
  },
  ward_stance: {
    type: 'ward_stance',
    name: 'Ofuda Iron-Chain Orbit',
    description:
      'Orbits the iron chain and glowing paper talismans in a protective 360-degree spiritual ward.',
    hitCount: 0,
    cameraZoom: 1.08,
    hitStopMs: 25,
    dashSpeedMs: 115,
    durationMs: 420,
    slashTrailColor: '#14B8A6',
    secondaryTrailColor: '#FB7185',
    slashAngleDeg: 90,
    vfxType: 'ward_barrier',
    callout: 'SACRED SHRINE WARD!',
  },
  spirit_surge: {
    type: 'spirit_surge',
    name: 'Tsukuyomi Blood-Lantern Ritual',
    description:
      'Raises the ancestral blood-lantern aloft, bathing the arena in eclipse moonlight and spirit fire.',
    hitCount: 0,
    cameraZoom: 1.27,
    hitStopMs: 55,
    dashSpeedMs: 100,
    durationMs: 550,
    slashTrailColor: '#F43F5E',
    secondaryTrailColor: '#2DD4BF',
    slashAngleDeg: 0,
    vfxType: 'spirit_awakening',
    callout: 'ECLIPSE LANTERN, SHINE!',
  },
};

export const AFRO_ASIAN_WARRIORS: WarriorProfile[] = [
  {
    id: 'odachi_vanguard',
    name: 'Kofi Kurogane',
    defaultName: 'Kofi Kurogane',
    title: 'The Cursed Odachi Vanguard',
    epithet: 'Demon-Blade Ronin of the Ashanti-Kurogane Lineage',
    heritage: 'Ashanti Gold-Coast & Kurogane Forge Clan',
    lore:
      'Sworn to sever the Eclipse Pagoda’s corruption, Kofi wields a six-foot Demon Odachi tempered in meteoric iron and ancestral spirit-fire.',
    hp: 80,
    maxHp: 80,
    energy: 3,
    chi: 3,
    weapon: 'Demon Odachi (Great-Katana)',
    weaponName: 'Demon Odachi (Great-Katana)',
    weaponDescription:
      'Six-foot curved obsidian greatblade etched with crimson Ashanti Adinkra and kanji runes.',
    fightingStyle: 'Kurogane Iaijutsu & Dragon-Gauntlet Grappling',
    primaryColor: '#EF4444',
    accentColor: '#F59E0B',
    slashTrailColor: '#EF4444',
    auraColor: 'rgba(239, 68, 68, 0.45)',
    hairStyle: 'High-top warrior dreadlock ponytail with crimson headband',
    silhouetteTag: 'odachi',
    starterRelic: {
      id: 'crimson_dragon_seal',
      name: 'Crimson Dragon Seal',
      description: 'At the end of each combat, mend 6 HP through ancestral blood-fire.',
      icon: '🐉',
      rarity: 'starter',
    },
    animations: ODACHI_MOTIONS,
    motions: ODACHI_MOTIONS,
  },
  {
    id: 'kodachi_phantom',
    name: 'Zuri Tachibana',
    defaultName: 'Zuri Tachibana',
    title: 'The Twin-Kodachi Kunoichi',
    epithet: 'Mist-Walker of the Swahili-Iga Shadow Guild',
    heritage: 'Zanzibar Shadow-Coast & Tachibana Shinobi Clan',
    lore:
      'Moving faster than a heartbeat between pagoda rafters, Zuri combines acrobatic capoeira-kick sweeps with lethal twin viper kodachi.',
    hp: 72,
    maxHp: 72,
    energy: 3,
    chi: 3,
    weapon: 'Twin Viper Kodachi & Shadow Kunai',
    weaponName: 'Twin Viper Kodachi & Shadow Kunai',
    weaponDescription:
      'Paired reverse-grip short blades and phantom kunai infused with violet lotus venom.',
    fightingStyle: 'Niten Shadow-Stepping & Heel-Hook Acrobatics',
    primaryColor: '#A855F7',
    accentColor: '#EC4899',
    slashTrailColor: '#C084FC',
    auraColor: 'rgba(168, 85, 247, 0.45)',
    hairStyle: 'Braided silver-violet crown locs with shinobi face-mask',
    silhouetteTag: 'kodachi',
    starterRelic: {
      id: 'violet_lotus_ring',
      name: 'Violet Lotus Ring',
      description: 'At the start of each combat, draw +2 additional scrolls on Turn 1.',
      icon: '🪷',
      rarity: 'starter',
    },
    animations: KODACHI_MOTIONS,
    motions: KODACHI_MOTIONS,
  },
  {
    id: 'nunchaku_dragon',
    name: 'Tarik Kazama',
    defaultName: 'Tarik Kazama',
    title: 'The Thunder Nunchaku Grandmaster',
    epithet: 'Grandmaster of the Golden Lightning Fist',
    heritage: 'Nubian Sun-Guard & Ryukyu Dragon Dojo',
    lore:
      'A martial prodigy whose braided locs crackle with Raijin’s storm-chi, chaining blinding nunchaku strikes into bone-shattering Tekken-style kicks.',
    hp: 78,
    maxHp: 78,
    energy: 3,
    chi: 3,
    weapon: 'Thunder-Coil Nunchaku & Iron Greaves',
    weaponName: 'Thunder-Coil Nunchaku & Iron Greaves',
    weaponDescription:
      'Twin dragon-carved ironwood rods linked by storm-forged chain, paired with gilded shin greaves.',
    fightingStyle: 'Ryukyu Nunchaku-Do, Wing-Chun Trapping & Flash Kicks',
    primaryColor: '#F59E0B',
    accentColor: '#38BDF8',
    slashTrailColor: '#FBBF24',
    auraColor: 'rgba(245, 158, 11, 0.45)',
    hairStyle: 'Golden-ringed locs with sleeveless dragon-scale gi',
    silhouetteTag: 'nunchaku',
    starterRelic: {
      id: 'raijin_handwraps',
      name: 'Raijin Handwraps',
      description: 'Start each combat with +1 Strength and +4 Ward.',
      icon: '⚡',
      rarity: 'starter',
    },
    animations: NUNCHAKU_MOTIONS,
    motions: NUNCHAKU_MOTIONS,
  },
  {
    id: 'kusarigama_mystic',
    name: 'Amara Tsukuyomi',
    defaultName: 'Amara Tsukuyomi',
    title: 'The Blood-Lantern Kusarigama Mystic',
    epithet: 'High Exorcist of the Eclipse Shrine',
    heritage: 'Yoruba Orisha Priesthood & Tsukuyomi Onmyoji Order',
    lore:
      'Guiding lost souls with her crimson spirit-lantern, Amara lashes out with a weighted iron meteor-chain and crescent sickle before detonating paper talismans at point-blank range.',
    hp: 75,
    maxHp: 75,
    energy: 3,
    chi: 3,
    weapon: 'Blood-Moon Kusarigama (Chain-Sickle) & Spirit Talismans',
    weaponName: 'Blood-Moon Kusarigama (Chain-Sickle) & Spirit Talismans',
    weaponDescription:
      'Crescent reaper sickle tethered to a heavy iron meteor weight and burning Onmyoji paper seals.',
    fightingStyle: 'Kusarigama Vortex Whip & Ofuda Palm Detonation',
    primaryColor: '#E11D48',
    accentColor: '#14B8A6',
    slashTrailColor: '#FB7185',
    auraColor: 'rgba(225, 29, 72, 0.45)',
    hairStyle: 'Flowing obsidian afro-braids adorned with spider-lily hairpins',
    silhouetteTag: 'kusarigama',
    starterRelic: {
      id: 'eclipse_lantern',
      name: 'Eclipse Lantern',
      description: 'Grants +1 bonus Chi on Turn 1 and +4 Metallicize Ward each turn.',
      icon: '🏮',
      rarity: 'starter',
    },
    animations: KUSARIGAMA_MOTIONS,
    motions: KUSARIGAMA_MOTIONS,
  },
];

// ============================================================================
// MOTION CHOREOGRAPHY CLASSIFIER FOR ALL CARDS
// Classifies any SpireCard into one of the 3 distinct attack animations
// ('single_hit' | 'multi_hit' | 'close_quarters') or ('ward_stance' | 'spirit_surge')
// ============================================================================
const CLOSE_QUARTERS_CARD_IDS = new Set([
  'gravity_crush',
  'barrier_impact',
  'kinetic_suppression',
  'cranial_smash',
  'kinetic_pulse',
  'disruption_blade',
  'seismic_shockwave',
  'neutron_hammer',
  'life_siphon',
  'blind_charge',
]);

const MULTI_HIT_CARD_IDS = new Set([
  'plasma_ricochet',
  'dual_phase_blades',
  'kinetic_vortex',
  'flurry_barrage',
  'singularity_purge',
  'vampiric_scythe',
  'radial_scythe',
]);

/**
 * Classifies any SpireCard into its corresponding martial motion choreography type.
 */
export function getCardMotionType(card: SpireCard): CardMotionType {
  if (card.type === 'power') {
    return 'spirit_surge';
  }
  if (card.type === 'skill') {
    if (card.block && card.block > 0) {
      return 'ward_stance';
    }
    return 'spirit_surge';
  }
  if (card.type !== 'attack') {
    return 'ward_stance';
  }

  // Strip random instance suffix (e.g., "gravity_crush_1" -> "gravity_crush")
  const baseId = card.id.replace(/_[a-z0-9]{1,7}$/i, '');

  if (MULTI_HIT_CARD_IDS.has(baseId) || MULTI_HIT_CARD_IDS.has(card.id)) {
    return 'multi_hit';
  }

  if (CLOSE_QUARTERS_CARD_IDS.has(baseId) || CLOSE_QUARTERS_CARD_IDS.has(card.id)) {
    return 'close_quarters';
  }

  // Check description heuristics for multi-hit or close-quarters martial strikes
  const descLower = card.description.toLowerCase();
  if (
    descLower.includes('times') ||
    descLower.includes('twice') ||
    descLower.includes('all ') ||
    (card.magicNumber && card.magicNumber >= 2 && descLower.includes('strike'))
  ) {
    return 'multi_hit';
  }

  if (
    descLower.includes('pommel') ||
    descLower.includes('grapple') ||
    descLower.includes('palm') ||
    descLower.includes('elbow') ||
    descLower.includes('knee') ||
    descLower.includes('crush') ||
    descLower.includes('bash') ||
    (card.block && card.block > 0)
  ) {
    return 'close_quarters';
  }

  return 'single_hit';
}

/**
 * Looks up a warrior profile by ID, defaulting to Kofi Kurogane ('odachi_vanguard').
 */
export function getWarriorById(archetypeId?: string): WarriorProfile {
  return (
    AFRO_ASIAN_WARRIORS.find((w) => w.id === archetypeId) || AFRO_ASIAN_WARRIORS[0]
  );
}

/**
 * Returns the full MotionAnimationSpec for a given card and active warrior.
 */
export function getCardChoreography(
  card: SpireCard,
  warrior: WarriorProfile = AFRO_ASIAN_WARRIORS[0]
): MotionAnimationSpec {
  const motionType = getCardMotionType(card);
  return warrior.motions[motionType];
}
