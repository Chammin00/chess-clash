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
import { RewardedAdModal } from './src/components/RewardedAdModal';
import { BattlePassService } from './src/services/battlePassService';
import { BattlePassState } from './src/types/monetization';
import { MonetizationService } from './src/services/monetizationService';
import { PlayerProfile } from './src/types/mmr';
import { MatchResultData } from './src/types/game';
import { OpponentMatchCandidate } from './src/services/matchmakerService';
import { StorageService } from './src/services/storageService';
import { AdService } from './src/services/adService';
import { FactionId } from './src/types/card';
import { FACTION_CONFIGS } from './src/config/factions';
import { ChessHubScreen } from './src/chess/screens/ChessHubScreen';
import { ChessMatchmakingScreen } from './src/chess/screens/ChessMatchmakingScreen';
import { ChessPlayScreen } from './src/chess/screens/ChessPlayScreen';
import { ChessMMRService } from './src/chess/services/chessMMRService';
import { ChessBotProfile, GameThemeId, PlayerChessProfile } from './src/chess/types';

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
  | 'chess_play';

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [battlePassState, setBattlePassState] = useState<BattlePassState | null>(null);
  const [chessProfile, setChessProfile] = useState<PlayerChessProfile | null>(null);
  const [activeChessTheme, setActiveChessTheme] = useState<GameThemeId>('ninjas');
  const [activeChessBot, setActiveChessBot] = useState<ChessBotProfile | null>(null);
  const [isChessPassAndPlay, setIsChessPassAndPlay] = useState(false);
  const [screen, setScreen] = useState<CurrentScreen>('lobby');
  const [activeOpponent, setActiveOpponent] = useState<OpponentMatchCandidate | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResultData | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [rewardDoubled, setRewardDoubled] = useState(false);

  // Ad Modal State
  const [adModalVisible, setAdModalVisible] = useState(false);
  const [adRewardType, setAdRewardType] = useState('gold');
  const [adRewardAmount, setAdRewardAmount] = useState(100);
  const [isInterstitialAd, setIsInterstitialAd] = useState(false);
  const [pendingRewardAction, setPendingRewardAction] = useState<(() => void) | null>(null);

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

  // Rewarded Ad for 2x Gold
  const handleWatchAdForDoubleRewards = () => {
    if (!matchResult) return;
    setAdRewardType('gold');
    setAdRewardAmount(matchResult.goldEarned);
    setIsInterstitialAd(false);
    setPendingRewardAction(() => async () => {
      setRewardDoubled(true);
      const extraGold = matchResult.goldEarned;
      const updated = { ...profile, gold: profile.gold + extraGold };
      setProfile(updated);
      await StorageService.saveProfile(updated);
    });
    setAdModalVisible(true);
  };

  // Rewarded Ad in Shop for Daily Mystery Pack
  const handleWatchAdForShopPack = () => {
    setAdRewardType('gold & gems');
    setAdRewardAmount(150);
    setIsInterstitialAd(false);
    setPendingRewardAction(() => async () => {
      const updated = { ...profile, gold: profile.gold + 150, gems: profile.gems + 10 };
      setProfile(updated);
      await StorageService.saveProfile(updated);
    });
    setAdModalVisible(true);
  };

  // Dismiss Post-Match Modal & check for Interstitial Ad
  const handleCloseResultModal = () => {
    setShowResultModal(false);
    setScreen('lobby');
    setActiveOpponent(null);

    // Evaluate AdMob interstitial frequency policy
    if (AdService.shouldShowInterstitial(profile)) {
      AdService.markInterstitialShown();
      setTimeout(() => {
        setIsInterstitialAd(true);
        setPendingRewardAction(null);
        setAdModalVisible(true);
      }, 500);
    }
  };

  const handleClaimAdReward = () => {
    if (pendingRewardAction) {
      pendingRewardAction();
      setPendingRewardAction(null);
    }
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
            if (profile.isVip || profile.hasNoAds) {
              const updated = { ...profile, gold: profile.gold + 150, gems: profile.gems + 15 };
              setProfile(updated);
              StorageService.saveProfile(updated);
              return;
            }
            handleWatchAdForShopPack();
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
          onBackToMainMenu={() => setScreen('lobby')}
        />
      )}

      {screen === 'chess_matchmaking' && chessProfile && (
        <ChessMatchmakingScreen
          themeId={activeChessTheme}
          profile={chessProfile}
          onOpponentFound={(opp) => {
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
          onGameEnd={async () => {
            await handleRefreshChessProfile();
            setScreen('chess_hub');
            setActiveChessBot(null);
          }}
          onExit={async () => {
            await handleRefreshChessProfile();
            setScreen('chess_hub');
            setActiveChessBot(null);
          }}
        />
      )}

      {/* Post Match Elo & Rewards Modal */}
      <MatchResultModal
        visible={showResultModal}
        result={matchResult}
        rewardDoubled={rewardDoubled}
        onWatchAdForDoubleRewards={handleWatchAdForDoubleRewards}
        onContinue={handleCloseResultModal}
      />

      {/* Rewarded / Interstitial Ad Simulation Modal */}
      <RewardedAdModal
        visible={adModalVisible}
        rewardType={adRewardType}
        rewardAmount={adRewardAmount}
        isInterstitial={isInterstitialAd}
        onRewardClaimed={handleClaimAdReward}
        onClose={() => setAdModalVisible(false)}
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
