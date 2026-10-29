import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { RankBadge } from '../components/RankBadge';
import { AdBannerView } from '../components/AdBannerView';
import { PlayerProfile } from '../types/mmr';
import { MmrEngine } from '../services/mmrEngine';
import { FACTION_CONFIGS } from '../config/factions';
import { FactionId } from '../types/card';
import { SoundService } from '../services/soundService';
import { GlyphIcon } from '../components/GlyphIcon';
import { DesignTokens } from '../theme/designSystem';

interface Props {
  profile: PlayerProfile;
  onFindMatch: () => void;
  onOpenDeck: () => void;
  onOpenLeaderboard: () => void;
  onOpenShop: () => void;
  onOpenBattlePass: () => void;
  onSelectFaction: (faction: FactionId) => void;
  onOpenChess?: () => void;
}

export const LobbyScreen: React.FC<Props> = ({
  profile,
  onFindMatch,
  onOpenDeck,
  onOpenLeaderboard,
  onOpenShop,
  onOpenBattlePass,
  onSelectFaction,
  onOpenChess,
}) => {
  const currentFaction: FactionId = profile.selectedFaction || 'shinobi';
  const factionConfig = FACTION_CONFIGS[currentFaction as Exclude<FactionId, 'neutral'>];

  const progress = MmrEngine.getProgressToNextTier(profile.mmr);
  const totalMatches = profile.wins + profile.losses;
  const winRate = totalMatches > 0 ? Math.round((profile.wins / totalMatches) * 100) : 0;

  const factionsList = Object.values(FACTION_CONFIGS);

  const handleFactionChange = (fId: FactionId) => {
    SoundService.playButtonClick();
    onSelectFaction(fId);
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header / Currency Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.appTitle}>影GWENT: SHADOW BATTLE</Text>
            <Text style={styles.appSubtitle}>Feudal Witcher Card Duel</Text>
          </View>
          <View style={styles.currencies}>
            <View style={styles.currencyPill}>
              <GlyphIcon name="gold" size={13} style={styles.curGlyph} />
              <Text style={styles.curAmount}>{profile.gold}</Text>
            </View>
            <View style={styles.currencyPill}>
              <GlyphIcon name="gem" size={13} style={styles.curGlyph} />
              <Text style={styles.curAmount}>{profile.gems}</Text>
            </View>
          </View>
        </View>

        {/* Profile Card & MMR Status */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View>
              <Text style={styles.playerName}>{profile.name}</Text>
              <Text style={styles.statsSummary}>
                {profile.wins}W - {profile.losses}L ({winRate}% WR)
              </Text>
            </View>
            <RankBadge mmr={profile.mmr} size="medium" />
          </View>

          {/* Rank Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Tier Ladder Progress</Text>
              <Text style={styles.progressPercent}>{progress.percent}%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progress.percent}%` }]} />
            </View>
            <Text style={styles.nextTierTarget}>
              Next division threshold: {progress.target} MMR
            </Text>
          </View>

          {/* Win Streak Pill */}
          {profile.winStreak >= 2 && (
            <View style={styles.streakBanner}>
              <Text style={styles.streakText}>
                🔥 {profile.winStreak} WIN STREAK (+20% Elo Bonus Active!)
              </Text>
            </View>
          )}
        </View>

        {/* Active Faction Showcase & Picker */}
        <View style={[styles.factionShowcaseCard, { borderColor: factionConfig.color }]}>
          <View style={styles.factionCardTop}>
            <Text style={styles.factionKanji}>{factionConfig.kanji}</Text>
            <View style={styles.factionTextGroup}>
              <Text style={[styles.factionName, { color: factionConfig.accentColor }]}>
                {factionConfig.emblem} {factionConfig.name}
              </Text>
              <Text style={styles.factionTagline}>{factionConfig.tagline}</Text>
            </View>
          </View>

          <View style={styles.factionPassiveBox}>
            <Text style={styles.passiveTitle}>
              ⚡ Faction Perk: <Text style={styles.passiveBold}>{factionConfig.passiveName}</Text>
            </Text>
            <Text style={styles.passiveDesc}>{factionConfig.passiveDesc}</Text>
          </View>

          {/* Faction Switcher Tabs */}
          <Text style={styles.switchFactionLabel}>SELECT YOUR CLAN DECK:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.factionTabsScroll}>
            {factionsList.map(f => {
              const isSelected = f.id === currentFaction;
              return (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => handleFactionChange(f.id)}
                  style={[
                    styles.factionTabPill,
                    isSelected && { backgroundColor: f.color, borderColor: f.accentColor, borderWidth: 1.5 },
                  ]}
                >
                  <Text style={styles.tabEmblem}>{f.emblem}</Text>
                  <Text style={[styles.tabName, isSelected && styles.tabNameSelected]}>
                    {f.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 10 Kingdoms Chess Arena CTA */}
        {onOpenChess && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.chessArenaButton}
            onPress={onOpenChess}
          >
            <View style={styles.chessArenaButtonInner}>
              <Text style={styles.chessIconBig}>👑</Text>
              <View style={styles.chessTextContainer}>
                <View style={styles.chessTitleRow}>
                  <Text style={styles.chessTitle}>10 KINGDOMS CHESS ARENA</Text>
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>TOP AI</Text>
                  </View>
                </View>
                <Text style={styles.chessSub}>
                  Ninjas • Samurais • Pirates • Animals • Sea Creatures
                </Text>
                <Text style={styles.chessEngineTags}>
                  Stockfish • Maia Human-AI • AlphaZero MCTS
                </Text>
              </View>
              <Text style={styles.chessArrow}>›</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Main Ranked Duel CTA */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.playButton, { backgroundColor: factionConfig.color }]}
          onPress={onFindMatch}
        >
          <View style={styles.playButtonInner}>
            <GlyphIcon name="duel" size={28} style={styles.playIcon} />
            <View style={styles.playTextContainer}>
              <Text style={styles.playTitle}>COMMENCE GWENT DUEL</Text>
              <Text style={styles.playSub}>Best 2-of-3 • 1v1 Elo Matchmaking</Text>
            </View>
            <GlyphIcon name="arrow" size={18} color="#FFFFFF" style={styles.playArrow} />
          </View>
        </TouchableOpacity>

        {/* Navigation Grid */}
        <View style={styles.navGrid}>
          <TouchableOpacity style={styles.navCard} onPress={onOpenDeck}>
            <GlyphIcon name="deck" size={22} style={styles.navIcon} />
            <Text style={styles.navTitle}>Deck Builder</Text>
            <Text style={styles.navDesc}>Edit Faction Deck</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navCard} onPress={onOpenLeaderboard}>
            <GlyphIcon name="leaderboard" size={22} style={styles.navIcon} />
            <Text style={styles.navTitle}>Leaderboard</Text>
            <Text style={styles.navDesc}>Global Shogun Rank</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navCard} onPress={onOpenShop}>
            <GlyphIcon name="shop" size={22} style={styles.navIcon} />
            <Text style={styles.navTitle}>Merchant</Text>
            <Text style={styles.navDesc}>Packs & Crates</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navCard} onPress={onOpenBattlePass}>
            <GlyphIcon name="pass" size={22} style={styles.navIcon} />
            <Text style={styles.navTitle}>Bushido Pass</Text>
            <Text style={styles.navDesc}>Season Rewards</Text>
          </TouchableOpacity>
        </View>

        {/* Ad Banner View at bottom */}
        <AdBannerView />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0C0A09',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  appTitle: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  appSubtitle: {
    color: '#A8A29E',
    fontSize: 11,
    fontWeight: '600',
  },
  currencies: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  curGlyph: {
    marginRight: 5,
  },
  curAmount: {
    color: '#F9FAFB',
    fontSize: 12,
    fontWeight: '800',
  },
  profileCard: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  playerName: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '900',
  },
  statsSummary: {
    color: '#A8A29E',
    fontSize: 12,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 6,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    color: '#D6D3D1',
    fontSize: 11,
    fontWeight: '600',
  },
  progressPercent: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#27272A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 4,
  },
  nextTierTarget: {
    color: '#78716C',
    fontSize: 10,
    marginTop: 6,
    textAlign: 'right',
  },
  streakBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 12,
    alignItems: 'center',
  },
  streakText: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: '800',
  },
  factionShowcaseCard: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 3,
  },
  factionCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  factionKanji: {
    fontSize: 34,
    color: '#D97706',
    fontWeight: '900',
    marginRight: 10,
  },
  factionTextGroup: {
    flex: 1,
  },
  factionName: {
    fontSize: 17,
    fontWeight: '900',
  },
  factionTagline: {
    color: '#A8A29E',
    fontSize: 11,
    marginTop: 2,
  },
  factionPassiveBox: {
    backgroundColor: '#27272A',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  passiveTitle: {
    color: '#FEF08A',
    fontSize: 12,
  },
  passiveBold: {
    fontWeight: '900',
  },
  passiveDesc: {
    color: '#D6D3D1',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  switchFactionLabel: {
    color: '#78716C',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  factionTabsScroll: {
    flexDirection: 'row',
  },
  factionTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  tabEmblem: {
    fontSize: 14,
    marginRight: 4,
  },
  tabName: {
    color: '#A8A29E',
    fontSize: 11,
    fontWeight: '700',
  },
  chessArenaButton: {
    backgroundColor: '#1E1B4B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  chessArenaButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chessIconBig: {
    fontSize: 32,
    marginRight: 12,
  },
  chessTextContainer: {
    flex: 1,
  },
  chessTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chessTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  newBadge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  chessSub: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  chessEngineTags: {
    color: '#818CF8',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '700',
  },
  chessArrow: {
    color: '#A5B4FC',
    fontSize: 24,
    fontWeight: '800',
    marginLeft: 6,
  },
  playButton: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  playButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playIcon: {
    marginRight: 14,
  },
  playTextContainer: {
    flex: 1,
  },
  playTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  playSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  playArrow: {
    marginLeft: 8,
  },
  navGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navCard: {
    width: '48%',
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  navIcon: {
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  navTitle: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '800',
  },
  navDesc: {
    color: '#78716C',
    fontSize: 11,
    marginTop: 2,
  },
});
