import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { CampaignProgress, CampaignStage } from '../campaign/types';
import { CampaignService } from '../campaign/campaignService';
import { CampaignMapView } from '../components/CampaignMapView';
import { CampaignStageModal } from '../components/CampaignStageModal';
import { CampaignShopModal } from '../components/CampaignShopModal';
import { GameThemeId } from '../types';
import { CAMPAIGN_WORLDS } from '../campaign/campaignData';

interface CampaignWorldMapScreenProps {
  onStartStageBattle: (stage: CampaignStage, worldId: GameThemeId) => void;
  onBack: () => void;
}

export const CampaignWorldMapScreen: React.FC<CampaignWorldMapScreenProps> = ({
  onStartStageBattle,
  onBack,
}) => {
  const [progress, setProgress] = useState<CampaignProgress | null>(null);
  const [selectedWorldId, setSelectedWorldId] = useState<GameThemeId>('ninjas');
  const [selectedStage, setSelectedStage] = useState<CampaignStage | null>(null);
  const [showShop, setShowShop] = useState(false);

  useEffect(() => {
    async function loadData() {
      const p = await CampaignService.loadProgress();
      setProgress(p);
      setSelectedWorldId(p.currentWorld || 'ninjas');
    }
    loadData();
  }, []);

  if (!progress) return null;

  const totalStars = CampaignService.getTotalStars(progress);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>‹ Arena Hub</Text>
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>10 WORLDS CAMPAIGN</Text>
          <Text style={styles.headerSubtitle}>SUPER MARIO CHESS ODYSSEY</Text>
        </View>

        <TouchableOpacity style={styles.shopBtn} onPress={() => setShowShop(true)}>
          <Text style={styles.shopBtnText}>🛒 Shop</Text>
        </TouchableOpacity>
      </View>

      {/* Resource Strip */}
      <View style={styles.resourceStrip}>
        <View style={styles.resourcePill}>
          <Text style={styles.resourceIcon}>⭐</Text>
          <Text style={styles.resourceText}>{totalStars} / 120 Stars</Text>
        </View>

        <View style={styles.resourcePill}>
          <Text style={styles.resourceIcon}>🪙</Text>
          <Text style={styles.resourceText}>{progress.coins} Gold</Text>
        </View>

        <View style={styles.resourcePill}>
          <Text style={styles.resourceIcon}>🌀</Text>
          <Text style={styles.resourceText}>
            {(progress.inventory.undo_one || 0) + (progress.inventory.revert_ten || 0)} Rewinds
          </Text>
        </View>
      </View>

      {/* Main Overworld Scroll Area */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <CampaignMapView
          progress={progress}
          selectedWorldId={selectedWorldId}
          onSelectWorld={(wId) => {
            setSelectedWorldId(wId);
          }}
          onSelectStage={(stage) => {
            setSelectedStage(stage);
          }}
        />

        {/* Mario World Campaign Guide Box */}
        <View style={styles.guideBox}>
          <Text style={styles.guideTitle}>🏰 OVERWORLD CAMPAIGN RULES</Text>
          <Text style={styles.guideText}>
            • <Text style={styles.bold}>Advance through 10 Kingdoms:</Text> Defeat each world's Fortress Boss to unlock the path to the next realm!
          </Text>
          <Text style={styles.guideText}>
            • <Text style={styles.bold}>Collect Tactical Powerups:</Text> Earn Hourglasses (Undo 1 move) and Chronos Scrolls (Revert 10 moves!) by clearing stages.
          </Text>
          <Text style={styles.guideText}>
            • <Text style={styles.bold}>Master 3-Star Objectives:</Text> Win without using items or within move limits to amass gold and star crowns.
          </Text>
        </View>
      </ScrollView>

      {/* Stage Briefing Modal */}
      <CampaignStageModal
        stage={selectedStage}
        starsEarned={selectedStage ? progress.stageStars[selectedStage.id] || 0 : 0}
        onStartStage={(stage) => {
          setSelectedStage(null);
          onStartStageBattle(stage, selectedWorldId);
        }}
        onClose={() => setSelectedStage(null)}
      />

      {/* Traveling Merchant Shop Modal */}
      <CampaignShopModal
        visible={showShop}
        progress={progress}
        onUpdateProgress={(updated) => setProgress(updated)}
        onClose={() => setShowShop(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 13,
    fontWeight: '700',
  },
  headerTitleBox: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  headerSubtitle: {
    color: '#F59E0B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  shopBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  shopBtnText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
  },
  resourceStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  resourcePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resourceIcon: {
    fontSize: 14,
  },
  resourceText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  guideBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  guideTitle: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  guideText: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 6,
  },
  bold: {
    color: '#F1F5F9',
    fontWeight: '700',
  },
});
