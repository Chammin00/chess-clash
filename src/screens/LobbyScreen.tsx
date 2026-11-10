import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { RankBadge } from '../components/RankBadge';
import { PlayerProfile } from '../types/mmr';
import { MmrEngine } from '../services/mmrEngine';
import { GameStudioEngine } from '../services/gameStudioEngine';
import {
  AFRO_ASIAN_WARRIORS,
  WarriorProfile,
  WarriorArchetypeId,
  generateRandomWarriorName,
} from '../data/afroAsianWarriors';
import {
  AfroAsianFighterRigSvg,
  MotionActionType,
} from '../components/AfroAsianMotionStage';

interface Props {
  profile: PlayerProfile;
  selectedWarrior: WarriorProfile;
  customWarriorName: string;
  onSelectWarrior: (warrior: WarriorProfile) => void;
  onRandomizeName: () => void;
  onStartSpireRun: () => void;
  onFindMatch: () => void;
  onOpenDeck: () => void;
  onOpenLeaderboard: () => void;
  onOpenShop: () => void;
  onOpenBattlePass: () => void;
  onOpenGwent: () => void;
}

const WARRIOR_PORTRAIT_MAP: Record<WarriorArchetypeId, string> = {
  odachi_vanguard: '/assets/warriors/warrior_odachi.png',
  kodachi_phantom: '/assets/warriors/warrior_kodachi.png',
  nunchaku_dragon: '/assets/warriors/warrior_nunchaku.png',
  kusarigama_mystic: '/assets/warriors/warrior_kusarigama.png',
};

export const LobbyScreen: React.FC<Props> = ({
  profile,
  selectedWarrior,
  customWarriorName,
  onSelectWarrior,
  onRandomizeName,
  onStartSpireRun,
  onFindMatch,
  onOpenDeck,
  onOpenLeaderboard,
  onOpenShop,
  onOpenBattlePass,
  onOpenGwent,
}) => {
  const [previewMotion, setPreviewMotion] = useState<MotionActionType>('idle');
  const [activeMotionLabel, setActiveMotionLabel] = useState<string>(
    selectedWarrior.motions.single_hit.name
  );
  const [sfxOn, setSfxOn] = useState(GameStudioEngine.isSfxEnabled());
  const [jukeboxOn, setJukeboxOn] = useState(GameStudioEngine.isJukeboxPlaying());

  const triggerPreviewMotion = (type: 'single_hit' | 'multi_hit' | 'close_quarters') => {
    setPreviewMotion(type);
    const spec = selectedWarrior.motions[type];
    setActiveMotionLabel(`${spec.callout} — ${spec.name}`);
    if (type === 'single_hit') GameStudioEngine.playSfx('heavy_strike');
    else if (type === 'multi_hit') GameStudioEngine.playSfx('card_strike');
    else GameStudioEngine.playSfx('enemy_attack');

    setTimeout(() => {
      setPreviewMotion('idle');
    }, 750);
  };

  const progress = MmrEngine.getProgressToNextTier(profile.mmr);

  return (
    <View style={styles.screen}>
      {/* Background Dark Pagoda Eclipse Art */}
      {Platform.OS === 'web' && (
        <Image
          source={{ uri: '/assets/warriors/dark_pagoda_arena.png' }}
          style={styles.bgBackdrop}
          resizeMode="cover"
        />
      )}
      <View style={styles.darkVignette} pointerEvents="none" />

      {/* NARAKA: BLADEPOINT STYLE TOP NAVIGATION BAR */}
      <View style={styles.narakaTopNav}>
        <View style={styles.brandBlock}>
          <Text style={styles.brandKagura}>KAGURA: ECLIPSE OF THE CRIMSON SPIRE</Text>
          <Text style={styles.brandSub}>AFRO-ASIAN DARK FANTASY MOTION DECKBUILDER</Text>
        </View>

        <View style={styles.navTabsRow}>
          <View style={[styles.navTab, styles.navTabActive]}>
            <Text style={styles.navTabTextActive}>HEROES</Text>
          </View>
          <TouchableOpacity style={styles.navTab} onPress={onOpenDeck}>
            <Text style={styles.navTabText}>SCROLLS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navTab} onPress={onFindMatch}>
            <Text style={styles.navTabText}>DUEL ARENA</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navTab, { borderColor: '#F59E0B' }]} onPress={onOpenGwent}>
            <Text style={[styles.navTabText, { color: '#FCD34D' }]}>GWENT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navTab} onPress={onOpenLeaderboard}>
            <Text style={styles.navTabText}>RANKS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navTab} onPress={onOpenBattlePass}>
            <Text style={styles.navTabText}>TENACITY PASS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navTab} onPress={onOpenShop}>
            <Text style={styles.navTabText}>SHRINE SHOP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.currencyCluster}>
          <TouchableOpacity
            style={[styles.audioPill, jukeboxOn && styles.audioPillActive]}
            onPress={() => setJukeboxOn(GameStudioEngine.toggleJukebox())}
          >
            <Text style={styles.audioPillText}>{jukeboxOn ? '🎵 BGM ON' : '🎹 BGM'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.audioPill, sfxOn && styles.audioPillActive]}
            onPress={() => setSfxOn(GameStudioEngine.toggleSfx())}
          >
            <Text style={styles.audioPillText}>{sfxOn ? '🔊 SFX' : '🔇 SFX'}</Text>
          </TouchableOpacity>
          <View style={styles.currencyPill}>
            <Text style={styles.curText}>🪙 {profile.gold}</Text>
          </View>
          <View style={styles.currencyPill}>
            <Text style={styles.curText}>💎 {profile.gems}</Text>
          </View>
        </View>
      </View>

      {/* MAIN 3-COLUMN NARAKA / TEKKEN 8 HERO CHAMBER */}
      <ScrollView contentContainerStyle={styles.chamberContent} showsVerticalScrollIndicator={false}>
        <View style={styles.chamberGrid}>
          {/* LEFT COLUMN: 4 AFRO-ASIAN WARRIOR ROSTER + RANDOM NAME GENERATOR */}
          <View style={styles.leftRosterCol}>
            <Text style={styles.sectionHeader}>SELECT WARRIOR (4 CLASSES)</Text>

            {AFRO_ASIAN_WARRIORS.map(w => {
              const isSelected = w.id === selectedWarrior.id;
              return (
                <TouchableOpacity
                  key={w.id}
                  activeOpacity={0.85}
                  onPress={() => {
                    GameStudioEngine.playSfx('button_click');
                    onSelectWarrior(w);
                    setActiveMotionLabel(w.motions.single_hit.name);
                  }}
                  style={[
                    styles.rosterCard,
                    isSelected && {
                      borderColor: w.primaryColor,
                      backgroundColor: 'rgba(24, 12, 28, 0.95)',
                    },
                  ]}
                >
                  {Platform.OS === 'web' && (
                    <Image
                      source={{ uri: WARRIOR_PORTRAIT_MAP[w.id] }}
                      style={[
                        styles.rosterThumb,
                        isSelected && { borderColor: w.primaryColor },
                      ]}
                    />
                  )}
                  <View style={styles.rosterTextCol}>
                    <Text
                      numberOfLines={1}
                      style={[styles.rosterName, isSelected && { color: '#FFF' }]}
                    >
                      {isSelected ? customWarriorName : w.name}
                    </Text>
                    <Text numberOfLines={1} style={[styles.rosterWeapon, { color: w.accentColor }]}>
                      {w.weaponName}
                    </Text>
                    <Text numberOfLines={1} style={styles.rosterStyle}>
                      {w.hp} VIT • {w.starterRelic.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Random Afro-Asian Warrior Name Generator Button */}
            <TouchableOpacity
              style={styles.randomizeBtn}
              onPress={() => {
                GameStudioEngine.playSfx('card_lift');
                onRandomizeName();
              }}
            >
              <Text style={styles.randomizeBtnText}>🎲 GENERATE AFRO-ASIAN NAME</Text>
            </TouchableOpacity>

            {/* MMR Rank Badge Plate */}
            <View style={styles.mmrMiniCard}>
              <View style={styles.mmrMiniHeader}>
                <View>
                  <Text style={styles.mmrMiniLabel}>ASCENSION MMR</Text>
                  <Text style={styles.mmrMiniVal}>{profile.mmr} RATING</Text>
                </View>
                <RankBadge mmr={profile.mmr} size="small" />
              </View>
              <View style={styles.mmrTrack}>
                <View style={[styles.mmrFill, { width: `${progress.percent}%` }]} />
              </View>
            </View>
          </View>

          {/* CENTER COLUMN: 3D-STYLE HERO SHOWCASE & LIVE MOTION ANIMATION TESTER */}
          <View style={styles.centerShowcaseCol}>
            <View
              style={[
                styles.heroShowcaseFrame,
                { borderColor: selectedWarrior.primaryColor },
              ]}
            >
              {/* High-Resolution Generated Afro-Asian Character Art */}
              {Platform.OS === 'web' && (
                <Image
                  source={{ uri: WARRIOR_PORTRAIT_MAP[selectedWarrior.id] }}
                  style={styles.heroFullPortrait}
                  resizeMode="cover"
                />
              )}

              {/* Live Articulated Motion Rig Overlay when testing attacks */}
              <View style={styles.liveRigCorner}>
                <AfroAsianFighterRigSvg
                  warriorId={selectedWarrior.id}
                  motionType={previewMotion}
                  size={122}
                />
              </View>

              {/* Bottom Hero Title & Motion Callout Overlay */}
              <View style={styles.showcaseBottomOverlay}>
                <Text style={[styles.showcaseHeritage, { color: selectedWarrior.accentColor }]}>
                  {selectedWarrior.heritage.toUpperCase()}
                </Text>
                <Text style={styles.showcaseHeroName}>{customWarriorName.toUpperCase()}</Text>
                <Text style={styles.showcaseEpithet}>{selectedWarrior.title}</Text>

                {/* Active Motion Preview Callout */}
                <View style={styles.motionPreviewPill}>
                  <Text style={styles.motionPreviewText}>⚡ {activeMotionLabel}</Text>
                </View>
              </View>
            </View>

            {/* 3 INTERACTIVE MOTION CHOREOGRAPHY BUTTONS (Single-Hit / Multi-Hit / Close-Quarters) */}
            <View style={styles.motionTesterRow}>
              <TouchableOpacity
                style={[styles.motionTestBtn, { borderColor: '#EF4444' }]}
                onPress={() => triggerPreviewMotion('single_hit')}
              >
                <Text style={styles.motionTestTag}>SINGLE-HIT CLEAVE</Text>
                <Text numberOfLines={1} style={styles.motionTestName}>
                  {selectedWarrior.motions.single_hit.name}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.motionTestBtn, { borderColor: '#C084FC' }]}
                onPress={() => triggerPreviewMotion('multi_hit')}
              >
                <Text style={[styles.motionTestTag, { color: '#C084FC' }]}>
                  MULTI-HIT ({selectedWarrior.motions.multi_hit.hitCount}x)
                </Text>
                <Text numberOfLines={1} style={styles.motionTestName}>
                  {selectedWarrior.motions.multi_hit.name}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.motionTestBtn, { borderColor: '#F59E0B' }]}
                onPress={() => triggerPreviewMotion('close_quarters')}
              >
                <Text style={[styles.motionTestTag, { color: '#F59E0B' }]}>
                  CLOSE-QUARTERS
                </Text>
                <Text numberOfLines={1} style={styles.motionTestName}>
                  {selectedWarrior.motions.close_quarters.name}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* RIGHT COLUMN: WEAPON LORE, COMBAT SPEC & LAUNCH SPIRE EXPEDITION */}
          <View style={styles.rightDetailsCol}>
            <View style={styles.inspectorCard}>
              <Text style={styles.inspectorHeader}>ARMAMENT & MARTIAL DOCTRINE</Text>
              <Text style={[styles.weaponTitle, { color: selectedWarrior.accentColor }]}>
                ⚔️ {selectedWarrior.weaponName}
              </Text>
              <Text style={styles.weaponDesc}>{selectedWarrior.weaponDescription}</Text>

              <View style={styles.divider} />

              <Text style={styles.inspectorHeader}>ANCESTRAL RELIC</Text>
              <View style={styles.relicRow}>
                <Text style={styles.relicIcon}>{selectedWarrior.starterRelic.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.relicName}>{selectedWarrior.starterRelic.name}</Text>
                  <Text style={styles.relicDesc}>{selectedWarrior.starterRelic.description}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.inspectorHeader}>WARRIOR CHRONICLE</Text>
              <Text style={styles.loreParagraph}>{selectedWarrior.lore}</Text>

              <View style={styles.motionBreakdownBox}>
                <Text style={styles.motionBreakdownTitle}>3-STANCE MOTION SYSTEM:</Text>
                <Text style={styles.motionBullet}>
                  • <Text style={{ color: '#FDA4AF', fontWeight: '800' }}>Single-Hit:</Text>{' '}
                  {selectedWarrior.motions.single_hit.description}
                </Text>
                <Text style={styles.motionBullet}>
                  • <Text style={{ color: '#D8B4FE', fontWeight: '800' }}>Multi-Hit:</Text>{' '}
                  {selectedWarrior.motions.multi_hit.description}
                </Text>
                <Text style={styles.motionBullet}>
                  • <Text style={{ color: '#FDE047', fontWeight: '800' }}>Close-Quarters:</Text>{' '}
                  {selectedWarrior.motions.close_quarters.description}
                </Text>
              </View>
            </View>

            {/* PRIMARY LAUNCH CTA (NARAKA CRIMSON-GOLD BUTTON) */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.launchSpireBtn}
              onPress={() => {
                GameStudioEngine.playSfx('power_surge');
                onStartSpireRun();
              }}
            >
              <Text style={styles.launchSpireTitle}>⚔️ ENTER THE CRIMSON SPIRE</Text>
              <Text style={styles.launchSpireSub}>
                Deploy as {customWarriorName} • 15 Pagoda Floors • Full Motion Combat
              </Text>
            </TouchableOpacity>

            {/* WITCHER GWENT ARENA LAUNCH CTA */}
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.launchGwentBtn}
              onPress={() => {
                GameStudioEngine.playSfx('power_surge');
                onOpenGwent();
              }}
            >
              <Text style={styles.launchGwentTitle}>🃏 ENTER WITCHER GWENT ARENA</Text>
              <Text style={styles.launchGwentSub}>
                10 Ryu Hayabusa Character Replicas • 3 Rows • Best-of-3 Tactics
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#07050A',
  },
  bgBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.28,
  },
  darkVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 5, 12, 0.65)',
  },
  narakaTopNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(11, 8, 18, 0.94)',
    borderBottomWidth: 1,
    borderBottomColor: '#4C1D95',
    flexWrap: 'wrap',
    gap: 8,
  },
  brandBlock: {
    marginRight: 10,
  },
  brandKagura: {
    color: '#F43F5E',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  brandSub: {
    color: '#A1A1AA',
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  navTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  navTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  navTabActive: {
    backgroundColor: '#7C3AED',
  },
  navTabText: {
    color: '#D4D4D8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  navTabTextActive: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  currencyCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  audioPill: {
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#3F3F46',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  audioPillActive: {
    borderColor: '#F43F5E',
    backgroundColor: 'rgba(244, 63, 94, 0.18)',
  },
  audioPillText: {
    color: '#F4F4F5',
    fontSize: 9,
    fontWeight: '800',
  },
  currencyPill: {
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#3F3F46',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  curText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '900',
  },
  chamberContent: {
    padding: 14,
  },
  chamberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
  },
  leftRosterCol: {
    flexGrow: 1,
    flexBasis: 250,
    maxWidth: 320,
    gap: 8,
  },
  sectionHeader: {
    color: '#E4E4E7',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 2,
  },
  rosterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 14, 24, 0.88)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1.5,
    borderColor: '#27272A',
  },
  rosterThumb: {
    width: 48,
    height: 48,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#3F3F46',
    marginRight: 10,
  },
  rosterTextCol: {
    flex: 1,
  },
  rosterName: {
    color: '#E4E4E7',
    fontSize: 12.5,
    fontWeight: '900',
  },
  rosterWeapon: {
    fontSize: 9.5,
    fontWeight: '800',
    marginTop: 1,
  },
  rosterStyle: {
    color: '#A1A1AA',
    fontSize: 8.5,
    marginTop: 2,
  },
  randomizeBtn: {
    backgroundColor: '#27272A',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    marginTop: 2,
  },
  randomizeBtnText: {
    color: '#FDE047',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  mmrMiniCard: {
    backgroundColor: 'rgba(17, 14, 24, 0.88)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#27272A',
    marginTop: 4,
  },
  mmrMiniHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  mmrMiniLabel: {
    color: '#A1A1AA',
    fontSize: 8.5,
    fontWeight: '800',
  },
  mmrMiniVal: {
    color: '#F4F4F5',
    fontSize: 13,
    fontWeight: '900',
  },
  mmrTrack: {
    height: 6,
    backgroundColor: '#090D16',
    borderRadius: 3,
    overflow: 'hidden',
  },
  mmrFill: {
    height: '100%',
    backgroundColor: '#F43F5E',
  },
  centerShowcaseCol: {
    flexGrow: 2,
    flexBasis: 340,
    alignItems: 'center',
  },
  heroShowcaseFrame: {
    width: '100%',
    height: 350,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#09060E',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroFullPortrait: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  liveRigCorner: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(9, 6, 14, 0.78)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 4,
  },
  showcaseBottomOverlay: {
    backgroundColor: 'rgba(9, 6, 14, 0.86)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  showcaseHeritage: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  showcaseHeroName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  showcaseEpithet: {
    color: '#D4D4D8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  motionPreviewPill: {
    backgroundColor: 'rgba(244, 63, 94, 0.2)',
    borderWidth: 1,
    borderColor: '#F43F5E',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  motionPreviewText: {
    color: '#FFE4E6',
    fontSize: 10,
    fontWeight: '900',
  },
  motionTesterRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginTop: 10,
  },
  motionTestBtn: {
    flex: 1,
    backgroundColor: 'rgba(17, 14, 24, 0.94)',
    borderRadius: 8,
    borderWidth: 1.5,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  motionTestTag: {
    color: '#FDA4AF',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  motionTestName: {
    color: '#F4F4F5',
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 2,
  },
  rightDetailsCol: {
    flexGrow: 1,
    flexBasis: 280,
    maxWidth: 360,
    justifyContent: 'space-between',
    gap: 10,
  },
  inspectorCard: {
    backgroundColor: 'rgba(17, 14, 24, 0.92)',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  inspectorHeader: {
    color: '#A1A1AA',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  weaponTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    marginBottom: 4,
  },
  weaponDesc: {
    color: '#D4D4D8',
    fontSize: 10.5,
    lineHeight: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#27272A',
    marginVertical: 10,
  },
  relicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  relicIcon: {
    fontSize: 22,
  },
  relicName: {
    color: '#FDE047',
    fontSize: 11.5,
    fontWeight: '900',
  },
  relicDesc: {
    color: '#D4D4D8',
    fontSize: 10,
  },
  loreParagraph: {
    color: '#A1A1AA',
    fontSize: 10.5,
    lineHeight: 15,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  motionBreakdownBox: {
    backgroundColor: '#09060E',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#27272A',
    gap: 4,
  },
  motionBreakdownTitle: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '900',
    marginBottom: 2,
  },
  motionBullet: {
    color: '#D4D4D8',
    fontSize: 9.5,
    lineHeight: 13.5,
  },
  launchSpireBtn: {
    backgroundColor: '#BE123C',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#FBBF24',
    alignItems: 'center',
  },
  launchSpireTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  launchSpireSub: {
    color: '#FFE4E6',
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 3,
  },
  launchGwentBtn: {
    backgroundColor: '#78350F',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
    alignItems: 'center',
    marginTop: 10,
  },
  launchGwentTitle: {
    color: '#FEF3C7',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  launchGwentSub: {
    color: '#FDE68A',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 3,
  },
});
