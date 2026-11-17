export interface TurboStage {
  id: number;
  name: string;
  skyTop: string;
  skyBottom: string;
  hillBack: string;
  groundTop: string;
  groundBottom: string;
  roadColor: string;
  carColor: string;
  hillAmplitude: number;
  hillFrequency: number;
  baseSpeed: number;
  spawnInterval: number;
  words: string[];
}

export const TURBO_STAGES: TurboStage[] = [
  {
    id: 1,
    name: 'Sunny Meadow',
    skyTop: '#0284C7',
    skyBottom: '#BAE6FD',
    hillBack: '#86EFAC',
    groundTop: '#22C55E',
    groundBottom: '#15803D',
    roadColor: '#475569',
    carColor: '#EF4444',
    hillAmplitude: 20,
    hillFrequency: 0.0055,
    baseSpeed: 120,
    spawnInterval: 2.9,
    words: [
      'cat', 'dog', 'sun', 'car', 'bus', 'hat', 'red', 'big',
      'run', 'cup', 'map', 'box', 'pen', 'fox', 'jam', 'bed',
      'bug', 'fan', 'hop', 'top', 'zip', 'van', 'bee', 'cow',
    ],
  },
  {
    id: 2,
    name: 'Desert Canyon',
    skyTop: '#EA580C',
    skyBottom: '#FDE68A',
    hillBack: '#FDBA74',
    groundTop: '#F59E0B',
    groundBottom: '#B45309',
    roadColor: '#78350F',
    carColor: '#3B82F6',
    hillAmplitude: 28,
    hillFrequency: 0.007,
    baseSpeed: 155,
    spawnInterval: 2.5,
    words: [
      'sand', 'jump', 'fast', 'star', 'frog', 'bike', 'tree', 'fish',
      'play', 'moon', 'duck', 'bear', 'ship', 'road', 'cake', 'wind',
      'kite', 'drum', 'blue', 'gold', 'rock', 'swim',
    ],
  },
  {
    id: 3,
    name: 'Ocean Boardwalk',
    skyTop: '#0369A1',
    skyBottom: '#67E8F9',
    hillBack: '#2DD4BF',
    groundTop: '#06B6D4',
    groundBottom: '#0E7490',
    roadColor: '#D97706',
    carColor: '#EC4899',
    hillAmplitude: 34,
    hillFrequency: 0.0085,
    baseSpeed: 190,
    spawnInterval: 2.15,
    words: [
      'beach', 'water', 'happy', 'tiger', 'plane', 'cloud', 'train',
      'apple', 'smile', 'green', 'shark', 'whale', 'shell', 'grape',
      'sunny', 'river', 'magic', 'light', 'music', 'robot',
    ],
  },
  {
    id: 4,
    name: 'Volcano Ridge',
    skyTop: '#450A0A',
    skyBottom: '#DC2626',
    hillBack: '#7F1D1D',
    groundTop: '#57534E',
    groundBottom: '#1C1917',
    roadColor: '#EA580C',
    carColor: '#FACC15',
    hillAmplitude: 40,
    hillFrequency: 0.01,
    baseSpeed: 225,
    spawnInterval: 1.85,
    words: [
      'rocket', 'planet', 'dragon', 'castle', 'orange', 'purple',
      'school', 'friend', 'bridge', 'jungle', 'island', 'monkey',
      'pirate', 'silver', 'summer', 'winter', 'garden', 'pencil',
    ],
  },
  {
    id: 5,
    name: 'Cosmic Starway',
    skyTop: '#090D16',
    skyBottom: '#312E81',
    hillBack: '#4C1D95',
    groundTop: '#7C3AED',
    groundBottom: '#2E1065',
    roadColor: '#06B6D4',
    carColor: '#10B981',
    hillAmplitude: 46,
    hillFrequency: 0.0115,
    baseSpeed: 260,
    spawnInterval: 1.6,
    words: [
      'rainbow', 'monster', 'diamond', 'treasure', 'spaceship',
      'elephant', 'butterfly', 'lightning', 'superstar', 'adventure',
      'galaxy', 'meteor', 'comet', 'gravity', 'universe',
    ],
  },
];

export const KEYBOARD_ROWS: string[][] = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];
