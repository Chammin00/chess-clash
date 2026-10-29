import { SpireCard } from '../types/spire';

// ============================================================================
// STARTER CARDS (Strike, Defend, Bash)
// ============================================================================
export const STARTER_DECK: SpireCard[] = [
  {
    id: 'void_slash_1',
    name: 'Void Slash',
    cost: 1,
    type: 'attack',
    rarity: 'starter',
    description: 'Strike foe for 6 damage.',
    damage: 6,
    target: 'enemy',
    artEmoji: '🗡️',
    color: '#EF4444',
  },
  {
    id: 'void_slash_2',
    name: 'Void Slash',
    cost: 1,
    type: 'attack',
    rarity: 'starter',
    description: 'Strike foe for 6 damage.',
    damage: 6,
    target: 'enemy',
    artEmoji: '🗡️',
    color: '#EF4444',
  },
  {
    id: 'void_slash_3',
    name: 'Void Slash',
    cost: 1,
    type: 'attack',
    rarity: 'starter',
    description: 'Strike foe for 6 damage.',
    damage: 6,
    target: 'enemy',
    artEmoji: '🗡️',
    color: '#EF4444',
  },
  {
    id: 'void_slash_4',
    name: 'Void Slash',
    cost: 1,
    type: 'attack',
    rarity: 'starter',
    description: 'Strike foe for 6 damage.',
    damage: 6,
    target: 'enemy',
    artEmoji: '🗡️',
    color: '#EF4444',
  },
  {
    id: 'void_slash_5',
    name: 'Void Slash',
    cost: 1,
    type: 'attack',
    rarity: 'starter',
    description: 'Strike foe for 6 damage.',
    damage: 6,
    target: 'enemy',
    artEmoji: '🗡️',
    color: '#EF4444',
  },
  {
    id: 'aegis_ward_1',
    name: 'Aegis Ward',
    cost: 1,
    type: 'skill',
    rarity: 'starter',
    description: 'Deploy 5 Barrier.',
    block: 5,
    target: 'self',
    artEmoji: '🛡️',
    color: '#0EA5E9',
  },
  {
    id: 'aegis_ward_2',
    name: 'Aegis Ward',
    cost: 1,
    type: 'skill',
    rarity: 'starter',
    description: 'Deploy 5 Barrier.',
    block: 5,
    target: 'self',
    artEmoji: '🛡️',
    color: '#0EA5E9',
  },
  {
    id: 'aegis_ward_3',
    name: 'Aegis Ward',
    cost: 1,
    type: 'skill',
    rarity: 'starter',
    description: 'Deploy 5 Barrier.',
    block: 5,
    target: 'self',
    artEmoji: '🛡️',
    color: '#0EA5E9',
  },
  {
    id: 'aegis_ward_4',
    name: 'Aegis Ward',
    cost: 1,
    type: 'skill',
    rarity: 'starter',
    description: 'Deploy 5 Barrier.',
    block: 5,
    target: 'self',
    artEmoji: '🛡️',
    color: '#0EA5E9',
  },
  {
    id: 'gravity_crush_1',
    name: 'Gravity Crush',
    cost: 2,
    type: 'attack',
    rarity: 'starter',
    description: 'Deal 8 kinetic damage. Apply 2 Vulnerable.',
    damage: 8,
    magicNumber: 2,
    target: 'enemy',
    artEmoji: '💥',
    color: '#F59E0B',
  },
];

// ============================================================================
// COMPREHENSIVE CARD CATALOG (1-to-1 Slay the Spire replica card pool)
// ============================================================================
export const SPIRE_CARD_CATALOG: SpireCard[] = [
  // --- COMMON ATTACKS ---
  {
    id: 'fury_rebound', // Anger (0 cost, 6 dmg, shuffle copy)
    name: 'Fury Rebound',
    cost: 0,
    type: 'attack',
    rarity: 'common',
    description: 'Deal 6 damage. Place a copy into discard pile.',
    damage: 6,
    target: 'enemy',
    artEmoji: '💢',
    color: '#EF4444',
  },
  {
    id: 'barrier_impact', // Body Slam (1 cost, dmg = current block)
    name: 'Barrier Impact',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    description: 'Deal damage equal to your current Barrier.',
    damage: 0, // dynamic in engine
    target: 'enemy',
    artEmoji: '🛡️',
    color: '#EF4444',
  },
  {
    id: 'radial_scythe', // Cleave (1 cost, 8 dmg to ALL)
    name: 'Radial Scythe',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    description: 'Sweep ALL hostiles for 8 damage.',
    damage: 8,
    target: 'all_enemies',
    artEmoji: '🌪️',
    color: '#EF4444',
  },
  {
    id: 'kinetic_suppression', // Clothesline (2 cost, 12 dmg, 2 weak)
    name: 'Suppression Beam',
    cost: 2,
    type: 'attack',
    rarity: 'common',
    description: 'Deal 12 damage. Inflict 2 Weak.',
    damage: 12,
    magicNumber: 2,
    target: 'enemy',
    artEmoji: '⚡',
    color: '#EF4444',
  },
  {
    id: 'cranial_smash', // Headbutt (1 cost, 9 dmg, put card from discard onto draw pile)
    name: 'Cranial Smash',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    description: 'Deal 9 damage. Retrieve a card from discard to top of deck.',
    damage: 9,
    target: 'enemy',
    artEmoji: '💥',
    color: '#EF4444',
  },
  {
    id: 'colossus_edge', // Heavy Blade (2 cost, 14 dmg, Strength x3)
    name: 'Colossus Edge',
    cost: 2,
    type: 'attack',
    rarity: 'common',
    description: 'Deal 14 damage. Strength affects this 3 times.',
    damage: 14,
    magicNumber: 3,
    target: 'enemy',
    artEmoji: '🪓',
    color: '#EF4444',
  },
  {
    id: 'kinetic_pulse', // Iron Wave (1 cost, 5 block, 5 dmg)
    name: 'Kinetic Pulse',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    description: 'Deploy 5 Barrier. Deal 5 damage.',
    damage: 5,
    block: 5,
    target: 'enemy',
    artEmoji: '⚡',
    color: '#EF4444',
  },
  {
    id: 'disruption_blade', // Pommel Strike (1 cost, 9 dmg, draw 1)
    name: 'Disruption Blade',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    description: 'Deal 9 damage. Draw 1 card.',
    damage: 9,
    magicNumber: 1,
    target: 'enemy',
    artEmoji: '🗡️',
    color: '#EF4444',
  },
  {
    id: 'plasma_ricochet', // Sword Boomerang (1 cost, 3 dmg 3 times random)
    name: 'Plasma Ricochet',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    description: 'Deal 3 damage to target 3 times.',
    damage: 3,
    magicNumber: 3,
    target: 'enemy',
    artEmoji: '🪃',
    color: '#EF4444',
  },
  {
    id: 'seismic_shockwave', // Thunderclap (1 cost, 4 dmg to all, 1 vulnerable to all)
    name: 'Seismic Wave',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    description: 'Deal 4 damage to ALL hostiles. Apply 1 Vulnerable to ALL.',
    damage: 4,
    magicNumber: 1,
    target: 'all_enemies',
    artEmoji: '🌊',
    color: '#EF4444',
  },
  {
    id: 'dual_phase_blades', // Twin Strike (1 cost, 5 dmg twice)
    name: 'Phase Blades',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    description: 'Strike twice for 5 damage each.',
    damage: 5,
    magicNumber: 2,
    target: 'enemy',
    artEmoji: '⚔️',
    color: '#EF4444',
  },

  // --- COMMON SKILLS ---
  {
    id: 'hyper_tune', // Armaments (1 cost, 5 block, upgrade in hand)
    name: 'Hyper-Tune',
    cost: 1,
    type: 'skill',
    rarity: 'common',
    description: 'Deploy 5 Barrier. Upgrade a card in hand for combat.',
    block: 5,
    target: 'self',
    artEmoji: '🔧',
    color: '#0EA5E9',
  },
  {
    id: 'nanite_surge', // Shrug It Off (1 cost, 8 block, draw 1)
    name: 'Nanite Surge',
    cost: 1,
    type: 'skill',
    rarity: 'common',
    description: 'Deploy 8 Barrier. Draw 1 card.',
    block: 8,
    magicNumber: 1,
    target: 'self',
    artEmoji: '🧪',
    color: '#0EA5E9',
  },
  {
    id: 'bio_overcharge', // Flex (0 cost, +2 str, lose 2 at turn end)
    name: 'Adrenaline Surge',
    cost: 0,
    type: 'skill',
    rarity: 'common',
    description: 'Gain 2 Strength this turn.',
    magicNumber: 2,
    target: 'self',
    artEmoji: '💪',
    color: '#0EA5E9',
  },
  {
    id: 'fortified_resilience', // True Grit (1 cost, 7 block, exhaust 1 card)
    name: 'Fortified Grit',
    cost: 1,
    type: 'skill',
    rarity: 'common',
    description: 'Deploy 7 Barrier. Exhaust a random card in hand.',
    block: 7,
    target: 'self',
    artEmoji: '🛡️',
    color: '#0EA5E9',
  },
  {
    id: 'battle_cry', // Warcry (0 cost, draw 1, topdeck 1)
    name: 'Battle Cry',
    cost: 0,
    type: 'skill',
    rarity: 'common',
    description: 'Draw 1 card. Place a card from hand onto draw pile.',
    magicNumber: 1,
    target: 'self',
    artEmoji: '📢',
    color: '#0EA5E9',
  },

  // --- UNCOMMON ATTACKS ---
  {
    id: 'singularity_cleave', // Carnage (2 cost, 20 dmg, ethereal)
    name: 'Singularity Cleave',
    cost: 2,
    type: 'attack',
    rarity: 'uncommon',
    description: 'Ethereal. Unload 20 void damage.',
    damage: 20,
    target: 'enemy',
    ethereal: true,
    artEmoji: '🌌',
    color: '#EF4444',
  },
  {
    id: 'neutron_hammer', // Uppercut (2 cost, 13 dmg, 1 weak 1 vuln)
    name: 'Neutron Hammer',
    cost: 2,
    type: 'attack',
    rarity: 'uncommon',
    description: 'Deal 13 damage. Inflict 1 Weak & 1 Vulnerable.',
    damage: 13,
    magicNumber: 1,
    target: 'enemy',
    artEmoji: '🔨',
    color: '#EF4444',
  },
  {
    id: 'kinetic_vortex', // Whirlwind (X cost / 2 cost standard in sim, deals 5 dmg x times to all)
    name: 'Kinetic Vortex',
    cost: 2,
    type: 'attack',
    rarity: 'uncommon',
    description: 'Deal 5 damage to ALL hostiles 2 times.',
    damage: 5,
    magicNumber: 2,
    target: 'all_enemies',
    artEmoji: '🌪️',
    color: '#EF4444',
  },
  {
    id: 'life_siphon', // Feed (1 cost, 10 dmg, fatal: +3 max hp)
    name: 'Bio-Harvester',
    cost: 1,
    type: 'attack',
    rarity: 'rare',
    description: 'Deal 10 damage. Fatal: Permanently gain +3 Max HP.',
    damage: 10,
    magicNumber: 3,
    target: 'enemy',
    artEmoji: '🧬',
    color: '#EF4444',
  },

  // --- UNCOMMON SKILLS ---
  {
    id: 'combat_focus', // Battle Trance (0 cost, draw 3, no more draws)
    name: 'Combat Focus',
    cost: 0,
    type: 'skill',
    rarity: 'uncommon',
    description: 'Draw 3 cards.',
    magicNumber: 3,
    target: 'self',
    artEmoji: '🧘',
    color: '#0EA5E9',
  },
  {
    id: 'blood_infusion', // Bloodletting (0 cost, lose 3 hp, gain 2 energy)
    name: 'Aether Siphon',
    cost: 0,
    type: 'skill',
    rarity: 'uncommon',
    description: 'Sacrifice 3 HP. Gain 2 Energy.',
    magicNumber: 2,
    target: 'self',
    artEmoji: '🩸',
    color: '#0EA5E9',
  },
  {
    id: 'emp_discharge', // Disarm (1 cost, enemy -2 str, exhaust)
    name: 'EMP Discharge',
    cost: 1,
    type: 'skill',
    rarity: 'uncommon',
    description: 'Hostile loses 2 Strength. Exhaust.',
    magicNumber: 2,
    target: 'enemy',
    exhaust: true,
    artEmoji: '⚡',
    color: '#0EA5E9',
  },
  {
    id: 'plasma_shield', // Flame Barrier (2 cost, 12 block, 4 reflect)
    name: 'Plasma Shield',
    cost: 2,
    type: 'skill',
    rarity: 'uncommon',
    description: 'Deploy 12 Barrier. Reflect 4 damage when struck.',
    block: 12,
    magicNumber: 4,
    target: 'self',
    artEmoji: '🔥',
    color: '#0EA5E9',
  },
  {
    id: 'reactive_barrier', // Entrench (2 cost, double block)
    name: 'Kinetic Reinforce',
    cost: 2,
    type: 'skill',
    rarity: 'uncommon',
    description: 'Double your current Barrier.',
    target: 'self',
    artEmoji: '🏰',
    color: '#0EA5E9',
  },
  {
    id: 'spot_vulnerability', // Spot Weakness (1 cost, if attacking gain 3 str)
    name: 'Target Analysis',
    cost: 1,
    type: 'skill',
    rarity: 'uncommon',
    description: 'If hostile intends to attack, gain 3 Strength.',
    magicNumber: 3,
    target: 'self',
    artEmoji: '🎯',
    color: '#0EA5E9',
  },
  {
    id: 'forcefield_matrix', // Impervious (2 cost, 30 block, exhaust)
    name: 'Forcefield Matrix',
    cost: 2,
    type: 'skill',
    rarity: 'rare',
    description: 'Deploy 30 Barrier. Exhaust.',
    block: 30,
    target: 'self',
    exhaust: true,
    artEmoji: '💠',
    color: '#0EA5E9',
  },
  {
    id: 'transcendence_offering', // Offering (0 cost, lose 6 hp, gain 2 energy, draw 3)
    name: 'Aether Overload',
    cost: 0,
    type: 'skill',
    rarity: 'rare',
    description: 'Lose 6 HP. Gain 2 Energy and draw 3 cards. Exhaust.',
    magicNumber: 3,
    target: 'self',
    exhaust: true,
    artEmoji: '⚡',
    color: '#0EA5E9',
  },
  {
    id: 'limit_amplifier', // Limit Break (1 cost, double strength)
    name: 'Overdrive Surge',
    cost: 1,
    type: 'skill',
    rarity: 'rare',
    description: 'Double your current Strength. Exhaust.',
    target: 'self',
    exhaust: true,
    artEmoji: '💥',
    color: '#0EA5E9',
  },

  // --- POWERS (Uncommon & Rare) ---
  {
    id: 'overcharge', // Inflame (1 cost, +2 str)
    name: 'Power Overcharge',
    cost: 1,
    type: 'power',
    rarity: 'uncommon',
    description: 'Channel +2 Strength.',
    magicNumber: 2,
    target: 'self',
    artEmoji: '⚡',
    color: '#8B5CF6',
  },
  {
    id: 'nanite_plating', // Metallicize (1 cost, +3 block at end of turn)
    name: 'Nanite Plating',
    cost: 1,
    type: 'power',
    rarity: 'uncommon',
    description: 'At end of your turn, deploy +3 Barrier.',
    magicNumber: 3,
    target: 'self',
    artEmoji: '🛡️',
    color: '#8B5CF6',
  },
  {
    id: 'void_overdrive', // Demon Form (3 cost, +2 str at start of turn)
    name: 'Void Overdrive',
    cost: 3,
    type: 'power',
    rarity: 'rare',
    description: 'At start of each turn, gain +2 Strength.',
    magicNumber: 2,
    target: 'self',
    artEmoji: '👑',
    color: '#8B5CF6',
  },
  {
    id: 'perpetual_aegis', // Barricade (3 cost, block not removed)
    name: 'Perpetual Aegis',
    cost: 3,
    type: 'power',
    rarity: 'rare',
    description: 'Barrier is never depleted at start of your turn.',
    target: 'self',
    artEmoji: '🏰',
    color: '#8B5CF6',
  },
  {
    id: 'berserk_matrix', // Berserk (0 cost, gain 1 vuln, +1 energy each turn)
    name: 'Core Accelerator',
    cost: 0,
    type: 'power',
    rarity: 'rare',
    description: 'Gain 1 Vulnerable. Gain +1 Energy at start of each turn.',
    target: 'self',
    artEmoji: '⚡',
    color: '#8B5CF6',
  },
  {
    id: 'obliterate', // Bludgeon (3 cost, 32 dmg)
    name: 'Annihilate',
    cost: 3,
    type: 'attack',
    rarity: 'rare',
    description: 'Unload 32 massive kinetic damage.',
    damage: 32,
    target: 'enemy',
    artEmoji: '💣',
    color: '#EF4444',
  },
  {
    id: 'vampiric_scythe', // Reaper (2 cost, 4 dmg to all, heal unblocked)
    name: 'Vampiric Scythe',
    cost: 2,
    type: 'attack',
    rarity: 'rare',
    description: 'Deal 4 damage to ALL hostiles. Heal HP equal to unblocked damage. Exhaust.',
    damage: 4,
    target: 'all_enemies',
    exhaust: true,
    artEmoji: '🩸',
    color: '#EF4444',
  },

  // --- ADDITIONAL 1-TO-1 IRONCLAD CARDS ---
  {
    id: 'precision_strike', // Perfected Strike (2 cost, 6 dmg + 2 per Strike/Slash in deck)
    name: 'Precision Strike',
    cost: 2,
    type: 'attack',
    rarity: 'common',
    description: 'Deal 6 damage. Deals +2 bonus damage for ALL your "Slash" & "Strike" cards.',
    damage: 6,
    magicNumber: 2,
    target: 'enemy',
    artEmoji: '🎯',
    color: '#EF4444',
  },
  {
    id: 'overload_slash', // Wild Strike (1 cost, 12 dmg, shuffle Wound into draw pile)
    name: 'Overload Slash',
    cost: 1,
    type: 'attack',
    rarity: 'common',
    description: 'Deal 12 damage. Shuffle a System Glitch into your draw pile.',
    damage: 12,
    target: 'enemy',
    artEmoji: '⚡',
    color: '#EF4444',
  },
  {
    id: 'blind_charge', // Reckless Charge (0 cost, 7 dmg, shuffle Dazed into draw pile)
    name: 'Blind Charge',
    cost: 0,
    type: 'attack',
    rarity: 'uncommon',
    description: 'Deal 7 damage. Shuffle a Neural Static into your draw pile.',
    damage: 7,
    target: 'enemy',
    artEmoji: '☄️',
    color: '#EF4444',
  },
  {
    id: 'bio_lance', // Hemokinesis (1 cost, lose 2 HP, deal 15 dmg)
    name: 'Bio-Lance',
    cost: 1,
    type: 'attack',
    rarity: 'uncommon',
    description: 'Sacrifice 2 HP. Deal 15 kinetic damage.',
    damage: 15,
    magicNumber: 2,
    target: 'enemy',
    artEmoji: '🩸',
    color: '#EF4444',
  },
  {
    id: 'escalating_strike', // Rampage (1 cost, 8 dmg, +5 dmg each play this combat)
    name: 'Escalating Strike',
    cost: 1,
    type: 'attack',
    rarity: 'uncommon',
    description: 'Deal 8 damage. Increase this card\'s damage by 5 this combat.',
    damage: 8,
    magicNumber: 5,
    target: 'enemy',
    artEmoji: '📈',
    color: '#EF4444',
  },
  {
    id: 'flurry_barrage', // Pummel (1 cost, 2 dmg x4, exhaust)
    name: 'Flurry Barrage',
    cost: 1,
    type: 'attack',
    rarity: 'uncommon',
    description: 'Deal 2 damage 4 times. Exhaust.',
    damage: 2,
    magicNumber: 4,
    target: 'enemy',
    exhaust: true,
    artEmoji: '🥊',
    color: '#EF4444',
  },
  {
    id: 'singularity_purge', // Fiend Fire (2 cost, exhaust hand, 7 dmg per card, exhaust)
    name: 'Singularity Purge',
    cost: 2,
    type: 'attack',
    rarity: 'rare',
    description: 'Exhaust all cards in hand. Deal 7 damage for each card Exhausted. Exhaust.',
    damage: 7,
    target: 'enemy',
    exhaust: true,
    artEmoji: '🔥',
    color: '#EF4444',
  },
  {
    id: 'plasma_supernova', // Immolate (2 cost, 21 dmg to all, add Burn to discard)
    name: 'Plasma Supernova',
    cost: 2,
    type: 'attack',
    rarity: 'rare',
    description: 'Deal 21 damage to ALL hostiles. Add a Thermal Burn into discard pile.',
    damage: 21,
    target: 'all_enemies',
    artEmoji: '☀️',
    color: '#EF4444',
  },
  {
    id: 'gravity_wave', // Shockwave (2 cost, 3 Weak & 3 Vuln to all, exhaust)
    name: 'Gravity Wave',
    cost: 2,
    type: 'skill',
    rarity: 'uncommon',
    description: 'Inflict 3 Weak and 3 Vulnerable to ALL hostiles. Exhaust.',
    magicNumber: 3,
    target: 'all_enemies',
    exhaust: true,
    artEmoji: '🌊',
    color: '#0EA5E9',
  },
  {
    id: 'system_jammer', // Intimidate (1 cost, 1 Weak to all, exhaust)
    name: 'System Jammer',
    cost: 1,
    type: 'skill',
    rarity: 'uncommon',
    description: 'Inflict 1 Weak to ALL hostiles. Exhaust.',
    magicNumber: 1,
    target: 'all_enemies',
    exhaust: true,
    artEmoji: '📡',
    color: '#0EA5E9',
  },
  {
    id: 'reactor_surge', // Seeing Red (1 cost, +2 energy, exhaust)
    name: 'Reactor Surge',
    cost: 1,
    type: 'skill',
    rarity: 'uncommon',
    description: 'Gain 2 Energy. Exhaust.',
    magicNumber: 2,
    target: 'self',
    exhaust: true,
    artEmoji: '🔋',
    color: '#0EA5E9',
  },
  {
    id: 'aegis_protocol', // Sentinel (1 cost, 5 block; if exhausted, +2 energy)
    name: 'Aegis Protocol',
    cost: 1,
    type: 'skill',
    rarity: 'uncommon',
    description: 'Deploy 5 Barrier. If this card is Exhausted, gain 2 Energy.',
    block: 5,
    magicNumber: 2,
    target: 'self',
    artEmoji: '🛡️',
    color: '#0EA5E9',
  },
  {
    id: 'emergency_reboot', // Second Wind (1 cost, exhaust all non-attacks in hand, +5 block each)
    name: 'Emergency Reboot',
    cost: 1,
    type: 'skill',
    rarity: 'uncommon',
    description: 'Exhaust all non-Attack cards in hand and deploy 5 Barrier for each.',
    block: 5,
    target: 'self',
    artEmoji: '♻️',
    color: '#0EA5E9',
  },
  {
    id: 'core_fortification', // Power Through (1 cost, add 2 Wounds to hand, +15 block)
    name: 'Core Fortification',
    cost: 1,
    type: 'skill',
    rarity: 'uncommon',
    description: 'Add 2 System Glitches into hand. Deploy 15 Barrier.',
    block: 15,
    target: 'self',
    artEmoji: '🧱',
    color: '#0EA5E9',
  },
  {
    id: 'phase_plating', // Ghostly Armor (1 cost, ethereal, 10 block)
    name: 'Phase Plating',
    cost: 1,
    type: 'skill',
    rarity: 'uncommon',
    description: 'Ethereal. Deploy 10 Barrier.',
    block: 10,
    ethereal: true,
    target: 'self',
    artEmoji: '👻',
    color: '#0EA5E9',
  },
  {
    id: 'dual_execution', // Double Tap (1 cost, next 1 attack played twice this turn)
    name: 'Dual Execution',
    cost: 1,
    type: 'skill',
    rarity: 'rare',
    description: 'This turn, your next Attack is executed twice.',
    magicNumber: 1,
    target: 'self',
    artEmoji: '⚔️',
    color: '#0EA5E9',
  },
  {
    id: 'quantum_recall', // Exhume (1 cost, retrieve card from exhaust into hand, exhaust)
    name: 'Quantum Recall',
    cost: 1,
    type: 'skill',
    rarity: 'rare',
    description: 'Retrieve a card from your Exhaust pile into your hand. Exhaust.',
    target: 'self',
    exhaust: true,
    artEmoji: '⏳',
    color: '#0EA5E9',
  },
  {
    id: 'tactical_absorption', // Feel No Pain (1 cost power, +3 block on exhaust)
    name: 'Tactical Absorption',
    cost: 1,
    type: 'power',
    rarity: 'uncommon',
    description: 'Whenever a card is Exhausted, deploy 3 Barrier.',
    magicNumber: 3,
    target: 'self',
    artEmoji: '🛡️',
    color: '#8B5CF6',
  },
  {
    id: 'void_conduit', // Dark Embrace (2 cost power, draw 1 on exhaust)
    name: 'Void Conduit',
    cost: 2,
    type: 'power',
    rarity: 'uncommon',
    description: 'Whenever a card is Exhausted, draw 1 card.',
    magicNumber: 1,
    target: 'self',
    artEmoji: '🌌',
    color: '#8B5CF6',
  },
  {
    id: 'adaptive_subroutines', // Evolve (1 cost power, draw 1 when Status drawn)
    name: 'Adaptive Subroutines',
    cost: 1,
    type: 'power',
    rarity: 'uncommon',
    description: 'Whenever you draw a Status card, draw 1 card.',
    magicNumber: 1,
    target: 'self',
    artEmoji: '🧬',
    color: '#8B5CF6',
  },
  {
    id: 'thermal_venting', // Fire Breathing (1 cost power, 6 dmg to all when Status/Curse drawn)
    name: 'Thermal Venting',
    cost: 1,
    type: 'power',
    rarity: 'uncommon',
    description: 'Whenever you draw a Status or Curse card, deal 6 damage to ALL hostiles.',
    magicNumber: 6,
    target: 'self',
    artEmoji: '🔥',
    color: '#8B5CF6',
  },
  {
    id: 'pain_feedback', // Rupture (1 cost power, +1 STR when losing HP from card)
    name: 'Pain Feedback',
    cost: 1,
    type: 'power',
    rarity: 'uncommon',
    description: 'Whenever you lose HP from a card, channel +1 Strength.',
    magicNumber: 1,
    target: 'self',
    artEmoji: '💢',
    color: '#8B5CF6',
  },
  {
    id: 'core_bleed', // Combust (1 cost power, end of turn lose 1 HP and deal 5 dmg to all)
    name: 'Core Bleed',
    cost: 1,
    type: 'power',
    rarity: 'uncommon',
    description: 'At the end of your turn, lose 1 HP and deal 5 damage to ALL hostiles.',
    magicNumber: 5,
    target: 'self',
    artEmoji: '☄️',
    color: '#8B5CF6',
  },
  {
    id: 'kinetic_juggernaut', // Juggernaut (2 cost power, whenever gaining block deal 5 dmg)
    name: 'Kinetic Juggernaut',
    cost: 2,
    type: 'power',
    rarity: 'rare',
    description: 'Whenever you deploy Barrier, deal 5 kinetic damage to the hostile.',
    magicNumber: 5,
    target: 'self',
    artEmoji: '🚜',
    color: '#8B5CF6',
  },
  {
    id: 'neural_overclock', // Brutality (0 cost power, start of turn lose 1 HP and draw 1)
    name: 'Neural Overclock',
    cost: 0,
    type: 'power',
    rarity: 'rare',
    description: 'At the start of your turn, lose 1 HP and draw 1 extra card.',
    magicNumber: 1,
    target: 'self',
    artEmoji: '🧠',
    color: '#8B5CF6',
  },
];

// ============================================================================
// STATUS & CURSE CARD GENERATORS (1-to-1 Wound, Dazed, Burn, Slimed)
// ============================================================================
export function createWoundCard(): SpireCard {
  return {
    id: `status_wound_${Math.random().toString(36).substring(2, 7)}`,
    name: 'System Glitch',
    cost: 0,
    type: 'status',
    rarity: 'status',
    description: 'Unplayable. Clogs your operational hand.',
    target: 'self',
    unplayable: true,
    artEmoji: '⚠️',
    color: '#64748B',
  };
}

export function createDazedCard(): SpireCard {
  return {
    id: `status_dazed_${Math.random().toString(36).substring(2, 7)}`,
    name: 'Neural Static',
    cost: 0,
    type: 'status',
    rarity: 'status',
    description: 'Unplayable. Ethereal (Exhausts at end of turn).',
    target: 'self',
    unplayable: true,
    ethereal: true,
    artEmoji: '💫',
    color: '#64748B',
  };
}

export function createBurnCard(upgraded: boolean = false): SpireCard {
  return {
    id: `status_burn_${Math.random().toString(36).substring(2, 7)}`,
    name: upgraded ? 'Thermal Burn+' : 'Thermal Burn',
    cost: 0,
    type: 'status',
    rarity: 'status',
    description: `Unplayable. At the end of your turn, take ${upgraded ? 4 : 2} thermal damage.`,
    magicNumber: upgraded ? 4 : 2,
    target: 'self',
    unplayable: true,
    isUpgraded: upgraded,
    artEmoji: '🔥',
    color: '#64748B',
  };
}

export function createSlimedCard(): SpireCard {
  return {
    id: `status_slimed_${Math.random().toString(36).substring(2, 7)}`,
    name: 'Corrosive Slime',
    cost: 1,
    type: 'status',
    rarity: 'status',
    description: 'Purge corrosive residue from your systems. Exhaust.',
    target: 'self',
    exhaust: true,
    artEmoji: '🧪',
    color: '#64748B',
  };
}

// ============================================================================
// CARD UPGRADE LOGIC (1-to-1 exact stat improvements matching Spire)
// ============================================================================
export function upgradeCard(card: SpireCard): SpireCard {
  if (card.type === 'status' || card.type === 'curse') {
    return card;
  }

  const upgraded: SpireCard = {
    ...card,
    name: card.name.endsWith('+') ? card.name : `${card.name}+`,
    isUpgraded: true,
  };

  const id = card.id;

  if (id.startsWith('void_slash')) {
    upgraded.damage = 9;
    upgraded.description = 'Strike foe for 9 damage.';
  } else if (id.startsWith('aegis_ward')) {
    upgraded.block = 8;
    upgraded.description = 'Deploy 8 Barrier.';
  } else if (id.startsWith('gravity_crush')) {
    upgraded.damage = 10;
    upgraded.magicNumber = 3;
    upgraded.description = 'Deal 10 kinetic damage. Apply 3 Vulnerable.';
  } else if (id.startsWith('fury_rebound')) {
    upgraded.damage = 8;
    upgraded.description = 'Deal 8 damage. Place a copy into discard pile.';
  } else if (id.startsWith('barrier_impact')) {
    upgraded.cost = 0; // Body Slam+ costs 0!
    upgraded.description = 'Deal damage equal to your current Barrier.';
  } else if (id.startsWith('radial_scythe')) {
    upgraded.damage = 11;
    upgraded.description = 'Sweep ALL hostiles for 11 damage.';
  } else if (id.startsWith('kinetic_suppression')) {
    upgraded.damage = 14;
    upgraded.magicNumber = 3;
    upgraded.description = 'Deal 14 damage. Inflict 3 Weak.';
  } else if (id.startsWith('cranial_smash')) {
    upgraded.damage = 12;
    upgraded.description = 'Deal 12 damage. Retrieve a card from discard to top of deck.';
  } else if (id.startsWith('colossus_edge')) {
    upgraded.magicNumber = 5;
    upgraded.description = 'Deal 14 damage. Strength affects this 5 times.';
  } else if (id.startsWith('kinetic_pulse')) {
    upgraded.damage = 7;
    upgraded.block = 7;
    upgraded.description = 'Deploy 7 Barrier. Deal 7 damage.';
  } else if (id.startsWith('disruption_blade')) {
    upgraded.damage = 10;
    upgraded.magicNumber = 2;
    upgraded.description = 'Deal 10 damage. Draw 2 cards.';
  } else if (id.startsWith('plasma_ricochet')) {
    upgraded.magicNumber = 4;
    upgraded.description = 'Deal 3 damage to target 4 times.';
  } else if (id.startsWith('seismic_shockwave')) {
    upgraded.damage = 7;
    upgraded.magicNumber = 2;
    upgraded.description = 'Deal 7 damage to ALL hostiles. Apply 2 Vulnerable to ALL.';
  } else if (id.startsWith('dual_phase_blades')) {
    upgraded.damage = 7;
    upgraded.description = 'Strike twice for 7 damage each.';
  } else if (id.startsWith('hyper_tune')) {
    upgraded.description = 'Deploy 5 Barrier. Upgrade ALL cards in hand for combat.';
  } else if (id.startsWith('nanite_surge')) {
    upgraded.block = 11;
    upgraded.description = 'Deploy 11 Barrier. Draw 1 card.';
  } else if (id.startsWith('bio_overcharge')) {
    upgraded.magicNumber = 4;
    upgraded.description = 'Gain 4 Strength this turn.';
  } else if (id.startsWith('fortified_resilience')) {
    upgraded.block = 9;
    upgraded.description = 'Deploy 9 Barrier. Exhaust a chosen card.';
  } else if (id.startsWith('battle_cry')) {
    upgraded.magicNumber = 2;
    upgraded.description = 'Draw 2 cards. Place a card from hand onto draw pile.';
  } else if (id.startsWith('singularity_cleave')) {
    upgraded.damage = 28;
    upgraded.description = 'Ethereal. Unload 28 void damage.';
  } else if (id.startsWith('neutron_hammer')) {
    upgraded.magicNumber = 2;
    upgraded.description = 'Deal 13 damage. Inflict 2 Weak & 2 Vulnerable.';
  } else if (id.startsWith('kinetic_vortex')) {
    upgraded.damage = 8;
    upgraded.description = 'Deal 8 damage to ALL hostiles 2 times.';
  } else if (id.startsWith('life_siphon')) {
    upgraded.damage = 12;
    upgraded.magicNumber = 4;
    upgraded.description = 'Deal 12 damage. Fatal: Permanently gain +4 Max HP.';
  } else if (id.startsWith('combat_focus')) {
    upgraded.magicNumber = 4;
    upgraded.description = 'Draw 4 cards.';
  } else if (id.startsWith('blood_infusion')) {
    upgraded.magicNumber = 3;
    upgraded.description = 'Sacrifice 3 HP. Gain 3 Energy.';
  } else if (id.startsWith('emp_discharge')) {
    upgraded.magicNumber = 3;
    upgraded.description = 'Hostile loses 3 Strength. Exhaust.';
  } else if (id.startsWith('plasma_shield')) {
    upgraded.block = 16;
    upgraded.magicNumber = 6;
    upgraded.description = 'Deploy 16 Barrier. Reflect 6 damage when struck.';
  } else if (id.startsWith('reactive_barrier')) {
    upgraded.cost = 1; // Entrench+ costs 1!
    upgraded.description = 'Double your current Barrier.';
  } else if (id.startsWith('spot_vulnerability')) {
    upgraded.magicNumber = 4;
    upgraded.description = 'If hostile intends to attack, gain 4 Strength.';
  } else if (id.startsWith('forcefield_matrix')) {
    upgraded.block = 40;
    upgraded.description = 'Deploy 40 Barrier. Exhaust.';
  } else if (id.startsWith('transcendence_offering')) {
    upgraded.magicNumber = 5;
    upgraded.description = 'Lose 6 HP. Gain 2 Energy and draw 5 cards. Exhaust.';
  } else if (id.startsWith('limit_amplifier')) {
    upgraded.exhaust = false; // Limit Break+ does not exhaust!
    upgraded.description = 'Double your current Strength.';
  } else if (id.startsWith('overcharge')) {
    upgraded.magicNumber = 3;
    upgraded.description = 'Channel +3 Strength.';
  } else if (id.startsWith('nanite_plating')) {
    upgraded.magicNumber = 4;
    upgraded.description = 'At end of your turn, deploy +4 Barrier.';
  } else if (id.startsWith('void_overdrive')) {
    upgraded.magicNumber = 3;
    upgraded.description = 'At start of each turn, gain +3 Strength.';
  } else if (id.startsWith('perpetual_aegis')) {
    upgraded.cost = 2; // Barricade+ costs 2!
    upgraded.description = 'Barrier is never depleted at start of your turn.';
  } else if (id.startsWith('berserk_matrix')) {
    upgraded.description = 'Gain +2 Energy at start of each turn.';
  } else if (id.startsWith('obliterate')) {
    upgraded.damage = 42;
    upgraded.description = 'Unload 42 massive kinetic damage.';
  } else if (id.startsWith('vampiric_scythe')) {
    upgraded.damage = 5;
    upgraded.description = 'Deal 5 damage to ALL hostiles. Heal HP equal to unblocked damage. Exhaust.';
  } else if (id.startsWith('precision_strike')) {
    upgraded.magicNumber = 3;
    upgraded.description = 'Deal 6 damage. Deals +3 bonus damage for ALL your "Slash" & "Strike" cards.';
  } else if (id.startsWith('overload_slash')) {
    upgraded.damage = 17;
    upgraded.description = 'Deal 17 damage. Shuffle a System Glitch into your draw pile.';
  } else if (id.startsWith('blind_charge')) {
    upgraded.damage = 10;
    upgraded.description = 'Deal 10 damage. Shuffle a Neural Static into your draw pile.';
  } else if (id.startsWith('bio_lance')) {
    upgraded.damage = 20;
    upgraded.description = 'Sacrifice 2 HP. Deal 20 kinetic damage.';
  } else if (id.startsWith('escalating_strike')) {
    upgraded.magicNumber = 8;
    upgraded.description = 'Deal 8 damage. Increase this card\'s damage by 8 this combat.';
  } else if (id.startsWith('flurry_barrage')) {
    upgraded.magicNumber = 5;
    upgraded.description = 'Deal 2 damage 5 times. Exhaust.';
  } else if (id.startsWith('singularity_purge')) {
    upgraded.damage = 10;
    upgraded.description = 'Exhaust all cards in hand. Deal 10 damage for each card Exhausted. Exhaust.';
  } else if (id.startsWith('plasma_supernova')) {
    upgraded.damage = 28;
    upgraded.description = 'Deal 28 damage to ALL hostiles. Add a Thermal Burn into discard pile.';
  } else if (id.startsWith('gravity_wave')) {
    upgraded.magicNumber = 5;
    upgraded.description = 'Inflict 5 Weak and 5 Vulnerable to ALL hostiles. Exhaust.';
  } else if (id.startsWith('system_jammer')) {
    upgraded.magicNumber = 2;
    upgraded.description = 'Inflict 2 Weak to ALL hostiles. Exhaust.';
  } else if (id.startsWith('reactor_surge')) {
    upgraded.cost = 0; // Seeing Red+ costs 0!
    upgraded.description = 'Gain 2 Energy. Exhaust.';
  } else if (id.startsWith('aegis_protocol')) {
    upgraded.block = 8;
    upgraded.magicNumber = 3;
    upgraded.description = 'Deploy 8 Barrier. If this card is Exhausted, gain 3 Energy.';
  } else if (id.startsWith('emergency_reboot')) {
    upgraded.block = 7;
    upgraded.description = 'Exhaust all non-Attack cards in hand and deploy 7 Barrier for each.';
  } else if (id.startsWith('core_fortification')) {
    upgraded.block = 20;
    upgraded.description = 'Add 2 System Glitches into hand. Deploy 20 Barrier.';
  } else if (id.startsWith('phase_plating')) {
    upgraded.block = 13;
    upgraded.description = 'Ethereal. Deploy 13 Barrier.';
  } else if (id.startsWith('dual_execution')) {
    upgraded.magicNumber = 2;
    upgraded.description = 'This turn, your next 2 Attacks are executed twice.';
  } else if (id.startsWith('quantum_recall')) {
    upgraded.cost = 0; // Exhume+ costs 0!
    upgraded.description = 'Retrieve a card from your Exhaust pile into your hand. Exhaust.';
  } else if (id.startsWith('tactical_absorption')) {
    upgraded.magicNumber = 4;
    upgraded.description = 'Whenever a card is Exhausted, deploy 4 Barrier.';
  } else if (id.startsWith('void_conduit')) {
    upgraded.cost = 1; // Dark Embrace+ costs 1!
    upgraded.description = 'Whenever a card is Exhausted, draw 1 card.';
  } else if (id.startsWith('adaptive_subroutines')) {
    upgraded.magicNumber = 2;
    upgraded.description = 'Whenever you draw a Status card, draw 2 cards.';
  } else if (id.startsWith('thermal_venting')) {
    upgraded.magicNumber = 10;
    upgraded.description = 'Whenever you draw a Status or Curse card, deal 10 damage to ALL hostiles.';
  } else if (id.startsWith('pain_feedback')) {
    upgraded.magicNumber = 2;
    upgraded.description = 'Whenever you lose HP from a card, channel +2 Strength.';
  } else if (id.startsWith('core_bleed')) {
    upgraded.magicNumber = 7;
    upgraded.description = 'At the end of your turn, lose 1 HP and deal 7 damage to ALL hostiles.';
  } else if (id.startsWith('kinetic_juggernaut')) {
    upgraded.magicNumber = 7;
    upgraded.description = 'Whenever you deploy Barrier, deal 7 kinetic damage to the hostile.';
  } else if (id.startsWith('neural_overclock')) {
    upgraded.description = 'Innate. At the start of your turn, lose 1 HP and draw 1 extra card.';
  } else {
    if (upgraded.damage) upgraded.damage += 3;
    if (upgraded.block) upgraded.block += 3;
  }

  return upgraded;
}

export function getRandomCardReward(count: number = 3, isElite: boolean = false): SpireCard[] {
  const commons = SPIRE_CARD_CATALOG.filter(c => c.rarity === 'common');
  const uncommons = SPIRE_CARD_CATALOG.filter(c => c.rarity === 'uncommon');
  const rares = SPIRE_CARD_CATALOG.filter(c => c.rarity === 'rare');

  const picked: SpireCard[] = [];
  const usedBaseIds = new Set<string>();

  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    let pool = commons;
    if (isElite) {
      if (roll < 0.15) pool = rares;
      else if (roll < 0.55) pool = uncommons;
      else pool = commons;
    } else {
      if (roll < 0.06) pool = rares;
      else if (roll < 0.43) pool = uncommons;
      else pool = commons;
    }

    const available = pool.filter(c => !usedBaseIds.has(c.id));
    const chosenPool = available.length > 0 ? available : SPIRE_CARD_CATALOG;
    const template = chosenPool[Math.floor(Math.random() * chosenPool.length)];
    usedBaseIds.add(template.id);

    picked.push({
      ...template,
      id: `${template.id}_${Math.random().toString(36).substring(2, 7)}`,
    });
  }

  return picked;
}
