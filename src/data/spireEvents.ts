export interface SpireEventOption {
  text: string;
  effectDescription: string;
  requiresGold?: number;
  actionId: string;
}

export interface SpireEvent {
  id: string;
  title: string;
  description: string;
  icon: string;
  options: SpireEventOption[];
}

export const SPIRE_EVENTS: SpireEvent[] = [
  {
    id: 'quantum_monolith',
    title: 'The Quantum Monolith',
    description: 'An iridescent tachyon core hovers within an anti-grav chamber. The containment field is failing, but siphoning its energy will trigger a dangerous plasma backlash.',
    icon: '🔮',
    options: [
      {
        text: 'Extract Tachyon Core',
        effectDescription: 'Gain 120 Credits. Take 10 radiation damage.',
        actionId: 'take_idol',
      },
      {
        text: 'Bypass Containment',
        effectDescription: 'Leave the volatile core intact and proceed safely.',
        actionId: 'leave_idol',
      },
    ],
  },
  {
    id: 'wandering_synthetica',
    title: 'Wandering Synthetica',
    description: 'A rogue cybernetic medic droid steps from the ruins, glowing with gentle teal light. "Greetings Vanguard. Bio-scans detect structural fatigue. Shall I initiate neural synthesis?"',
    icon: '🤖',
    options: [
      {
        text: 'Cellular Restoration (35 Credits)',
        effectDescription: 'Repair 25% of your maximum Vitality.',
        requiresGold: 35,
        actionId: 'cleric_heal',
      },
      {
        text: 'Neural Protocol Purge (50 Credits)',
        effectDescription: 'Purge a Void Slash from your operational deck.',
        requiresGold: 50,
        actionId: 'cleric_purge',
      },
      {
        text: 'Decline Assistance',
        effectDescription: 'Continue forward into the rift.',
        actionId: 'cleric_leave',
      },
    ],
  },
  {
    id: 'chrono_terminal',
    title: 'Chrono-Archive Terminal',
    description: 'A massive holographic console hums into life, scanning your equipment signature. "USER DETECTED. SELECT MEMORY RECONFIGURATION MATRIX."',
    icon: '💻',
    options: [
      {
        text: 'Overclock Subroutines',
        effectDescription: 'Upgrade a Void Slash to Void Slash+.',
        actionId: 'wall_grow',
      },
      {
        text: 'Purge Redundant Ward',
        effectDescription: 'Decommission an Aegis Ward from deck.',
        actionId: 'wall_forget',
      },
      {
        text: 'Siphon Crypto-Bounty',
        effectDescription: 'Extract 80 Credits from archive node.',
        actionId: 'wall_change',
      },
    ],
  },
  {
    id: 'bio_nutrient_chamber', // Big Fish
    title: 'Bio-Nutrient Hydroponics',
    description: 'You enter a suspended zero-G greenhouse. Three sealed containment pods float within arm\'s reach: a cellular restorative, a genetic enhancer, and a locked artifact vault.',
    icon: '🧬',
    options: [
      {
        text: 'Consume Cellular Restorative (Banana)',
        effectDescription: 'Heal 33% of your Max Vitality.',
        actionId: 'fish_banana',
      },
      {
        text: 'Inject Genetic Enhancer (Donut)',
        effectDescription: 'Permanently gain +5 Max Vitality.',
        actionId: 'fish_donut',
      },
      {
        text: 'Crack Artifact Vault (Box)',
        effectDescription: 'Acquire a random Relic Artifact.',
        actionId: 'fish_box',
      },
    ],
  },
  {
    id: 'radiant_singularity', // Shining Light
    title: 'Radiant Tachyon Beam',
    description: 'A blinding column of pure photon energy pierces the chamber ceiling. Stepping into the beam will scorch your bio-suit, but supercharge your combat subroutines.',
    icon: '✨',
    options: [
      {
        text: 'Step Into the Photon Beam',
        effectDescription: 'Take 12 damage. Upgrade 2 random cards in your deck!',
        actionId: 'light_enter',
      },
      {
        text: 'Skirt the Perimeter',
        effectDescription: 'Proceed without risking thermal burns.',
        actionId: 'light_leave',
      },
    ],
  },
  {
    id: 'scrap_amalgam_vat', // Scrap Ooze
    title: 'Corrosive Salvage Vat',
    description: 'A churning vat of acidic nanite sludge glitters with high-grade hardware trapped deep inside. Reaching in will burn your gauntlets, but the salvage is pristine.',
    icon: '🧪',
    options: [
      {
        text: 'Reach Deep for Salvage',
        effectDescription: 'Take 8 acid damage. Acquire a random Relic Artifact!',
        actionId: 'scrap_reach',
      },
      {
        text: 'Withdraw Safely',
        effectDescription: 'Leave the salvage vat undisturbed.',
        actionId: 'scrap_leave',
      },
    ],
  },
];

export function getRandomEvent(): SpireEvent {
  return SPIRE_EVENTS[Math.floor(Math.random() * SPIRE_EVENTS.length)];
}
