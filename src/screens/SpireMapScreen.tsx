import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MapNode, SpireRunState } from '../types/spire';
import { SpireMapNodeVector } from '../components/SpireVectorArt';
import { GameStudioEngine } from '../services/gameStudioEngine';

interface Props {
  runState: SpireRunState;
  onSelectNode: (node: MapNode) => void;
  onOpenDeck: () => void;
  onAbandonRun: () => void;
}

export const SpireMapScreen: React.FC<Props> = ({
  runState,
  onSelectNode,
  onOpenDeck,
  onAbandonRun,
}) => {
  const { hero, floor, map } = runState;

  const getNodeIcon = (type: MapNode['type']) => {
    switch (type) {
      case 'monster': return '👾';
      case 'elite': return '⚡';
      case 'rest': return '💠';
      case 'shop': return '🛸';
      case 'event': return '🌀';
      case 'boss': return '🌌';
      default: return '📍';
    }
  };

  const getNodeTitle = (type: MapNode['type']) => {
    switch (type) {
      case 'monster': return 'Hostile';
      case 'elite': return 'Elite';
      case 'rest': return 'Forge';
      case 'shop': return 'Market';
      case 'event': return 'Anomaly';
      case 'boss': return 'Nexus Core';
      default: return 'Sector';
    }
  };

  return (
    <View style={styles.container}>
      {/* Top HUD */}
      <View style={styles.topHud}>
        <View style={styles.hudStat}>
          <Text style={styles.hudEmoji}>❤️</Text>
          <Text style={styles.hudValue}>{hero.hp}/{hero.maxHp}</Text>
        </View>

        <View style={styles.hudStat}>
          <Text style={styles.hudEmoji}>🪙</Text>
          <Text style={styles.hudValue}>{hero.gold} Credits</Text>
        </View>

        <TouchableOpacity style={styles.hudBtn} onPress={onOpenDeck}>
          <Text style={styles.hudEmoji}>🃏</Text>
          <Text style={styles.hudValue}>{hero.deck.length} Cards</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.surrenderBtn} onPress={onAbandonRun}>
          <Text style={styles.surrenderText}>🏳️</Text>
        </TouchableOpacity>
      </View>

      {/* Map Header */}
      <View style={styles.mapHeader}>
        <Text style={styles.mapTitle}>SECTOR ALPHA: ELYSIUM RIFT</Text>
        <Text style={styles.floorSub}>Waypoint Level {floor} of 15</Text>
      </View>

      {/* Scrollable Waypoints */}
      <ScrollView
        contentContainerStyle={styles.mapScroll}
        showsVerticalScrollIndicator={false}
      >
        {[...map].reverse().map(floorRow => {
          const rowFloor = floorRow[0].floor;
          const isCurrentFloor = rowFloor === floor;

          return (
            <View key={'floor_' + rowFloor} style={styles.floorRow}>
              {/* Waypoint Floor Badge */}
              <View style={[styles.floorNumBadge, isCurrentFloor && styles.floorNumBadgeActive]}>
                <Text style={styles.floorNumText}>W{rowFloor}</Text>
              </View>

              {/* Waypoint Nodes */}
              <View style={styles.nodesRow}>
                {floorRow.map(node => {
                  const isCurrent = runState.currentNodeId === node.id;
                  const isAccessible = node.accessible;

                  return (
                    <TouchableOpacity
                      key={node.id}
                      disabled={!isAccessible}
                      onPress={() => {
                        GameStudioEngine.playSfx('button_click');
                        onSelectNode(node);
                      }}
                      style={[
                        styles.nodeBtn,
                        node.visited && styles.nodeVisited,
                        isCurrent && styles.nodeCurrent,
                        isAccessible && styles.nodeAccessible,
                      ]}
                    >
                      <SpireMapNodeVector
                        type={node.type}
                        size={24}
                        active={isAccessible || isCurrent}
                      />
                      <Text style={styles.nodeLabel}>{getNodeTitle(node.type)}</Text>
                      {isAccessible && <View style={styles.pulseIndicator} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Hint */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomHint}>
          ⚡ Tap an active beacon to initiate waypoint jump
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A13',
  },
  topHud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  hudStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hudEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  hudValue: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
  },
  hudBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00F0FF',
  },
  surrenderBtn: {
    padding: 4,
  },
  surrenderText: {
    fontSize: 16,
  },
  mapHeader: {
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  mapTitle: {
    color: '#00F0FF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  floorSub: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  mapScroll: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 14,
  },
  floorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  floorNumBadge: {
    width: 36,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  floorNumBadgeActive: {
    borderColor: '#00F0FF',
    backgroundColor: '#0369A1',
  },
  floorNumText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
  },
  nodesRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 12,
  },
  nodeBtn: {
    width: 70,
    height: 62,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  nodeVisited: {
    opacity: 0.35,
  },
  nodeCurrent: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 2,
  },
  nodeAccessible: {
    borderColor: '#00F0FF',
    borderWidth: 2,
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    elevation: 6,
    shadowColor: '#00F0FF',
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  nodeIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  nodeLabel: {
    color: '#F8FAFC',
    fontSize: 8,
    fontWeight: '700',
    textAlign: 'center',
  },
  pulseIndicator: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#00F0FF',
  },
  bottomBar: {
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  bottomHint: {
    color: '#00F0FF',
    fontSize: 10,
    fontWeight: '700',
  },
});
