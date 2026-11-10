import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {
  GwentCard,
  GwentGameState,
  GwentRow,
} from '../types/gwent';
import { GwentEngine } from '../services/gwentEngine';
import { GwentCardView } from '../components/GwentCardView';
import { GwentCardInspectModal } from '../components/GwentCardInspectModal';
import { GwentGraveyardModal } from '../components/GwentGraveyardModal';
import { GameStudioEngine } from '../services/gameStudioEngine';

interface Props {
  playerName?: string;
  onExit: () => void;
  onMatchComplete?: (won: boolean) => void;
}

export const GwentScreen: React.FC<Props> = ({
  playerName = 'Ryu Hayabusa',
  onExit,
  onMatchComplete,
}) => {
  const [gameState, setGameState] = useState<GwentGameState>(() =>
    GwentEngine.initMatch(playerName)
  );

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [inspectedCard, setInspectedCard] = useState<GwentCard | null>(null);
  const [showPlayerGraveyard, setShowPlayerGraveyard] = useState(false);
  const [showOpponentGraveyard, setShowOpponentGraveyard] = useState(false);
  const [agilePromptCard, setAgilePromptCard] = useState<GwentCard | null>(null);
  const [hornPromptCard, setHornPromptCard] = useState<GwentCard | null>(null);

  // Trigger AI turn automatically when it's the opponent's active turn
  useEffect(() => {
    if (
      gameState.activeTurn === 'opponent' &&
      !gameState.opponent.passed &&
      gameState.status === 'playing'
    ) {
      const timer = setTimeout(() => {
        setGameState((prev) => {
          const next = GwentEngine.executeAiTurn({ ...prev });
          GameStudioEngine.playSfx('card_lift');
          return { ...next };
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState.activeTurn, gameState.status, gameState.opponent.passed]);

  // Handle card selection & play
  const handleSelectHandCard = (card: GwentCard) => {
    if (gameState.status !== 'playing' || gameState.activeTurn !== 'player' || gameState.player.passed) {
      setInspectedCard(card);
      return;
    }

    // If tapping already selected card -> inspect it
    if (selectedCardId === card.id) {
      setInspectedCard(card);
      return;
    }

    setSelectedCardId(card.id);
    GameStudioEngine.playSfx('button_click');

    // If card is agile, prompt for Melee or Ranged
    if (card.row === 'agile') {
      setAgilePromptCard(card);
      return;
    }

    // If card is Commander's Horn, prompt for target row
    if (card.ability === 'commanders_horn') {
      setHornPromptCard(card);
      return;
    }

    // Otherwise play card directly!
    executePlayCard(card.id);
  };

  const executePlayCard = (cardId: string, chosenRow?: GwentRow) => {
    setGameState((prev) => {
      const next = GwentEngine.playCard({ ...prev }, cardId, 'player', chosenRow);
      GameStudioEngine.playSfx('power_surge');
      return { ...next };
    });
    setSelectedCardId(null);
    setAgilePromptCard(null);
    setHornPromptCard(null);
  };

  const handlePassRound = () => {
    if (gameState.player.passed || gameState.status !== 'playing') return;
    GameStudioEngine.playSfx('button_click');
    setGameState((prev) => {
      const next = GwentEngine.passTurn({ ...prev }, 'player');
      return { ...next };
    });
    setSelectedCardId(null);
  };

  const handleNextRound = () => {
    GameStudioEngine.playSfx('power_surge');
    setGameState((prev) => GwentEngine.startNextRound({ ...prev }));
  };

  const handleMulliganRedraw = (cardId: string) => {
    GameStudioEngine.playSfx('card_lift');
    setGameState((prev) => GwentEngine.redrawMulligan({ ...prev }, cardId));
  };

  const handleFinishMulligan = () => {
    GameStudioEngine.playSfx('power_surge');
    setGameState((prev) => GwentEngine.finishMulligan({ ...prev }));
  };

  // Render Gems (2 Life crystals per player)
  const renderLifeGems = (lives: number) => {
    return (
      <View style={styles.gemRow}>
        <View style={[styles.gemCircle, lives >= 1 ? styles.gemActive : styles.gemShattered]}>
          <Text style={styles.gemIcon}>{lives >= 1 ? '💎' : '⚪'}</Text>
        </View>
        <View style={[styles.gemCircle, lives >= 2 ? styles.gemActive : styles.gemShattered]}>
          <Text style={styles.gemIcon}>{lives >= 2 ? '💎' : '⚪'}</Text>
        </View>
      </View>
    );
  };

  // Render a tactical board row
  const renderBoardRow = (
    row: GwentRow,
    side: 'player' | 'opponent',
    rowLabel: string,
    icon: string
  ) => {
    const actor = side === 'player' ? gameState.player : gameState.opponent;
    const boardRow = actor.rows[row];
    const isTargetableForHorn =
      hornPromptCard && side === 'player' && !boardRow.hasHorn;

    return (
      <TouchableOpacity
        activeOpacity={isTargetableForHorn ? 0.7 : 1}
        disabled={!isTargetableForHorn}
        onPress={() => {
          if (isTargetableForHorn && hornPromptCard) {
            executePlayCard(hornPromptCard.id, row);
          }
        }}
        style={[
          styles.tacticalRow,
          side === 'player' ? styles.playerRowBg : styles.opponentRowBg,
          isTargetableForHorn && styles.rowTargetableHorn,
        ]}
      >
        {/* Row Label & Score Badge */}
        <View style={styles.rowLeadSlot}>
          <Text style={styles.rowIconSymbol}>{icon}</Text>
          <View style={styles.rowScorePill}>
            <Text style={styles.rowScoreText}>{boardRow.rowScore}</Text>
          </View>
          {boardRow.hasHorn && (
            <View style={styles.rowHornBadge}>
              <Text style={{ fontSize: 10 }}>📯</Text>
            </View>
          )}
        </View>

        {/* Cards stationed on this row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowCardsContainer}
        >
          {boardRow.cards.length === 0 ? (
            <View style={styles.emptyRowPlaceholder}>
              <Text style={styles.emptyRowText}>
                {isTargetableForHorn ? 'TAP TO PLACE WAR HORN' : rowLabel}
              </Text>
            </View>
          ) : (
            boardRow.cards.map((card) => (
              <GwentCardView
                key={card.id}
                card={card}
                size="normal"
                onPress={() => setInspectedCard(card)}
              />
            ))
          )}
        </ScrollView>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Global Status & Navigation Bar */}
      <View style={styles.topMenuBar}>
        <TouchableOpacity
          style={styles.exitBtn}
          onPress={() => {
            GameStudioEngine.playSfx('button_click');
            onExit();
          }}
        >
          <Text style={styles.exitBtnText}>◂ TAVERN LOBBY</Text>
        </TouchableOpacity>

        <View style={styles.roundInfoBox}>
          <Text style={styles.roundInfoTag}>THE WITCHER • GWENT DUEL</Text>
          <Text style={styles.roundTitleText}>
            ROUND {gameState.round} OF 3
          </Text>
        </View>

        <View style={styles.topActionsCluster}>
          <TouchableOpacity
            style={styles.inspectDeckBtn}
            onPress={() => setShowPlayerGraveyard(true)}
          >
            <Text style={styles.inspectDeckBtnText}>
              ⚰️ CRYPT ({gameState.player.graveyard.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Tavern Board Layout */}
      <View style={styles.boardLayout}>
        {/* LEFT COLUMN: ACTIVE WEATHER, LORDS' METRICS, TURN INDICATOR & LOG */}
        <View style={styles.leftSidebarCol}>
          {/* OPPONENT PROFILE CARD */}
          <View
            style={[
              styles.lordCard,
              gameState.activeTurn === 'opponent' && styles.lordCardActive,
            ]}
          >
            <View style={styles.lordHeader}>
              <Text style={styles.lordFactionTag}>SHOGUNATE & YOKAI</Text>
              {renderLifeGems(gameState.opponent.lives)}
            </View>
            <Text numberOfLines={1} style={styles.lordName}>
              {gameState.opponent.name}
            </Text>
            <View style={styles.lordStatsRow}>
              <Text style={styles.lordScoreText}>{gameState.opponent.totalScore}</Text>
              <Text style={styles.lordCardsCount}>
                🃏 {gameState.opponent.hand.length} Hand • 📚 {gameState.opponent.deck.length}
              </Text>
            </View>
            {gameState.opponent.passed && (
              <View style={styles.passedBadge}>
                <Text style={styles.passedBadgeText}>PASSED ROUND</Text>
              </View>
            )}
          </View>

          {/* ACTIVE WEATHER BATTLEFIELD ZONE */}
          <View style={styles.weatherZoneCard}>
            <Text style={styles.weatherZoneHeader}>WEATHER FRONT</Text>
            <View style={styles.weatherPillsRow}>
              <View
                style={[
                  styles.weatherPill,
                  gameState.weather.frost && styles.weatherPillFrost,
                ]}
              >
                <Text style={styles.weatherPillText}>❄️ FROST</Text>
              </View>
              <View
                style={[
                  styles.weatherPill,
                  gameState.weather.fog && styles.weatherPillFog,
                ]}
              >
                <Text style={styles.weatherPillText}>🌫️ FOG</Text>
              </View>
              <View
                style={[
                  styles.weatherPill,
                  gameState.weather.rain && styles.weatherPillRain,
                ]}
              >
                <Text style={styles.weatherPillText}>🌧️ RAIN</Text>
              </View>
            </View>
          </View>

          {/* REAL-TIME COMBAT DISPATCH LOG */}
          <View style={styles.combatLogCard}>
            <Text style={styles.combatLogHeader}>CHRONICLE OF BATTLE</Text>
            <ScrollView style={styles.logScrollView} showsVerticalScrollIndicator={false}>
              {gameState.combatLog.slice(0, 8).map((log, idx) => (
                <Text key={idx} style={styles.logLine}>
                  • {log}
                </Text>
              ))}
            </ScrollView>
          </View>

          {/* PLAYER PROFILE CARD */}
          <View
            style={[
              styles.lordCard,
              gameState.activeTurn === 'player' && styles.lordCardActive,
            ]}
          >
            <View style={styles.lordHeader}>
              <Text style={[styles.lordFactionTag, { color: '#38BDF8' }]}>
                HAYABUSA CLAN
              </Text>
              {renderLifeGems(gameState.player.lives)}
            </View>
            <Text numberOfLines={1} style={styles.lordName}>
              {gameState.player.name}
            </Text>
            <View style={styles.lordStatsRow}>
              <Text style={[styles.lordScoreText, { color: '#38BDF8' }]}>
                {gameState.player.totalScore}
              </Text>
              <Text style={styles.lordCardsCount}>
                🃏 {gameState.player.hand.length} Hand • 📚 {gameState.player.deck.length}
              </Text>
            </View>
            {gameState.player.passed && (
              <View style={styles.passedBadge}>
                <Text style={styles.passedBadgeText}>PASSED ROUND</Text>
              </View>
            )}
          </View>
        </View>

        {/* RIGHT COLUMN: 6 TACTICAL COMBAT ROWS & PLAYER HAND */}
        <View style={styles.boardMainArea}>
          {/* OPPONENT ROWS (Siege, Ranged, Melee) */}
          <View style={styles.sideRowsBlock}>
            {renderBoardRow('siege', 'opponent', 'OPPONENT SIEGE ROW', '🎯')}
            {renderBoardRow('ranged', 'opponent', 'OPPONENT RANGED ROW', '🏹')}
            {renderBoardRow('melee', 'opponent', 'OPPONENT MELEE ROW', '⚔️')}
          </View>

          {/* CENTER BATTLEFIELD DIVIDER */}
          <View style={styles.battlefieldDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerBannerText}>
              {gameState.activeTurn === 'player'
                ? '⚡ RYU HAYABUSA PRIORITY'
                : '🛡️ OPPONENT CONTEMPLATING...'}
            </Text>
            <View style={styles.dividerLine} />
          </View>

          {/* PLAYER ROWS (Melee, Ranged, Siege) */}
          <View style={styles.sideRowsBlock}>
            {renderBoardRow('melee', 'player', 'PLAYER CLOSE COMBAT ROW', '⚔️')}
            {renderBoardRow('ranged', 'player', 'PLAYER RANGED ARTILLERY ROW', '🏹')}
            {renderBoardRow('siege', 'player', 'PLAYER SIEGE BATTERY ROW', '🎯')}
          </View>

          {/* BOTTOM CONTROLS & PLAYER HAND CAROUSEL */}
          <View style={styles.playerHandBar}>
            {/* Left: Pass Round Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={gameState.player.passed || gameState.status !== 'playing'}
              style={[
                styles.passTurnBtn,
                gameState.player.passed && styles.passTurnBtnDisabled,
              ]}
              onPress={handlePassRound}
            >
              <Text style={styles.passTurnBtnTitle}>
                {gameState.player.passed ? 'PASSED' : 'PASS ROUND'}
              </Text>
              <Text style={styles.passTurnBtnSub}>
                {gameState.player.passed ? 'Awaiting Opponent' : 'Conserve Cards'}
              </Text>
            </TouchableOpacity>

            {/* Middle: Horizontal Hand of Cards */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.handScrollContainer}
            >
              {gameState.player.hand.length === 0 ? (
                <View style={styles.emptyHandContainer}>
                  <Text style={styles.emptyHandText}>Your hand is empty for this round.</Text>
                </View>
              ) : (
                gameState.player.hand.map((card) => (
                  <GwentCardView
                    key={card.id}
                    card={card}
                    size="normal"
                    selected={selectedCardId === card.id}
                    disabled={gameState.player.passed || gameState.activeTurn !== 'player'}
                    onPress={() => handleSelectHandCard(card)}
                    onLongPress={() => setInspectedCard(card)}
                  />
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </View>

      {/* MULLIGAN OVERLAY (Select up to 2 cards to redraw at start) */}
      {gameState.status === 'mulligan' && (
        <View style={styles.mulliganOverlay}>
          <View style={styles.mulliganCard}>
            <Text style={styles.mulliganTag}>WAR ROOM TACTICAL DRAFT</Text>
            <Text style={styles.mulliganTitle}>MULLIGAN PHASE</Text>
            <Text style={styles.mulliganDesc}>
              Tap up to {gameState.mulligansRemaining} card(s) to reshuffle them into your deck
              and draw fresh tactical options:
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mulliganCardList}
            >
              {gameState.player.hand.map((card) => (
                <View key={card.id} style={{ marginHorizontal: 6, alignItems: 'center' }}>
                  <GwentCardView
                    card={card}
                    size="normal"
                    onPress={() => handleMulliganRedraw(card.id)}
                  />
                  {gameState.mulligansRemaining > 0 && (
                    <TouchableOpacity
                      style={styles.redrawPill}
                      onPress={() => handleMulliganRedraw(card.id)}
                    >
                      <Text style={styles.redrawPillText}>REDRAW</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.mulliganLockBtn}
              onPress={handleFinishMulligan}
            >
              <Text style={styles.mulliganLockBtnText}>LOCK IN HAND & BEGIN DUEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ROUND END MODAL (Best 2-of-3 status) */}
      {gameState.status === 'round_end' && (
        <View style={styles.modalOverlay}>
          <View style={styles.roundEndCard}>
            <Text style={styles.roundEndTag}>ROUND {gameState.round} FINISHED</Text>
            <Text style={styles.roundEndScoreText}>
              {gameState.player.name}: {gameState.player.totalScore} vs{' '}
              {gameState.opponent.totalScore} :{gameState.opponent.name}
            </Text>

            <View style={styles.roundGemsStatusRow}>
              <View style={styles.roundGemCol}>
                <Text style={styles.roundLordName}>{gameState.player.name}</Text>
                {renderLifeGems(gameState.player.lives)}
              </View>
              <Text style={styles.roundVsText}>VS</Text>
              <View style={styles.roundGemCol}>
                <Text style={styles.roundLordName}>{gameState.opponent.name}</Text>
                {renderLifeGems(gameState.opponent.lives)}
              </View>
            </View>

            <TouchableOpacity style={styles.nextRoundBtn} onPress={handleNextRound}>
              <Text style={styles.nextRoundBtnText}>COMMENCE NEXT ROUND</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* GAME OVER MODAL */}
      {gameState.status === 'game_over' && (
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.gameOverCard,
              gameState.matchWinner === 'player'
                ? styles.gameOverVictory
                : styles.gameOverDefeat,
            ]}
          >
            <Text style={styles.gameOverTag}>
              {gameState.matchWinner === 'player' ? '👑 GWENT SUPREMACY' : '💀 VANQUISHED'}
            </Text>
            <Text style={styles.gameOverTitle}>
              {gameState.matchWinner === 'player'
                ? 'VICTORY IN THE TAVERN!'
                : 'DEFEAT IN THE TAVERN'}
            </Text>
            <Text style={styles.gameOverSub}>
              {gameState.matchWinner === 'player'
                ? `Ryu Hayabusa claimed 2 rounds! The Shogunate withdraws in defeat.`
                : `The Shogunate took 2 rounds. Your deck yields the tavern table.`}
            </Text>

            <View style={styles.gameOverRewardsBox}>
              <Text style={styles.gameOverRewardTitle}>TACTICAL SPOILS:</Text>
              <Text style={styles.gameOverRewardLine}>
                {gameState.matchWinner === 'player' ? '+45 MMR • 🪙 150 Gold • 💎 15 Gems' : '+5 MMR • 🪙 35 Gold'}
              </Text>
            </View>

            <View style={styles.gameOverBtnRow}>
              <TouchableOpacity
                style={styles.playAgainBtn}
                onPress={() => {
                  GameStudioEngine.playSfx('power_surge');
                  setGameState(GwentEngine.initMatch(playerName));
                  if (onMatchComplete) onMatchComplete(gameState.matchWinner === 'player');
                }}
              >
                <Text style={styles.playAgainBtnText}>PLAY AGAIN</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.lobbyReturnBtn}
                onPress={() => {
                  GameStudioEngine.playSfx('button_click');
                  onExit();
                }}
              >
                <Text style={styles.lobbyReturnBtnText}>RETURN TO LOBBY</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* AGILE ROW CHOICE DIALOG */}
      {agilePromptCard && (
        <View style={styles.modalOverlay}>
          <View style={styles.promptDialogCard}>
            <Text style={styles.promptTag}>AGILE UNIT DEPLOYMENT</Text>
            <Text style={styles.promptTitle}>{agilePromptCard.name}</Text>
            <Text style={styles.promptDesc}>
              This versatile warrior can engage in Close Combat or fire from Ranged distance.
              Select tactical row:
            </Text>
            <View style={styles.promptBtnRow}>
              <TouchableOpacity
                style={styles.promptActionBtn}
                onPress={() => executePlayCard(agilePromptCard.id, 'melee')}
              >
                <Text style={styles.promptActionBtnText}>⚔️ CLOSE COMBAT (MELEE)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.promptActionBtn, { borderColor: '#10B981' }]}
                onPress={() => executePlayCard(agilePromptCard.id, 'ranged')}
              >
                <Text style={[styles.promptActionBtnText, { color: '#10B981' }]}>
                  🏹 RANGED DISTANCE
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* CARD INSPECT MODAL */}
      <GwentCardInspectModal
        card={inspectedCard}
        visible={!!inspectedCard}
        onClose={() => setInspectedCard(null)}
      />

      {/* GRAVEYARD / MEDIC REVIVAL MODAL */}
      <GwentGraveyardModal
        visible={showPlayerGraveyard || gameState.medicPending}
        cards={gameState.player.graveyard}
        title="Ryu Hayabusa's Crypt"
        isMedicSelection={gameState.medicPending}
        onSelectCard={(cardId, chosenRow) => {
          setGameState((prev) => GwentEngine.reviveCardFromGraveyard(prev, cardId, 'player', chosenRow));
        }}
        onClose={() => {
          setShowPlayerGraveyard(false);
          if (gameState.medicPending) {
            setGameState((prev) => ({ ...prev, medicPending: false }));
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#120F0D',
  },
  topMenuBar: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#1F1915',
    borderBottomWidth: 1.5,
    borderBottomColor: '#3D2F24',
  },
  exitBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#2E241E',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#4A3B30',
  },
  exitBtnText: {
    color: '#D4C8B8',
    fontSize: 11,
    fontWeight: '800',
  },
  roundInfoBox: {
    alignItems: 'center',
  },
  roundInfoTag: {
    fontSize: 8,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 1,
  },
  roundTitleText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#F5E6D3',
  },
  topActionsCluster: {
    flexDirection: 'row',
  },
  inspectDeckBtn: {
    backgroundColor: '#2E241E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#544133',
  },
  inspectDeckBtnText: {
    color: '#D4C8B8',
    fontSize: 11,
    fontWeight: '800',
  },
  boardLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  leftSidebarCol: {
    width: 170,
    backgroundColor: '#181411',
    borderRightWidth: 1.5,
    borderRightColor: '#3D2F24',
    padding: 8,
    justifyContent: 'space-between',
  },
  lordCard: {
    backgroundColor: '#241D17',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#453528',
  },
  lordCardActive: {
    borderColor: '#F59E0B',
    backgroundColor: '#2C2219',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  lordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lordFactionTag: {
    fontSize: 8,
    fontWeight: '800',
    color: '#EF4444',
  },
  lordName: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F5E6D3',
    marginBottom: 4,
  },
  lordStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  lordScoreText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F59E0B',
  },
  lordCardsCount: {
    fontSize: 9,
    color: '#A89F91',
  },
  passedBadge: {
    marginTop: 4,
    backgroundColor: '#451A03',
    paddingVertical: 2,
    borderRadius: 3,
    alignItems: 'center',
  },
  passedBadgeText: {
    color: '#FDE68A',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  gemRow: {
    flexDirection: 'row',
  },
  gemCircle: {
    marginLeft: 3,
  },
  gemActive: {
    opacity: 1,
  },
  gemShattered: {
    opacity: 0.25,
  },
  gemIcon: {
    fontSize: 10,
  },
  weatherZoneCard: {
    backgroundColor: '#1E1813',
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#382D23',
    marginVertical: 4,
  },
  weatherZoneHeader: {
    fontSize: 8,
    fontWeight: '800',
    color: '#8A7A6B',
    marginBottom: 4,
  },
  weatherPillsRow: {
    flexDirection: 'column',
    gap: 3,
  },
  weatherPill: {
    backgroundColor: '#27201A',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignItems: 'center',
    opacity: 0.35,
  },
  weatherPillFrost: {
    backgroundColor: '#0369A1',
    opacity: 1,
  },
  weatherPillFog: {
    backgroundColor: '#475569',
    opacity: 1,
  },
  weatherPillRain: {
    backgroundColor: '#1E3A8A',
    opacity: 1,
  },
  weatherPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFF',
  },
  combatLogCard: {
    flex: 1,
    backgroundColor: '#181310',
    borderRadius: 6,
    padding: 6,
    borderWidth: 1,
    borderColor: '#33271D',
    marginVertical: 4,
  },
  combatLogHeader: {
    fontSize: 8,
    fontWeight: '800',
    color: '#716556',
    marginBottom: 4,
  },
  logScrollView: {
    flex: 1,
  },
  logLine: {
    fontSize: 9,
    color: '#C7B9A7',
    marginBottom: 3,
    lineHeight: 12,
  },
  boardMainArea: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
  },
  sideRowsBlock: {
    flex: 1,
    justifyContent: 'space-around',
  },
  tacticalRow: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3D2F24',
    marginVertical: 2,
    paddingHorizontal: 6,
  },
  playerRowBg: {
    backgroundColor: '#1E1915',
  },
  opponentRowBg: {
    backgroundColor: '#1B1512',
  },
  rowTargetableHorn: {
    borderColor: '#F59E0B',
    borderWidth: 2,
    backgroundColor: '#352515',
  },
  rowLeadSlot: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#3D2F24',
    paddingRight: 6,
  },
  rowIconSymbol: {
    fontSize: 14,
  },
  rowScorePill: {
    backgroundColor: '#0F172ACC',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginTop: 2,
  },
  rowScoreText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  rowHornBadge: {
    position: 'absolute',
    top: -2,
    right: 2,
  },
  rowCardsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 6,
  },
  emptyRowPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyRowText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4B3B2E',
    letterSpacing: 1,
  },
  battlefieldDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#453528',
  },
  dividerBannerText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9E8D7B',
    marginHorizontal: 8,
    letterSpacing: 1,
  },
  playerHandBar: {
    height: 122,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181411',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#3D2F24',
    padding: 6,
  },
  passTurnBtn: {
    width: 78,
    height: '100%',
    backgroundColor: '#78350F',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    marginRight: 6,
  },
  passTurnBtnDisabled: {
    backgroundColor: '#27201A',
    borderColor: '#3D2F24',
  },
  passTurnBtnTitle: {
    color: '#FEF3C7',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  passTurnBtnSub: {
    color: '#FDE68A',
    fontSize: 7,
    marginTop: 2,
    textAlign: 'center',
  },
  handScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyHandContainer: {
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  emptyHandText: {
    color: '#71717A',
    fontSize: 12,
    fontStyle: 'italic',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000C8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 50,
  },
  mulliganOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000E6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 60,
  },
  mulliganCard: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: '#1C1612',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#785A3C',
    padding: 16,
    alignItems: 'center',
  },
  mulliganTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 1,
  },
  mulliganTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F5E6D3',
    marginVertical: 4,
  },
  mulliganDesc: {
    fontSize: 12,
    color: '#A89F91',
    textAlign: 'center',
    marginBottom: 14,
  },
  mulliganCardList: {
    paddingVertical: 10,
  },
  redrawPill: {
    marginTop: 6,
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
  },
  redrawPillText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
  },
  mulliganLockBtn: {
    marginTop: 16,
    backgroundColor: '#78350F',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  mulliganLockBtnText: {
    color: '#FEF3C7',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  roundEndCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#1F1813',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D97706',
    padding: 20,
    alignItems: 'center',
  },
  roundEndTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 1,
  },
  roundEndScoreText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F5E6D3',
    marginVertical: 10,
    textAlign: 'center',
  },
  roundGemsStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  roundGemCol: {
    alignItems: 'center',
  },
  roundLordName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A89F91',
    marginBottom: 4,
  },
  roundVsText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#785A3C',
    marginHorizontal: 16,
  },
  nextRoundBtn: {
    backgroundColor: '#78350F',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  nextRoundBtnText: {
    color: '#FEF3C7',
    fontSize: 12,
    fontWeight: '900',
  },
  gameOverCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#181411',
    borderRadius: 12,
    borderWidth: 2.5,
    padding: 20,
    alignItems: 'center',
  },
  gameOverVictory: {
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  gameOverDefeat: {
    borderColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  gameOverTag: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: 1,
  },
  gameOverTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F5E6D3',
    marginVertical: 6,
  },
  gameOverSub: {
    fontSize: 12,
    color: '#A89F91',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  gameOverRewardsBox: {
    width: '100%',
    backgroundColor: '#27201B',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#4A3B30',
    marginBottom: 16,
    alignItems: 'center',
  },
  gameOverRewardTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
    marginBottom: 2,
  },
  gameOverRewardLine: {
    fontSize: 13,
    fontWeight: '900',
    color: '#38BDF8',
  },
  gameOverBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  playAgainBtn: {
    backgroundColor: '#78350F',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  playAgainBtnText: {
    color: '#FEF3C7',
    fontSize: 12,
    fontWeight: '900',
  },
  lobbyReturnBtn: {
    backgroundColor: '#2E241E',
    borderWidth: 1,
    borderColor: '#4A3B30',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  lobbyReturnBtnText: {
    color: '#D4C8B8',
    fontSize: 12,
    fontWeight: '800',
  },
  promptDialogCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1E1813',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#785A3C',
    padding: 16,
    alignItems: 'center',
  },
  promptTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 1,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F5E6D3',
    marginVertical: 4,
  },
  promptDesc: {
    fontSize: 11,
    color: '#A89F91',
    textAlign: 'center',
    marginBottom: 14,
  },
  promptBtnRow: {
    width: '100%',
    gap: 8,
  },
  promptActionBtn: {
    backgroundColor: '#27201A',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  promptActionBtnText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '900',
  },
});
