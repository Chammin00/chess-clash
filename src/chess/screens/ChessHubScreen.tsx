import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { GameThemeId, PlayerChessProfile, ThemeConfig, PieceType } from '../types';
import { THEME_CONFIGS } from '../themes';
import { getTierColor, getTierIcon } from '../services/chessMMRService';
import { VectorPiece } from '../components/VectorPiece';

interface ChessHubScreenProps {
  profile: PlayerChessProfile;
  selectedThemeId: GameThemeId;
  onSelectTheme: (themeId: GameThemeId) => void;
  onStartRankedMatch: (themeId: GameThemeId) => void;
  onStartPracticeMatch: (
    themeId: GameThemeId,
    engine: 'stockfish' | 'maia' | 'alphazero',
    botMmr: number
  ) => void;
  onStartPassAndPlay: (themeId: GameThemeId) => void;
  onOpenCampaign?: () => void;
  onBackToMainMenu: () => void;
}

export const ChessHubScreen: React.FC<ChessHubScreenProps> = ({
  profile,
  selectedThemeId,
  onSelectTheme,
  onStartRankedMatch,
  onStartPracticeMatch,
  onStartPassAndPlay,
  onOpenCampaign,
  onBackToMainMenu,
}) => {
  const [selectedThemeForModal, setSelectedThemeForModal] = useState<ThemeConfig | null>(null);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [practiceEngine, setPracticeEngine] = useState<'stockfish' | 'maia' | 'alphazero'>('stockfish');
  const [practiceMmr, setPracticeMmr] = useState(1400);

  const themeList = Object.values(THEME_CONFIGS);
  const currentTheme = THEME_CONFIGS[selectedThemeId];
  const currentStat = profile.themeStats[selectedThemeId] || {
    mmr: 1000,
    tier: 'Bronze' as const,
    wins: 0,
    losses: 0,
    draws: 0,
    streak: 0,
    peakMmr: 1000,
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBackToMainMenu}>
          <Text style={styles.backBtnText}>‹ Main Menu</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>10 KINGDOMS CHESS</Text>
          <Text style={styles.headerSubtitle}>MMR ARENA & REPLICATED ENGINES</Text>
        </View>
        <View style={styles.overallMmrBadge}>
          <Text style={styles.overallMmrLabel}>GLOBAL MMR</Text>
          <Text style={styles.overallMmrValue}>{profile.overallMmr}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Super Mario World 1-Player Story Mode CTA */}
        {onOpenCampaign && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.storyModeBanner}
            onPress={onOpenCampaign}
          >
            <View style={styles.storyBannerLeft}>
              <Text style={styles.storyBannerEmoji}>🗺️</Text>
              <View style={styles.storyTextCol}>
                <View style={styles.storyTitleRow}>
                  <Text style={styles.storyBannerTitle}>1-PLAYER STORY CAMPAIGN</Text>
                  <View style={styles.storyBadge}>
                    <Text style={styles.storyBadgeText}>10 WORLDS</Text>
                  </View>
                </View>
                <Text style={styles.storyBannerSub}>
                  Mario-Style Overworld • Castle Bosses • Tactical Rewinds & Items!
                </Text>
              </View>
            </View>
            <Text style={styles.storyBannerArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Selected Game Hero Banner */}
        <View style={[styles.heroCard, { borderColor: currentTheme.primaryColor }]}>
          <View style={styles.heroHeader}>
            <View style={styles.heroBannerIcon}>
              <Text style={styles.bannerIconText}>{currentTheme.factionBanner}</Text>
            </View>
            <View style={styles.heroTitleCol}>
              <Text style={styles.heroName}>{currentTheme.name}</Text>
              <Text style={styles.heroTagline}>{currentTheme.tagline}</Text>
            </View>
            <TouchableOpacity
              style={styles.loreBtn}
              onPress={() => setSelectedThemeForModal(currentTheme)}
            >
              <Text style={styles.loreBtnText}>Pieces & Lore ℹ️</Text>
            </TouchableOpacity>
          </View>

          {/* Player Stats for this Kingdom */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>TIER</Text>
              <View style={styles.tierValueRow}>
                <Text style={styles.tierIcon}>{getTierIcon(currentStat.tier)}</Text>
                <Text style={[styles.statValue, { color: getTierColor(currentStat.tier) }]}>
                  {currentStat.tier}
                </Text>
              </View>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>MMR</Text>
              <Text style={[styles.statValue, { color: '#38BDF8' }]}>{currentStat.mmr}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>W / L</Text>
              <Text style={styles.statValue}>
                {currentStat.wins}W - {currentStat.losses}L
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>STREAK</Text>
              <Text style={[styles.statValue, { color: '#10B981' }]}>
                {currentStat.streak > 0 ? `+${currentStat.streak} 🔥` : '-'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsCol}>
            <TouchableOpacity
              style={[styles.playRankedBtn, { backgroundColor: currentTheme.primaryColor }]}
              onPress={() => onStartRankedMatch(selectedThemeId)}
            >
              <Text style={styles.playRankedBtnText}>⚡ PLAY RANKED MMR MATCH</Text>
            </TouchableOpacity>

            <View style={styles.secondaryActionRow}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => setShowPracticeModal(true)}
              >
                <Text style={styles.secondaryBtnText}>🤖 Engine AI Practice</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => onStartPassAndPlay(selectedThemeId)}
              >
                <Text style={styles.secondaryBtnText}>👥 Pass & Play (2P)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 10 Themed Chess Games Grid Selector */}
        <Text style={styles.sectionHeader}>SELECT YOUR CHESS KINGDOM (10 GAMES)</Text>

        <View style={styles.themeGrid}>
          {themeList.map((t) => {
            const isSelected = t.id === selectedThemeId;
            const stat = profile.themeStats[t.id] || { mmr: 1000, tier: 'Bronze' };

            return (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.themeCard,
                  isSelected && {
                    borderColor: t.primaryColor,
                    borderWidth: 2,
                    backgroundColor: '#1E293B',
                  },
                ]}
                onPress={() => onSelectTheme(t.id)}
              >
                <View style={styles.themeCardHeader}>
                  <Text style={styles.themeCardEmoji}>{t.factionBanner}</Text>
                  <View style={styles.themeCardTierBadge}>
                    <Text style={[styles.themeCardTierText, { color: getTierColor(stat.tier) }]}>
                      {stat.tier}
                    </Text>
                  </View>
                </View>
                <Text style={styles.themeCardName} numberOfLines={1}>
                  {t.name}
                </Text>
                <Text style={styles.themeCardMmr}>MMR {stat.mmr}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Engine Information Callout */}
        <View style={styles.engineExplainerBox}>
          <Text style={styles.engineExplainerTitle}>🧠 REPLICATED TOP CHESS MODELS</Text>
          <Text style={styles.engineItem}>
            • <Text style={styles.boldText}>Stockfish NNUE Model:</Text> Alpha-Beta pruning, PeSTO
            Piece-Square Tables, quiescence tactical capture evaluation.
          </Text>
          <Text style={styles.engineItem}>
            • <Text style={styles.boldText}>Maia Chess Model:</Text> Human-calibrated move prediction
            trained on human games with blunder-rate modeling.
          </Text>
          <Text style={styles.engineItem}>
            • <Text style={styles.boldText}>AlphaZero MCTS Model:</Text> Monte Carlo Tree Search
            with UCB1 selection and policy-value rollouts.
          </Text>
        </View>
      </ScrollView>

      {/* Piece Lore & Abilities Modal */}
      <Modal
        visible={selectedThemeForModal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedThemeForModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedThemeForModal && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    [{selectedThemeForModal.factionBanner}] {selectedThemeForModal.name}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedThemeForModal(null)}>
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalLoreText}>{selectedThemeForModal.lore}</Text>

                {/* Asymmetric Faction Modifier Banner */}
                {selectedThemeForModal.factionModifier && (
                  <View style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', borderWidth: 1, borderColor: selectedThemeForModal.primaryColor, borderRadius: 8, padding: 10, marginVertical: 8 }}>
                    <Text style={{ color: selectedThemeForModal.highlightColor, fontSize: 13, fontWeight: '800', marginBottom: 2 }}>
                      FACTION TRAIT: {selectedThemeForModal.factionModifier.name.toUpperCase()}
                    </Text>
                    <Text style={{ color: '#E2E8F0', fontSize: 12 }}>
                      {selectedThemeForModal.factionModifier.effect}
                    </Text>
                  </View>
                )}

                <ScrollView style={styles.modalPieceList}>
                  {Object.entries(selectedThemeForModal.pieces).map(([type, piece]) => (
                    <View key={type} style={styles.modalPieceItem}>
                      <View style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}>
                        <VectorPiece type={type as PieceType} color="white" size={36} />
                      </View>
                      <View style={styles.modalPieceInfo}>
                        <View style={styles.modalPieceNameRow}>
                          <Text style={styles.modalPieceTitle}>{piece.title}</Text>
                          <Text style={styles.modalPieceType}>({type.toUpperCase()})</Text>
                        </View>
                        <Text style={styles.modalPieceAbility}>{piece.specialAbility}</Text>
                        <Text style={styles.modalPieceDesc}>
                          {piece.description} • {piece.moveRadius}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* AI Practice Configuration Modal */}
      <Modal
        visible={showPracticeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPracticeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.practiceModalContent}>
            <Text style={styles.practiceModalTitle}>🤖 AI Engine Sandbox</Text>
            <Text style={styles.practiceModalSubtitle}>
              Practice against top replicated chess models
            </Text>

            {/* Select Engine Model */}
            <Text style={styles.inputLabel}>SELECT ENGINE MODEL</Text>
            <View style={styles.enginePickerRow}>
              {[
                { id: 'stockfish', label: 'Stockfish' },
                { id: 'maia', label: 'Maia Human' },
                { id: 'alphazero', label: 'AlphaZero MCTS' },
              ].map((eng) => (
                <TouchableOpacity
                  key={eng.id}
                  style={[
                    styles.engineOptionBtn,
                    practiceEngine === eng.id && styles.engineOptionActive,
                  ]}
                  onPress={() => setPracticeEngine(eng.id as any)}
                >
                  <Text
                    style={[
                      styles.engineOptionText,
                      practiceEngine === eng.id && styles.engineOptionActiveText,
                    ]}
                  >
                    {eng.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Select Target Bot MMR */}
            <Text style={styles.inputLabel}>BOT DIFFICULTY / MMR: {practiceMmr}</Text>
            <View style={styles.mmrPickerRow}>
              {[800, 1200, 1500, 1800, 2200, 2600].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.mmrOptionBtn,
                    practiceMmr === rating && styles.mmrOptionActive,
                  ]}
                  onPress={() => setPracticeMmr(rating)}
                >
                  <Text
                    style={[
                      styles.mmrOptionText,
                      practiceMmr === rating && styles.mmrOptionActiveText,
                    ]}
                  >
                    {rating}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Start Button */}
            <TouchableOpacity
              style={styles.startPracticeBtn}
              onPress={() => {
                setShowPracticeModal(false);
                onStartPracticeMatch(selectedThemeId, practiceEngine, practiceMmr);
              }}
            >
              <Text style={styles.startPracticeBtnText}>Launch Practice Match</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowPracticeModal(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  overallMmrBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  overallMmrLabel: {
    color: '#38BDF8',
    fontSize: 8,
    fontWeight: '800',
  },
  overallMmrValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 16,
  },
  storyModeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3B0764',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#A855F7',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  storyBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storyBannerEmoji: {
    fontSize: 32,
    marginRight: 10,
  },
  storyTextCol: {
    flex: 1,
  },
  storyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storyBannerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  storyBadge: {
    backgroundColor: '#A855F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  storyBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  storyBannerSub: {
    color: '#E9D5FF',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  storyBannerArrow: {
    color: '#D8B4FE',
    fontSize: 22,
    fontWeight: '800',
    marginLeft: 6,
  },
  heroCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroBannerIcon: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  bannerIconText: {
    fontSize: 26,
  },
  heroTitleCol: {
    flex: 1,
  },
  heroName: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '900',
  },
  heroTagline: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
  },
  loreBtn: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  loreBtnText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1F2937',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 2,
  },
  tierValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierIcon: {
    fontSize: 12,
    marginRight: 3,
  },
  statValue: {
    color: '#F9FAFB',
    fontSize: 13,
    fontWeight: '800',
  },
  actionButtonsCol: {
    gap: 8,
  },
  playRankedBtn: {
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  playRankedBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  secondaryActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#1F2937',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  secondaryBtnText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  themeCard: {
    width: '48%',
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  themeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  themeCardEmoji: {
    fontSize: 22,
  },
  themeCardTierBadge: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  themeCardTierText: {
    fontSize: 9,
    fontWeight: '800',
  },
  themeCardName: {
    color: '#F3F4F6',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  themeCardMmr: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600',
  },
  engineExplainerBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 20,
  },
  engineExplainerTitle: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  engineItem: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 6,
  },
  boldText: {
    color: '#F1F5F9',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 16,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#374151',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '900',
  },
  modalCloseText: {
    color: '#9CA3AF',
    fontSize: 18,
    fontWeight: '800',
    padding: 4,
  },
  modalLoreText: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  modalPieceList: {
    marginTop: 6,
  },
  modalPieceItem: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  modalPieceIcon: {
    fontSize: 26,
    marginRight: 10,
  },
  modalPieceInfo: {
    flex: 1,
  },
  modalPieceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalPieceTitle: {
    color: '#F9FAFB',
    fontSize: 13,
    fontWeight: '800',
  },
  modalPieceType: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '700',
  },
  modalPieceAbility: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  modalPieceDesc: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 1,
  },
  practiceModalContent: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#374151',
  },
  practiceModalTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  practiceModalSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 16,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  enginePickerRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  engineOptionBtn: {
    flex: 1,
    backgroundColor: '#1F2937',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  engineOptionActive: {
    backgroundColor: '#2563EB',
    borderColor: '#38BDF8',
  },
  engineOptionText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
  },
  engineOptionActiveText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  mmrPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 20,
  },
  mmrOptionBtn: {
    width: '31%',
    backgroundColor: '#1F2937',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  mmrOptionActive: {
    backgroundColor: '#059669',
    borderColor: '#34D399',
  },
  mmrOptionText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
  },
  mmrOptionActiveText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  startPracticeBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  startPracticeBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
});
