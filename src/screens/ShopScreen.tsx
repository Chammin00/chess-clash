import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { PlayerProfile } from '../types/mmr';
import { DailyDealItem, CrateOpeningResult } from '../types/monetization';
import { IAP_PRODUCTS, CRATE_CONFIGS, INITIAL_DAILY_DEALS } from '../config/monetization';
import { MonetizationService } from '../services/monetizationService';
import { CrateOpeningModal } from '../components/CrateOpeningModal';

interface Props {
  profile: PlayerProfile;
  onWatchAdForPack: () => void;
  onProfileUpdate: (updated: PlayerProfile) => void;
  onBack: () => void;
  onOpenBattlePass: () => void;
}

type ShopTab = 'deals' | 'gems' | 'crates' | 'free';

export const ShopScreen: React.FC<Props> = ({
  profile,
  onWatchAdForPack,
  onProfileUpdate,
  onBack,
  onOpenBattlePass,
}) => {
  const [activeTab, setActiveTab] = useState<ShopTab>('deals');
  const [dailyDeals, setDailyDeals] = useState<DailyDealItem[]>(INITIAL_DAILY_DEALS);
  const [crateModalVisible, setCrateModalVisible] = useState(false);
  const [activeCrateResult, setActiveCrateResult] = useState<CrateOpeningResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Buy IAP Product
  const handleBuyProduct = async (productId: string) => {
    setIsProcessing(true);
    const res = await MonetizationService.purchaseProduct(productId, profile);
    setIsProcessing(false);

    if (res.success) {
      onProfileUpdate(res.updatedProfile);
      Alert.alert('Purchase Successful! 🎉', res.message);
    } else {
      Alert.alert('Purchase Failed', res.message);
    }
  };

  // Unlock Piggy Bank
  const handleUnlockPiggyBank = async () => {
    setIsProcessing(true);
    const res = await MonetizationService.unlockPiggyBank(profile);
    setIsProcessing(false);

    if (res.success) {
      onProfileUpdate(res.updatedProfile);
      Alert.alert('Vault Smashed! 💰', `You claimed ${res.gemsAwarded} Gems for $1.99!`);
    }
  };

  // Open Crate
  const handleOpenCrate = async (crateId: string) => {
    setIsProcessing(true);
    const res = await MonetizationService.openCrate(crateId, profile);
    setIsProcessing(false);

    if (res.success && res.result) {
      onProfileUpdate(res.updatedProfile);
      setActiveCrateResult(res.result);
      setCrateModalVisible(true);
    } else {
      Alert.alert('Cannot Open Crate', res.error || 'Failed to open crate.');
    }
  };

  // Buy Daily Deal
  const handleBuyDailyDeal = async (deal: DailyDealItem) => {
    setIsProcessing(true);
    const res = await MonetizationService.purchaseDailyDeal(deal, profile);
    setIsProcessing(false);

    if (res.success) {
      onProfileUpdate(res.updatedProfile);
      setDailyDeals((prev) =>
        prev.map((d) => (d.id === deal.id ? { ...d, purchased: true } : d))
      );
      Alert.alert('Offer Claimed! 🎁', `Unlocked ${deal.title}!`);
    } else {
      Alert.alert('Insufficient Balance', res.error || 'Cannot purchase deal.');
    }
  };

  const piggyGems = profile.piggyBankGems || 250;
  const isPiggyFull = piggyGems >= 500;
  const pityCount = profile.pityCounter || 0;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>‹ BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>EMPORIUM & TREASURY</Text>
        <View style={styles.currencies}>
          <View style={styles.currencyPill}>
            <Text style={styles.curIcon}>🪙</Text>
            <Text style={styles.curAmount}>{profile.gold}</Text>
          </View>
          <View style={styles.currencyPill}>
            <Text style={styles.curIcon}>💎</Text>
            <Text style={styles.curAmount}>{profile.gems}</Text>
          </View>
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.tabBar}>
        {(['deals', 'gems', 'crates', 'free'] as ShopTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'deals'
                ? '⚡ DEALS'
                : tab === 'gems'
                ? '💎 GEMS'
                : tab === 'crates'
                ? '📦 CRATES'
                : '🎁 SUPPLY'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* TAB 1: DEALS & SPECIAL OFFERS */}
        {activeTab === 'deals' && (
          <>
            {/* Starter Pack Banner */}
            {!profile.starterPackPurchased && (
              <View style={styles.starterCard}>
                <View style={styles.starterTag}>
                  <Text style={styles.starterTagText}>85% OFF • LIMITED TIME STARTER PACK</Text>
                </View>
                <Text style={styles.starterIcon}>⚡</Text>
                <Text style={styles.starterTitle}>Grandmaster Starter Bundle</Text>
                <Text style={styles.starterDesc}>
                  500 Radiant Gems + 2,500 Gold + Guaranteed Epic Dawn Valkyrie Card + Legendary Gold Avatar Crest!
                </Text>
                <TouchableOpacity
                  disabled={isProcessing}
                  style={styles.buyStarterBtn}
                  onPress={() => handleBuyProduct('com.aether.starter_pack')}
                >
                  <Text style={styles.buyStarterBtnText}>CLAIM STARTER PACK ($1.99)</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Piggy Bank / Spire Vault */}
            <View style={styles.piggyCard}>
              <View style={styles.piggyHeader}>
                <Text style={styles.piggyIcon}>🏺</Text>
                <View style={styles.piggyTextContainer}>
                  <Text style={styles.piggyTitle}>The Spire Treasury Vault</Text>
                  <Text style={styles.piggySub}>
                    Gems saved from your battles: {piggyGems} / 500
                  </Text>
                </View>
              </View>
              <View style={styles.piggyTrack}>
                <View
                  style={[
                    styles.piggyFill,
                    { width: `${Math.min(100, Math.round((piggyGems / 500) * 100))}%` },
                  ]}
                />
              </View>
              <TouchableOpacity
                disabled={isProcessing}
                style={[styles.smashPiggyBtn, !isPiggyFull && styles.smashPiggyBtnPartial]}
                onPress={handleUnlockPiggyBank}
              >
                <Text style={styles.smashPiggyText}>
                  {isPiggyFull
                    ? `SMASH VAULT FOR 500 💎 ($1.99)`
                    : `SMASH VAULT FOR ${piggyGems} 💎 ($1.99)`}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Daily Rotating Offers */}
            <Text style={styles.sectionHeader}>DAILY ROTATING DEALS (RESETS IN 14H)</Text>
            {dailyDeals.map((deal) => (
              <View key={deal.id} style={styles.dealCard}>
                <Text style={styles.dealIcon}>{deal.icon}</Text>
                <View style={styles.dealInfo}>
                  <Text style={styles.dealTitle}>{deal.title}</Text>
                  <Text style={styles.dealDiscount}>🔥 -{deal.discountPct}% Daily Discount</Text>
                </View>
                {deal.purchased ? (
                  <View style={styles.claimedPill}>
                    <Text style={styles.claimedText}>✓ CLAIMED</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    disabled={isProcessing}
                    style={styles.buyDealBtn}
                    onPress={() => handleBuyDailyDeal(deal)}
                  >
                    <Text style={styles.buyDealBtnText}>
                      {deal.currency === 'gold' ? '🪙 ' : '💎 '}
                      {deal.price}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* Battle Pass Cross-Promo CTA */}
            <TouchableOpacity style={styles.battlePassCta} onPress={onOpenBattlePass}>
              <View>
                <Text style={styles.bpCtaTitle}>👑 SEASON 1 BATTLE PASS</Text>
                <Text style={styles.bpCtaSub}>Claim 50 tiers of exclusive rewards</Text>
              </View>
              <Text style={styles.bpCtaArrow}>VIEW LADDER ➔</Text>
            </TouchableOpacity>
          </>
        )}

        {/* TAB 2: IN-APP PURCHASES (GEMS & PERMANENT PERKS) */}
        {activeTab === 'gems' && (
          <>
            {/* Founder Supporter Pass */}
            <View style={styles.vipPassCard}>
              <View style={styles.vipTag}>
                <Text style={styles.vipTagText}>
                  {profile.hasNoAds ? 'ACTIVE' : 'BEST SELLER'}
                </Text>
              </View>
              <Text style={styles.vipPassIcon}>🛡️</Text>
              <Text style={styles.vipPassTitle}>Founder Vanguard Supporter Pass</Text>
              <Text style={styles.vipPassDesc}>
                Permanently unlocks Founder Vanguard crest and grants enhanced daily supply caches!
              </Text>
              <TouchableOpacity
                disabled={profile.hasNoAds || isProcessing}
                style={[styles.buyVipBtn, profile.hasNoAds && styles.buyVipBtnOwned]}
                onPress={() => handleBuyProduct('com.aether.founder_supporter_pass')}
              >
                <Text style={styles.buyVipBtnText}>
                  {profile.hasNoAds ? '✓ OWNED FOREVER' : 'UNLOCK FOUNDER PASS ($4.99)'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Monthly VIP Subscription */}
            <View style={styles.monthlyVipCard}>
              <Text style={styles.monthlyVipIcon}>🌟</Text>
              <View style={styles.monthlyVipInfo}>
                <Text style={styles.monthlyVipTitle}>Monthly Ascendant VIP</Text>
                <Text style={styles.monthlyVipSub}>
                  +50 Gems Daily, +25% Gold on all matches & Spire runs!
                </Text>
              </View>
              <TouchableOpacity
                disabled={profile.isVip || isProcessing}
                style={styles.monthlyVipBtn}
                onPress={() => handleBuyProduct('com.aether.vip_subscription')}
              >
                <Text style={styles.monthlyVipBtnText}>
                  {profile.isVip ? 'ACTIVE' : '$4.99/mo'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Hard Currency Gem Bundles */}
            <Text style={styles.sectionHeader}>RADIANT GEM TREASURY</Text>
            <View style={styles.gemGrid}>
              {IAP_PRODUCTS.filter((p) => p.gemAmount && p.id.includes('tier')).map((product) => (
                <View key={product.id} style={styles.gemCard}>
                  {product.badge && (
                    <View style={styles.gemBadge}>
                      <Text style={styles.gemBadgeText}>{product.badge}</Text>
                    </View>
                  )}
                  <Text style={styles.gemIcon}>{product.icon}</Text>
                  <Text style={styles.gemAmountText}>
                    {product.gemAmount} 💎
                  </Text>
                  {product.bonusGems ? (
                    <Text style={styles.gemBonusText}>+{product.bonusGems} Bonus</Text>
                  ) : null}
                  <TouchableOpacity
                    disabled={isProcessing}
                    style={styles.buyGemBtn}
                    onPress={() => handleBuyProduct(product.id)}
                  >
                    <Text style={styles.buyGemBtnText}>{product.priceUsd}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {/* TAB 3: GACHA CRATES */}
        {activeTab === 'crates' && (
          <>
            {/* Pity Counter Status */}
            <View style={styles.pityBanner}>
              <Text style={styles.pityBannerIcon}>🔮</Text>
              <View style={styles.pityBannerTextContainer}>
                <Text style={styles.pityBannerTitle}>Legendary Pity Counter</Text>
                <Text style={styles.pityBannerSub}>
                  Pity Progress: {pityCount} / 10 (Guaranteed Legendary when full!)
                </Text>
              </View>
            </View>

            {CRATE_CONFIGS.map((crate) => (
              <View key={crate.id} style={styles.crateItemCard}>
                <Text style={styles.crateItemIcon}>{crate.icon}</Text>
                <View style={styles.crateItemInfo}>
                  <Text style={styles.crateItemTitle}>{crate.title}</Text>
                  <Text style={styles.crateItemDesc}>{crate.description}</Text>
                  <Text style={styles.crateDropDetail}>
                    Drops {crate.dropCount} Cards • +{crate.minGold}-{crate.maxGold} Gold
                  </Text>
                </View>
                <TouchableOpacity
                  disabled={isProcessing}
                  style={styles.openCrateBtn}
                  onPress={() => handleOpenCrate(crate.id)}
                >
                  <Text style={styles.openCrateBtnText}>
                    {crate.goldCost > 0 ? `🪙 ${crate.goldCost}` : `💎 ${crate.gemCost}`}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* TAB 4: DAILY VANGUARD SUPPLY DROP */}
        {activeTab === 'free' && (
          <View style={styles.featuredCard}>
            <View style={styles.featuredTag}>
              <Text style={styles.featuredTagText}>
                {profile.hasNoAds ? 'FOUNDER SUPPLY DROP' : 'VANGUARD REQUISITION'}
              </Text>
            </View>
            <Text style={styles.packIcon}>🎁</Text>
            <Text style={styles.packTitle}>Daily Tactical Requisition Cache</Text>
            <Text style={styles.packDesc}>
              Claim your Citadel Vanguard supply drop to receive +150 Credits and +15 Radiant Gems for your next ascent!
            </Text>

            <TouchableOpacity style={styles.watchAdBtn} onPress={onWatchAdForPack}>
              <Text style={styles.watchAdText}>
                ⚡ CLAIM DAILY SUPPLY CACHE (+150 GOLD / +15 GEMS)
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Crate Opening Reveal Modal */}
      <CrateOpeningModal
        visible={crateModalVisible}
        result={activeCrateResult}
        onClose={() => setCrateModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1D',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backBtn: {
    padding: 6,
  },
  backText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  currencies: {
    flexDirection: 'row',
    gap: 6,
  },
  currencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  curIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  curAmount: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#38BDF8',
  },
  tabText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
  },
  tabTextActive: {
    color: '#38BDF8',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  starterCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  starterTag: {
    backgroundColor: '#F59E0B',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  starterTagText: {
    color: '#0F172A',
    fontSize: 9,
    fontWeight: '900',
  },
  starterIcon: {
    fontSize: 36,
    marginBottom: 4,
  },
  starterTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  starterDesc: {
    color: '#C7D2FE',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 14,
    lineHeight: 16,
  },
  buyStarterBtn: {
    backgroundColor: '#D97706',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  buyStarterBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  piggyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  piggyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  piggyIcon: {
    fontSize: 32,
    marginRight: 10,
  },
  piggyTextContainer: {
    flex: 1,
  },
  piggyTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  piggySub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  piggyTrack: {
    height: 8,
    backgroundColor: '#0F172A',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  piggyFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
  },
  smashPiggyBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  smashPiggyBtnPartial: {
    backgroundColor: '#0369A1',
  },
  smashPiggyText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
  },
  sectionHeader: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dealIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  dealInfo: {
    flex: 1,
  },
  dealTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
  },
  dealDiscount: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  buyDealBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buyDealBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  battlePassCta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#262214',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#EAB308',
  },
  bpCtaTitle: {
    color: '#FEF08A',
    fontSize: 13,
    fontWeight: '900',
  },
  bpCtaSub: {
    color: '#CA8A04',
    fontSize: 10,
    marginTop: 2,
  },
  bpCtaArrow: {
    color: '#FEF08A',
    fontSize: 11,
    fontWeight: '900',
  },
  vipPassCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  vipTag: {
    backgroundColor: '#0284C7',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 8,
  },
  vipTagText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: '900',
  },
  vipPassIcon: {
    fontSize: 36,
    marginBottom: 4,
  },
  vipPassTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  vipPassDesc: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 16,
  },
  buyVipBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 10,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  buyVipBtnOwned: {
    backgroundColor: '#064E3B',
  },
  buyVipBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  monthlyVipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#713F12',
  },
  monthlyVipIcon: {
    fontSize: 26,
    marginRight: 10,
  },
  monthlyVipInfo: {
    flex: 1,
  },
  monthlyVipTitle: {
    color: '#FEF08A',
    fontSize: 12,
    fontWeight: '800',
  },
  monthlyVipSub: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  monthlyVipBtn: {
    backgroundColor: '#EAB308',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  monthlyVipBtnText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '900',
  },
  gemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gemCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  gemBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#EAB308',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  gemBadgeText: {
    color: '#0F172A',
    fontSize: 8,
    fontWeight: '900',
  },
  gemIcon: {
    fontSize: 32,
    marginVertical: 4,
  },
  gemAmountText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '900',
  },
  gemBonusText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 8,
  },
  buyGemBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 6,
  },
  buyGemBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  pityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1B4B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  pityBannerIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  pityBannerTextContainer: {
    flex: 1,
  },
  pityBannerTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
  },
  pityBannerSub: {
    color: '#C7D2FE',
    fontSize: 10,
    marginTop: 2,
  },
  crateItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  crateItemIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  crateItemInfo: {
    flex: 1,
  },
  crateItemTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  crateItemDesc: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  crateDropDetail: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
  },
  openCrateBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  openCrateBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  featuredCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  featuredTag: {
    backgroundColor: '#F59E0B',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 12,
  },
  featuredTagText: {
    color: '#1A202C',
    fontSize: 9,
    fontWeight: '900',
  },
  packIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  packTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  packDesc: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 16,
  },
  watchAdBtn: {
    backgroundColor: '#D97706',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  watchAdText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  claimedPill: {
    backgroundColor: '#064E3B',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  claimedText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '900',
  },
});
