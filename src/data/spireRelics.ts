import { SpireRelic, SpirePotion } from '../types/spire';

export const STARTER_RELIC: SpireRelic = {
  id: 'phoenix_battery',
  name: 'Phoenix Battery',
  description: 'At the end of each combat, regenerate 6 Vitality.',
  icon: '🔋',
  rarity: 'starter',
};

export const ALL_SPIRE_RELICS: SpireRelic[] = [
  STARTER_RELIC,
  {
    id: 'dark_matter_prism',
    name: 'Dark Matter Prism',
    description: 'At the start of each combat, channel +1 Strength.',
    icon: '🔮',
    rarity: 'common',
  },
  {
    id: 'kinetic_plate',
    name: 'Kinetic Inertia Plate',
    description: 'Start each combat with 10 Barrier.',
    icon: '🛡️',
    rarity: 'common',
  },
  {
    id: 'nanite_emitter',
    name: 'Nanite Barrier Emitter',
    description: 'If you end your turn with 0 Barrier, auto-deploy 6 Barrier.',
    icon: '💠',
    rarity: 'common',
  },
  {
    id: 'bio_ampoule',
    name: 'Bio-Regen Ampoule',
    description: 'At the start of each combat, heal 2 Vitality.',
    icon: '🧪',
    rarity: 'common',
  },
  {
    id: 'targeting_uplink',
    name: 'Targeting Uplink',
    description: 'At the start of combat, inflict 1 Vulnerable on all hostiles.',
    icon: '📡',
    rarity: 'common',
  },
  {
    id: 'auxiliary_reactor',
    name: 'Auxiliary Reactor',
    description: 'Gain +1 Energy on the first turn of each combat.',
    icon: '⚡',
    rarity: 'uncommon',
  },
  {
    id: 'molecular_disruptor',
    name: 'Molecular Disruptor',
    description: 'Enemies in Elite sectors spawn with 25% less HP.',
    icon: '🧬',
    rarity: 'uncommon',
  },
  {
    id: 'resonance_capacitor', // Akabeko
    name: 'Resonance Capacitor',
    description: 'Your first Attack each combat deals +8 bonus kinetic damage.',
    icon: '🔔',
    rarity: 'common',
  },
  {
    id: 'quantum_edge', // Pen Nib
    name: 'Quantum Edge',
    description: 'Every 10th Attack you execute deals DOUBLE damage.',
    icon: '✒️',
    rarity: 'common',
    counter: 0,
  },
  {
    id: 'phase_stabilizer', // Horn Cleat
    name: 'Phase Stabilizer',
    description: 'At the start of your 2nd turn, auto-deploy 14 Barrier.',
    icon: '⚓',
    rarity: 'uncommon',
  },
  {
    id: 'aegis_gyroscope', // Captain's Wheel
    name: 'Aegis Gyroscope',
    description: 'At the start of your 3rd turn, auto-deploy 18 Barrier.',
    icon: '☸️',
    rarity: 'rare',
  },
  {
    id: 'vulnerability_matrix', // Paper Phrog
    name: 'Vulnerability Matrix',
    description: 'Hostiles with Vulnerable take 75% more damage rather than 50%.',
    icon: '🐸',
    rarity: 'uncommon',
  },
  {
    id: 'tachyon_emitter', // Mercury Hourglass
    name: 'Tachyon Emitter',
    description: 'At the start of each of your turns, deal 3 damage to ALL hostiles.',
    icon: '⏳',
    rarity: 'uncommon',
  },
  {
    id: 'nano_suture', // Meat on the Bone
    name: 'Nano-Suture Core',
    description: 'If your Vitality is at or below 50% at the end of combat, repair 12 HP.',
    icon: '🥩',
    rarity: 'uncommon',
  },
  {
    id: 'crimson_overdrive', // Red Skull
    name: 'Crimson Overdrive',
    description: 'While your Vitality is at or below 50%, you have +3 bonus Strength.',
    icon: '💀',
    rarity: 'common',
  },
];

export const ALL_SPIRE_POTIONS: SpirePotion[] = [
  {
    id: 'plasma_grenade', // Fire Potion
    name: 'Plasma Grenade',
    description: 'Detonate for 20 instant thermal damage to target.',
    icon: '💣',
    target: 'enemy',
  },
  {
    id: 'barrier_injector', // Block Potion
    name: 'Barrier Injector',
    description: 'Inject emergency forcefield for 12 Barrier.',
    icon: '💉',
    target: 'self',
  },
  {
    id: 'adrenaline_booster', // Strength Potion
    name: 'Adrenaline Booster',
    description: 'Overclock cybernetics for +2 Strength this combat.',
    icon: '⚡',
    target: 'self',
  },
  {
    id: 'tachyon_cell', // Energy Potion
    name: 'Tachyon Cell',
    description: 'Immediately surge +2 operational Energy.',
    icon: '🔋',
    target: 'self',
  },
  {
    id: 'neural_accelerator', // Swift Potion
    name: 'Neural Accelerator',
    description: 'Immediately draw 3 cards from your deck.',
    icon: '🧠',
    target: 'self',
  },
  {
    id: 'suppression_vial', // Weak Potion
    name: 'Suppression Vial',
    description: 'Inflict 3 Weak on target hostile.',
    icon: '🧪',
    target: 'enemy',
  },
  {
    id: 'gravity_vial', // Fear Potion
    name: 'Gravity Vial',
    description: 'Inflict 3 Vulnerable on target hostile.',
    icon: '🌌',
    target: 'enemy',
  },
  {
    id: 'bio_mender', // Regen/Blood Potion
    name: 'Bio-Mender Ampoule',
    description: 'Immediately restore 15 Vitality.',
    icon: '❤️‍🩹',
    target: 'self',
  },
];

export function getRandomRelic(excludeIds: string[] = []): SpireRelic {
  const pool = ALL_SPIRE_RELICS.filter(r => !excludeIds.includes(r.id));
  if (pool.length === 0) return { ...ALL_SPIRE_RELICS[1] };
  return { ...pool[Math.floor(Math.random() * pool.length)] };
}

export function getRandomPotion(): SpirePotion {
  return { ...ALL_SPIRE_POTIONS[Math.floor(Math.random() * ALL_SPIRE_POTIONS.length)] };
}
