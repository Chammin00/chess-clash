import { Card, FactionId } from '../types/card';

export interface FactionConfig {
  id: FactionId;
  name: string;
  kanji: string;
  tagline: string;
  description: string;
  color: string;
  accentColor: string;
  emblem: string;
  passiveName: string;
  passiveDesc: string;
  leader: Card;
  starterDeckIds: string[];
}

export const FACTION_CONFIGS: Record<Exclude<FactionId, 'neutral'>, FactionConfig> = {
  shinobi: {
    id: 'shinobi',
    name: 'Shadow Shinobi',
    kanji: '忍',
    tagline: 'Lethal Infiltrators & Masters of Deception',
    description: 'Specializes in deadly spies that infiltrate enemy lines to grant massive card advantage, decoy substitutions, and lethal assassination strikes.',
    color: '#8B5CF6',
    accentColor: '#A78BFA',
    emblem: '🥷',
    passiveName: 'Shadow Infiltration',
    passiveDesc: 'Master of stealth: +1 extra card redraw in the opening mulligan.',
    leader: {
      id: 'ldr_hanzo',
      name: 'Hattori Hanzo',
      faction: 'shinobi',
      type: 'leader',
      row: 'special',
      power: 0,
      rarity: 'legendary',
      ability: 'spy',
      description: 'Shadow Clone: Summons a 2-power spy clone on opponent ranged row to draw 1 card.',
      icon: '👤',
      color: '#8B5CF6',
      quote: 'Strike like lightning, vanish like smoke.',
    },
    starterDeckIds: [
      'sh_genin_scout', 'sh_genin_scout', 'sh_genin_scout',
      'sh_kunoichi_poisoner', 'sh_kunoichi_poisoner',
      'sh_chunin_assassin', 'sh_chunin_assassin',
      'sh_iga_infiltrator', 'sh_koga_shadow_spy',
      'sh_kawarimi_decoy', 'sh_kawarimi_decoy',
      'sh_shadow_assassination',
      'sh_fuma_kotaro', 'sh_hanzo_legend',
      'sp_war_taiko', 'wth_bamboo_fog'
    ],
  },

  bushido: {
    id: 'bushido',
    name: 'Iron Bushido',
    kanji: '侍',
    tagline: 'Honor, Steel & Tight Bond Battlelines',
    description: 'Unstoppable frontline warriors with Clan Tight-Bond synergy that doubles and multiplies attack power when fighting side-by-side.',
    color: '#DC2626',
    accentColor: '#EF4444',
    emblem: '⚔️',
    passiveName: 'Bushido Resolve',
    passiveDesc: 'Unwavering honor: Bushido automatically wins any round that ends in a tie.',
    leader: {
      id: 'ldr_tadakatsu',
      name: 'Honda Tadakatsu',
      faction: 'bushido',
      type: 'leader',
      row: 'special',
      power: 0,
      rarity: 'legendary',
      ability: 'horn',
      description: 'War Horn Rally: Grants a Commander Horn on your Melee row, doubling its power.',
      icon: '🎺',
      color: '#DC2626',
      quote: 'The warrior who never retreats.',
    },
    starterDeckIds: [
      'bu_clan_swordsman', 'bu_clan_swordsman', 'bu_clan_swordsman',
      'bu_nodachi_vanguard', 'bu_nodachi_vanguard',
      'bu_yabusame_archer', 'bu_yabusame_archer',
      'bu_ronin_wanderer', 'bu_ronin_wanderer',
      'bu_banner_bearer', 'bu_armored_cavalry',
      'bu_miyamoto_musashi', 'bu_oda_warlord',
      'sp_war_taiko', 'sp_clear_dawn', 'wth_mountain_frost'
    ],
  },

  yokai: {
    id: 'yokai',
    name: 'Yokai & Onryo',
    kanji: '鬼',
    tagline: 'Endless Swarms of Demons & Spirits',
    description: 'The terrifying creatures of Japanese folklore. Features Muster swarms that summon entire packs from your deck, and unyielding resilience.',
    color: '#059669',
    accentColor: '#10B981',
    emblem: '👹',
    passiveName: 'Immortal Curse',
    passiveDesc: 'Demonic endurance: 1 random non-hero unit remains on the board into the next round.',
    leader: {
      id: 'ldr_shuten',
      name: 'Shuten-Doji',
      faction: 'yokai',
      type: 'leader',
      row: 'special',
      power: 0,
      rarity: 'legendary',
      ability: 'muster',
      description: 'Night Parade: Summons two 3-power Oni Goblins directly onto your Melee row.',
      icon: '👺',
      color: '#059669',
      quote: 'The mortal world shall drown in red sake and screaming.',
    },
    starterDeckIds: [
      'yo_kappa_swarmer', 'yo_kappa_swarmer', 'yo_kappa_swarmer',
      'yo_karasu_tengu', 'yo_karasu_tengu', 'yo_karasu_tengu',
      'yo_oni_berserker', 'yo_oni_berserker',
      'yo_rokurokubi', 'yo_gashadokuro_beast',
      'yo_kitsune_trickster', 'yo_yamata_dragon',
      'yo_tamamo_legend',
      'sp_war_taiko', 'wth_mountain_frost', 'wth_bamboo_fog'
    ],
  },

  onmyo: {
    id: 'onmyo',
    name: 'Onmyo Mystics',
    kanji: '陰',
    tagline: 'Masters of Calamities, Rebirth & Kami',
    description: 'Spiritual guardians who summon elemental weather calamities (Frost, Fog, Rain) and use holy shrine maidens to resurrect fallen allies.',
    color: '#2563EB',
    accentColor: '#3B82F6',
    emblem: '⛩️',
    passiveName: 'Karmic Balance',
    passiveDesc: 'Spiritual reincarnation: Draw 1 extra card whenever you lose a round.',
    leader: {
      id: 'ldr_seimei',
      name: 'Abe no Seimei',
      faction: 'onmyo',
      type: 'leader',
      row: 'special',
      power: 0,
      rarity: 'legendary',
      ability: 'clear_weather',
      description: 'Divine Light: Clears all active weather calamities across the entire battlefield.',
      icon: '✨',
      color: '#2563EB',
      quote: 'Between yin and yang lies the order of the cosmos.',
    },
    starterDeckIds: [
      'on_sohei_warrior_monk', 'on_sohei_warrior_monk',
      'on_miko_healer', 'on_miko_healer',
      'on_shikigami_bird', 'on_shikigami_bird',
      'on_talisman_warden', 'on_yamabushi_hermit',
      'on_bell_guardian', 'on_fujin_wind_kami',
      'on_raijin_thunder_god', 'on_amaterasu_avatar',
      'wth_mountain_frost', 'wth_bamboo_fog', 'wth_shrine_rain', 'sp_clear_dawn'
    ],
  },

  shogunate: {
    id: 'shogunate',
    name: 'Imperial Shogunate',
    kanji: '将',
    tagline: 'Imperial Siege Artillery & Heavy Garrison',
    description: 'Disciplined military empire wielding devastating siege engines, trebuchets, fire carts, arquebuses, and tactical field commanders.',
    color: '#D97706',
    accentColor: '#F59E0B',
    emblem: '🏯',
    passiveName: 'Imperial Reserves',
    passiveDesc: 'Superior supply lines: Redraw 1 extra card at the start of Round 2 and Round 3.',
    leader: {
      id: 'ldr_tokugawa',
      name: 'Tokugawa Ieyasu',
      faction: 'shogunate',
      type: 'leader',
      row: 'special',
      power: 0,
      rarity: 'legendary',
      ability: 'scorch',
      description: 'Artillery Barrage: Execute the highest power non-hero unit on enemy Siege row.',
      icon: '💣',
      color: '#D97706',
      quote: 'Patience and gunpowder turn kings into dust.',
    },
    starterDeckIds: [
      'sg_ashigaru_spear', 'sg_ashigaru_spear', 'sg_ashigaru_spear',
      'sg_tanegashima_gunner', 'sg_tanegashima_gunner',
      'sg_heavy_trebuchet', 'sg_heavy_trebuchet',
      'sg_fire_arrow_cart', 'sg_fire_arrow_cart',
      'sg_court_diplomat_spy', 'sg_field_surgeon',
      'sg_castle_fortress', 'sg_general_nobunaga',
      'sp_war_taiko', 'sp_scorch_flame', 'wth_shrine_rain'
    ],
  },
};
