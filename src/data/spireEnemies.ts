import { SpireEnemy } from '../types/spire';

export function createAstralZealot(): SpireEnemy {
  return {
    id: 'zealot_' + Math.random().toString(36).substring(2, 6),
    name: 'Astral Rift-Crow',
    title: 'Acolyte of the Singularity',
    hp: 50,
    maxHp: 50,
    block: 0,
    statuses: [],
    spriteIcon: '🦅',
    themeColor: '#A855F7',
    aiTurn: 1,
    intent: {
      type: 'buff',
      value: 3,
      icon: '🔮',
      description: 'Void Resonance: Channel +3 Strength every turn ("FOR THE SUMMIT!")',
    },
    pattern: (turn: number) => {
      if (turn === 1) {
        return {
          type: 'buff',
          value: 3,
          icon: '🔮',
          description: 'Void Resonance: +3 Strength ("FOR THE SUMMIT!")',
        };
      }
      return {
        type: 'attack',
        value: 6,
        icon: '🗡️',
        description: 'Phase Strike: Deal 6 damage (+Strength)',
      };
    },
  };
}

export function createChitinLeviathan(): SpireEnemy {
  return {
    id: 'leviathan_' + Math.random().toString(36).substring(2, 6),
    name: 'Chitin Dredger',
    title: 'Subterranean Carapace',
    hp: 44,
    maxHp: 44,
    block: 0,
    statuses: [],
    spriteIcon: '🦂',
    themeColor: '#F59E0B',
    aiTurn: 1,
    intent: {
      type: 'attack',
      value: 11,
      icon: '💥',
      description: 'Pincer Chomp: Deal 11 heavy damage',
    },
    pattern: (turn: number) => {
      const cycle = turn % 3;
      if (cycle === 1) {
        return {
          type: 'attack',
          value: 11,
          icon: '💥',
          description: 'Pincer Chomp: Deal 11 heavy damage',
        };
      } else if (cycle === 2) {
        return {
          type: 'buff',
          value: 3,
          secondaryValue: 6,
          icon: '🛡️',
          description: 'Seismic Roar: Gain +3 Strength & 6 Barrier',
        };
      } else {
        return {
          type: 'attack_defend',
          value: 7,
          secondaryValue: 5,
          icon: '⚔️',
          description: 'Tail Thrash: Deal 7 damage & Deploy 5 Barrier',
        };
      }
    },
  };
}

export function createSparkArachnid(): SpireEnemy {
  const hp = Math.floor(Math.random() * 5) + 14;
  return {
    id: 'arachnid_' + Math.random().toString(36).substring(2, 6),
    name: 'Spark Arachnid',
    title: 'Neurotoxin Weaver',
    hp,
    maxHp: hp,
    block: 0,
    statuses: [{ type: 'curl_up', amount: 5 }],
    spriteIcon: '🕷️',
    themeColor: '#06B6D4',
    aiTurn: 1,
    intent: {
      type: 'attack',
      value: 6,
      icon: '⚡',
      description: 'Static Fang: Deal 6 shock damage',
    },
    pattern: (turn: number) => {
      if (turn % 2 === 1) {
        return {
          type: 'attack',
          value: 6,
          icon: '⚡',
          description: 'Static Fang: Deal 6 shock damage',
        };
      }
      return {
        type: 'debuff',
        value: 2,
        icon: '🕸️',
        description: 'Neuro-Filament: Inflict 2 Weak on player',
      };
    },
  };
}

export function createMycelialDrone(): SpireEnemy {
  return {
    id: 'mycelial_' + Math.random().toString(36).substring(2, 6),
    name: 'Mycelial Drone',
    title: 'Spore Symbiote',
    hp: 26,
    maxHp: 26,
    block: 0,
    statuses: [{ type: 'spore_cloud', amount: 2 }],
    spriteIcon: '🍄',
    themeColor: '#10B981',
    aiTurn: 1,
    intent: {
      type: 'attack',
      value: 6,
      icon: '🗡️',
      description: 'Mycelial Lunge: Deal 6 damage',
    },
    pattern: (turn: number) => {
      if (turn % 3 === 2) {
        return {
          type: 'buff',
          value: 3,
          icon: '🧬',
          description: 'Mutagenic Growth: Gain +3 Strength',
        };
      }
      return {
        type: 'attack',
        value: 6,
        icon: '🗡️',
        description: 'Mycelial Lunge: Deal 6 damage',
      };
    },
  };
}

export function createCryoEnforcer(): SpireEnemy {
  return {
    id: 'cryo_' + Math.random().toString(36).substring(2, 6),
    name: 'Cryo-Enforcer',
    title: 'Sub-Zero Warden',
    hp: 48,
    maxHp: 48,
    block: 0,
    statuses: [],
    spriteIcon: '🥶',
    themeColor: '#38BDF8',
    aiTurn: 1,
    intent: {
      type: 'attack_debuff',
      value: 7,
      secondaryValue: 1,
      icon: '❄️',
      description: 'Cryo-Rake: Deal 7 damage & Inflict 1 Weak',
    },
    pattern: (turn: number) => {
      if (turn % 2 === 1) {
        return {
          type: 'attack_debuff',
          value: 7,
          secondaryValue: 1,
          icon: '❄️',
          description: 'Cryo-Rake: Deal 7 damage & Inflict 1 Weak',
        };
      }
      return {
        type: 'attack',
        value: 12,
        icon: '🗡️',
        description: 'Glacial Impale: Deal 12 kinetic damage',
      };
    },
  };
}

export function createPyroEnforcer(): SpireEnemy {
  return {
    id: 'pyro_' + Math.random().toString(36).substring(2, 6),
    name: 'Pyro-Enforcer',
    title: 'Thermal Executioner',
    hp: 48,
    maxHp: 48,
    block: 0,
    statuses: [],
    spriteIcon: '🔥',
    themeColor: '#F97316',
    aiTurn: 1,
    intent: {
      type: 'attack',
      value: 13,
      icon: '🗡️',
      description: 'Plasma Lance: Deal 13 thermal damage',
    },
    pattern: (turn: number) => {
      if (turn % 2 === 1) {
        return {
          type: 'attack',
          value: 13,
          icon: '🗡️',
          description: 'Plasma Lance: Deal 13 thermal damage',
        };
      }
      return {
        type: 'attack_debuff',
        value: 8,
        secondaryValue: 1,
        icon: '💥',
        description: 'Armor Scrape: Deal 8 damage & Inflict 1 Vulnerable',
      };
    },
  };
}

export function createCorrosiveMass(): SpireEnemy {
  return {
    id: 'corrosive_' + Math.random().toString(36).substring(2, 6),
    name: 'Corrosive Amalgam',
    title: 'Bio-Hazard Ooze',
    hp: 64,
    maxHp: 64,
    block: 0,
    statuses: [],
    spriteIcon: '🧪',
    themeColor: '#84CC16',
    aiTurn: 1,
    intent: {
      type: 'attack_debuff',
      value: 11,
      secondaryValue: 1,
      icon: '☣️',
      description: 'Corrosive Spit: Deal 11 damage & Inject Corrosive Slime into deck',
    },
    pattern: (turn: number) => {
      const cycle = turn % 3;
      if (cycle === 1) {
        return {
          type: 'attack_debuff',
          value: 11,
          secondaryValue: 1,
          icon: '☣️',
          description: 'Corrosive Spit: Deal 11 damage & Inject Corrosive Slime',
        };
      } else if (cycle === 2) {
        return {
          type: 'debuff',
          value: 2,
          icon: '🕸️',
          description: 'Acidic Coating: Inflict 2 Weak',
        };
      }
      return {
        type: 'attack',
        value: 16,
        icon: '💥',
        description: 'Heavy Slam: Deal 16 crushing damage',
      };
    },
  };
}

export function createCyberGorgon(): SpireEnemy {
  return {
    id: 'gorgon_' + Math.random().toString(36).substring(2, 6),
    name: 'Cyber-Gorgon Prime',
    title: 'Apex War-Engine (Elite)',
    hp: 84,
    maxHp: 84,
    block: 0,
    statuses: [{ type: 'enrage', amount: 2 }],
    spriteIcon: '👹',
    themeColor: '#EF4444',
    aiTurn: 1,
    intent: {
      type: 'buff',
      value: 2,
      icon: '💢',
      description: 'Hyper-Reactive Enrage: Gains +2 Strength whenever you play a Skill!',
    },
    pattern: (turn: number) => {
      if (turn === 1) {
        return {
          type: 'buff',
          value: 2,
          icon: '💢',
          description: 'Hyper-Enrage: +2 Strength per player Skill',
        };
      } else if (turn % 3 === 2) {
        return {
          type: 'attack_debuff',
          value: 8,
          secondaryValue: 2,
          icon: '🔨',
          description: 'Cranial Shock: Deal 8 damage & Inflict 2 Vulnerable',
        };
      } else {
        return {
          type: 'attack',
          value: 14,
          icon: '💥',
          description: 'Plasma Cleave: Deal 14 devastating damage (+Strength)',
        };
      }
    },
  };
}

export function createChronoColossus(): SpireEnemy {
  return {
    id: 'chrono_' + Math.random().toString(36).substring(2, 6),
    name: 'Chrono-Stasis Warden',
    title: 'Ancient Vault Guardian (Elite)',
    hp: 110,
    maxHp: 110,
    block: 8,
    statuses: [{ type: 'metallicize', amount: 8 }],
    spriteIcon: '🗿',
    themeColor: '#6366F1',
    aiTurn: 1,
    intent: {
      type: 'special',
      value: 0,
      icon: '💤',
      description: 'Stasis Slumber: Inert until damaged (+8 Metallicize Barrier)',
    },
    pattern: (turn: number, hp: number, maxHp: number) => {
      if (turn <= 2 && hp === maxHp) {
        return {
          type: 'special',
          value: 0,
          icon: '💤',
          description: 'Stasis Slumber: Recharging (+8 Metallicize)',
        };
      }
      if (turn % 3 === 0) {
        return {
          type: 'debuff',
          value: 1,
          icon: '🌀',
          description: 'Time Siphon: Drains -1 Dexterity & -1 Strength!',
        };
      }
      return {
        type: 'attack',
        value: 18,
        icon: '⚔️',
        description: 'Temporal Crush: Deal 18 kinetic damage',
      };
    },
  };
}

export function createTriOpticSentinel(): SpireEnemy {
  return {
    id: 'sentinel_' + Math.random().toString(36).substring(2, 6),
    name: 'Tri-Optic Sentinel',
    title: 'Citadel Defense Construct (Elite)',
    hp: 92,
    maxHp: 92,
    block: 0,
    statuses: [{ type: 'artifact', amount: 1 }],
    spriteIcon: '👁️',
    themeColor: '#F59E0B',
    aiTurn: 1,
    intent: {
      type: 'debuff',
      value: 2,
      icon: '💫',
      description: 'Neural Scramble: Inject 2 Neural Static (Dazed) into discard pile',
    },
    pattern: (turn: number) => {
      if (turn % 2 === 1) {
        return {
          type: 'debuff',
          value: 2,
          icon: '💫',
          description: 'Neural Scramble: Inject 2 Neural Static into discard pile',
        };
      }
      return {
        type: 'attack',
        value: 10,
        icon: '⚡',
        description: 'Disintegration Beam: Deal 10 laser damage',
      };
    },
  };
}

export function createSingularityOverlord(): SpireEnemy {
  return {
    id: 'overlord_' + Math.random().toString(36).substring(2, 6),
    name: 'The Singularity Overlord',
    title: 'Nexus Core Sovereign (Act 1 Boss)',
    hp: 140,
    maxHp: 140,
    block: 0,
    statuses: [],
    spriteIcon: '🌌',
    themeColor: '#EC4899',
    aiTurn: 1,
    intent: {
      type: 'attack_debuff',
      value: 10,
      secondaryValue: 2,
      icon: '🧪',
      description: 'Corrosive Spray: Deal 10 damage & Inject 2 Corrosive Slimes',
    },
    pattern: (turn: number) => {
      const cycle = turn % 3;
      if (cycle === 1) {
        return {
          type: 'attack_debuff',
          value: 10,
          secondaryValue: 2,
          icon: '🧪',
          description: 'Corrosive Spray: Deal 10 damage & Inject 2 Corrosive Slimes',
        };
      } else if (cycle === 2) {
        return {
          type: 'buff',
          value: 3,
          secondaryValue: 12,
          icon: '⚠️',
          description: 'Event Horizon Charging: +3 Strength & 12 Barrier!',
        };
      } else {
        return {
          type: 'attack',
          value: 35,
          icon: '💀',
          description: 'SUPERNOVA COLLAPSE: Deal 35 apocalyptic damage!',
        };
      }
    },
  };
}

export function createAegisConstructBoss(): SpireEnemy {
  return {
    id: 'guardian_' + Math.random().toString(36).substring(2, 6),
    name: 'Aegis Construct Omega',
    title: 'Transforming Citadel Warden (Act 1 Boss)',
    hp: 200,
    maxHp: 200,
    block: 0,
    statuses: [{ type: 'mode_shift', amount: 30 }],
    spriteIcon: '🤖',
    themeColor: '#0EA5E9',
    aiTurn: 1,
    intent: {
      type: 'defend',
      value: 9,
      icon: '🛡️',
      description: 'Capacitor Charge: Deploy 9 Barrier',
    },
    pattern: (turn: number) => {
      const cycle = turn % 4;
      if (cycle === 1) {
        return {
          type: 'defend',
          value: 9,
          icon: '🛡️',
          description: 'Capacitor Charge: Deploy 9 Barrier',
        };
      } else if (cycle === 2) {
        return {
          type: 'attack',
          value: 32,
          icon: '💥',
          description: 'Fierce Kinetic Bash: Deal 32 devastating damage!',
        };
      } else if (cycle === 3) {
        return {
          type: 'debuff',
          value: 2,
          icon: '💨',
          description: 'Coolant Vent: Inflict 2 Weak & 2 Vulnerable',
        };
      }
      return {
        type: 'attack',
        value: 5,
        hits: 4,
        icon: '🌪️',
        description: 'Cyclone Blades: Deal 5x4 multi-strike damage!',
      };
    },
  };
}

export function createVoidHexaCoreBoss(): SpireEnemy {
  return {
    id: 'hexaghost_' + Math.random().toString(36).substring(2, 6),
    name: 'Void Hexa-Core',
    title: 'Six-Fold Plasma Poltergeist (Act 1 Boss)',
    hp: 220,
    maxHp: 220,
    block: 0,
    statuses: [],
    spriteIcon: '🔯',
    themeColor: '#A855F7',
    aiTurn: 1,
    intent: {
      type: 'attack',
      value: 4,
      hits: 6,
      icon: '🔥',
      description: 'Six-Fold Divider: Unload 4x6 plasma barrage!',
    },
    pattern: (turn: number) => {
      if (turn === 1) {
        return {
          type: 'attack',
          value: 4,
          hits: 6,
          icon: '🔥',
          description: 'Six-Fold Divider: Unload 4x6 plasma barrage!',
        };
      }
      const cycle = turn % 3;
      if (cycle === 2) {
        return {
          type: 'attack_debuff',
          value: 6,
          secondaryValue: 1,
          icon: '☄️',
          description: 'Plasma Sear: Deal 6 damage & Inject Thermal Burn into discard',
        };
      } else if (cycle === 0) {
        return {
          type: 'attack',
          value: 6,
          hits: 2,
          icon: '⚔️',
          description: 'Twin Inferno Lash: Deal 6x2 thermal damage',
        };
      }
      return {
        type: 'buff',
        value: 2,
        secondaryValue: 12,
        icon: '🛡️',
        description: 'Core Stoking: Gain +2 Strength & 12 Barrier',
      };
    },
  };
}

export function getMonsterForNode(type: 'monster' | 'elite' | 'boss', floor: number): SpireEnemy {
  if (type === 'boss') {
    const r = Math.random();
    if (r < 0.34) return createSingularityOverlord();
    if (r < 0.67) return createAegisConstructBoss();
    return createVoidHexaCoreBoss();
  }
  if (type === 'elite') {
    const r = Math.random();
    if (r < 0.34) return createCyberGorgon();
    if (r < 0.67) return createChronoColossus();
    return createTriOpticSentinel();
  }
  // Normal encounters: floors 1-3 use easier pool, floors 4+ include full pool
  if (floor <= 3) {
    const r = Math.random();
    if (r < 0.35) return createAstralZealot();
    if (r < 0.7) return createChitinLeviathan();
    return createSparkArachnid();
  }
  const pool = [
    createAstralZealot,
    createChitinLeviathan,
    createSparkArachnid,
    createMycelialDrone,
    createCryoEnforcer,
    createPyroEnforcer,
    createCorrosiveMass,
  ];
  return pool[Math.floor(Math.random() * pool.length)]();
}
