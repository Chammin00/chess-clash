import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { CAMPAIGN_ITEMS } from '../campaign/campaignData';
import { PowerupItemId } from '../campaign/types';

interface CampaignInventoryBarProps {
  inventory: Record<PowerupItemId, number>;
  onUseItem: (itemId: PowerupItemId) => void;
  disabled?: boolean;
}

export const CampaignInventoryBar: React.FC<CampaignInventoryBarProps> = ({
  inventory,
  onUseItem,
  disabled = false,
}) => {
  const itemKeys: PowerupItemId[] = [
    'undo_one',
    'revert_ten',
    'engine_hint',
    'king_shield',
    'pawn_strike',
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.barTitle}>STORY POWERUPS</Text>
        <Text style={styles.barSub}>Tap to activate tactical rewinds & artifacts</Text>
      </View>

      <View style={styles.itemsRow}>
        {itemKeys.map((key) => {
          const item = CAMPAIGN_ITEMS[key];
          const count = inventory[key] || 0;
          const isUsable = count > 0 && !disabled;

          return (
            <TouchableOpacity
              key={key}
              activeOpacity={0.7}
              disabled={!isUsable}
              style={[
                styles.itemBtn,
                !isUsable && styles.itemBtnDisabled,
                key === 'revert_ten' && count > 0 && styles.itemBtnEpic,
              ]}
              onPress={() => onUseItem(key)}
            >
              <Text style={styles.itemIcon}>{item.icon}</Text>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name.split(' ')[0]}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  count > 0 ? styles.countBadgeActive : styles.countBadgeEmpty,
                ]}
              >
                <Text style={styles.countText}>x{count}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginVertical: 4,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  barTitle: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  barSub: {
    color: '#64748B',
    fontSize: 9,
  },
  itemsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  itemBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
    position: 'relative',
  },
  itemBtnEpic: {
    borderColor: '#A855F7',
    backgroundColor: '#3B0764',
  },
  itemBtnDisabled: {
    opacity: 0.4,
    borderColor: '#1E293B',
  },
  itemIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  itemName: {
    color: '#E2E8F0',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  countBadge: {
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 2,
  },
  countBadgeActive: {
    backgroundColor: '#2563EB',
  },
  countBadgeEmpty: {
    backgroundColor: '#334155',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
