import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Screen Imports
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
import { GameStudioEngine } from './src/services/gameStudioEngine';

// Spire Roguelike Screens & Components
import { SpireMapScreen } from './src/screens/SpireMapScreen';
import { SpireCombatScreen } from './src/screens/SpireCombatScreen';
import { SpireRewardScreen } from './src/screens/SpireRewardScreen';
import { SpireRestScreen } from './src/screens/SpireRestScreen';
import { SpireShopScreen } from './src/screens/SpireShopScreen';
import { SpireEventScreen } from './src/screens/SpireEventScreen';
import { SpireRunOverModal } from './src/screens/SpireRunOverModal';
import { SpireDeckViewModal } from './src/components/SpireDeckViewModal';
import { GwentScreen } from './src/screens/GwentScreen';

// Types & Services
import { PlayerProfile } from './src/types/mmr';
import { MatchResultData } from './src/types/game';
import {
  SpireHero,
  SpireEnemy,
  SpireRunState,
  MapNode,
  SpireCard,
  SpireRelic,
  SpirePotion,
} from './src/types/spire';
import { STARTER_DECK, getRandomCardReward, upgradeCard } from './src/data/spireCards';
import { getMonsterForNode } from './src/data/spireEnemies';
import { STARTER_RELIC, ALL_SPIRE_POTIONS, getRandomRelic, getRandomPotion } from './src/data/spireRelics';
import {
  AFRO_ASIAN_WARRIORS,
  WarriorProfile,
  generateRandomWarriorName,
} from './src/data/afroAsianWarriors';
import { getRandomEvent, SpireEvent, SpireEventOption } from './src/data/spireEvents';
import { SpireMapGenerator } from './src/services/spireMapGenerator';
import { OpponentMatchCandidate } from './src/services/matchmakerService';
import { StorageService } from './src/services/storageService';
import { MmrEngine } from './src/services/mmrEngine';

type CurrentScreen =
  | 'lobby'
  | 'matchmaking'
  | 'battle'
  | 'deck'
  | 'leaderboard'
  | 'shop'
  | 'battlepass'
  | 'spire_map'
  | 'spire_combat'
  | 'spire_reward'
  | 'spire_rest'
  | 'spire_shop'
  | 'spire_event'
  | 'gwent';

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [battlePassState, setBattlePassState] = useState<BattlePassState | null>(null);
  const [screen, setScreen] = useState<CurrentScreen>('lobby');

  // Selected Afro-Asian Warrior & Random Name Generator State
  const [selectedWarrior, setSelectedWarrior] = useState<WarriorProfile>(AFRO_ASIAN_WARRIORS[0]);
  const [customWarriorName, setCustomWarriorName] = useState<string>(AFRO_ASIAN_WARRIORS[0].name);

  // Ranked Duel Arena state
  const [activeOpponent, setActiveOpponent] = useState<OpponentMatchCandidate | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResultData | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [rewardDoubled, setRewardDoubled] = useState(false);

  // Slay the Spire Roguelike State
  const [spireRun, setSpireRun] = useState<SpireRunState | null>(null);
  const [activeSpireEnemy, setActiveSpireEnemy] = useState<SpireEnemy | null>(null);
  const [activeSpireEvent, setActiveSpireEvent] = useState<SpireEvent | null>(null);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [showRunOverModal, setShowRunOverModal] = useState(false);
  const [runOverMmrDelta, setRunOverMmrDelta] = useState(0);
  const [runOverOldMmr, setRunOverOldMmr] = useState(1500);
  const [runOverNewMmr, setRunOverNewMmr] = useState(1500);

  // Reward Screen State
  const [pendingReward, setPendingReward] = useState<{
    gold: number;
    cards: SpireCard[];
    relic?: SpireRelic;
    potion?: SpirePotion;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      const p = await StorageService.getProfile();
      setProfile(p);
      const bp = await BattlePassService.getBattlePassState();
      setBattlePassState(bp);
    }
    loadData();
  }, []);

  if (!profile || !battlePassState) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  // ==========================================
  // SPIRE ROGUELIKE HANDLERS
  // ==========================================
  const handleStartSpireRun = () => {
    const actMap = SpireMapGenerator.generateActMap();

    const starterHero: SpireHero = {
      name: customWarriorName || selectedWarrior.name,
      className: selectedWarrior.title,
      hp: selectedWarrior.hp,
      maxHp: selectedWarrior.maxHp,
      energy: selectedWarrior.energy,
      maxEnergy: selectedWarrior.energy,
      block: 0,
      gold: 99,
      deck: [...STARTER_DECK],
      drawPile: [],
      hand: [],
      discardPile: [],
      exhaustPile: [],
      statuses: [],
      relics: [{ ...selectedWarrior.starterRelic }],
      potions: [ALL_SPIRE_POTIONS[0], null, null],
    };

    const newRun: SpireRunState = {
      act: 1,
      actName: 'Sector Alpha',
      floor: 1,
      seed: Math.floor(Math.random() * 1000000),
      map: actMap,
      currentNodeId: null,
      hero: starterHero,
      isOver: false,
      victory: false,
      score: 0,
      monstersDefeated: 0,
      elitesDefeated: 0,
      bossesDefeated: 0,
    };

    setSpireRun(newRun);
    setScreen('spire_map');
  };

  const handleSelectMapNode = (node: MapNode) => {
    if (!spireRun) return;

    // Update map node state
    const updatedMap = spireRun.map.map(floorRow =>
      floorRow.map(n => ({
        ...n,
        current: n.id === node.id,
        visited: n.visited || n.id === node.id,
        accessible: false, // will re-unlock next floor after resolving node
      }))
    );

    const updatedRun: SpireRunState = {
      ...spireRun,
      floor: node.floor,
      currentNodeId: node.id,
      map: updatedMap,
    };
    setSpireRun(updatedRun);

    // Route to node encounter type
    if (node.type === 'monster' || node.type === 'elite' || node.type === 'boss') {
      const enemy = getMonsterForNode(node.type, node.floor);
      setActiveSpireEnemy(enemy);
      setScreen('spire_combat');
    } else if (node.type === 'rest') {
      setScreen('spire_rest');
    } else if (node.type === 'shop') {
      setScreen('spire_shop');
    } else if (node.type === 'event') {
      setActiveSpireEvent(getRandomEvent());
      setScreen('spire_event');
    }
  };

  // Helper to unlock next accessible nodes on the map
  const advanceMapToNextFloor = (currentRun: SpireRunState): SpireRunState => {
    const currentNode = currentRun.map.flat().find(n => n.id === currentRun.currentNodeId);
    if (!currentNode) return currentRun;

    const nextFloor = currentRun.floor + 1;
    const nextAccessibleIds = currentNode.nextIds;

    const updatedMap = currentRun.map.map(floorRow =>
      floorRow.map(n => {
        if (n.floor === nextFloor && nextAccessibleIds.includes(n.id)) {
          return { ...n, accessible: true };
        }
        return n;
      })
    );

    return {
      ...currentRun,
      map: updatedMap,
    };
  };

  // Combat Victory
  const handleSpireCombatVictory = async (updatedHero: SpireHero, enemy: SpireEnemy) => {
    if (!spireRun) return;

    // Trigger Nano-Suture Core (Meat on the Bone: heal 12 if HP <= 50%)
    const hasNanoSuture = updatedHero.relics.some(r => r.id === 'nano_suture');
    if (hasNanoSuture && updatedHero.hp <= updatedHero.maxHp / 2) {
      updatedHero.hp = Math.min(updatedHero.maxHp, updatedHero.hp + 12);
    }

    // Trigger Phoenix Battery relic (+6 Vitality on victory)
    const hasPhoenixBattery = updatedHero.relics.some(r => r.id === 'phoenix_battery' || r.id === 'burning_blood');
    if (hasPhoenixBattery) {
      updatedHero.hp = Math.min(updatedHero.maxHp, updatedHero.hp + 6);
    }

    const isBoss = enemy.name.includes('Boss') || enemy.title.includes('Boss');
    const isElite = enemy.name.includes('Elite') || enemy.title.includes('Elite');

    const updatedRun: SpireRunState = {
      ...spireRun,
      hero: updatedHero,
      monstersDefeated: isBoss || isElite ? spireRun.monstersDefeated : spireRun.monstersDefeated + 1,
      elitesDefeated: isElite ? spireRun.elitesDefeated + 1 : spireRun.elitesDefeated,
      bossesDefeated: isBoss ? spireRun.bossesDefeated + 1 : spireRun.bossesDefeated,
    };

    if (isBoss) {
      // VICTORY! Slain the Act 1 Boss!
      updatedRun.victory = true;
      updatedRun.isOver = true;
      setSpireRun(updatedRun);

      // MMR Award (+300 Spire Conqueror Bonus!)
      const oldMmr = profile.mmr;
      const mmrCalc = MmrEngine.calculateMmrChange(oldMmr, 2200, true, profile.wins + 1, profile.winStreak + 1, false);
      const newMmr = mmrCalc.newMmr;
      const mmrDelta = mmrCalc.change;

      setRunOverOldMmr(oldMmr);
      setRunOverNewMmr(newMmr);
      setRunOverMmrDelta(mmrDelta);

      const updatedProfile: PlayerProfile = {
        ...profile,
        mmr: newMmr,
        peakMmr: Math.max(profile.peakMmr, newMmr),
        wins: profile.wins + 1,
        winStreak: profile.winStreak + 1,
        gold: profile.gold + 150,
      };
      setProfile(updatedProfile);
      await StorageService.saveProfile(updatedProfile);

      // Award Boss Battle Pass XP & Vault Gems
      const bpRes = await BattlePassService.addXp(300);
      setBattlePassState(bpRes.state);
      const withGems = await MonetizationService.addPiggyBankGems(updatedProfile, 50);
      setProfile(withGems);

      setShowRunOverModal(true);
      return;
    }

    // Award Encounter Battle Pass XP & Vault Gems
    const xpToAdd = isElite ? 100 : 40;
    const bpRes = await BattlePassService.addXp(xpToAdd);
    setBattlePassState(bpRes.state);
    const withGems = await MonetizationService.addPiggyBankGems(profile, isElite ? 25 : 10);
    setProfile(withGems);

    // Normal or Elite Victory Rewards
    const rawGold = isElite ? Math.floor(Math.random() * 20) + 35 : Math.floor(Math.random() * 12) + 14;
    const goldEarned = profile.isVip ? Math.round(rawGold * 1.25) : rawGold;
    const cardChoices = getRandomCardReward(3, isElite);
    const relicEarned = isElite ? getRandomRelic(updatedHero.relics.map(r => r.id)) : undefined;
    const potionEarned = Math.random() < 0.45 ? getRandomPotion() : undefined;

    setPendingReward({
      gold: goldEarned,
      cards: cardChoices,
      relic: relicEarned,
      potion: potionEarned,
    });

    setSpireRun(updatedRun);
    setScreen('spire_reward');
  };

  // Combat Defeat
  const handleSpireCombatDefeat = async (finalHero: SpireHero) => {
    if (!spireRun) return;

    const updatedRun: SpireRunState = {
      ...spireRun,
      hero: finalHero,
      isOver: true,
      victory: false,
    };
    setSpireRun(updatedRun);

    const oldMmr = profile.mmr;
    // Loss calculation: -400 differential with rust decay
    const mmrCalc = MmrEngine.calculateMmrChange(oldMmr, 2200, false, profile.wins + profile.losses + 1, 0, true, 50);
    const newMmr = mmrCalc.newMmr;
    const mmrDelta = mmrCalc.change;

    setRunOverOldMmr(oldMmr);
    setRunOverNewMmr(newMmr);
    setRunOverMmrDelta(mmrDelta);

    const updatedProfile: PlayerProfile = {
      ...profile,
      mmr: newMmr,
      losses: profile.losses + 1,
      winStreak: 0,
    };
    setProfile(updatedProfile);
    await StorageService.saveProfile(updatedProfile);

    setShowRunOverModal(true);
  };

  // Claim Rewards
  const handleClaimSpireRewards = (selectedCard?: SpireCard) => {
    if (!spireRun || !pendingReward) return;

    const hero = { ...spireRun.hero };
    hero.gold += pendingReward.gold;
    if (selectedCard) {
      hero.deck.push(selectedCard);
    }
    if (pendingReward.relic) {
      hero.relics.push(pendingReward.relic);
    }
    if (pendingReward.potion) {
      const emptySlot = hero.potions.findIndex(p => p === null);
      if (emptySlot !== -1) {
        hero.potions[emptySlot] = pendingReward.potion;
      }
    }

    let updatedRun: SpireRunState = { ...spireRun, hero };
    updatedRun = advanceMapToNextFloor(updatedRun);

    setSpireRun(updatedRun);
    setPendingReward(null);
    setScreen('spire_map');
  };

  // Rest Site Actions
  const handleRestChosen = (healAmount: number) => {
    if (!spireRun) return;
    const hero = { ...spireRun.hero };
    hero.hp = Math.min(hero.maxHp, hero.hp + healAmount);

    let updatedRun: SpireRunState = { ...spireRun, hero };
    updatedRun = advanceMapToNextFloor(updatedRun);

    setSpireRun(updatedRun);
    setScreen('spire_map');
  };

  const handleSmithChosen = (cardId: string) => {
    if (!spireRun) return;
    const hero = { ...spireRun.hero };
    hero.deck = hero.deck.map(c => (c.id === cardId ? upgradeCard(c) : c));

    let updatedRun: SpireRunState = { ...spireRun, hero };
    updatedRun = advanceMapToNextFloor(updatedRun);

    setSpireRun(updatedRun);
    setScreen('spire_map');
  };

  // Shop Actions
  const handleBuyCardInShop = (card: SpireCard, cost: number) => {
    if (!spireRun) return;
    const hero = { ...spireRun.hero };
    hero.gold -= cost;
    hero.deck.push(card);
    setSpireRun({ ...spireRun, hero });
  };

  const handleBuyRelicInShop = (relic: SpireRelic, cost: number) => {
    if (!spireRun) return;
    const hero = { ...spireRun.hero };
    hero.gold -= cost;
    hero.relics.push(relic);
    setSpireRun({ ...spireRun, hero });
  };

  const handleBuyPotionInShop = (potion: SpirePotion, cost: number) => {
    if (!spireRun) return;
    const hero = { ...spireRun.hero };
    hero.gold -= cost;
    const emptySlot = hero.potions.findIndex(p => p === null);
    if (emptySlot !== -1) hero.potions[emptySlot] = potion;
    setSpireRun({ ...spireRun, hero });
  };

  const handlePurgeCardInShop = (cardId: string, cost: number) => {
    if (!spireRun) return;
    const hero = { ...spireRun.hero };
    hero.gold -= cost;
    hero.deck = hero.deck.filter(c => c.id !== cardId);
    setSpireRun({ ...spireRun, hero });
  };

  const handleLeaveShop = () => {
    if (!spireRun) return;
    const updatedRun = advanceMapToNextFloor(spireRun);
    setSpireRun(updatedRun);
    setScreen('spire_map');
  };

  // Event Action
  const handleSelectEventOption = (option: SpireEventOption) => {
    if (!spireRun) return;
    const hero = { ...spireRun.hero };

    if (option.actionId === 'take_idol') {
      hero.gold += 120;
      hero.hp = Math.max(1, hero.hp - 10);
    } else if (option.actionId === 'cleric_heal') {
      hero.gold -= 35;
      hero.hp = Math.min(hero.maxHp, hero.hp + Math.round(hero.maxHp * 0.25));
    } else if (option.actionId === 'cleric_purge') {
      hero.gold -= 50;
      const idx = hero.deck.findIndex(c => c.id.startsWith('void_slash') || c.id.startsWith('strike'));
      if (idx !== -1) hero.deck.splice(idx, 1);
    } else if (option.actionId === 'wall_grow') {
      const idx = hero.deck.findIndex(c => (c.id.startsWith('void_slash') || c.id.startsWith('strike')) && !c.isUpgraded);
      if (idx !== -1) hero.deck[idx] = upgradeCard(hero.deck[idx]);
    } else if (option.actionId === 'wall_forget') {
      const idx = hero.deck.findIndex(c => c.id.startsWith('aegis_ward') || c.id.startsWith('defend'));
      if (idx !== -1) hero.deck.splice(idx, 1);
    } else if (option.actionId === 'wall_change') {
      hero.gold += 80;
    } else if (option.actionId === 'fish_banana') {
      hero.hp = Math.min(hero.maxHp, hero.hp + Math.round(hero.maxHp * 0.33));
    } else if (option.actionId === 'fish_donut') {
      hero.maxHp += 5;
      hero.hp += 5;
    } else if (option.actionId === 'fish_box') {
      const relic = getRandomRelic(hero.relics.map(r => r.id));
      hero.relics.push(relic);
    } else if (option.actionId === 'light_enter') {
      hero.hp = Math.max(1, hero.hp - 12);
      const upgradeableIndices = hero.deck
        .map((c, idx) => (!c.isUpgraded && c.type !== 'status' && c.type !== 'curse' ? idx : -1))
        .filter(idx => idx !== -1);
      const shuffledIdx = [...upgradeableIndices].sort(() => Math.random() - 0.5).slice(0, 2);
      for (const idx of shuffledIdx) {
        hero.deck[idx] = upgradeCard(hero.deck[idx]);
      }
    } else if (option.actionId === 'scrap_reach') {
      hero.hp = Math.max(1, hero.hp - 8);
      const relic = getRandomRelic(hero.relics.map(r => r.id));
      hero.relics.push(relic);
    }

    let updatedRun: SpireRunState = { ...spireRun, hero };
    updatedRun = advanceMapToNextFloor(updatedRun);

    setSpireRun(updatedRun);
    setActiveSpireEvent(null);
    setScreen('spire_map');
  };

  // ==========================================
  // RANKED ARENA HANDLERS
  // ==========================================
  const handleFindMatch = () => {
    setScreen('matchmaking');
  };

  const handleMatchFound = (opponent: OpponentMatchCandidate) => {
    setActiveOpponent(opponent);
    setScreen('battle');
  };

  const handleMatchComplete = async (result: MatchResultData) => {
    setMatchResult(result);
    setRewardDoubled(false);

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

    // Add Battle Pass XP (120 XP on win, 50 XP on loss)
    const bpRes = await BattlePassService.addXp(isWin ? 120 : 50);
    setBattlePassState(bpRes.state);

    // Add Gems to Piggy Bank
    updatedProfile = await MonetizationService.addPiggyBankGems(updatedProfile, 15);

    setProfile(updatedProfile);
    await StorageService.saveProfile(updatedProfile);

    await StorageService.recordMatch({
      id: Math.random().toString(),
      timestamp: Date.now(),
      opponentName: activeOpponent ? activeOpponent.name : 'Unknown',
      opponentMmr: activeOpponent ? activeOpponent.mmr : 1500,
      result: isWin ? 'win' : 'loss',
      mmrChange: result.mmrDelta,
      oldMmr: result.oldMmr,
      newMmr: result.newMmr,
    });

    setShowResultModal(true);
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
    setScreen('lobby');
    setActiveOpponent(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Main Lobby / Naraka-Style Hero Showcase Chamber */}
      {screen === 'lobby' && (
        <LobbyScreen
          profile={profile}
          selectedWarrior={selectedWarrior}
          customWarriorName={customWarriorName}
          onSelectWarrior={(w) => {
            setSelectedWarrior(w);
            setCustomWarriorName(w.name);
          }}
          onRandomizeName={() => {
            const generated = generateRandomWarriorName(selectedWarrior.id);
            setCustomWarriorName(generated.fullName);
          }}
          onStartSpireRun={handleStartSpireRun}
          onFindMatch={handleFindMatch}
          onOpenDeck={() => setScreen('deck')}
          onOpenLeaderboard={() => setScreen('leaderboard')}
          onOpenShop={() => setScreen('shop')}
          onOpenBattlePass={() => setScreen('battlepass')}
          onOpenGwent={() => setScreen('gwent')}
        />
      )}

      {/* Spire Map Screen */}
      {screen === 'spire_map' && spireRun && (
        <SpireMapScreen
          runState={spireRun}
          onSelectNode={handleSelectMapNode}
          onOpenDeck={() => setShowDeckModal(true)}
          onAbandonRun={() => {
            setSpireRun(null);
            setScreen('lobby');
          }}
        />
      )}

      {/* Spire Turn-Based Combat Arena */}
      {screen === 'spire_combat' && spireRun && activeSpireEnemy && (
        <SpireCombatScreen
          initialHero={spireRun.hero}
          initialEnemy={activeSpireEnemy}
          warriorProfile={selectedWarrior}
          customWarriorName={customWarriorName}
          isVip={!!(profile.isVip || profile.hasNoAds)}
          onWatchAdForRevive={(onSuccess) => {
            GameStudioEngine.playSfx('power_surge');
            onSuccess();
          }}
          onVictory={handleSpireCombatVictory}
          onDefeat={handleSpireCombatDefeat}
        />
      )}

      {/* Spire Post-Combat Reward Drafting */}
      {screen === 'spire_reward' && pendingReward && (
        <SpireRewardScreen
          goldEarned={pendingReward.gold}
          cardChoices={pendingReward.cards}
          relicEarned={pendingReward.relic}
          potionEarned={pendingReward.potion}
          onClaimRewards={handleClaimSpireRewards}
        />
      )}

      {/* Spire Campfire Rest Site */}
      {screen === 'spire_rest' && spireRun && (
        <SpireRestScreen
          hero={spireRun.hero}
          onRestChosen={handleRestChosen}
          onSmithChosen={handleSmithChosen}
        />
      )}

      {/* Spire Merchant Shop */}
      {screen === 'spire_shop' && spireRun && (
        <SpireShopScreen
          hero={spireRun.hero}
          onBuyCard={handleBuyCardInShop}
          onBuyRelic={handleBuyRelicInShop}
          onBuyPotion={handleBuyPotionInShop}
          onPurgeCard={handlePurgeCardInShop}
          onLeaveShop={handleLeaveShop}
        />
      )}

      {/* Spire Mystery ? Narrative Event */}
      {screen === 'spire_event' && spireRun && activeSpireEvent && (
        <SpireEventScreen
          event={activeSpireEvent}
          hero={spireRun.hero}
          onSelectOption={handleSelectEventOption}
        />
      )}

      {/* Quick 1v1 Ranked Matchmaking */}
      {screen === 'matchmaking' && (
        <MatchmakingScreen
          playerProfile={profile}
          onMatchFound={handleMatchFound}
          onCancel={() => setScreen('lobby')}
        />
      )}

      {/* Quick 1v1 Battle Screen */}
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

      {/* PvP Deck Builder */}
      {screen === 'deck' && (
        <DeckBuilderScreen
          currentDeckIds={profile.deckCardIds}
          onSaveDeck={async ids => {
            const updated = { ...profile, deckCardIds: ids };
            setProfile(updated);
            await StorageService.saveProfile(updated);
          }}
          onBack={() => setScreen('lobby')}
        />
      )}

      {/* Global MMR Leaderboard */}
      {screen === 'leaderboard' && (
        <LeaderboardScreen
          playerProfile={profile}
          onBack={() => setScreen('lobby')}
        />
      )}

      {/* Shop & Daily Supply Rewards */}
      {screen === 'shop' && (
        <ShopScreen
          profile={profile}
          onWatchAdForPack={() => {
            GameStudioEngine.playSfx('gold_gain');
            const updated = { ...profile, gold: profile.gold + 150, gems: profile.gems + 15 };
            setProfile(updated);
            StorageService.saveProfile(updated);
          }}
          onProfileUpdate={(updated) => setProfile(updated)}
          onOpenBattlePass={() => setScreen('battlepass')}
          onBack={() => setScreen('lobby')}
        />
      )}

      {/* Season 1 Battle Pass Screen */}
      {screen === 'battlepass' && battlePassState && (
        <BattlePassScreen
          profile={profile}
          battlePassState={battlePassState}
          onProfileUpdate={(updated) => setProfile(updated)}
          onPassStateUpdate={(updated) => setBattlePassState(updated)}
          onBack={() => setScreen('lobby')}
        />
      )}

      {/* The Witcher: Gwent Duel Arena */}
      {screen === 'gwent' && (
        <GwentScreen
          playerName={customWarriorName || 'Ryu Hayabusa'}
          onExit={() => setScreen('lobby')}
          onMatchComplete={(won) => {
            if (profile) {
              const delta = won ? 45 : 5;
              const updated = {
                ...profile,
                mmr: profile.mmr + delta,
                gold: profile.gold + (won ? 150 : 35),
                gems: profile.gems + (won ? 15 : 0),
              };
              setProfile(updated);
              StorageService.saveProfile(updated);
            }
          }}
        />
      )}

      {/* Active Spire Deck Inspector Modal */}
      {spireRun && (
        <SpireDeckViewModal
          visible={showDeckModal}
          deck={spireRun.hero.deck}
          onClose={() => setShowDeckModal(false)}
        />
      )}

      {/* Spire Run Over (Victory or Defeat) Summary Modal */}
      <SpireRunOverModal
        visible={showRunOverModal}
        runState={spireRun}
        oldMmr={runOverOldMmr}
        newMmr={runOverNewMmr}
        mmrChange={runOverMmrDelta}
        onPlayAgain={() => {
          setShowRunOverModal(false);
          handleStartSpireRun();
        }}
        onReturnToLobby={() => {
          setShowRunOverModal(false);
          setSpireRun(null);
          setScreen('lobby');
        }}
      />

      {/* 1v1 Arena Result Modal */}
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
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
