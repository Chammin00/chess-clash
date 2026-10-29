import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { CAMPAIGN_WORLDS } from '../campaign/campaignData';
import { CampaignProgress, CampaignStage, CampaignWorld } from '../campaign/types';
import { CampaignService } from '../campaign/campaignService';
import { GameThemeId } from '../types';
import { THEME_CONFIGS } from '../themes';

interface CampaignMapViewProps {
  progress: CampaignProgress;
  selectedWorldId: GameThemeId;
  onSelectWorld: (worldId: GameThemeId) => void;
  onSelectStage: (stage: CampaignStage) => void;
}

export const CampaignMapView: React.FC<CampaignMapViewProps> = ({
  progress,
  selectedWorldId,
  onSelectWorld,
  onSelectStage,
}) => {
  const { width } = useWindowDimensions();
  const currentWorld =
    CAMPAIGN_WORLDS.find((w) => w.id === selectedWorldId) || CAMPAIGN_WORLDS[0];
  const theme = THEME_CONFIGS[currentWorld.id];

  return (
    <View style={styles.container}>
      {/* World Selector Tabs (World 1 to 10) */}
      <View style={styles.worldTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.worldTabsScroll}
        >
          {CAMPAIGN_WORLDS.map((world) => {
            const isUnlocked = progress.unlockedWorldIds.includes(world.id);
            const isSelected = world.id === selectedWorldId;

            return (
              <TouchableOpacity
                key={world.id}
                style={[
                  styles.worldTabPill,
                  isSelected && styles.worldTabPillSelected,
                  !isUnlocked && styles.worldTabPillLocked,
                ]}
                disabled={!isUnlocked}
                onPress={() => onSelectWorld(world.id)}
              >
                <Text style={styles.worldTabBanner}>{world.banner}</Text>
                <Text
                  style={[
                    styles.worldTabName,
                    isSelected && styles.worldTabNameSelected,
                    !isUnlocked && styles.worldTabNameLocked,
                  ]}
                >
                  W{world.worldNumber}
                </Text>
                {!isUnlocked && <Text style={styles.tabLockIcon}>🔒</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* World Map Canvas (Mario Style Overworld) */}
      <View style={[styles.mapBoard, { borderColor: theme.primaryColor }]}>
        {/* World Header Banner */}
        <View style={styles.worldHeaderBar}>
          <View style={styles.worldHeaderLeft}>
            <Text style={styles.worldHeaderEmoji}>{currentWorld.banner}</Text>
            <View>
              <Text style={styles.worldHeaderTitle}>{currentWorld.name}</Text>
              <Text style={styles.worldHeaderTagline}>{currentWorld.tagline}</Text>
            </View>
          </View>
          <View style={styles.worldStarsBox}>
            <Text style={styles.starTotalText}>
              ⭐{' '}
              {currentWorld.stages.reduce(
                (sum, s) => sum + (progress.stageStars[s.id] || 0),
                0
              )}
              /{currentWorld.stages.length * 3}
            </Text>
          </View>
        </View>

        {/* Mario Style Linear / Winding Stage Path */}
        <View style={styles.stagePathContainer}>
          {currentWorld.stages.map((stage, idx) => {
            const isUnlocked = CampaignService.isStageUnlocked(stage.id, progress);
            const isCleared = progress.clearedStageIds.includes(stage.id);
            const stars = progress.stageStars[stage.id] || 0;
            const isBoss = stage.type === 'boss';
            const isTreasure = stage.type === 'treasure';

            return (
              <View key={stage.id} style={styles.stageNodeWrapper}>
                {/* Connecting Path Line */}
                {idx > 0 && (
                  <View
                    style={[
                      styles.pathLine,
                      isUnlocked ? styles.pathLineUnlocked : styles.pathLineLocked,
                    ]}
                  />
                )}

                {/* Stage Node Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={!isUnlocked}
                  style={[
                    styles.stageNode,
                    isBoss && styles.bossStageNode,
                    isTreasure && styles.treasureStageNode,
                    isCleared && styles.clearedStageNode,
                    !isUnlocked && styles.lockedStageNode,
                    isUnlocked && !isCleared && styles.currentStageNode,
                  ]}
                  onPress={() => onSelectStage(stage)}
                >
                  {/* Node Icon */}
                  {isBoss ? (
                    <Text style={styles.bossNodeIcon}>🏰</Text>
                  ) : isTreasure ? (
                    <Text style={styles.treasureNodeIcon}>🎁</Text>
                  ) : (
                    <Text style={styles.stageNumberText}>{stage.stageNumber}</Text>
                  )}

                  {/* Lock Indicator */}
                  {!isUnlocked && (
                    <View style={styles.nodeLockBadge}>
                      <Text style={styles.nodeLockText}>🔒</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Stage Stars & Title Label */}
                <View style={styles.stageInfoBox}>
                  <Text style={styles.stageTitleText} numberOfLines={1}>
                    {stage.title}
                  </Text>
                  {isUnlocked && (
                    <View style={styles.starsRow}>
                      {[1, 2, 3].map((starIdx) => (
                        <Text
                          key={starIdx}
                          style={[
                            styles.starEmoji,
                            { opacity: starIdx <= stars ? 1 : 0.25 },
                          ]}
                        >
                          ⭐
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  worldTabsContainer: {
    marginBottom: 12,
  },
  worldTabsScroll: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 8,
  },
  worldTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#334155',
    gap: 5,
  },
  worldTabPillSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#818CF8',
  },
  worldTabPillLocked: {
    opacity: 0.5,
    borderColor: '#1E293B',
  },
  worldTabBanner: {
    fontSize: 14,
  },
  worldTabName: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
  },
  worldTabNameSelected: {
    color: '#FFFFFF',
  },
  worldTabNameLocked: {
    color: '#64748B',
  },
  tabLockIcon: {
    fontSize: 10,
  },
  mapBoard: {
    backgroundColor: '#0F172A',
    marginHorizontal: 12,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  worldHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  worldHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  worldHeaderEmoji: {
    fontSize: 28,
  },
  worldHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  worldHeaderTagline: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  worldStarsBox: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  starTotalText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '800',
  },
  stagePathContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 14,
  },
  stageNodeWrapper: {
    alignItems: 'center',
    position: 'relative',
    flex: 1,
  },
  pathLine: {
    position: 'absolute',
    top: 24,
    left: -28,
    right: 28,
    height: 4,
    zIndex: -1,
  },
  pathLineUnlocked: {
    backgroundColor: '#F59E0B',
  },
  pathLineLocked: {
    backgroundColor: '#334155',
  },
  stageNode: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#475569',
    position: 'relative',
  },
  clearedStageNode: {
    backgroundColor: '#059669',
    borderColor: '#34D399',
  },
  currentStageNode: {
    backgroundColor: '#D97706',
    borderColor: '#FDE047',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  lockedStageNode: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    opacity: 0.6,
  },
  bossStageNode: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7F1D1D',
    borderColor: '#EF4444',
  },
  treasureStageNode: {
    backgroundColor: '#581C87',
    borderColor: '#C084FC',
  },
  stageNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  bossNodeIcon: {
    fontSize: 26,
  },
  treasureNodeIcon: {
    fontSize: 24,
  },
  nodeLockBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 2,
  },
  nodeLockText: {
    fontSize: 10,
  },
  stageInfoBox: {
    alignItems: 'center',
    marginTop: 8,
  },
  stageTitleText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  starEmoji: {
    fontSize: 9,
    marginHorizontal: 1,
  },
});
