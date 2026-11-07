import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LobbyScreen } from './src/screens/LobbyScreen';
import { MatchmakingScreen } from './src/screens/MatchmakingScreen';
import { BattleScreen } from './src/screens/BattleScreen';
import { MatchResultModal } from './src/screens/MatchResultModal';
import { DeckBuilderScreen } from './src/screens/DeckBuilderScreen';
import { LeaderboardScreen } from './src/screens/LeaderboardScreen';
import { ShopScreen } from './src/screens/ShopScreen';
import { BattlePassScreen } from './src/screens/BattlePassScreen';
import { BattlePassService } from './src/services/battlePassService';
import { BattlePassState } from './src/types/monetization';
import { MonetizationService } from './src/services/monetizationService';
import { PlayerProfile } from './src/types/mmr';
import { MatchResultData } from './src/types/game';
import { OpponentMatchCandidate } from './src/services/matchmakerService';
import { StorageService } from './src/services/storageService';
import { FactionId } from './src/types/card';
import { FACTION_CONFIGS } from './src/config/factions';
import { ChessHubScreen } from './src/chess/screens/ChessHubScreen';
import { ChessMatchmakingScreen } from './src/chess/screens/ChessMatchmakingScreen';
import { ChessPlayScreen } from './src/chess/screens/ChessPlayScreen';
import { ChessMMRService } from './src/chess/services/chessMMRService';
import { ChessBotProfile, GameThemeId, PlayerChessProfile } from './src/chess/types';
import { CampaignWorldMapScreen } from './src/chess/screens/CampaignWorldMapScreen';
import { CampaignStage } from './src/chess/campaign/types';

type CurrentScreen =
  | 'lobby'
  | 'matchmaking'
  | 'battle'
  | 'deck'
  | 'leaderboard'
  | 'shop'
  | 'battlepass'
  | 'chess_hub'
  | 'chess_matchmaking'
  | 'chess_play'
  | 'campaign_map';

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [battlePassState, setBattlePassState] = useState<BattlePassState | null>(null);
  const [chessProfile, setChessProfile] = useState<PlayerChessProfile | null>(null);
  const [activeChessTheme, setActiveChessTheme] = useState<GameThemeId>('ninjas');
  const [activeChessBot, setActiveChessBot] = useState<ChessBotProfile | null>(null);
  const [activeCampaignStage, setActiveCampaignStage] = useState<CampaignStage | null>(null);
  const [isChessPassAndPlay, setIsChessPassAndPlay] = useState(false);
  const [screen, setScreen] = useState<CurrentScreen>('chess_hub');
  const [activeOpponent, setActiveOpponent] = useState<OpponentMatchCandidate | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResultData | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [rewardDoubled, setRewardDoubled] = useState(false);

  useEffect(() => {
    async function loadData() {
      const p = await StorageService.getProfile();
      setProfile(p);
      const bp = await BattlePassService.getBattlePassState();
      setBattlePassState(bp);
      const cp = await ChessMMRService.loadProfile();
      setChessProfile(cp);
    }
    loadData();
  }, []);

  if (!profile || !battlePassState || !chessProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
      </View>
    );
  }

  // Faction Selection Handler
  const handleSelectFaction = async (newFaction: FactionId) => {
    const factionConfig = FACTION_CONFIGS[newFaction as Exclude<FactionId, 'neutral'>];
    const updated: PlayerProfile = {
      ...profile,
      selectedFaction: newFaction,
      deckCardIds: [...factionConfig.starterDeckIds],
    };
    setProfile(updated);
    await StorageService.saveProfile(updated);
  };

  // Matchmaking Handlers
  const handleFindMatch = () => {
    setScreen('matchmaking');
  };

  const handleMatchFound = (opponent: OpponentMatchCandidate) => {
    setActiveOpponent(opponent);
    setScreen('battle');
  };

  // Match End Handlers
  const handleMatchComplete = async (result: MatchResultData) => {
    setMatchResult(result);
    setRewardDoubled(false);

    // Update Profile
    const isWin = result.winner === 'player';
    const goldEarned = profile.isVip ? Math.round(result.goldEarned * 1.25) : result.goldEarned;

    let updatedProfile: PlayerProfile = {
      ...profile,
      mmr: result.newMmr,
      peakMmr: Math.max(profile.peakMmr, result.newMmr),
      wins: isWin ? profile.wins + 1 : profile.wins,
      losses: !isWin ? profile.losses + 1 : profile.losses,
      winStreak: isWin ? profile.winStreak + 1 : 0,
      gold: profile.gold + goldEarned,
    };

    // Add Battle Pass XP
    const bpRes = await BattlePassService.addXp(isWin ? 120 : 50);
    setBattlePassState(bpRes.state);

    // Add Gems to Piggy Bank
    updatedProfile = await MonetizationService.addPiggyBankGems(updatedProfile, 15);

    setProfile(updatedProfile);
    await StorageService.saveProfile(updatedProfile);

    // Record History
    await StorageService.recordMatch({
      id: Math.random().toString(),
      timestamp: Date.now(),
      opponentName: activeOpponent ? activeOpponent.name : 'Unknown',
      opponentMmr: activeOpponent ? activeOpponent.mmr : 1000,
      result: isWin ? 'win' : (result.winner === 'tie' ? 'draw' : 'loss'),
      mmrChange: result.mmrDelta,
      oldMmr: result.oldMmr,
      newMmr: result.newMmr,
    });

    setShowResultModal(true);
  };

  // Daily Free Supply Ration (Zero Ads)
  const handleClaimDailySupply = async () => {
    const updated = { ...profile, gold: profile.gold + 150, gems: profile.gems + 10 };
    setProfile(updated);
    await StorageService.saveProfile(updated);
  };

  // Dismiss Post-Match Modal (Zero Interstitials)
  const handleCloseResultModal = () => {
    setShowResultModal(false);
    setScreen('lobby');
    setActiveOpponent(null);
  };

  const handleSaveDeck = async (newDeckIds: string[]) => {
    const updated = { ...profile, deckCardIds: newDeckIds };
    setProfile(updated);
    await StorageService.saveProfile(updated);
  };

  // Chess Handlers
  const handleStartChessRanked = (themeId: GameThemeId) => {
    setActiveChessTheme(themeId);
    setScreen('chess_matchmaking');
  };

  const handleStartChessPractice = (
    themeId: GameThemeId,
    engine: 'stockfish' | 'maia' | 'alphazero',
    botMmr: number
  ) => {
    setActiveChessTheme(themeId);
    setActiveChessBot({
      id: `practice_${engine}_${botMmr}`,
      name: `${engine.toUpperCase()} Bot`,
      avatar: engine === 'maia' ? '🧠' : engine === 'alphazero' ? '🤖' : '⚡',
      country: '🌐 AI Grid',
      mmr: botMmr,
      engine,
      targetDepth: engine === 'stockfish' ? (botMmr > 2000 ? 4 : botMmr > 1400 ? 3 : 2) : 3,
      blunderRate: engine === 'maia' ? Math.max(0, 0.35 - (botMmr / 2600) * 0.35) : 0,
      playstyle: 'Adaptive',
      quote: `Trained to replicate ${engine.toUpperCase()} architecture.`,
    });
    setIsChessPassAndPlay(false);
    setScreen('chess_play');
  };

  const handleStartChessPassAndPlay = (themeId: GameThemeId) => {
    setActiveChessTheme(themeId);
    setActiveChessBot({
      id: 'local_player_2',
      name: 'Player 2',
      avatar: '⚔️',
      country: '🎮 Local',
      mmr: 1000,
      engine: 'stockfish',
      targetDepth: 1,
      blunderRate: 0,
      playstyle: 'Tactical',
      quote: 'Pass & play opponent',
    });
    setIsChessPassAndPlay(true);
    setScreen('chess_play');
  };

  const handleRefreshChessProfile = async () => {
    const cp = await ChessMMRService.loadProfile();
    setChessProfile(cp);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {screen === 'lobby' && (
        <LobbyScreen
          profile={profile}
          onFindMatch={handleFindMatch}
          onOpenDeck={() => setScreen('deck')}
          onOpenLeaderboard={() => setScreen('leaderboard')}
          onOpenShop={() => setScreen('shop')}
          onOpenBattlePass={() => setScreen('battlepass')}
          onSelectFaction={handleSelectFaction}
          onOpenChess={() => setScreen('chess_hub')}
        />
      )}

      {screen === 'matchmaking' && (
        <MatchmakingScreen
          playerProfile={profile}
          onMatchFound={handleMatchFound}
          onCancel={() => setScreen('lobby')}
        />
      )}

      {screen === 'battle' && activeOpponent && (
        <BattleScreen
          playerProfile={profile}
          opponent={activeOpponent}
          onMatchComplete={handleMatchComplete}
          onSurrender={() => {
            setScreen('lobby');
            setActiveOpponent(null);
          }}
        />
      )}

      {screen === 'deck' && (
        <DeckBuilderScreen
          currentFaction={profile.selectedFaction || 'shinobi'}
          currentDeckIds={profile.deckCardIds}
          onSaveDeck={handleSaveDeck}
          onBack={() => setScreen('lobby')}
        />
      )}

      {screen === 'leaderboard' && (
        <LeaderboardScreen
          playerProfile={profile}
          onBack={() => setScreen('lobby')}
        />
      )}

      {screen === 'shop' && (
        <ShopScreen
          profile={profile}
          onWatchAdForPack={() => {
            const updated = { ...profile, gold: profile.gold + 150, gems: profile.gems + 15 };
            setProfile(updated);
            StorageService.saveProfile(updated);
          }}
          onProfileUpdate={(updated) => setProfile(updated)}
          onOpenBattlePass={() => setScreen('battlepass')}
          onBack={() => setScreen('lobby')}
        />
      )}

      {screen === 'battlepass' && battlePassState && (
        <BattlePassScreen
          profile={profile}
          battlePassState={battlePassState}
          onProfileUpdate={(updated) => setProfile(updated)}
          onPassStateUpdate={(updated) => setBattlePassState(updated)}
          onBack={() => setScreen('lobby')}
        />
      )}

      {/* 10 Kingdoms Chess Screen Renders */}
      {screen === 'chess_hub' && chessProfile && (
        <ChessHubScreen
          profile={chessProfile}
          selectedThemeId={activeChessTheme}
          onSelectTheme={(t) => setActiveChessTheme(t)}
          onStartRankedMatch={handleStartChessRanked}
          onStartPracticeMatch={handleStartChessPractice}
          onStartPassAndPlay={handleStartChessPassAndPlay}
          onOpenCampaign={() => setScreen('campaign_map')}
          onBackToMainMenu={() => setScreen('lobby')}
        />
      )}

      {screen === 'campaign_map' && (
        <CampaignWorldMapScreen
          onStartStageBattle={(stage, worldId) => {
            setActiveCampaignStage(stage);
            setActiveChessTheme(worldId);
            setActiveChessBot(stage.opponent);
            setIsChessPassAndPlay(false);
            setScreen('chess_play');
          }}
          onBack={() => setScreen('chess_hub')}
        />
      )}

      {screen === 'chess_matchmaking' && chessProfile && (
        <ChessMatchmakingScreen
          themeId={activeChessTheme}
          profile={chessProfile}
          onOpponentFound={(opp) => {
            setActiveCampaignStage(null);
            setActiveChessBot(opp);
            setIsChessPassAndPlay(false);
            setScreen('chess_play');
          }}
          onCancel={() => setScreen('chess_hub')}
        />
      )}

      {screen === 'chess_play' && activeChessBot && (
        <ChessPlayScreen
          themeId={activeChessTheme}
          opponent={activeChessBot}
          isPassAndPlay={isChessPassAndPlay}
          campaignStage={activeCampaignStage || undefined}
          onGameEnd={async () => {
            await handleRefreshChessProfile();
            if (activeCampaignStage) {
              setScreen('campaign_map');
              setActiveCampaignStage(null);
            } else {
              setScreen('chess_hub');
            }
            setActiveChessBot(null);
          }}
          onExit={async () => {
            await handleRefreshChessProfile();
            if (activeCampaignStage) {
              setScreen('campaign_map');
              setActiveCampaignStage(null);
            } else {
              setScreen('chess_hub');
            }
            setActiveChessBot(null);
          }}
        />
      )}

      {/* Post Match Elo & Rewards Modal */}
      <MatchResultModal
        visible={showResultModal}
        result={matchResult}
        rewardDoubled={rewardDoubled}
        onWatchAdForDoubleRewards={() => {}}
        onContinue={handleCloseResultModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0A09',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0C0A09',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
